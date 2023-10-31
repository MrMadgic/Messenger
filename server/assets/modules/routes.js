const connection = require('../database/db.js');
const fs = require('fs');


function generateRandomUserId() {
    const randomUserId = Math.random().toString().slice(2, 12);
    return randomUserId;
}

function register(req, res) {
    const { email, login, password } = req.body;

    const emailCheckQuery = 'SELECT * FROM users WHERE email = ?';
    connection.query(emailCheckQuery, [email], (emailCheckError, emailCheckResults) => {
        if (emailCheckError) {
            console.error('Ошибка при выполнении SQL-запроса для проверки email:', emailCheckError);
            res.status(500).json({ error: 'Ошибка сервера' });
            return;
        }

        if (emailCheckResults.length > 0) {
            res.status(200).json({ email: true });
            return;
        }

        const loginCheckQuery = 'SELECT * FROM users WHERE login = ?';
        connection.query(loginCheckQuery, [login], (loginCheckError, loginCheckResults) => {
            if (loginCheckError) {
                console.error('Ошибка при выполнении SQL-запроса для проверки login:', loginCheckError);
                res.status(500).json({ error: 'Ошибка сервера' });
                return;
            }

            if (loginCheckResults.length > 0) {
                res.status(200).json({ login: true });
                return;
            }

            const user_id = generateRandomUserId();
            const insertQuery = 'INSERT INTO users (user_id, email, login, password) VALUES (?, ?, ?, ?)';
            connection.query(insertQuery, [user_id, email, login, password], (insertError, insertResults) => {
                if (insertError) {
                    console.error('Ошибка при выполнении SQL-запроса:', insertError);
                    res.status(500).json({ error: 'Ошибка сервера' });
                    return;
                }

                res.status(200).json({ message: 'Регистрация успешно завершена' });
            });
        });
    });
}

function authenticate(req, res) {
    const { login, password } = req.body;

    const checkCredentialsQuery = 'SELECT * FROM users WHERE login = ? AND password = ?';
    connection.query(checkCredentialsQuery, [login, password], (checkError, checkResults) => {
        if (checkError) {
            console.error('Ошибка при проверке учетных данных:', checkError);
            res.status(500).json({ isAuth: false, error: 'Ошибка сервера' });
            return;
        }

        if (checkResults.length > 0) {
            res.status(200).json({ isAuth: true });
        } else {
            res.status(200).json({ isAuth: false });
        }
    });
}

