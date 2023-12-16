import passport from "passport";
import UserModel from "../dao/models/users.models.js";
import GitHubStrategy from "passport-github2";
import local from "passport-local";
import { createHash, isValidPassword } from "../utils/bcrypt.password.js";

const LocalStrategy = local.Strategy;

export const initializePassport = () => {
  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
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

          if (!user) {
            console.log("User not found");
            done(null, false);
          }

          if (!isValidPassword(password, user.password)) {
            console.log("Password is not valid");
            done(null, false);
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    return done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await UserModel.findById(id);
    return done(null, user);
  });

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
            console.log("User already registered");
            return done(null, user);
          }

          const newUser = await UserModel.create({
            first_name: profile._json.name,
            last_name: "",
            email: profile._json.email,
            password: createHash("githubpassword"),
            image: profile._json.avatar_url,
            github: true,
          });

          return done(null, newUser);
        } catch (error) {
          return done("Error to login with github " + error);
        }
      }
    )
  );
};
