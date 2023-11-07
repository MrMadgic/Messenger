const connection = require('../database/db.js');
const fs = require('fs');


function generateRandomUserId() {
    const randomUserId = Math.floor(1 + Math.random() * 9).toString() + Math.random().toString().slice(2, 12);
    return randomUserId;
}

function register(req, res) {
    const { email, login, password } = req.body;

    const emailCheckBlockedQuery = 'SELECT * FROM blocked_list WHERE blocked_user_email = ?';
    connection.query(emailCheckBlockedQuery, [email], (emailCheckBlockedError, emailCheckBlockedResults) => {
        if (emailCheckBlockedError) {
            console.error('Ошибка при выполнении SQL-запроса для проверки email в blocked_list:', emailCheckBlockedError);
            res.status(500).json({ error: 'Ошибка сервера' });
            return;
        }

        if (emailCheckBlockedResults.length > 0) {
            res.status(200).json({ message: 'Этот email заблокирован', emailBlocked: true });
            return;
        }

        const loginCheckBlockedQuery = 'SELECT * FROM blocked_list WHERE blocked_user_login = ?';
        connection.query(loginCheckBlockedQuery, [login], (loginCheckBlockedError, loginCheckBlockedResults) => {
            if (loginCheckBlockedError) {
                console.error('Ошибка при выполнении SQL-запроса для проверки login в blocked_list:', loginCheckBlockedError);
                res.status(500).json({ error: 'Ошибка сервера' });
                return;
            }

            if (loginCheckBlockedResults.length > 0) {
                res.status(200).json({ message: 'Этот login заблокирован', loginBlocked: true });
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
    const { oldLogin, login, password, email, firstName, lastName, bio, avatarURL } = req.body;

    const updatePasswordQuery = 'UPDATE users SET password = ? WHERE login = ?';
    const updateFirstNameQuery = 'UPDATE users SET first_name = ? WHERE login = ?';
    const updateLastNameQuery = 'UPDATE users SET last_name = ? WHERE login = ?';
    const updateBioQuery = 'UPDATE users SET bio = ? WHERE login = ?';
    const updateLoginQuery = 'UPDATE users SET login = ? WHERE login = ?';
    const updateEmailQuery = 'UPDATE users SET email = ? WHERE login = ?';
    const updateAvatarQuery = 'UPDATE users SET avatar_url = ? WHERE login = ?';

    const queries = [
        { query: updatePasswordQuery, params: [password, oldLogin] },
        { query: updateFirstNameQuery, params: [firstName, oldLogin] },
        { query: updateLastNameQuery, params: [lastName, oldLogin] },
        { query: updateBioQuery, params: [bio, oldLogin] },
        { query: updateLoginQuery, params: [login, oldLogin] },
        { query: updateEmailQuery, params: [email, oldLogin] },
        { query: updateAvatarQuery, params: [avatarURL, oldLogin] },
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
            isRead: row.is_read,
            isDoc: row.is_doc,
            docURL: row.doc_url,
        }));

        res.json(messages);
    });
}

function sendMessage({ room, text, sender, timestamp, ownerId, userId, senderId, isDoc, docURL }) {
    const interlocutorId = senderId === ownerId ? userId : ownerId;

    const userQuery = 'SELECT selected_dialog_id FROM users WHERE user_id = ?';
    connection.query(userQuery, [interlocutorId], (userError, userResults) => {
        if (userError) {
            console.error('Ошибка при получении данных собеседника:', userError);
            return false;
        }

        const interlocutorSelectedDialogId = userResults[0].selected_dialog_id;

        const isRead = Number(room) === interlocutorSelectedDialogId;

        const updateQuery1 = 'UPDATE dialogs SET message_status = ? WHERE owner_id = ?';
        connection.query(updateQuery1, [isRead, interlocutorId], (updateError, updateResults) => {
            if (updateError) {
                console.error('Ошибка при обновлении статуса сообщения в таблице dialogs:', updateError);
                return false;
            }

        });

        const updateQuery2 = 'UPDATE dialogs SET message_status = ? WHERE owner_id = ?';
        connection.query(updateQuery2, [true, senderId], (updateError, updateResults) => {
            if (updateError) {
                console.error('Ошибка при обновлении статуса сообщения в таблице dialogs:', updateError);
                return false;
            }

        });

        if (isDoc) {
            const insertQuery = 'INSERT INTO messages (dialog_id, text, sender, timestamp, is_read, to_id, is_doc, doc_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            connection.query(insertQuery, [room, text, sender, timestamp, isRead, interlocutorId, isDoc, docURL], (insertError, insertResults) => {
                if (insertError) {
                    console.error('Ошибка при сохранении сообщения:', insertError);
                    return false;
                }
            });
        } else {
            const insertQuery = 'INSERT INTO messages (dialog_id, text, sender, timestamp, is_read, to_id) VALUES (?, ?, ?, ?, ?, ?)';
            connection.query(insertQuery, [room, text, sender, timestamp, isRead, interlocutorId], (insertError, insertResults) => {
                if (insertError) {
                    console.error('Ошибка при сохранении сообщения:', insertError);
                    return false;
                }
            });
        }


    });

    return true;
}

