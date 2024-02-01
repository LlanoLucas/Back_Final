import passport from "passport";
import UserModel from "../dao/mongo/models/users.model.js";
import GitHubStrategy from "passport-github2";
import local from "passport-local";
import { createHash, isValidPassword } from "../utils/bcrypt.password.js";
import jwt from "jsonwebtoken";
import passportJWT from "passport-jwt";
import { CartsRepository } from "../repositories/index.js";

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
            console.log("Passwords do not match");
            return done(null, false);
          }

          if (user) {
            console.log("User already registered");
            return done(null, false);
          }

          req.body.password = createHash(password);
          const cart = await CartsRepository.createCart();
          req.body.cart = cart._id;
          const newUser = await UserModel.create({ ...req.body });

          if (newUser) return done(null, newUser);

          return done(null, false);
        } catch (error) {
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

          if (!user || !isValidPassword(password, user.password)) {
            console.log("Invalid credentials");
            return done(null, false);
          }

          return done(null, { user });
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await UserModel.findOne({ email: profile._json.email });

          if (user) {
            const token = jwt.sign(
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
              process.env.JWT_SECRET,
              { expiresIn: "8h" }
            );

            user.token = token;

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

            const token = jwt.sign(
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
              process.env.JWT_SECRET,
              { expiresIn: "8h" }
            );

            newUser.token = token;

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
        jwtFromRequest: passportJWT.ExtractJwt.fromExtractors([
          (req) => req?.cookies?.jwt ?? null,
        ]),
        secretOrKey: process.env.JWT_SECRET,
      },
      (jwt_payload, done) => {
        try {
          if (!jwt_payload) {
            return done({ message: "No token provided" }, false);
          }

          done(null, jwt_payload);
        } catch (error) {
          console.error("Error in JWT authentication:", error);
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
