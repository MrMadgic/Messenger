const dotenv = require("dotenv");
const express = require("express");
const multer = require("multer");
const path = require("path");

dotenv.config({ path: "./assets/.env" });

const http = require("http");
const { Server } = require("socket.io");

const cors = require("cors");
const {
  register,
  setMessagesReadStatus,
  saveGroupAvatar,
  setDialogId,
  setUserAvatar,
  authenticate,
  setUserDialog,
  getUserData,
  getUserDialogs,
  changeUserData,
  getRoomMessages,
  getUsers,
  getGroups,
  sendMessage,
  setUserStatusData,
  trackUser,
  blockUser,
  sendDocument,
  getGeneratedGroupID,
  setUserGroup,
  getUserGroupData,
  setNewUser,
  setUsersDialogsIds,
  updateGroupInfo,
  setUserPremium
} = require("./assets/modules/routes.js");
const connection = require("./assets/database/db.js");

const app = express();
const port = process.env.PORT;
const socketPORT = process.env.socketPORT;

app.use(express.json());
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(
  "/uploads",
  express.static(path.join(__dirname, "assets/database/images"))
);
app.use(
  "/groupImages",
  express.static(path.join(__dirname, "assets/database/groupImages"))
);
// app.use('/documents', express.static(path.join(__dirname, 'assets/database/documents')));

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "assets/database/images"));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "assets/database/documents"));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const groupAvatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "assets/database/groupImages"));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const uploadAvatar = multer({ storage: avatarStorage });
const uploadDocument = multer({ storage: documentStorage });
const uploadGroupAvatar = multer({ storage: groupAvatarStorage });

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("user_settings", (userId) => {
    trackUser(userId, (err, user) => {
      if (err) {
        console.error("Произошла ошибка: " + err.message);
        return;
      }

      if (user) {
        socket.emit("track_user", user);
      }
    });
  });

  socket.on("join_room", (data) => {
    if(data?.type === "group"){
      setUsersDialogsIds(data)
    }else{
      setDialogId(data);
      setMessagesReadStatus(data);
    }
    
    socket.join(data.id);
  });

  socket.on("is_online", (data) => {
    setUserStatusData(data);
  });

  socket.on("send_message", (data) => {
    const status = sendMessage(data);
    if (status) {
      socket.to(data.room).emit("receive_message", data);
    }
  });
});

app.post("/register/", register);
app.post("/authenticate/", authenticate);
app.post("/getUserData/", getUserData);
app.post("/changeUserData/", changeUserData);
app.post("/getUsers/", getUsers);
app.post("/getRoomMessages/", getRoomMessages);
app.post("/getUserDialogs/", getUserDialogs);
app.post("/blockUser/", blockUser);

app.post("/setUserPremium/", setUserPremium);

app.post("/setUserDialog/", setUserDialog);

app.post("/setUserGroup/", setUserGroup);
app.post("/getUserGroupData/", getUserGroupData);

app.post("/getGroups/", getGroups);
app.post("/updateGroupInfo/", updateGroupInfo);

app.post("/setNewUser/", setNewUser);


app.post("/setUserAvatar/", uploadAvatar.single("avatar"), setUserAvatar);
app.post("/sendDocument/", uploadDocument.single("document"), sendDocument);

app.post(
  "/saveGroupAvatar/",
  uploadGroupAvatar.single("groupImage"),
  saveGroupAvatar
);

app.get("/getGeneratedGroupID/", getGeneratedGroupID);

app.get("/documents/:filename", (req, res) => {
  const documentPath = path.join(
    __dirname,
    "assets/database/documents",
    req.params.filename
  );

  res.download(documentPath, (err) => {
    if (err) {
      res.status(404).send("Файл не найден");
    }
  });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

server.listen(socketPORT, () => {
  console.log(`Socket server started on port ${socketPORT}`);
});

connection.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Database connected");
  }
});
