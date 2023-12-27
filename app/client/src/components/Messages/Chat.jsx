import React, { useEffect, useState } from "react";
import telegramLogo from "../../assets/image/telegram_logo.png";
import clipImage from "../../assets/image/clip.png";
import docImage from "../../assets/image/document.png";
import GroupOptions from "./GroupOptions/GroupOptions";
import GroupIcon from "../../assets/image/group-icon.png";

function Chat({
  selectedDialog,
  message,
  setMessage,
  handleSendMessage,
  user,
  formatTimestamp,
  handleGroupOptionsClick,
  groupOptionsVisible,
  getUserData,
  serverConfig,
  handleSelectFile,
  setSelectedFile,
  selectedFile,
  fileInputRef,
  getStatusColor,
  updateGroupInfo,
  groupLimit,
}) {
  const onFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleSelectFile(file);
      setSelectedFile(file);
    }
  };

  const isFileSelected = selectedFile !== null;
  const fileName = isFileSelected
    ? selectedFile.name.length > 100
      ? selectedFile.name.slice(0, 97) + "..."
      : selectedFile.name
    : "";

  const isGroup = selectedDialog?.type === "group";
  const [isGroupAdmin, setIsGroupAdmin] = useState(false);

  useEffect(() => {
    if (Number(user?.id) === Number(selectedDialog?.ownerId)) {
      setIsGroupAdmin(true);
    }
  }, [user, selectedDialog]);

  return (
    <div className="col-md-8">
      {selectedDialog ? (
        <div className="card card-chat">
          <div className="card-header text-center">
            <div className="card-header-status">
              <span>

              {selectedDialog.login}

              </span>

              {selectedDialog?.type === "group" ? (
                <div className="chat-type">
                  <img alt={selectedDialog?.type} src={GroupIcon} />
                </div>
              ) : selectedDialog.isOnline ? (
                <span className="small">онлайн</span>
              ) : (
                <span className="small">не в сети</span>
              )}
            </div>

            {isGroup &&
              (isGroupAdmin ? (
                !groupOptionsVisible ? (
                  <div
                    className="card-header-admin dots-icon"
                    onClick={handleGroupOptionsClick}
                  >
                    &#65049;
                  </div>
                ) : (
                  <div
                    className="card-header-admin close-icon"
                    onClick={handleGroupOptionsClick}
                  >
                    &#10006;
                  </div>
                )
              ) : null)}
          </div>

          {groupOptionsVisible && (
            <GroupOptions
              updateGroupInfo={updateGroupInfo}
              getUserData={getUserData}
              dialog={selectedDialog}
              user={user}
              serverConfig={serverConfig}
              getStatusColor={getStatusColor}
            />
          )}

          <div
            className={`card-body message-list`}
            style={{ overflow: "auto", maxHeight: "400px" }}
          >
            {selectedDialog.messages.map((msg, index) => (
              <div
                className={`messages ${msg.sender === user?.login && "sent"}`}
                key={index}
              >
                <div className="avatar-block">
                  {selectedDialog.type === "group" ? (
                    <img
                      src={msg?.avatarURL}
                      alt={msg?.login}
                      className="avatar"
                    />
                  ) : (
                    <img
                      src={
                        msg.sender === user.login
                          ? user.avatarURL
                          : selectedDialog.avatarURL
                      }
                      alt={
                        msg.sender === user.login
                          ? user.login
                          : selectedDialog.login
                      }
                      className="avatar"
                    />
                  )}
                </div>
                <div className={`message mb-2 p-2 `}>
                  <div className={`message-content`}>
                    <div className="message-sender">
                      {msg.sender === user?.login ? user.login : msg.sender}
                      <span className="message-timestamp text-muted">
                        {formatTimestamp(msg.timestamp)}
                      </span>
                    </div>
                    <div className="message-messag">
                      {msg.is_doc ? (
                        <div className="doc-image">
                          <a href={msg.doc_url}>
                            <img alt="docImage" src={docImage} />
                          </a>
                        </div>
                      ) : (
                        msg.text
                      )}

                      {selectedDialog.type !== "group" ? (
                        msg.is_read === 1 ? (
                          <div className="message-status">
                            <i className="message-status_wrapper message-status_true">
                              &#10004;
                            </i>
                          </div>
                        ) : (
                          <div className="message-status">
                            <i className="message-status_wrapper message-status_false">
                              &#10004;
                            </i>
                          </div>
                        )
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="card-footer">
            <div className="input-group">
              <div className="input-group-select-file">
                <img
                  src={clipImage}
                  alt="select-file"
                  className="btn-select-file"
                  onClick={() => fileInputRef.current.click()}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={onFileInputChange}
                />
              </div>
              <input
                type="text"
                className="form-control"
                placeholder={isFileSelected ? "" : "Введите сообщение"}
                value={isFileSelected ? fileName : message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isFileSelected}
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
          {groupLimit && (
            <div className="group-limit-info">
              {groupLimit.groupName ? (
                <p>В этой группе слишком много участников</p>
              ) : null}
            </div>
          )}
          Выберите диалог, чтобы начать чат
        </div>
      )}
    </div>
  );
}

export default Chat;
