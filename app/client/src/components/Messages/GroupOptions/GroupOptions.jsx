import React, { useState } from "react";
import "./GroupOptions.css";

export default function GroupOptions({
  getUserData,
  serverConfig,
  dialog,
  user,
  getStatusColor,
  updateGroupInfo,
}) {
  const [groupName, setGroupName] = useState(dialog.login || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  const havePremium = user?.havePremium;


  const handleSaveClick = async () => {
    if (!groupName) {
      setSaveStatus({
        type: "danger",
        message: "Пожалуйста, заполните все поля",
      });
      setTimeout(() => {
        setSaveStatus(null);
      }, 5000);
      return;
    }

    const avatar = !avatarFile ? dialog.avatarURL : avatarFile;

    const data = {
      groupImageInfo: avatar,
      oldAvatar: !avatarFile,
      groupName,
      groupId: dialog?.id,
    };

    const response = await updateGroupInfo(data);

    setSaveStatus({
      type: "info",
      message: "Обновление..."
    });

    setTimeout(() => {
      if (response?.message) {
        setSaveStatus({
          type: "success",
          message: "Информация о группе успешно сохранена",
        });
      } else {
        setSaveStatus({
          type: "danger",
          message: "Не удалось сохранить информацию о группе",
        });
      }
  
      setTimeout(() => {
        setSaveStatus(null);
      }, 2000);
    }, 4000);
  };

  const handleCopyLinkClick = () => {
    navigator.clipboard.writeText(dialog.groupName);
    setSaveStatus({
      type: "info",
      message: "Ссылка на группу успешно скопирована",
    });
    setTimeout(() => {
      setSaveStatus(null);
    }, 5000);
  };

  async function blockUser(data) {
    if (user.isAdmin) {
      try {
        const response = await fetch(
          `${serverConfig.host}${serverConfig.port}/blockUser`,
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

        const result = await response.json();

        if (result) {
          return result;
        }
      } catch (error) {
        console.error("Error user:", error);
      }
    } else {
      setSaveStatus({ type: "danger", message: "Не достаточно прав" });
    }
  }

  const handleBlockUserClick = async () => {
    const result = await getUserData(dialog.login);
    const data = {
      adminId: user.id,
      adminLogin: user.login,
      blockedUserId: result.user_id,
      blockedUserLogin: result.login,
    };

    const response = await blockUser(data);

    if (response?.status) {
      window.location.reload();
    } else {
      setSaveStatus({ type: "danger", message: "Status not true" });
    }
  };

  return (
    <div className="admin-options-popup-wrapper">
      <div className="admin-options-popup">
        <form>
          <div className="form-group">
            <label htmlFor="groupName">Название группы:</label>
            <input
              type="text"
              className="form-control"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          <hr />
          <div className="form-group">
            <label htmlFor="avatarFile">Сменить аватарку группы:</label>
            {avatarFile ? (
              <p>Selected: {avatarFile.name}</p>
            ) : (
              <input
                type="file"
                accept="image/*"
                id="avatarFile"
                onChange={(e) => setAvatarFile(e.target.files[0])}
              />
            )}
          </div>
          <hr />
          <div>
            Подписка:{" "}
            {havePremium
              ? "присутствует"
              : "не оплачено, ограничение 10 пользователей"}
          </div>

          {saveStatus && (
            <div className={`alert alert-${saveStatus.type}`} role="alert">
              {saveStatus.message}
            </div>
          )}

          <button
            type="button"
            onClick={handleSaveClick}
            className="styled-button"
          >
            Сохранить
          </button>

          <p>Пригласить пользователя: </p>
          <button
            type="button"
            className="styled-button"
            onClick={handleCopyLinkClick}
          >
            Копировать названия группы
          </button>
          {user?.isAdmin ? (
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleBlockUserClick}
            >
              Заблокировать пользователя
            </button>
          ) : null}
          <hr />
          <h4>Пользователи: </h4>
          <div className="group-users">
            {dialog?.groupUsers?.map((groupUser, id) => (
              <div key={id} className="dialog-info">
                <div className="avatar-block">
                  <img
                    src={groupUser?.avatar_url}
                    alt={groupUser?.login}
                    className="avatar"
                  />
                </div>
                <div
                  className="status-circle"
                  style={{
                    backgroundColor: getStatusColor(groupUser?.is_online),
                  }}
                ></div>
                <div className="dialog-text">
                  <div className="name-time">
                    {groupUser && groupUser.login !== undefined
                      ? groupUser.login
                      : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}