function getUserData(req, res) {
    const { login } = req.body;

    console.log(login)

    const getUserQuery = 'SELECT * FROM users WHERE login = ?';
    connection.query(getUserQuery, [login], (error, results) => {
        if (error) {
            console.error('Ошибка при получении данных пользователя:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
            return;
        }

        if (results.length > 0) {
            const userData = results[0];
            res.status(200).json(userData);
        } else {
            res.status(404).json({ error: 'Пользователь не найден' });
        }
    });
}

function changeUserData(req, res) {
    const { oldLogin, login, password, email, firstName, lastName, bio } = req.body;

    const updatePasswordQuery = 'UPDATE users SET password = ? WHERE login = ?';
    const updateFirstNameQuery = 'UPDATE users SET first_name = ? WHERE login = ?';
    const updateLastNameQuery = 'UPDATE users SET last_name = ? WHERE login = ?';
    const updateBioQuery = 'UPDATE users SET bio = ? WHERE login = ?';
    const updateLoginQuery = 'UPDATE users SET login = ? WHERE login = ?';
    const updateEmailQuery = 'UPDATE users SET email = ? WHERE login = ?';

    const queries = [
        { query: updatePasswordQuery, params: [password, oldLogin] },
        { query: updateFirstNameQuery, params: [firstName, oldLogin] },
        { query: updateLastNameQuery, params: [lastName, oldLogin] },
        { query: updateBioQuery, params: [bio, oldLogin] },
        { query: updateLoginQuery, params: [login, oldLogin] },
        { query: updateEmailQuery, params: [email, oldLogin] },
    ];

    const executeQuery = (index) => {
        if (index >= queries.length) {
            res.status(200).json({ message: 'Данные успешно обновлены' });
        } else {
            const { query, params } = queries[index];
            connection.query(query, params, (error) => {
                if (error) {
                    console.error('Ошибка при выполнении запроса:', error);
                    res.status(500).json({ error: 'Ошибка сервера' });
                } else {
                    executeQuery(index + 1);
                }
            });
        }
    };

    executeQuery(0);
}

function getUsers(req, res) {
    const { query } = req.body;

    const sqlQuery = `
    SELECT login, avatar_url, is_online, user_id
    FROM users
    WHERE login LIKE ?;`;

    connection.query(sqlQuery, [`%${query}%`], (error, results) => {
        if (error) {
            console.error('Error executing the SQL query:', error);
            res.status(500).json({ error: 'Internal server error' });
        } else {

            const users = results.map((row) => ({ login: row.login, avatarURL: row.avatar_url, isOnline: row.is_online, id: row.user_id, messages: [] }));
            res.json(users);
        }
    });
}


function getRoomMessages(req, res) {
    const { id } = req.body;

    const sqlQuery = 'SELECT * FROM messages WHERE dialog_id = ?';

    connection.query(sqlQuery, [id], (error, results) => {
        if (error) {
            console.error('Ошибка при получении сообщений:', error);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }

        const messages = results.map((row) => ({
            messageId: row.message_id,
            room: Number(row.dialog_id),
            text: row.text,
            sender: row.sender,
            timestamp: row.timestamp,
        }));

        res.json(messages);
    });
}


function sendMessage({ room, text, sender, timestamp }) {

    const insertQuery = 'INSERT INTO messages (dialog_id, text, sender, timestamp) VALUES (?, ?, ?, ?)';
    connection.query(insertQuery, [room, text, sender, timestamp], (insertError, insertResults) => {
        if (insertError) {
            console.error('Ошибка при сохранении сообщения:', insertError);
            return false;
        }

    });

    return true
}

function getUserDialogs(req, res) {
    const { ownerId } = req.body;
    const query = 'SELECT * FROM dialogs WHERE owner_id = ?';

    connection.query(query, [ownerId], (error, results) => {
        if (error) {
            console.error('Ошибка при выполнении SQL-запроса:', error);
            res.status(500).send('Ошибка сервера');
        } else {
            const formattedResults = results.map(result => ({
                id: result.dialog_id,
                login: result.login,
                isOnline: result.isOnline,
                avatarURL: result.avatarURL,
                messages: [],
            }));

            const getMessagesQuery = 'SELECT * FROM messages WHERE dialog_id = ?';

            const messagePromises = formattedResults.map(dialog => {
                return new Promise((resolve, reject) => {
                    connection.query(getMessagesQuery, [dialog.id], (error, messages) => {
                        if (error) {
                            console.error('Ошибка при получении сообщений:', error);
                            reject(error);
                        } else {
                            dialog.messages = messages;
                            resolve(dialog);
                        }
                    });
                });
            });

            Promise.all(messagePromises)
                .then(dialogs => res.json(dialogs))
                .catch(error => res.status(500).send('Ошибка сервера'));
        }
    });
}

function setUserDialog(req, res) {
    const { ownerId, room, login, isOnline, avatarURL } = req.body;

    const checkQuery = 'SELECT dialog_id FROM dialogs WHERE owner_id = ? AND dialog_id = ?';
    connection.query(checkQuery, [ownerId, room], (checkError, checkResults) => {
        if (checkError) {
            console.error('Ошибка при выполнении SQL-запроса для проверки:', checkError);
            res.status(500).send('Ошибка сервера');
        } else {
            if (checkResults.length > 0) {
                console.log("Диалог уже существует.");
                res.status(200).send('Диалог уже существует.');
            } else {
                const insertQuery = 'INSERT INTO dialogs (owner_id, dialog_id, login, isOnline, avatarURL) VALUES (?, ?, ?, ?, ?)';
                connection.query(insertQuery, [ownerId, room, login, isOnline, avatarURL], (insertError, insertResults) => {
                    if (insertError) {
                        console.error('Ошибка при выполнении SQL-запроса:', insertError);
                        res.status(500).send('Ошибка сервера');
                    } else {
                        console.log("Диалог успешно добавлен.");
                        res.status(200).send('Диалог успешно добавлен.');
                    }
                });
            }
        }
    });
}


module.exports = {
    setUserDialog,
    register,
    getUsers,
    authenticate,
    getUserData,
    changeUserData,
    getRoomMessages,
    sendMessage,
    getUserDialogs
}
