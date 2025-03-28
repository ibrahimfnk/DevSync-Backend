const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const Issue = require("../models/issueModel");
const User = require("../models/userModel");



async function createIssue (req, res) {
    const { title, description } = req.body;
    const { id } = req.params;

    try{
        const issue = new Issue({
            title,
            description,
            repository: id
        });
    
        await issue.save();
    
        res.status(201).json({
            message: "Issue created successfully",
            issue
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating issue",
            error: error.message
        });
    }
    
        
};

async function updateIssueById (req, res) {
    const { id } = req.params;
    const { title, description, status } = req.body;

    try {
        const issue = await Issue.findByIdAndUpdate(id, {
            title,
            description,
            status
        }, { new: true });
    
        if (!issue) {
            return res.status(404).json({
                message: "Issue not found"
            });
        }
    
        await issue.save();

        res.status(200).json({
            message: "Issue updated successfully",
            issue
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating issue",
            error: error.message
        });
    }
};

async function deleteIssueById (req, res) {
    const { id } = req.params;

    try {
        const issue = await Issue.findByIdAndDelete(id);
    
        if (!issue) {
            return res.status(404).json({
                message: "Issue not found"
            });
        }
    
        res.status(200).json({
            message: "Issue deleted successfully",
            issue
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting issue",
            error: error.message
        });
    }
};

async function getAllIssues (req, res) {
    const { id } = req.params;
    try {
        const issues = await Issue.find({ repository: id });
    
        if (!issues) {
            return res.status(404).json({
                message: "No issues found"
            });
        }
    
        res.status(200).json({
            message: "Issues fetched successfully",
            issues
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching issues",
            error: error.message
        });
    }
};

async function getIssueById (req, res) {
    const { id } = req.params;
    try {
        const issue = await Issue.findById(id);

        if (!issue) {
            return res.status(404).json({
                message: "Issue not found"
            });
        }

        res.status(200).json({
            message: "Issue fetched successfully",
            issue
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching issue",
            error: error.message
        });
    }
};


module.exports = {
    createIssue,
    updateIssueById,
    deleteIssueById,
    getAllIssues,
    getIssueById
};