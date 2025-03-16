const fs = require('fs').promises;
const path = require('path');
const { s3, S3_BUCKET } = require('../config/aws-config');

async function pushRepo() {
    const repoPath = path.resolve(process.cwd(), ".devgit");
    const commitsPath = path.join(repoPath, "commits");

    try {
        const commitDirs = await fs.readdir(commitsPath);
        for (const commitDir of commitDirs) {
            const commitPath = path.join(commitsPath, commitDir);
            const commitFiles = await fs.readdir(commitPath);
            for (const commitFile of commitFiles) {
                const filePath = path.join(commitPath, commitFile);
                const fileData = await fs.readFile(filePath);
                const params = {
                    Bucket: S3_BUCKET,
                    Key: `commits/${commitDir}/${commitFile}`,
                    Body: fileData
                };
                await s3.upload(params).promise();
            }
        }

        console.log("Repository Pushed");
    } catch (err) {
        console.error("Error in pushing the repository", err);
    }
}

module.exports = {pushRepo};