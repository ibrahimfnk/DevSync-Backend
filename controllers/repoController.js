const createRepository = (req, res) => {
    res.send("repository created");
};

const getAllRepositories = (req, res) => {
    res.send("all repositories");
};

const fetchRepositoryById = (req, res) => {
    res.send("fetch repository by id");
};

const fetchRepositoryByName = (req, res) => {
    res.send("fetch repository by name");
};

const fetchRepositoriesForCurrentUser = (req, res) => {
    res.send("fetch repository for logged in user");
};

const toggleVisibility = (req, res) => {
    res.send("toggle repository visibility");
};

const updateRepository = (req, res) => {
    res.send("update repository");
};

const deleteRepository = (req, res) => {
    res.send("delete repository");
};


module.exports = {
    createRepository,
    getAllRepositories,
    fetchRepositoryById,
    fetchRepositoryByName,
    fetchRepositoriesForCurrentUser,
    toggleVisibility,
    updateRepository,
    deleteRepository
};