function getUserDialogs(req, res) {
    const { ownerId } = req.body;
    const query = `
        SELECT d.dialog_id, u.login, u.is_online AS isOnline, u.avatar_url AS avatarURL, d.user_id AS userId, d.owner_id AS ownerId
        FROM dialogs AS d
        JOIN users AS u ON d.user_id = u.user_id
        WHERE d.owner_id = ?;
    `;

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
                userId: result.userId,
                ownerId: String(result.ownerId),
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
    const { ownerId, id, userId } = req.body;

    const checkQuery = 'SELECT dialog_id FROM dialogs WHERE owner_id = ? AND dialog_id = ?';
    connection.query(checkQuery, [ownerId, id], (checkError, checkResults) => {
        if (checkError) {
            console.error('Ошибка при выполнении SQL-запроса для проверки:', checkError);
            res.status(500).send('Ошибка сервера');
        } else {
            if (checkResults.length > 0) {
                res.status(200).send('Диалог уже существует.');
            } else {
                const insertQuery1 = 'INSERT INTO dialogs (owner_id, dialog_id, user_id) VALUES (?, ?, ?)';
                connection.query(insertQuery1, [ownerId, id, userId], (insertError, insertResults) => {
                    if (insertError) {
                        console.error('Ошибка при выполнении SQL-запроса:', insertError);
                        res.status(500).send('Ошибка сервера');
                    } else {
                        res.status(200).send('Диалог успешно добавлен .');
                    }
                });

                const insertQuery2 = 'INSERT INTO dialogs (owner_id, dialog_id, user_id) VALUES (?, ?, ?)';
                connection.query(insertQuery2, [userId, id, ownerId], (insertError, insertResults) => {
                    if (insertError) {
                        console.error('Ошибка при выполнении SQL-запроса:', insertError);
                        res.status(500).send('Ошибка сервера');
                    }
                });
            }
        }
    });
}

function setUserStatusData({ userId, status }) {
    const sql = `UPDATE users SET is_Online = ? WHERE user_id = ?`;

    connection.query(sql, [status, userId], (error, results) => {
        if (error) throw error;
    });
}

function trackUser(userId, callback) {
    const query = `
    SELECT d.dialog_id, u.is_online, u.avatar_url, u.login
    FROM dialogs AS d
    INNER JOIN users AS u ON d.owner_id = u.user_id
    WHERE d.user_id = ?;
  `;


    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Ошибка при выполнении запроса: ' + err.message);
            callback(err, null);
            return;
        }

        if (results.length === 0) {
            callback(null, []);
        } else {

            const users = results.map((row) => ({
                login: row.login,
                id: Number(row.dialog_id),
                avatarURL: row.avatar_url,
                isOnline: row.is_online,
            }));


            callback(null, users);
        }
    });
}

function setUserAvatar(req, res) {
    if (!req.file) {
        return res.status(400).send('Файл не был загружен.');
    }

    const avatarURL = `${req.protocol}://${req.get('host')}/uploads/${req.file.originalname}`;

    res.json({ url: avatarURL });
}

