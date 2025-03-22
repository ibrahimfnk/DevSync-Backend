const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const userController = require("../controllers/userController");
require("../config/google-auth");


const userRouter = express.Router();

userRouter.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
userRouter.get("/auth/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/signUp" }), 
    async (req, res) => {
    try {
        const user = req.user;
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '1h'
        });
        res.status(200).json({ token, userId: user._id });
    } catch (error) {
        console.error("Google Auth Error: ", error.message);
        res.status(500).send("Server error");
    }
});

userRouter.get("/allUsers", userController.getAllUsers);
userRouter.post("/signUp", userController.signUp);
userRouter.post("/login", userController.login);
userRouter.get("/getUserProfile", userController.getUserProfile);
userRouter.put("/updateUserProfile", userController.updateUserProfile);
userRouter.delete("/deleteUserProfile", userController.deleteUserProfile);

module.exports = userRouter;