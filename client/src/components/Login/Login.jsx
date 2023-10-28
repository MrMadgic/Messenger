import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { useSelector } from "react-redux";
import { selectIsAuth } from "../../selectors";

export default function Login() {
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    login: "",
    password: "",
  });

  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuth);

  useEffect(() => {
    if (isAuth) {
      navigate("/messages");
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let hasError = false;

    if (formData.login.trim() === "") {
      setErrors({ ...errors, login: "Логин не может быть пустым" });
      hasError = true;
    }

    if (formData.password.trim() === "") {
      setErrors({ ...errors, password: "Пароль не может быть пустым" });
      hasError = true;
    }

    if (!hasError) {
      alert("Авторизация успешно завершена");
    }
  };

  return (
    <div className="login section-box">
      <h2>Авторизация</h2>
      <hr />

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="login" className="form-label">
            Логин
          </label>
          <input
            type="text"
            className="form-control"
            id="login"
            name="login"
            value={formData.login}
            onChange={handleChange}
            placeholder="Введите ваш логин"
            autoComplete="username"
          />
          {errors.login && (
            <div className="text-danger">{errors.login}</div>
          )}
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Пароль
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Введите ваш пароль"
            autoComplete="current-password"
          />
          {errors.password && (
            <div className="text-danger">{errors.password}</div>
          )}
        </div>
        <hr />
        <button type="submit" className="btn btn-primary">
          Войти
        </button>
      </form>

      <p className="mt-3">
        Нет аккаунта? <Link to="/signup">Зарегистрируйтесь</Link>
      </p>
    </div>
  );
}
