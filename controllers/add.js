const fs = require('fs').promises;
const path = require('path');

async function addFile(filePath) {
    const repoPath = path.resolve(process.cwd(), ".devgit");
    const stagingPath = path.join(repoPath, "staging");

    try {
        await fs.mkdir(stagingPath, {recursive: true});
        const fileName = path.basename(filePath);
        await fs.copyFile(filePath, path.join(stagingPath, fileName));
        console.log(`File ${fileName} added to staging area`);
    } catch (error) {
        console.error("Error adding file: ", error);
    }
}


module.exports = {addFile};