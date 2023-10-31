const dotenv = require('dotenv');
const express = require('express');

dotenv.config({ path: "./assets/.env" });

const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");

const cors = require('cors');
const { register, authenticate,setUserDialog, getUserData, getUserDialogs, changeUserData, getRoomMessages, getUsers, sendMessage } = require('./assets/modules/routes.js');
const connection = require('./assets/database/db.js');

const app = express();
const port = process.env.PORT
const socketPORT = process.env.socketPORT

app.use(express.json({ limit: "100MB" }));
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});


io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("join_room", (roomId) => {
        console.log(`User connected ${roomId}`)
        socket.join(roomId);
    });

    socket.on("send_message", (data) => {
        const status = sendMessage(data)

        if(status){
            socket.to(data.room).emit("receive_message", data);
        }
    });



});


app.post("/register/", register)
app.post("/authenticate/", authenticate)
app.post("/getUserData/", getUserData)
app.post("/changeUserData/", changeUserData)
app.post("/getUsers/", getUsers)
app.post("/getRoomMessages/", getRoomMessages)
app.post("/getUserDialogs/", getUserDialogs)
app.post("/setUserDialog/", setUserDialog)

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

server.listen(socketPORT, () => {
    console.log(`Server started on port ${socketPORT}`);
});

connection.connect((err) => {
    if (err) {
        console.log(err)
    } else {
        console.log("Database connected")
    }
})