function setDialogId({ id, userId }) {
    connection.query('SELECT * FROM users WHERE user_id = ?', [userId], (err, rows) => {
        if (err) {
            console.error('Ошибка при выполнении запроса:', err);
            return;
        }

        if (rows.length > 0) {
            connection.query('UPDATE users SET selected_dialog_id = ? WHERE user_id = ?', [id, userId], (err) => {
                if (err) {
                    console.error('Ошибка при выполнении запроса на обновление:', err);
                }
            });
        }
    });
}

function setMessagesReadStatus({ id, userId }) {
    const query = `
      UPDATE messages
      SET is_read = 1
      WHERE dialog_id = ? AND to_id = ?;
    `;

    const values = [id, userId];

    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Ошибка при обновлении статуса прочтения сообщений:', error);
        }
    });
}

function blockUser(req, res) {
    const { adminId, adminLogin, blockedUserId, blockedUserLogin, blockedUserEmail } = req.body;

    const checkAdminQuery = `SELECT is_admin FROM users WHERE user_id = ?`;

    connection.query(checkAdminQuery, [adminId], (err, result) => {
        if (err) {
            res.status(500).json({ status: false, message: "Ошибка сервера" });
        } else {
            if (result.length === 0) {
                res.status(404).json({ status: false, message: "Пользователь не найден" });
            } else {
                const isAdmin = result[0].is_admin === 1;
                if (isAdmin) {
                    const selectUserQuery = `SELECT * FROM users WHERE user_id = ?`;

                    connection.query(selectUserQuery, [blockedUserId], (err, result) => {
                        if (err) {
                            res.status(500).json({ status: false, message: "Ошибка сервера" });
                        } else {
                            if (result.length === 0) {
                                res.status(200).json({ status: false, message: "Пользователь не найден" });
                            } else {

                                const deleteMessagesQuery = `DELETE FROM messages WHERE to_id = ?`;

                                connection.query(deleteMessagesQuery, [blockedUserId], (err, result) => {
                                    if (err) {
                                        res.status(500).json({ status: false, message: "Ошибка сервера" });
                                    } else {
                                        const deleteDialogsQuery = `DELETE FROM dialogs WHERE owner_id = ? OR user_id = ?`;

                                        connection.query(deleteDialogsQuery, [blockedUserId, blockedUserId], (err, result) => {
                                            if (err) {
                                                res.status(500).json({ status: false, message: "Ошибка сервера" });
                                            } else {
                                                const deleteUserQuery = `DELETE FROM users WHERE user_id = ?`;

                                                connection.query(deleteUserQuery, [blockedUserId], (err, result) => {
                                                    if (err) {
                                                        res.status(500).json({ status: false, message: "Ошибка сервера" });
                                                    } else {
                                                        const insertBlockedUserQuery = `INSERT INTO blocked_list (admin_id, admin_login, blocked_user_id, blocked_user_login, blocked_user_email) VALUES (?, ?, ?, ?, ?)`;

                                                        connection.query(insertBlockedUserQuery, [adminId, adminLogin, blockedUserId, blockedUserLogin, blockedUserEmail], (err, result) => {
                                                            if (err) {
                                                                res.status(500).json({ status: false, message: "Ошибка сервера" });
                                                            } else {
                                                                res.status(200).json({ status: true, message: "Пользователь заблокирован" });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });
                } else {
                    res.status(403).json({ status: false, message: "Недостаточно прав для блокировки" });
                }
            }
        }
    });

}

function sendDocument(req, res) {
    if (!req.file) {
        return res.status(400).send('Файл не был загружен.');
    }

    const docURL = `${req.protocol}://${req.get('host')}/documents/${req.file.originalname}`;

    res.json({ url: docURL });
}


module.exports = {
    blockUser,
    setMessagesReadStatus,
    setUserDialog,
    register,
    setDialogId,
    getUsers,
    authenticate,
    getUserData,
    changeUserData,
    getRoomMessages,
    sendMessage,
    getUserDialogs,
    setUserStatusData,
    trackUser,
    setUserAvatar,
    sendDocument
}
