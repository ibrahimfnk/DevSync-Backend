const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {MongoClient, ReturnDocument} = require('mongodb');
const dotenv = require('dotenv');
let ObjectId = require('mongodb').ObjectId;

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

async function getAllUsers(req, res) {
    try {
        await connectToDatabase();
        const db = client.db('devsync');
        const usersCollection = db.collection('users');

        const users = await usersCollection.find({}).toArray();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching all users: ", error.message);
        res.status(500).send("Server error");
    }
};




async function signUp(req, res) {
    const {username, email, password} = req.body;
    try {
        await connectToDatabase();
        const db = client.db('devsync');
        const usersCollection = db.collection('users');
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
            res.status(201).json({ token,userId: result.insertedId });
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
        const usersCollection = db.collection('users');
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

async function getUserProfile(req, res) {
    const id = req.params.id;
    try {
        await connectToDatabase();
        const db = client.db('devsync');
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ _id: new ObjectId(id) });
        if (!user) {
            res.status(404).send("User not found");
        } else {
            res.status(200).json(user);
        }
    } catch (error) {
        console.error("Error fetching user profile: ", error.message);
        res.status(500).send("Server error");
    }
};

async function updateUserProfile(req, res) {
    const id = req.params.id;
    const {email, password} = req.body;
    try {
        await connectToDatabase();
        const db = client.db('devsync');
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ _id: new ObjectId(id) });
        if (!user) {
            res.status(404).send("User not found");
        } else {
            const updatedUser = {email};
            if (password) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                updatedUser.password = hashedPassword;
            }

            const result = await usersCollection.updateOne({ _id: new ObjectId(id) }, { $set: updatedUser }, {returnDocument: 'after'});

            res.send(result.value);
        }
    } catch (error) {
        console.error("Error updating user profile: ", error.message);
        res.status(500).send("Server error");
    }

};

async function deleteUserProfile(req, res) {
    id = req.params.id;
    try {
        await connectToDatabase();
        const db = client.db('devsync');
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ _id: new ObjectId(id) });
        if (!user) {
            res.status(404).send("User not found");
        } else {
            const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
            res.status(200).send("User deleted");
        }
    } catch (error) {
        console.error("Error deleting user profile: ", error.message);
        res.status(500).send("Server error");
    }
}


module.exports = {
    getAllUsers,
    signUp,
    login,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile
};