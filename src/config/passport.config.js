import passport from "passport";
import UserModel from "../dao/models/users.models.js";
import GitHubStrategy from "passport-github2";
import local from "passport-local";
import { createHash, isValidPassword } from "../utils/bcrypt.password.js";
import jwt from "jsonwebtoken";
import passportJWT from "passport-jwt";

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
          // Find or create a user based on GitHub profile information
          const user = await UserModel.findOne({ email: profile._json.email });

          if (user) {
            // If the user exists, issue a JWT token
            const token = jwt.sign(
              {
                sub: user._id,
                user: {
                  first_name: user.first_name,
                  last_name: user.last_name,
                  email: user.email,
                  image: user.image,
                  role: user.role,
                  cart: user.cart,
                },
              },
              process.env.JWT_SECRET,
              { expiresIn: "1h" }
            );

            // Attach the token to the user object
            user.token = token;

            // Pass the user object to the next step in the authentication process
            return done(null, user);
          } else {
            // If the user does not exist, create a new user
            const newUser = await UserModel.create({
              first_name: profile._json.name,
              last_name: "",
              email: profile._json.email,
              password: createHash("githubpassword"), // Replace with a secure method
              image: profile._json.avatar_url,
              cart: profile.cart,
              github: true,
            });

            // Issue a JWT token for the new user
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
              { expiresIn: "1h" }
            );

            // Attach the token to the user object
            newUser.token = token;

            // Pass the new user object to the next step in the authentication process
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
          // Your existing logic here, for example:
          // Check if the user exists in the database and call done(null, user) if found
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
