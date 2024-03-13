import passport from "passport";
import UserModel from "../dao/mongo/models/users.model.js";
import GitHubStrategy from "passport-github2";
import local from "passport-local";
import { createHash, isValidPassword } from "../utils/bcrypt.password.js";
import jwt from "jsonwebtoken";
import passportJWT from "passport-jwt";
import { logger } from "../utils/logger.js";
import { CartsRepository } from "../repositories/index.js";
import {
  CLIENT_ID,
  CLIENT_SECRET,
  CALLBACK_URL,
  JWT_SECRET,
} from "./config.js";
import { generateToken } from "../utils/token.generate.js";

const LocalStrategy = local.Strategy;
const current = passportJWT.Strategy;

export const initializePassport = () => {
  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email", session: false },
      async (req, username, password, done) => {
        try {
          const user = await UserModel.findOne({ email: username });

          const { confirmPassword } = req.body;

          if (password !== confirmPassword) {
            logger.info("Passwords do not match");
            return done(null, false, { message: "Passwords do not match" });
          }

          if (user) {
            logger.info("User already registered");
            return done(null, false, { message: "Email already exists" });
          }

          req.body.password = createHash(password);
          const cart = await CartsRepository.createCart();
          req.body.cart = cart._id;
          const newUser = await UserModel.create({ ...req.body });

          if (newUser) {
            return done(null, newUser);
          }

          return done(null, false);
        } catch (error) {
          logger.error(error);
          return done(error);
        }
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email" },
      async (username, password, done) => {
        try {
          const user = await UserModel.findOne({ email: username });

          if (!user) {
            logger.warning("Email adress not found");
            return done(null, false, { message: "Email address not found." });
          } else if (!isValidPassword(password, user.password)) {
            logger.warning("Invalid password");
            return done(null, false, { message: "Incorrect password." });
          }

          user.last_connection = new Date();
          await user.save();

          return done(null, { user });
        } catch (error) {
          logger.error("Error during login:", error);
          return done(error);
        }
      }
    )
  );

  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        callbackURL: CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await UserModel.findOne({ email: profile._json.email });

          if (user) {
            const token = generateToken(
              {
                sub: user._id,
                user: {
                  first_name: user.first_name,
                  last_name: user.last_name,
                  email: user.email,
                  role: user.role,
                  cart: user.cart,
                  image: user.image,
                },
              },
              "8h"
            );

            user.token = token;

            user.last_connection = new Date();
            user.save();

            return done(null, user);
          } else {
            const newUser = await UserModel.create({
              first_name: profile._json.name,
              last_name: "",
              email: profile._json.email,
              password: createHash("githubpassword"),
              image: profile._json.avatar_url,
              cart: await CartsRepository.createCart(),
              github: true,
            });

            const token = generateToken(
              {
                sub: newUser._id,
                user: {
                  first_name: newUser.first_name,
                  last_name: newUser.last_name,
                  email: newUser.email,
                  image: newUser.image,
                  role: newUser.role,
                  cart: newUser.cart,
                },
              },
              "8h"
            );

            newUser.token = token;

            user.last_connection = new Date();
            user.save();

            return done(null, newUser);
          }
        } catch (error) {
          return done("Error authenticating with GitHub: " + error);
        }
      }
    )
  );

  passport.use(
    "jwt",
    new current(
      {
        jwtFromRequest: (req) => {
          let token = null;
          if (req.cookies && req.cookies.jwt) {
            token = req.cookies.jwt;
          } else if (req.headers.authorization) {
            const parts = req.headers.authorization.split(" ");
            if (parts.length === 2 && parts[0] === "Bearer") {
              token = parts[1];
            }
          }
          return token;
        },
        secretOrKey: JWT_SECRET,
      },
      (jwt_payload, done) => {
        try {
          if (!jwt_payload) {
            return done({ message: "No token provided" }, false);
          }

          done(null, jwt_payload);
        } catch (error) {
          logger.error("Error in JWT authentication:", error);
          return done(error, false);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await UserModel.findById(id);
    done(null, user);
  });
};
