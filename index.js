const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const mainRouter = require('./routes/main.router.js');

const yargs = require('yargs');
const {hideBin} = require("yargs/helpers");

const {initRepo} = require("./controllers/init.js");
const {addFile} = require("./controllers/add.js");
const {commitFile} = require("./controllers/commit.js");
const {pushRepo} = require("./controllers/push.js");
const {pullRepo} = require("./controllers/pull.js");
const {revertRepo} = require("./controllers/revert.js");

dotenv.config();

yargs(hideBin(process.argv))
.command('start', "Stars a new server", {}, startServer)
.command('init',"Initialise a new repository", {}, initRepo)
.command('add <file>',"Add a file to the repository", (yargs) => {
    yargs.positional("file", {
        describe: "File to add to the staging area",
        type: "string"
    })
}, 
(argv) => {
    addFile(argv.file);
})
.command('commit <message>',"Commit a file to the repository", (yargs) => {
    yargs.positional("message", {
        describe: "Commit message",
        type: "string"
    })
}, 
(argv) => {
    commitFile(argv.message)
})
.command('push',"Push a file to the repository", {}, pushRepo)
.command('pull',"Pull a file from a repository", {}, pullRepo)
.command(
    "revert <commitID>",
    "Revert a file from a repository", (yargs) => {
    yargs.positional("commitID", {
        describe: "Commit ID to revert to",
        type: "string"
    });
},
(argv) => { 
    revertRepo(argv.commitID) 
    }
)
.demandCommand(1, "You need to enter atleast one command")
.help()
.argv;


function startServer() {
    const app = express();
    const port = process.env.PORT || 3000;

    app.use(bodyParser.json());
    app.use(express.json());

    const mongoURI = process.env.MONGODB_URI;

    mongoose
    .connect(mongoURI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log("Unable to connect", err));

    app.use(cors({origin : "*"}));

    app.use("/", mainRouter);

    
    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    let user = "test";
    io.on("connection", (socket) => {
        socket.on("joinRoom", (userID) => {
            user = userID;
            console.log("User joined room", user);
            socket.join(user);
        });
    });

    const db = mongoose.connection;

    db.once("open", async() => {
        console.log("crud operations called");
        //CRUD operations
    });

    httpServer.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}