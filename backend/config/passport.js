const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const { env } = require('./env');

const publicUserFields = '_id name email avatar role preferences createdAt updatedAt';
const oauthUserFields = `${publicUserFields} googleId authProvider`;

const ensureUserPortfolio = async (userId) => {
  await Portfolio.updateOne({ user: userId }, { $setOnInsert: { user: userId } }, { upsert: true });
};

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select(publicUserFields);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

if (env.googleClientId && env.googleClientSecret && env.googleCallbackUrl) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.googleClientId,
        clientSecret: env.googleClientSecret,
        callbackURL: env.googleCallbackUrl,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          if (mongoose.connection.readyState !== 1) {
            return done(new Error('MongoDB must be connected before using Google OAuth'));
          }

          const email = profile.emails?.[0]?.value?.toLowerCase();

          if (!email) {
            return done(new Error('Google profile did not include an email address'));
          }

          const googleId = profile.id;
          const name = profile.displayName || email.split('@')[0];
          const avatar = profile.photos?.[0]?.value || '';

          let user = await User.findOne({ $or: [{ googleId }, { email }] }).select(oauthUserFields);

          if (user) {
            let shouldSave = false;

            if (!user.googleId) {
              user.googleId = googleId;
              shouldSave = true;
            }

            if (user.authProvider !== 'google') {
              user.authProvider = 'google';
              shouldSave = true;
            }

            if (avatar && !user.avatar) {
              user.avatar = avatar;
              shouldSave = true;
            }

            if (shouldSave) {
              await user.save();
            }
          } else {
            user = await User.create({
              name,
              email,
              avatar,
              googleId,
              authProvider: 'google',
            });
          }

          await ensureUserPortfolio(user._id);

          const safeUser = await User.findById(user._id).select(publicUserFields);
          return done(null, safeUser);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

module.exports = passport;
