# Этап 1: Установка зависимостей и SQL-дампа
FROM node:18.17.0 AS builder
WORKDIR /app

# Установка Node.js и npm (Ubuntu)
RUN apt-get update && apt-get install -y nodejs npm
RUN apt-get install -y mysql-client

COPY . .

# Создание SQL-дампа для создания пользователя и назначения прав
RUN echo "CREATE USER 'admin'@'%' IDENTIFIED BY '0w)UrHtPUWZgKz]i';" > /app/mysql-init.sql
RUN echo "GRANT ALL PRIVILEGES ON *.* TO 'admin'@'%' WITH GRANT OPTION;" >> /app/mysql-init.sql

# Установка SQL-дампа базы данных
RUN mysql -u admin -p < /app/mysql-init.sql
RUN mysql -u admin -p -e "CREATE DATABASE messanger"
RUN mysql -u admin -p messanger < /app/path/to/messanger.sql

# Этап 2: Запуск сервера и фронтенда
FROM node:18.17.0 
WORKDIR /app

# Копирование только необходимых файлов
COPY --from=builder /app/server /app/server
COPY --from=builder /app/client /app/client
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/package-lock.json /app/package-lock.json

# Установка зависимостей для сервера и фронтенда
RUN cd /app/server && npm install
RUN cd /app/client && npm install

# Запуск сервера и фронтенда
CMD cd /app/server && node index.js &
CMD cd /app/client && npm start
