import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import {
  selectDialog,
  sendMessage,
  setMessages,
  setNewDialog,
} from "../../redux/actionCreaters/actionCreater";
import { useParams, useNavigate } from "react-router-dom";

import telegramLogo from "../../assets/image/telegram_logo.png";

import "./Messages.css";
import { selectIsAuth, selectServerConfig } from "../../selectors";

const socket = io.connect(`http://localhost:4000`);

export default function Messages() {
  const dialogs = useSelector((state) => state.user.dialogs);
  const user = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAuth = useSelector(selectIsAuth);
  const [loading, setLoading] = useState(true);

  const { id } = useParams();

  const selectedDialog = dialogs.find((dialog) => dialog.id === parseInt(id));

  const [message, setMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState(dialogs);


  const serverConfig = useSelector(selectServerConfig);

  const isDialogExist = (dialogs, dialogId) => {
    return dialogs.some((dialog) => dialog.id === dialogId);
  };

  const joinRoom = async () => {
    const dialogExist = isDialogExist(dialogs, Number(id));

    if (id && dialogExist) {
      socket.emit("join_room", id);
      const res = await fetch(
        `${serverConfig.host}${serverConfig.port}/getRoomMessages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        }
      );

      const resJson = await res.json();

      dispatch(setMessages(resJson));
    }
  };

  useEffect(() => {
    console.log("joinRoom");
    joinRoom();
  }, [id, socket]);

  useEffect(() => {
    setSearchResults(dialogs)
  }, [dialogs])

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

  useEffect(() => {
    const handleReceiveMessage = (data) => {

      const existingDialog = dialogs.find(
        (dialog) => dialog.login === data.sender
      );

      if (!existingDialog) {
        const newDialog = {
          login: data.sender,
          id: data.room,
          isOnline: false,
          messages: [data],
        };

        dispatch(setNewDialog(newDialog));
      } else {
        dispatch(sendMessage(data, existingDialog?.id));
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [dialogs, dispatch, socket]);

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


  const handleDialogClick = (dialog) => {
    const existingDialog = isDialogExist(dialogs, dialog.id);

    if (!selectedDialog && !existingDialog) {
      const generatedId = Number(user.id) + Number(dialog.id);
      const newDialog = { ...dialog, id: generatedId, ownerId: user.id, room: generatedId }
      
      setUserDialog(newDialog)

      dispatch(setNewDialog(newDialog));
      dispatch(selectDialog(newDialog));

      navigate(`/messages/${generatedId}`);
      
      dialogs.push(newDialog)

      setSearchResults(dialogs)
      setSearchText("")
      
    } else {
      navigate(`/messages/${dialog.id}`);
    }

    // socket.emit("select_dialog", dialog);
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

    if (message.trim() === "") return;

    const sender = user.login;
    const timestamp = new Date();
    const newMessage = {
      text: message,
      sender,
      timestamp,
      room: String(selectedDialog.id),
    };

    dispatch(sendMessage(newMessage));
    socket.emit("send_message", newMessage);

    setMessage("");
  };

  const getStatusColor = (isOnline) => {
    return isOnline ? "green" : "gray";
  };

  const searchDialogs = (query) => {
    return dialogs.filter((dialog) =>
      dialog.login.toLowerCase().includes(query.toLowerCase())
    );
  };

  const searchGlobal = async (query) => {
    try {
      const response = await fetch(
        `${serverConfig.host}${serverConfig.port}/getUsers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();

      return result;
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  const handleSearch = async (event) => {
    const searchText = event.target.value;
    setSearchText(searchText);

    if (searchText.trim() === "") {
      setSearchResults(dialogs);
    } else {
      const chatResults = searchDialogs(searchText);
      setSearchResults(chatResults);

      if (chatResults.length === 0) {
        const globalResults = await searchGlobal(searchText);

        const filteredResults = globalResults.filter(
          (result) => result.id !== user.id
        );

        setSearchResults(filteredResults);
      }
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
            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Поиск"
                    value={searchText}
                    onChange={handleSearch}
                  />
                </div>
                <div className="card-body">
                  <ul className="list-group">
                    {searchResults?.map((result, id) => (
                      <li
                        key={id}
                        className={`list-group-item ${
                          result === selectedDialog ? "active" : ""
                        }`}
                        onClick={() => handleDialogClick(result)}
                      >
                        <div className="dialog-info">
                          <div className="avatar-block">
                            <img
                              src={result?.avatarURL}
                              alt={result?.login}
                              className="avatar"
                            />
                            <div
                              className="status-circle"
                              style={{
                                backgroundColor: getStatusColor(
                                  result?.isOnline
                                ),
                              }}
                            ></div>
                          </div>
                          <div className="dialog-text">
                            <div className="name-time">
                              {result && result.login !== undefined
                                ? result.login
                                : null}
                              <span className="message-timestamp text-muted">
                                {result &&
                                result.messages &&
                                result.messages.length > 0 &&
                                result.messages[result.messages.length - 1] &&
                                result.messages[result.messages.length - 1]
                                  .timestamp !== undefined
                                  ? formatTimestamp(
                                      result.messages[
                                        result.messages.length - 1
                                      ].timestamp
                                    )
                                  : null}
                              </span>
                            </div>

                            <div className="message-text">
                              {result &&
                              result.messages &&
                              result.messages.length > 0 &&
                              result.messages[result.messages.length - 1] &&
                              result.messages[result.messages.length - 1]
                                .text !== undefined
                                ? result.messages[result.messages.length - 1]
                                    .text.length > 40
                                  ? `${result.messages[
                                      result.messages.length - 1
                                    ].text.slice(0, 40)}...`
                                  : result.messages[result.messages.length - 1]
                                      .text
                                : ""}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-8">
              {selectedDialog ? (
                <div className="card card-chat">
                  <div className="card-header text-center">
                    {selectedDialog.login}
                    {selectedDialog.isOnline ? (
                      <span className="small">онлайн</span>
                    ) : (
                      <span className="small">не в сети</span>
                    )}
                  </div>
                  <div
                    className="card-body message-list"
                    style={{ overflow: "auto", maxHeight: "400px" }}
                  >
                    {selectedDialog.messages.map((msg, index) => (
                      <div className="messages" key={index}>
                        <div className="avatar-block">
                          <img
                            src={
                              msg.sender === "me"
                                ? user.avatarURL
                                : selectedDialog.avatarURL
                            }
                            alt={
                              msg.sender === "me"
                                ? user.login
                                : selectedDialog.login
                            }
                            className="avatar"
                          />
                        </div>
                        <div
                          className={`message mb-2 p-2 ${
                            msg.sender === "me" ? "sent" : "received"
                          }`}
                        >
                          <div
                            className={`message-content ${
                              msg.sender === "me" ? "text-right" : ""
                            }`}
                          >
                            <div className="message-sender">
                              {msg.sender === "me" ? user.login : msg.sender}
                              <span className="message-timestamp text-muted">
                                {formatTimestamp(msg.timestamp)}
                              </span>
                            </div>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="card-footer">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Введите сообщение"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                      <div className="input-group-append">
                        <img
                          onClick={handleSendMessage}
                          src={telegramLogo}
                          alt=""
                          className="btn-send"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="alert alert-info mt-3">
                  Выберите диалог, чтобы начать чат
                </div>
              )}
            </div>
          </div>
        )}
      </>
    </div>
  );
}
