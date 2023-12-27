import React, { useEffect, useState } from "react";
import "./Settings.css";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setUserData,
  setUserLogin,
  setUserSettings,
} from "../../redux/actionCreaters/actionCreater";
import { selectIsAuth, selectServerConfig } from "../../selectors";
import Cookies from "js-cookie";
import Subscribe from "./Subscribe";

export default function Settings() {
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuth);
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [newLogin, setNewLogin] = useState(user.login);
  const [newPassword, setNewPassword] = useState(user.password || "");
  const [newEmail, setNewEmail] = useState(user.email || "");
  const [newFirstName, setNewFirstName] = useState(user.firstName || "");
  const [newLastName, setNewLastName] = useState(user.lastName || "");
  const [newBio, setNewBio] = useState(user.bio || "");
  const [selectedSection, setSelectedSection] = useState("profile");
  const [isSaved, setIsSaved] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const serverConfig = useSelector(selectServerConfig);

  function fillUserData(userObject) {
    setNewLogin(userObject.login);
    setNewPassword(userObject.password || "");
    setNewEmail(userObject.email || "");
    setNewFirstName(userObject.first_name || "");
    setNewLastName(userObject.last_name || "");
    setNewBio(userObject.bio || "");
  }

  useEffect(() => {
    if (!isAuth) {
      setLoading(true);
      setTimeout(() => {
        navigate("/signup");
        setLoading(false);
      }, 1000);
    } else {
      setLoading(true);

      async function fetchData() {
        try {
          const response = await fetch(
            `${serverConfig.host}${serverConfig.port}/getUserData`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ login: user.login }),
            }
          );

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          const result = await response.json();

          if (result) {
            dispatch(setUserSettings(result));
            fillUserData(result);

            setTimeout(() => {
              setLoading(false);
            }, 2000);
          }
        } catch (error) {
          console.error("Error registering user:", error);
          setTimeout(() => {
            navigate("/");
            setLoading(false);
          }, 2000);
        }
      }

      fetchData();
    }
  }, [isAuth, navigate]);

  const handleSaveChanges = async (e) => {
    e.preventDefault();

    if (!newLogin || !newPassword || !newEmail) {
      return;
    }

    let avatarURL = user.avatarURL;
    if (selectedImage) {
      const avatarData = new FormData();
      avatarData.append("avatar", selectedImage);

      try {
        const avatarResponse = await fetch(
          `${serverConfig.host}${serverConfig.port}/setUserAvatar`,
          {
            method: "POST",
            body: avatarData,
          }
        );

        if (avatarResponse.ok) {
          const result = await avatarResponse.json();
          avatarURL = result.url;
        } else {
          console.error("Error uploading avatar:", avatarResponse);
        }
      } catch (error) {
        console.error("Error uploading avatar:", error);
      }
    }

    const userData = {
      oldLogin: user.login,
      login: newLogin,
      password: newPassword,
      email: newEmail,
      firstName: newFirstName,
      lastName: newLastName,
      bio: newBio,
      avatarURL,
    };

    try {
      const userDataResponse = await fetch(
        `${serverConfig.host}${serverConfig.port}/changeUserData`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      if (userDataResponse.ok) {
        const result = await userDataResponse.json();
        if (result?.message) {
          dispatch(setUserData(userData));
          setIsSaved(true);

          Cookies.set("login", userData.login);
          dispatch(setUserLogin(userData.login));

          setTimeout(() => {
            setIsSaved(false);
          }, 2000);
        }
      } else {
        console.error("Error changing user settings:", userDataResponse);
      }
    } catch (error) {
      console.error("Error changing user settings:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    setSelectedImage(file);
  };

  const handleProfileLinkClick = () => {
    setSelectedSection("profile");
  };

  const handleThemesLinkClick = () => {
    setSelectedSection("themes");
  };

  const handlePremiumLinkClick = () => {
    setSelectedSection("premium");
  };

  return (
    <>
      {loading ? (
        <div className="spinner-wrapper text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="container mt-4">
          <div className="row">
            <div className="col-md-3">
              <ul className="list-group">
                <li
                  onClick={handleProfileLinkClick}
                  className={`list-group-item ${
                    selectedSection === "profile" ? "active" : ""
                  }`}
                >
                  Профиль
                </li>
                <li
                  onClick={handleThemesLinkClick}
                  className={`list-group-item ${
                    selectedSection === "themes" ? "active" : ""
                  }`}
                >
                  Темы
                </li>
                <li
                  onClick={handlePremiumLinkClick}
                  className={`list-group-item ${
                    selectedSection === "premium" ? "active" : ""
                  }`}
                >
                  Подписка
                </li>
              </ul>
            </div>
            <div className="col-md-9">
              {isSaved && (
                <div className="alert alert-success mt-2" role="alert">
                  Данные успешно сохранены!
                </div>
              )}
              <form>
                {selectedSection === "profile" && (
                  <div className="card">
                    <div className="card-header">
                      <h2>Профиль</h2>
                    </div>
                    <div className="card-body">
                      <div className="form-group">
                        <label htmlFor="newLogin">Логин:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="newLogin"
                          value={newLogin}
                          onChange={(e) => setNewLogin(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="newPassword">Пароль:</label>
                        <input
                          type="password"
                          className="form-control"
                          id="newPassword"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          autoComplete="current-password"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="newEmail">Email:</label>
                        <input
                          type="email"
                          className="form-control"
                          id="newEmail"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          autoComplete="username"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="newFirstName">Имя:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="newFirstName"
                          value={newFirstName}
                          onChange={(e) => setNewFirstName(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="newLastName">Фамилия:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="newLastName"
                          value={newLastName}
                          onChange={(e) => setNewLastName(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="newBio">О себе:</label>
                        <textarea
                          className="form-control"
                          id="newBio"
                          value={newBio}
                          onChange={(e) => setNewBio(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="newAvatar">Загрузить аватар : </label>
                        <input
                          type="file"
                          id="newAvatar"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </div>
                      <div className="button-container text-center">
                        <button
                          className="btn btn-primary"
                          onClick={(e) => {
                            handleSaveChanges(e);
                          }}
                        >
                          Сохранить изменения
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {selectedSection === "themes" && (
                  <div className="card">
                    <div className="card-header">
                      <h2>Темы</h2>
                    </div>
                    <div className="card-body"></div>
                  </div>
                )}
                {selectedSection === "premium" && <Subscribe />}
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
