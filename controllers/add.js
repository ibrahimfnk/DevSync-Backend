const fs = require('fs').promises;
const path = require('path');

async function copyDirectory(source, destination) {
    await fs.mkdir(destination, { recursive: true });
    const items = await fs.readdir(source, { withFileTypes: true });

    for (const item of items) {
        const sourcePath = path.join(source, item.name);
        const destinationPath = path.join(destination, item.name);

        if (item.isDirectory()) {
            await copyDirectory(sourcePath, destinationPath); // Recursively copy subdirectories
        } else {
            await fs.copyFile(sourcePath, destinationPath); // Copy file
        }
    }
}

async function addFile(filePath) {
    const repoPath = path.resolve(process.cwd(), ".devgit");
    const stagingPath = path.join(repoPath, "staging");

    try {
        await fs.mkdir(stagingPath, { recursive: true });
        const fileName = path.basename(filePath);
        const destinationPath = path.join(stagingPath, fileName);

        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
            await copyDirectory(filePath, destinationPath); // Copy entire folder
            console.log(`Folder ${fileName} added to staging area`);
        } else {
            await fs.copyFile(filePath, destinationPath); // Copy single file
            console.log(`File ${fileName} added to staging area`);
        }
    } catch (error) {
        console.error("Error adding file/folder:", error);
    }
}

module.exports = { addFile };
