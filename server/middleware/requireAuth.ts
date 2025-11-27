import passport from "../auth/passport";
export const requireAuth = passport.authenticate("jwt", { session: false });
