import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import {
  selectDialog,
  sendMessage,
  setNewDialog,
} from "../../redux/actionCreaters/actionCreater";
import { useParams, useNavigate } from "react-router-dom";

import DialogList from "./DialogList.jsx";
import Chat from "./Chat";

import "./Messages.css";
import { selectIsAuth, selectServerConfig } from "../../selectors";
import CreateNewGroup from "./CreateNewGroup/CreateNewGroup.jsx";

const socket = io.connect(`http://localhost:4000`);

export default function Messages({ getUserData }) {
  const dialogs = useSelector((state) => state.user.dialogs);
  const user = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAuth = useSelector(selectIsAuth);
  const [loading, setLoading] = useState(true);

  const { id } = useParams();

  const selectedDialog = dialogs.find((dialog) => dialog.id === parseInt(id));

  const [message, setMessage] = useState("");
  const [groupLimit, setGroupLimit] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [localSearchResults, setLocalSearchResults] = useState(dialogs);
  const searchRef = useRef(null);

  const [groupOptionsVisible, setGroupOptionsVisible] = useState(false);
  const [createNewGroup, setCreateNewGroup] = useState(false);

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileURL, setSelectedFileURL] = useState(null);

  const serverConfig = useSelector(selectServerConfig);

  const isDialogExist = (dialogs, dialogId) => {
    return dialogs.some((dialog) => dialog.id === dialogId);
  };

  const joinRoom = async () => {
    const dialogExist = isDialogExist(dialogs, Number(id));
    if (id && dialogExist) {
      socket.emit("join_room", {
        type: selectedDialog?.type,
        id,
        userId: user.id,
        messages: selectedDialog?.messages,
      });
    }

    window.addEventListener("beforeunload", () => {
      socket.emit("join_room", { id: null, userId: user.id });
    });
  };

  useEffect(() => {
    joinRoom();
  }, [id, socket]);

  useEffect(() => {
    if (!searchText) {
      setLocalSearchResults(dialogs);
    }
  }, [dialogs]);

  useEffect(() => {
    if (!isAuth) {
      setTimeout(() => {
        navigate("/signup");
        setLoading(false);
      }, 1000);
    } else {
      setLoading(false);
    }
  }, [isAuth, navigate, selectedDialog, dispatch]);

  useEffect(() => {
    if (!selectedDialog) {
      navigate("/messages/");
    }
  }, [selectedDialog, navigate]);

  // useEffect(() => {
  //   const handleReceiveMessage = (data) => {
  //     console.log(data.sender)
  //     const existingDialog = dialogs.find(
  //       (dialog) => dialog.login === data.sender
  //     );

  //     if (!existingDialog) {
  //       const newDialog = {
  //         login: data.sender,
  //         id: data.room,
  //         isOnline: false,
  //         messages: [data],
  //       };

  //       dispatch(setNewDialog(newDialog));
  //     } else {
  //       dispatch(sendMessage(data, existingDialog?.id));
  //     }
  //   };

  //   socket.on("receive_message", handleReceiveMessage);

  //   return () => {
  //     socket.off("receive_message", handleReceiveMessage);
  //   };
  // }, [dialogs, dispatch, socket]);

  const formatTimestamp = (timestamp) => {
    const currentDate = new Date();
    const messageDate = new Date(timestamp);
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);

    if (messageDate >= today) {
      const hours = messageDate.getHours().toString().padStart(2, "0");
      const minutes = messageDate.getMinutes().toString().padStart(2, "0");
      return `Сегодня ${hours}:${minutes}`;
    } else {
      const yesterday = new Date(currentDate);
      yesterday.setDate(currentDate.getDate() - 1);

      if (messageDate >= yesterday) {
        const hours = messageDate.getHours().toString().padStart(2, "0");
        const minutes = messageDate.getMinutes().toString().padStart(2, "0");
        return `Вчера ${hours}:${minutes}`;
      } else {
        return "Давно";
      }
    }
  };

  async function setUserDialog(data) {
    try {
      const response = await fetch(
        `${serverConfig.host}${serverConfig.port}/setUserDialog`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Error user:", error);
    }
  }

  async function setNewUser(data) {
    try {
      const response = await fetch(
        `${serverConfig.host}${serverConfig.port}/setNewUser`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Error user:", error);
    }
  }

  const handleDialogClick = (dialog) => {
    const existingDialog = isDialogExist(dialogs, dialog.id);

    if (!selectedDialog && !existingDialog) {
      const generatedId = Number(user.id) + Number(dialog.id);

      if (dialog.type === "group") {
        // const groupLimitStatus = checkGroupLimit(
        //   [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
        //   dialog?.ownerPremium
        // );
        const groupLimitStatus = checkGroupLimit(dialog?.users, dialog?.ownerPremium)

        const newUser = {
          ...dialog,
          newUserId: Number(user.id),
          id: Number(dialog.id),
        };

        if (!groupLimitStatus) {
          setNewUser(newUser);

          dispatch(setNewDialog(newUser));
          dispatch(selectDialog(newUser));

          navigate(`/messages/${newUser.id}`);

          dialogs.push(newUser);

          setLocalSearchResults(dialogs);
          setSearchText("");
        } else {
          setGroupLimit({ groupName: dialog.groupName });
        }
      } else {
        const newDialog = {
          ...dialog,
          id: generatedId,
          ownerId: user.id,
          userId: dialog.id,
        };

        setUserDialog(newDialog);

        dispatch(setNewDialog(newDialog));
        dispatch(selectDialog(newDialog));

        navigate(`/messages/${generatedId}`);

        dialogs.push(newDialog);

        setLocalSearchResults(dialogs);
        setSearchText("");
      }
    } else {
      navigate(`/messages/${dialog.id}`);
    }
  };

  const handleCreateGroup = () => {
    navigate(`/messages/`);
    setCreateNewGroup(!createNewGroup);
  };

  useEffect(() => {
    if (selectedDialog && id) {
      dispatch(selectDialog(selectedDialog));
    }
  }, [selectedDialog, id, dispatch, dialogs]);

  const handleSendMessage = () => {
    if (!selectedDialog || !selectedDialog.id) {
      console.error("Выбранный диалог отсутствует или не имеет id");
      return;
    }

    if (message.trim() === "" && !selectedFileURL) {
      return;
    }

    const sender = user.login;
    const timestamp = new Date();
    const isDoc = !!selectedFileURL;

    const newMessage = {
      forSever: {
        text: isDoc ? null : message,
        sender,
        timestamp,
        room: String(selectedDialog.id),
        ownerId: selectedDialog.ownerId,
        userId: selectedDialog.userId,
        senderId: user.id,
        isDoc,
        docURL: isDoc ? selectedFileURL : null,
        type: selectedDialog?.type,
      },
      forMessage: {
        text: isDoc ? null : message,
        sender,
        timestamp,
        room: String(selectedDialog.id),
        owner_id: selectedDialog.ownerId,
        user_id: selectedDialog.userId,
        sender_id: user.id,
        is_doc: isDoc,
        doc_url: isDoc ? selectedFileURL : null,
        type: selectedDialog?.type,
      },
    };

    dispatch(sendMessage(newMessage.forMessage));
    socket.emit("send_message", newMessage.forSever);

    setMessage("");
    setSelectedFile(null);
    setSelectedFileURL(null);
  };

  const getStatusColor = (isOnline) => {
    return isOnline ? "green" : "gray";
  };

  const searchDialogs = (query) => {
    return dialogs.filter((dialog) =>
      dialog.login.toLowerCase().includes(query.toLowerCase())
    );
  };

  const checkGroupLimit = (users, havePremium) => {
    if (!havePremium) {
      if (users?.length > 9) {
        return true;
      }
      return false;
    }
  };

  const searchGlobal = async (query) => {
    try {
      const responseUsers = await fetch(
        `${serverConfig.host}${serverConfig.port}/getUsers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        }
      );

      const responseGroups = await fetch(
        `${serverConfig.host}${serverConfig.port}/getGroups`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        }
      );

      const users = await responseUsers.json();

      const groups = await responseGroups.json();

      const result = [...users, ...groups];

      return result;
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  const handleSearch = async (event) => {
    const searchText = event.target.value;
    setSearchText(searchText);

    searchRef.current = searchText;

    if (searchText.trim() === "") {
      setLocalSearchResults(dialogs);
    } else {
      const chatResults = searchDialogs(searchText);
      setLocalSearchResults(chatResults);

      if (chatResults.length === 0) {
        const globalResults = await searchGlobal(searchText);

        const filteredResults = globalResults.filter(
          (result) => result.id !== user.id
        );
        if (searchRef.current === searchText) {
          setLocalSearchResults(filteredResults);
        }
      }
    }
  };

  const handleGroupOptionsClick = () => {
    setGroupOptionsVisible(!groupOptionsVisible);
  };

  const handleSelectFile = async (document) => {
    const docData = new FormData();
    docData.append("document", document);

    try {
      const response = await fetch(
        `${serverConfig.host}${serverConfig.port}/sendDocument`,
        {
          method: "POST",
          body: docData,
        }
      );

      const result = await response.json();

      if (result) {
        setSelectedFileURL(result.url);
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
    }
  };

  const generateGroup = async (groupImageInfo, groupName, ownerId) => {
    const groupImage = new FormData();
    groupImage.append("groupImage", groupImageInfo);

    try {
      const getAvatarURL = await fetch(
        `${serverConfig.host}${serverConfig.port}/saveGroupAvatar`,
        {
          method: "POST",
          body: groupImage,
        }
      );

      const { url } = await getAvatarURL.json();

      const getGeneratedGroupID = await fetch(
        `${serverConfig.host}${serverConfig.port}/getGeneratedGroupID`
      );

      const { id } = await getGeneratedGroupID.json();

      const newGroup = {
        id,
        avatarURL: url,
        login: groupName,
        ownerId,
        users: [ownerId],
        type: "group",
      };

      await fetch(`${serverConfig.host}${serverConfig.port}/setUserGroup`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newGroup),
      });
    } catch (error) {
      console.error("Error generate group:", error);
    }
  };

  const updateGroupInfo = async ({
    groupImageInfo,
    groupName,
    groupId,
    oldAvatar,
  }) => {
    try {
      let url;

      if (!oldAvatar) {
        const groupImage = new FormData();
        groupImage.append("groupImage", groupImageInfo);

        const getAvatarURL = await fetch(
          `${serverConfig.host}${serverConfig.port}/saveGroupAvatar`,
          {
            method: "POST",
            body: groupImage,
          }
        );

        const { url: newUrl } = await getAvatarURL.json();
        url = newUrl;
      } else {
        url = groupImageInfo;
      }

      const updatedGroupInfo = {
        avatarURL: url,
        groupName,
        groupId,
      };

      const response = await fetch(
        `${serverConfig.host}${serverConfig.port}/updateGroupInfo`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedGroupInfo),
        }
      );

      return response.json();
    } catch (error) {
      console.error("Error updating group:", error);
    }
  };

  return (
    <div className="container mt-4">
      <>
        {loading ? (
          <div className="spinner-wrapper">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row">
            <DialogList
              handleCreateGroup={handleCreateGroup}
              searchResults={localSearchResults}
              selectedDialog={selectedDialog}
              handleDialogClick={handleDialogClick}
              searchText={searchText}
              handleSearch={handleSearch}
              getStatusColor={getStatusColor}
              formatTimestamp={formatTimestamp}
            />
            <Chat
              groupLimit={groupLimit}
              getStatusColor={getStatusColor}
              handleSelectFile={handleSelectFile}
              selectedDialog={selectedDialog}
              message={message}
              setMessage={setMessage}
              handleSendMessage={handleSendMessage}
              user={user}
              formatTimestamp={formatTimestamp}
              handleGroupOptionsClick={handleGroupOptionsClick}
              serverConfig={serverConfig}
              getUserData={getUserData}
              setSelectedFile={setSelectedFile}
              selectedFile={selectedFile}
              fileInputRef={fileInputRef}
              groupOptionsVisible={groupOptionsVisible}
              updateGroupInfo={updateGroupInfo}
            />
            <CreateNewGroup
              setCreateNewGroup={setCreateNewGroup}
              status={createNewGroup}
              setUserDialog={setUserDialog}
              generateGroup={generateGroup}
            />
          </div>
        )}
      </>
    </div>
  );
}
