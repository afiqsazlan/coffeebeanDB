import passport from 'passport';
import passportJWT from 'passport-jwt';
import {Strategy as LocalStrategy} from 'passport-local'
import {db} from "./db.js";
import {eq} from "drizzle-orm";
import {users} from "../db/schema/users.js";
import bcrypt from "bcrypt";
import {StrategyOptions} from 'passport-jwt'

const {Strategy: JwtStrategy, ExtractJwt} = passportJWT;

const opts: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET ?? '',
    issuer: process.env.APP_URL
};

passport.use(
    new JwtStrategy(opts, async (jwtPayload, done) => {
        try {
            // Check expiration time
            const now = Math.floor(Date.now() / 1000); // Convert to seconds
            if (jwtPayload.exp <= now) {
                return done(null, false, { message: 'JWT token has expired.' });
            }

            // Check issuer
            if (jwtPayload.iss !== opts.issuer) {
                return done(null, false, { message: 'Invalid JWT issuer.' });
            }

            // Fetch user from database based on the JWT payload
            const result = await db.select().from(users).where(eq(users.username, jwtPayload.username)).limit(1);
            const user = result[0];

            if (user) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'User not found.' });
            }
        } catch (error) {
            console.log({error})
            return done(error, false);
        }
    })
);

passport.use(new LocalStrategy(async function verify(username, password, done) {
    try {
        const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
        const user = result[0]

        // If no user with username,
        if (!user) {
            return done(null, false, {message: 'Incorrect username or password.'});
        }

        bcrypt.compare(password, user.password, function (err, result) {
            if (err) {
                return done(err);
            }
            if (!result) {
                return done(null, false, {message: 'Incorrect username or password.'});
            }
            return done(null, user);
        });

    } catch (error) {
        return done(error, false);
    }
}));