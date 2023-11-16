## Запуск Node.js сервера и React-фронтенда (Docker)

1. **Запуск Dockerfile**
   ```bash
   docker build -t app-container .
   docker run -p 3001:3001 -p 3000:3000 -p 4000:4000 app-container

## Запуск Node.js сервера и React-фронтенда (CMD)

2. **Установите Node.js и npm**:
   Убедитесь, что на вашем компьютере установлены Node.js и npm. Вы можете скачать их с официального сайта: [Node.js](https://nodejs.org/).

3. **Установите dump sql базы**
   ```bash
   mysql -u ВАШ ЮЗЕР НЕЙМ -p
   CREATE DATABASE messanger;
   mysql -u ВАШ ЮЗЕР НЕЙМ -p messanger < path/to/initial_data.sql

4. **Запуск приложения**
   ```bash
   server/ npm i && node index.js
   client/ npm i && npm start