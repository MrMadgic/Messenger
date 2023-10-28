import React, { useEffect, useState } from 'react';
import './Settings.css';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUserData } from '../../redux/actionCreaters/actionCreater';
import { selectIsAuth } from '../../selectors';

export default function Settings() {
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuth);
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [newLogin, setNewLogin] = useState(user.login);
  const [newPassword, setNewPassword] = useState(user.password);
  const [newEmail, setNewEmail] = useState(user.email);
  const [selectedSection, setSelectedSection] = useState('profile');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!isAuth) {
      setLoading(true);
      setTimeout(() => {
        navigate('/signup');
        setLoading(false);
      }, 1000);
    } else {
      setLoading(false);
    }
  }, [isAuth, navigate]);

  const handleSaveChanges = () => {
    if (!newLogin || !newPassword || !newEmail) {
      return;
    }

    const updatedUserData = {
      login: newLogin,
      password: newPassword,
      email: newEmail,
    };
    dispatch(setUserData(updatedUserData));
    setIsSaved(true);

    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const handleProfileLinkClick = () => {
    navigate('/settings/profile');
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
                  onClick={() => setSelectedSection('profile')}
                  className={`list-group-item ${selectedSection === 'profile' ? 'active' : ''}`}
                >
                  <a href="#profile" onClick={handleProfileLinkClick}>Профиль</a>
                </li>
                <li
                  onClick={() => setSelectedSection('themes')}
                  className={`list-group-item ${selectedSection === 'themes' ? 'active' : ''}`}
                >
                  <a href="#themes">Темы</a>
                </li>
              </ul>
            </div>
            <div className="col-md-9">
              {isSaved && (
                <div className="alert alert-success mt-2" role="alert">
                  Данные успешно сохранены!
                </div>
              )}
              {selectedSection === 'profile' && (
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
                      />
                    </div>
                    <div className="button-container text-center">
                      <button
                        className="btn btn-primary"
                        onClick={handleSaveChanges}
                      >
                        Сохранить изменения
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {selectedSection === 'themes' && (
                <div className="card">
                  <div className="card-header">
                    <h2>Темы</h2>
                  </div>
                  <div className="card-body">
                    {/* Здесь вы можете добавить настройки тем */}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
