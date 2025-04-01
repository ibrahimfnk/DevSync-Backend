const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

const uri = process.env.MONGODB_URI;
let client;

async function connectToDatabase() {
    if (!client) {
        client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
    }
    return client.db("devsync");
}

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback"
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const db = await connectToDatabase();
                const usersCollection = db.collection("users");

                let user = await usersCollection.findOne({ googleId: profile.id });

                if (!user) {
                    user = {
                        googleId: profile.id,
                        username: profile.displayName,
                        email: profile.emails[0].value,
                        repositories: [],
                        followedUsers: [],
                        starredRepositories: []
                    };
                    await usersCollection.insertOne(user);
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.googleId || user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection("user");
        const user = await usersCollection.findOne({ $or: [{ googleId: id }, { _id: id }] });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
