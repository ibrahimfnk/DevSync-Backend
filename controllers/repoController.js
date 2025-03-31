const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");


async function createRepository(req, res) {
    const { owner, name, issues, content ,description, visibility } = req.body;

    try {
        if (!name) {
            return res.status(400).json({ message: "Repository name is required" });
        }

        if (!mongoose.Types.ObjectId.isValid(owner)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        
        const newRepository = new Repository({
            name,
            description,
            visibility,
            owner,
            content,
            issues,
        });

        const result = await newRepository.save();

        res.status(201).json({
            message: "Repository created successfully",
            repositoryID: result._id
        });
    } catch (error) {
        console.error("Error creating repository:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

async function getAllRepositories(req, res) {
    try {
        const repositories = await Repository.find({}).populate("owner").populate("issues").exec();
        res.status(200).json(repositories);
    }
    catch (error) {
        console.error("Error fetching repositories:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

async function fetchRepositoryById(req, res) {
    const {id} = req.params;
    try {
        const repository = await Repository.find({ _id: id}).populate("owner").populate("issues");
        if (!repository) {
            return res.status(404).json({ message: "Repository not found" });
        }
        res.status(200).json(repository);
    } catch (error) {
        console.error("Error fetching repository by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

async function fetchRepositoryByName(req, res) {
    const {name} = req.params;
    try {
        const repository = await Repository.find({ name: name}).populate("owner").populate("issues").exec();
        if (!repository) {
            return res.status(404).json({ message: "Repository not found" });
        }
        res.status(200).json(repository);
    } catch (error) {
        console.error("Error fetching repository by Name:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

async function fetchRepositoriesForCurrentUser(req, res) {
    console.log(req.params);
    const { userID } = req.params;
  
    try {
      const repositories = await Repository.find({ owner: userID });
  
      if (!repositories || repositories.length == 0) {
        return res.status(404).json({ error: "User Repositories not found!" });
      }
      console.log(repositories);
      res.json({ message: "Repositories found!", repositories });
    } catch (err) {
      console.error("Error during fetching user repositories : ", err.message);
      res.status(500).send("Server error");
    }
  }
  
async function toggleVisibility(req, res) {
    const { id } = req.params;

    try {
        const repository = await Repository.findById(id);
        if (!Repository) {
            return res.status(404).json({ message: "Repository not found" });
        }

        repository.visibility = !repository.visibility;
        const updatedRepository = await repository.save();
        res.status(200).json({ message: "Repository visibility updated successfully", repository: updatedRepository });

    } catch (error) {
        console.error("Error during toggling visibility of repository:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

async function updateRepository(req, res) {
    const { id } = req.params;
    const { content, description } = req.body;

    try {
        const repository = await Repository.findById(id);
        if (!Repository) {
            return res.status(404).json({ message: "Repository not found" });
        }

        repository.content.push(content);
        repository.description = description;
        const updatedRepository = await repository.save();
        res.status(200).json({ message: "Repository updated successfully", repository: updatedRepository });
    } catch (error) {
        console.error("Error updating repository:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

async function deleteRepository(req, res) {
    const {id} = req.params;
    try {
        const repository = await Repository.findByIdAndDelete({ id });
        if (!repository) {
            return res.status(404).json({ message: "Repository not found" });
        }
        res.status(200).json({ message: "Repository deleted successfully" });
    } catch (error) {
        console.error("Error deleting repository:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

async function starRepository(req, res) {
    const { repoId } = req.params;
    const { userId } = req.body;

    try {
        await connectToDatabase();
        const db = client.db('devsync');
        const usersCollection = db.collection('users');
        const reposCollection = db.collection('repositories');

        // Check if repository exists
        const repo = await reposCollection.findOne({ _id: new ObjectId(repoId) });
        if (!repo) {
            return res.status(404).json({ message: "Repository not found" });
        }

        // Update user's starred repositories
        const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $addToSet: { starredRepositories: new ObjectId(repoId) } }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({ message: "Repository already starred" });
        }

        // Get updated user data
        const updatedUser = await usersCollection.findOne({ _id: new ObjectId(userId) });

        res.status(200).json({
            message: "Repository starred successfully",
            starredRepositories: updatedUser.starredRepositories
        });
    } catch (error) {
        console.error("Error starring repository:", error);
        res.status(500).json({ message: "Server error" });
    }
}

async function unstarRepository(req, res) {
    const { repoId } = req.params;
    const { userId } = req.body;

    try {
        await connectToDatabase();
        const db = client.db('devsync');
        const usersCollection = db.collection('users');
        const reposCollection = db.collection('repositories');

        // Check if repository exists
        const repo = await reposCollection.findOne({ _id: new ObjectId(repoId) });
        if (!repo) {
            return res.status(404).json({ message: "Repository not found" });
        }

        // Update user's starred repositories
        const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { starredRepositories: new ObjectId(repoId) } }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({ message: "Repository not starred" });
        }

        // Get updated user data
        const updatedUser = await usersCollection.findOne({ _id: new ObjectId(userId) });

        res.status(200).json({
            message: "Repository unstarred successfully",
            starredRepositories: updatedUser.starredRepositories
        });
    } catch (error) {
        console.error("Error unstarring repository:", error);
        res.status(500).json({ message: "Server error" });
    }
}

module.exports = {
    createRepository,
    getAllRepositories,
    fetchRepositoryById,
    fetchRepositoryByName,
    fetchRepositoriesForCurrentUser,
    toggleVisibility,
    updateRepository,
    deleteRepository,
    starRepository,
    unstarRepository
};