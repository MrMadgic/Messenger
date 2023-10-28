import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectDialog,
  sendMessage,
} from "../../redux/actionCreaters/actionCreater";
import { useParams, useNavigate } from "react-router-dom";

import telegramLogo from "../../assets/image/telegram_logo.png";

import "./Messages.css";
import { selectIsAuth } from "../../selectors";

export default function Messages() {
  const dialogs = useSelector((state) => state.user.dialogs);
  const user = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAuth = useSelector(selectIsAuth);
  const [loading, setLoading] = useState(true);

  const { id } = useParams();

  const selectedDialog = dialogs.find((dialog) => dialog.id === parseInt(id));

  useEffect(() => {
    if (!isAuth) {
      setTimeout(() => {
        navigate("/signup");
        setLoading(false);
      }, 1000);
    } else {
      setLoading(false);
    }
  }, [isAuth, navigate]);

  useEffect(() => {
    if (!selectedDialog) {
      navigate("/messages");
    }
  }, [selectedDialog, navigate]);

  const [message, setMessage] = useState("");

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

  const handleDialogClick = (dialog) => {
    dispatch(selectDialog(dialog));
    navigate(`/messages/${dialog.id}`);
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

    const sender = "me";
    const timestamp = new Date();
    const newMessage = { text: message, sender, timestamp };

    dispatch(sendMessage(newMessage));

    setMessage("");
  };

  const getStatusColor = (isOnline) => {
    return isOnline ? "green" : "gray";
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
                  />
                </div>
                <div className="card-body">
                  <ul className="list-group">
                    {dialogs.map((dialog) => (
                      <li
                        key={dialog.id}
                        className={`list-group-item ${
                          dialog === selectedDialog ? "active" : ""
                        }`}
                        onClick={() => handleDialogClick(dialog)}
                      >
                        <div className="dialog-info">
                          <div className="avatar-block">
                            <img
                              src={dialog.avatarURL}
                              alt={dialog.login}
                              className="avatar"
                            />
                            <div
                              className="status-circle"
                              style={{
                                backgroundColor: getStatusColor(
                                  dialog.isOnline
                                ),
                              }}
                            ></div>
                          </div>
                          <div className="dialog-text">
                            <div className="name-time">
                              {dialog.login}
                              <span className="message-timestamp text-muted">
                                {formatTimestamp(
                                  dialog.messages[dialog.messages.length - 1]
                                    ?.timestamp
                                )}
                              </span>
                            </div>
                            <div className="message-text">
                              {dialog.messages[dialog.messages.length - 1]?.text
                                ? dialog.messages[dialog.messages.length - 1]
                                    ?.text.length > 40
                                  ? `${dialog.messages[
                                      dialog.messages.length - 1
                                    ].text.slice(0, 40)}...`
                                  : dialog.messages[dialog.messages.length - 1]
                                      ?.text
                                : "..."}
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
                      <div className="messages">
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
                          key={index}
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
