import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";
import { useSelector } from "react-redux";
import { selectIsAuth } from "../../selectors";

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (formData.username.trim() === "") {
      setErrors({ ...errors, username: "Логин не может быть пустым" });
      hasError = true;
    }

    if (formData.email.trim() === "") {
      setErrors({ ...errors, email: "Почта не может быть пустой" });
      hasError = true;
    }

    if (formData.password.trim() === "") {
      setErrors({ ...errors, password: "Пароль не может быть пустым" });
      hasError = true;
    }

    if (formData.confirmPassword.trim() === "") {
      setErrors({
        ...errors,
        confirmPassword: "Подтверждение пароля не может быть пустым",
      });
      hasError = true;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors({ ...errors, confirmPassword: "Пароли не совпадают" });
      hasError = true;
    }

    if (!hasError) {
      alert("Регистрация успешно завершена");
    }
  };

  return (
    <div className="signup section-box">
      <h2>Зарегистрироваться</h2>
      <hr />

      <form className="signup-form" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Логин
          </label>
          <input
            type="text"
            className="form-control"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Введите логин"
            autoComplete="username"
          />
          {errors.username && (
            <div className="text-danger">{errors.username}</div>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Почта
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Введите адрес электронной почты"
            autoComplete="email"
          />
          {errors.email && <div className="text-danger">{errors.email}</div>}
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
            placeholder="Введите пароль"
            autoComplete="new-password"
          />
          {errors.password && (
            <div className="text-danger">{errors.password}</div>
          )}
        </div>
        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">
            Подтвердите пароль
          </label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Подтвердите пароль"
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <div className="text-danger">{errors.confirmPassword}</div>
          )}
        </div>
        <hr />
        <button type="submit" className="btn btn-primary">
          Зарегистрироваться
        </button>
      </form>

      <p className="mt-3">
        Уже есть аккаунт? <Link to="/login">Авторизуйтесь</Link>
      </p>
    </div>
  );
}
