import React, { useState, useEffect } from "react";
import "./CreateNewGroup.css";
import { useDispatch, useSelector } from "react-redux";
import { selectServerConfig } from "../../../selectors";
import {
  selectDialog,
  setNewDialog,
} from "../../../redux/actionCreaters/actionCreater";
import { useNavigate } from "react-router-dom";

export default function CreateNewGroup({
  status,
  setCreateNewGroup,
  setUserDialog,
  generateGroup,
}) {
  const [channelName, setChannelName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const user = useSelector((state) => state.user);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const maxParticipantsInfo = user?.havePremium
    ? "Не ограничено"
    : "Макс. 10 участников";

  const clearForm = () => {
    setSelectedFile(null);
    setChannelName("");
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setCreateNewGroup(false);
        clearForm();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [successMessage, setCreateNewGroup]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!channelName) {
      newErrors.channelName = "Поле 'Название канала' обязательно";
    }
    if (!selectedFile) {
      newErrors.avatarFile = "Выберите аватарку канала";
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setSuccessMessage("Канал успешно создан!");

      const newDialog = await generateGroup(selectedFile, channelName, user.id);

      setUserDialog(newDialog);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  return (
    <>
      {status && (
        <div className="popup-wrapper">
          <div className="popup-body">
            <form onSubmit={handleSubmit}>
              {successMessage && (
                <div className="alert alert-success" role="alert">
                  {successMessage}
                </div>
              )}
              <div
                onClick={() => {
                  setCreateNewGroup(!status);
                  clearForm();
                }}
                className="close-popup"
              >
                &#10006;
              </div>

              <div className="form-group">
                <label htmlFor="channelName">Название канала</label>
                <input
                  type="text"
                  className={`form-control ${
                    errors.channelName ? "is-invalid" : ""
                  }`}
                  id="channelName"
                  placeholder="Введите название канала"
                  value={channelName}
                  onChange={(e) => {
                    setChannelName(e.target.value);

                    if (errors.channelName) {
                      setErrors({ ...errors, channelName: undefined });
                    }
                  }}
                />
                {errors.channelName && (
                  <div className="invalid-feedback">{errors.channelName}</div>
                )}
              </div>
              <hr />
              <div className="form-group">
                <label htmlFor="avatarFile">Выберите аватарку канала: </label>
                <input
                  type="file"
                  className={`form-control-file ${
                    errors.avatarFile ? "is-invalid" : ""
                  }`}
                  id="avatarFile"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {errors.avatarFile && (
                  <div className="invalid-feedback">{errors.avatarFile}</div>
                )}
              </div>
              <div className="form-group">
                <hr />
                <p>{`Максимальное количество участников: ${maxParticipantsInfo}`}</p>
                <hr />
              </div>
              <button
                type="submit"
                style={{ width: "100%" }}
                className="styled-button"
              >
                Создать
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
