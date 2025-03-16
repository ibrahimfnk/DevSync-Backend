const getAllUsers = (req, res) => {
    res.send("All users fetched");
};


const signUp = (req, res) => {
    res.send("User signed up");
};

const login = (req, res) => {
    res.send("User logged in");
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