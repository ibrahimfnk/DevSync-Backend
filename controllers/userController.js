const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {MongoClient} = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGODB_URI;

let client;

async function connectToDatabase() {
    if (!client) {
        client = new MongoClient(uri, {
            useNewUrlParser: true, 
            useUnifiedTopology: true
        });
    }
    await client.connect();
    return client;
}

const getAllUsers = (req, res) => {
    res.send("All users fetched");
};


async function signUp(req, res) {
    const {username, email, password} = req.body;
    try {
        await connectToDatabase();
        const db = client.db('devsync');
        const usersCollection = db.collection('user');
        const user = await usersCollection.findOne({ username });
        if (user) {
            res.status(400).send("User already exists");
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const newUser = {
                username,
                email,
                password: hashedPassword,
                repositories: [],
                followedUsers: [],
                starredRepositories: []
            };
            const result = await usersCollection.insertOne(newUser);
            const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET_KEY, {
                expiresIn: '1h'
            });
            res.status(201).json({ token });
        };
    } catch (error) {
        console.error("Error during signup: ", error.message);
        res.status(500).send("Server error");
    }
};

async function login(req, res) {
    const {email, password} = req.body;
    try {
        await connectToDatabase();
        const db = client.db('devsync');
        const usersCollection = db.collection('user');
        const user = await usersCollection.findOne({ email });
        if (!user) {
            res.status(400).send("Invalid credentials");
        } else {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                res.status(400).send("Invalid credentials");
            } else {
                const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
                    expiresIn: '1h'
                });
                res.status(200).json({ token, userId: user._id });
            }
        }
    } catch (error) {
        console.error("Error during login: ", error.message);
        res.status(500).send("Server error");
    }
};

const getUserProfile = (req, res) => {
    res.send("User profile fetched");
};

const updateUserProfile = (req, res) => {
    res.send("Profile updated");
};

const deleteUserProfile = (req, res) => {
    res.send("Profile deleted");
}


module.exports = {
    getAllUsers,
    signUp,
    login,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile
};