const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

const readDir = promisify(fs.readdir);
const copyFile = promisify(fs.copyFile);


async function revertRepo(commitID) {
    const repoPath = path.resolve(process.cwd(), ".devgit");
    const commitsPath = path.join(repoPath, "commits");

    try {
        const commitDir = path.join(commitsPath, commitID);
        const files = await readDir(commitDir);
        const parentDir = path.resolve(repoPath, "..");

        for (const file of files) {
            await copyFile(path.join(commitDir, file), path.join(parentDir, file));
        }

        console.log(`Reverted to commit ${commitID}`);
    } catch (err) {
        console.log("Commit not found", err);
        return;
    }
}

module.exports = {revertRepo};