const fs = require('fs').promises; 
const path = require('path');
const hidefile = require("hidefile");

async function initRepo() {
    const repoPath = path.resolve(process.cwd(), ".devgit");
    const commitsPath = path.join(repoPath, "commits");


    try {
        await fs.mkdir(repoPath, {recursive: true});
        hidefile.hideSync('.devgit');
        await fs.mkdir(commitsPath, {recursive: true});
        await fs.writeFile(
            path.join(repoPath, "config.json"),
            JSON.stringify({bucket: process.env.S3_BUCKET})
        );
        console.log("Repository Initialized");
    } catch(err) {
        console.error("Error in initializing the repository");
    }
}

module.exports = {initRepo};