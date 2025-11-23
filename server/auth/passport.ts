import passport from "passport";
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
} from "passport-jwt";
const db = require("../db/models");
const { User } = db;

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  console.warn(
    "⚠️  WARNING: JWT_SECRET is not defined in environment variables. Using default (INSECURE - only for development)"
  );
}

const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret || "development_secret_change_in_production",
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await User.findByPk(jwt_payload.id);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (err) {
      return done(err, false);
    }
  })
);

export = passport;
