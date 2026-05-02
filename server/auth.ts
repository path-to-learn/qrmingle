import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import type { User } from "@shared/schema";
import { authLimiter } from "./limiters";

declare global {
  namespace Express {
    // Export interface User from schema.ts
    interface User extends Omit<import('@shared/schema').User, 'password'> {
      password: string;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret && process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET environment variable must be set in production');
  }

  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret || 'dev_only_secret_not_for_production',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        // For demo user, use simple password verification
        if (username === 'demo' && password === 'demo') {
          return done(null, user);
        }
        
        // Handle different password storage formats
        
        // 1. Check if using scrypt with salt (our Node.js format)
        if (user.password.includes('.') && !user.password.startsWith('pbkdf2:')) {
          const passwordMatch = await comparePasswords(password, user.password);
          if (!passwordMatch) {
            return done(null, false, { message: "Invalid username or password" });
          }
        } 
        // 2. Handle Python's pbkdf2 format from Flask
        else if (user.password.startsWith('pbkdf2:')) {
          // Since we can't verify this format directly in Node.js easily,
          // we'll allow demo user with demo password as special case
          if (username === 'demo' && password === 'demo') {
            return done(null, user);
          } else {
            // For real implementation, we would need to port the Python verification code
            console.log('Password stored in pbkdf2 format that requires Python verification');
            return done(null, false, { message: "Please use JS-created users during migration" });
          }
        } 
        // 3. Unknown format — reject; user must reset their password
        else {
          return done(null, false, { message: "Account requires a password reset. Please use Forgot Password." });
        }
        
        return done(null, user);
      } catch (error) {
        console.error('Error in authentication:', error);
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/auth/register", authLimiter, async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // For demo user, use simple password storage
      let password = req.body.password;
      if (req.body.username !== 'demo') {
        password = await hashPassword(password);
      }

      // Check if this is the admin user (dathwal@qrmingle#2025)
      const isAdmin = req.body.username === 'dathwal@qrmingle#2025';

      const user = await storage.createUser({
        ...req.body,
        password,
      });
      
      // If this is the admin user, update their admin status
      if (isAdmin) {
        await storage.updateUserAdminStatus(user.id, true);
        // Get updated user with admin flag
        const adminUser = await storage.getUser(user.id);
        if (adminUser) {
          req.login(adminUser, (err) => {
            if (err) return next(err);
            const { password, ...userWithoutPassword } = adminUser;
            res.status(201).json(userWithoutPassword);
          });
          return;
        }
      }

      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/login", authLimiter, passport.authenticate("local"), (req, res) => {
    const { password, ...userWithoutPassword } = req.user as User;
    res.status(200).json(userWithoutPassword);
  });

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/auth/validate", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { password, ...userWithoutPassword } = req.user as User;
    res.json(userWithoutPassword);
  });
}