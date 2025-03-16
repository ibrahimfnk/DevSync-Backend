const express = require('express');
const repoController = require("../controllers/repoController");

const repoRouter = express.Router();

repoRouter.post("/repo/create", repoController.createRepository);
repoRouter.get("/repo/all", repoController.getAllRepositories);
repoRouter.get("/repo/id/:id", repoController.fetchRepositoryById);
repoRouter.get("/repo/name/:name", repoController.fetchRepositoryByName);
repoRouter.get("/repo/user/:userID", repoController.fetchRepositoriesForCurrentUser);
repoRouter.put("repo/update/:id", repoController.updateRepository);
repoRouter.delete("repo/delete/:id", repoController.deleteRepository);
repoRouter.patch("repo/toggle/:id", repoController.toggleVisibility);

module.exports = repoRouter;