const connection = require("../database/db.js");
const fs = require("fs");

function generateRandomUserId() {
  const randomUserId =
    Math.floor(1 + Math.random() * 9).toString() +
    Math.random().toString().slice(2, 12);
  return randomUserId;
}

function register(req, res) {
  const { email, login, password } = req.body;

  const emailCheckBlockedQuery =
    "SELECT * FROM blocked_list WHERE blocked_user_email = ?";
  connection.query(
    emailCheckBlockedQuery,
    [email],
    (emailCheckBlockedError, emailCheckBlockedResults) => {
      if (emailCheckBlockedError) {
        console.error(
          "Ошибка при выполнении SQL-запроса для проверки email в blocked_list:",
          emailCheckBlockedError
        );
        res.status(500).json({ error: "Ошибка сервера" });
        return;
      }

      if (emailCheckBlockedResults.length > 0) {
        res
          .status(200)
          .json({ message: "Этот email заблокирован", emailBlocked: true });
        return;
      }

      const loginCheckBlockedQuery =
        "SELECT * FROM blocked_list WHERE blocked_user_login = ?";
      connection.query(
        loginCheckBlockedQuery,
        [login],
        (loginCheckBlockedError, loginCheckBlockedResults) => {
          if (loginCheckBlockedError) {
            console.error(
              "Ошибка при выполнении SQL-запроса для проверки login в blocked_list:",
              loginCheckBlockedError
            );
            res.status(500).json({ error: "Ошибка сервера" });
            return;
          }

          if (loginCheckBlockedResults.length > 0) {
            res
              .status(200)
              .json({ message: "Этот login заблокирован", loginBlocked: true });
            return;
          }

          const user_id = generateRandomUserId();
          const insertQuery =
            "INSERT INTO users (user_id, email, login, password) VALUES (?, ?, ?, ?)";
          connection.query(
            insertQuery,
            [user_id, email, login, password],
            (insertError, insertResults) => {
              if (insertError) {
                console.error(
                  "Ошибка при выполнении SQL-запроса:",
                  insertError
                );
                res.status(500).json({ error: "Ошибка сервера" });
                return;
              }

              res
                .status(200)
                .json({ message: "Регистрация успешно завершена" });
            }
          );
        }
      );
    }
  );
}

function authenticate(req, res) {
  const { login, password } = req.body;

  const checkCredentialsQuery =
    "SELECT * FROM users WHERE login = ? AND password = ?";
  connection.query(
    checkCredentialsQuery,
    [login, password],
    (checkError, checkResults) => {
      if (checkError) {
        console.error("Ошибка при проверке учетных данных:", checkError);
        res.status(500).json({ isAuth: false, error: "Ошибка сервера" });
        return;
      }

      if (checkResults.length > 0) {
        res.status(200).json({ isAuth: true });
      } else {
        res.status(200).json({ isAuth: false });
      }
    }
  );
}

function getUserData(req, res) {
  const { login } = req.body;

  const getUserQuery = "SELECT * FROM users WHERE login = ?";
  connection.query(getUserQuery, [login], (error, results) => {
    if (error) {
      console.error("Ошибка при получении данных пользователя:", error);
      res.status(500).json({ error: "Ошибка сервера" });
      return;
    }

    if (results.length > 0) {
      const userData = results[0];
      res.status(200).json(userData);
    } else {
      res.status(404).json({ error: "Пользователь не найден" });
    }
  });
}

function changeUserData(req, res) {
  const {
    oldLogin,
    login,
    password,
    email,
    firstName,
    lastName,
    bio,
    avatarURL,
  } = req.body;

  const updatePasswordQuery = "UPDATE users SET password = ? WHERE login = ?";
  const updateFirstNameQuery =
    "UPDATE users SET first_name = ? WHERE login = ?";
  const updateLastNameQuery = "UPDATE users SET last_name = ? WHERE login = ?";
  const updateBioQuery = "UPDATE users SET bio = ? WHERE login = ?";
  const updateLoginQuery = "UPDATE users SET login = ? WHERE login = ?";
  const updateEmailQuery = "UPDATE users SET email = ? WHERE login = ?";
  const updateAvatarQuery = "UPDATE users SET avatar_url = ? WHERE login = ?";

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
      res.status(200).json({ message: "Данные успешно обновлены" });
    } else {
      const { query, params } = queries[index];
      connection.query(query, params, (error) => {
        if (error) {
          console.error("Ошибка при выполнении запроса:", error);
          res.status(500).json({ error: "Ошибка сервера" });
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
      console.error("Error executing the SQL query:", error);
      res.status(500).json({ error: "Internal server error" });
    } else {
      const users = results.map((row) => ({
        login: row.login,
        avatarURL: row.avatar_url,
        isOnline: row.is_online,
        id: row.user_id,
        messages: [],
      }));
      res.json(users);
    }
  });
}

function getGroups(req, res) {
  const { query } = req.body;

  const sqlQuery = `
    SELECT groups.group_name, groups.avatarURL, groups.group_id
    FROM groups
    WHERE groups.group_name LIKE ?;`;

  connection.query(sqlQuery, [`%${query}%`], (error, results) => {
    if (error) {
      console.error("Error executing the SQL query:", error);
      res.status(500).json({ error: "Internal server error" });
    } else {
      const groups = results.map((row) => ({
        groupName: row.group_name,
        avatarURL: row.avatarURL,
        id: row.group_id,
        login: row.group_name,
        messages: [],
        isOnline: 0,
        users: [],
        type: "group",
        ownerId: "",
        ownerPremium: null,
      }));

      const promises = groups.map((group) => {
        return new Promise((resolve, reject) => {
          getGroupData(group.id)
            .then((groupData) => {
              group.users = groupData.users;
              group.ownerPremium = groupData.ownerPremium;

              resolve(group);
            })
            .catch((err) => {
              reject(err);
            });
        });
      });

      Promise.all(promises)
        .then((resultGroups) => {
          res.json(resultGroups);
        })
        .catch((err) => {
          console.error("Error getting group details:", err);
          res.status(500).json({ error: "Internal server error" });
        });
    }
  });
}

function getGroupData(groupId) {
  return new Promise((resolve, reject) => {
    const groupQuery = "SELECT * FROM groups WHERE group_id = ?";
    connection.query(groupQuery, [groupId], (groupError, groupResults) => {
      if (groupError) {
        console.error("Error fetching group data:", groupError);
        reject(groupError);
        return;
      }

      if (groupResults.length === 0) {
        reject("Group not found");
        return;
      }

      const ownerId = groupResults[0].owner_id;

      const groupData = {
        groupId,
        avatarURL: groupResults[0].avatarURL,
        groupName: groupResults[0].group_name,
        users: [],
        ownerId,
        userId: ownerId,
        type: "group",
        messages: [],
      };

      const ownerQuery = "SELECT have_premium FROM users WHERE user_id = ?";
      connection.query(ownerQuery, [ownerId], (ownerError, ownerResults) => {
        if (ownerError) {
          console.error("Error fetching owner data:", ownerError);
          reject(ownerError);
          return;
        }

        if (ownerResults.length !== 0) {
          groupData.ownerPremium = ownerResults[0].have_premium;
        }

        const usersQuery =
          "SELECT * FROM users WHERE user_id IN (SELECT user_id FROM group_users WHERE group_id = ?)";
        connection.query(usersQuery, [groupId], (usersError, usersResults) => {
          if (usersError) {
            console.error("Error fetching users for group:", usersError);
            reject(usersError);
            return;
          }

          groupData.users = usersResults;

          const messagesPromises = groupData.users.map((user) => {
            const messagesQuery =
              "SELECT * FROM messages WHERE dialog_id = ? AND sender_id = ?";
            return new Promise((messagesResolve, messagesReject) => {
              connection.query(
                messagesQuery,
                [groupId, user.user_id],
                (messagesError, messagesResults) => {
                  if (messagesError) {
                    console.error(
                      "Error fetching messages for user:",
                      messagesError
                    );
                    messagesReject(messagesError);
                    return;
                  }
                  groupData.messages.push(...messagesResults);
                  messagesResolve();
                }
              );
            });
          });

          Promise.all(messagesPromises)
            .then(() => {
              resolve(groupData);
            })
            .catch((error) => {
              reject(error);
            });
        });
      });
    });
  });
}

function getRoomMessages(req, res) {
  const { id } = req.body;

  const sqlQuery = "SELECT * FROM messages WHERE dialog_id = ?";

  connection.query(sqlQuery, [id], (error, results) => {
    if (error) {
      console.error("Ошибка при получении сообщений:", error);
      return res.status(500).json({ error: "Ошибка сервера" });
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

function sendMessage({
  room,
  text,
  sender,
  timestamp,
  ownerId,
  userId,
  senderId,
  isDoc,
  docURL,
  type,
}) {
  let interlocutorId = senderId;
  if (type !== "group") {
    interlocutorId = senderId === ownerId ? userId : ownerId;
  }

  const userQuery = "SELECT selected_dialog_id FROM users WHERE user_id = ?";
  connection.query(userQuery, [interlocutorId], (userError, userResults) => {
    if (userError) {
      console.error("Ошибка при получении данных собеседника:", userError);
      return false;
    }

    const interlocutorSelectedDialogId = userResults[0]?.selected_dialog_id;

    const isRead = Number(room) === interlocutorSelectedDialogId;

    const updateQuery1 =
      "UPDATE dialogs SET message_status = ? WHERE owner_id = ?";
    connection.query(
      updateQuery1,
      [isRead, interlocutorId],
      (updateError, updateResults) => {
        if (updateError) {
          console.error(
            "Ошибка при обновлении статуса сообщения в таблице dialogs:",
            updateError
          );
          return false;
        }
      }
    );

    const updateQuery2 =
      "UPDATE dialogs SET message_status = ? WHERE owner_id = ?";
    connection.query(
      updateQuery2,
      [true, senderId],
      (updateError, updateResults) => {
        if (updateError) {
          console.error(
            "Ошибка при обновлении статуса сообщения в таблице dialogs:",
            updateError
          );
          return false;
        }
      }
    );

    if (isDoc) {
      const insertQuery =
        "INSERT INTO messages (dialog_id, text, sender, timestamp, is_read, to_id, is_doc, doc_url, sender_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
      connection.query(
        insertQuery,
        [
          room,
          text,
          sender,
          timestamp,
          isRead,
          interlocutorId,
          isDoc,
          docURL,
          senderId,
        ],
        (insertError, insertResults) => {
          if (insertError) {
            console.error("Ошибка при сохранении сообщения:", insertError);
            return false;
          }
        }
      );
    } else {
      const insertQuery =
        "INSERT INTO messages (dialog_id, text, sender, timestamp, is_read, to_id, sender_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
      connection.query(
        insertQuery,
        [room, text, sender, timestamp, isRead, interlocutorId, senderId],
        (insertError, insertResults) => {
          if (insertError) {
            console.error("Ошибка при сохранении сообщения:", insertError);
            return false;
          }
        }
      );
    }
  });

  return true;
}

async function getUserDialogs(req, res) {
  const { ownerId } = req.body;
  const query = `
    SELECT d.dialog_id, d.type, u.login, u.is_online AS isOnline, u.avatar_url AS avatarURL, d.user_id AS userId, d.owner_id AS ownerId
    FROM dialogs AS d
    JOIN users AS u ON d.user_id = u.user_id
    WHERE d.owner_id = ?;
  `;

  try {
    const results = await new Promise((resolve, reject) => {
      connection.query(query, [ownerId], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    const formattedResults = results.map((result) => ({
      id: result.dialog_id,
      login: result.login,
      isOnline: result.isOnline,
      avatarURL: result.avatarURL,
      userId: result.userId,
      ownerId: String(result.ownerId),
      type: result.type,
      groupName: result.login,
      messages: [],
      groupUsers: [],
      ownerPremium: null,
    }));

    const getMessagesQuery = "SELECT * FROM messages WHERE dialog_id =";
    const messagePromises = formattedResults.map((dialog) => {
      return new Promise(async (resolve, reject) => {
        try {
          const messages = await queryAsync(`${getMessagesQuery} ?`, [
            dialog.id,
          ]);
          const senderIds = messages.map((message) => message.sender_id);
          const avatars = await fetchAvatars(senderIds);

          dialog.messages = messages.map((message) => ({
            ...message,
            avatarURL: avatars[message.sender_id],
          }));

          if (dialog.type === "group") {
            const ownerPremium = await getOwnerPremium(dialog.ownerId);
            dialog.ownerPremium = ownerPremium;
          }

          if (dialog.type === "group") {
            const groupUsers = await getGroupUsers(dialog.id);
            dialog.groupUsers = groupUsers;
          }

          resolve(dialog);
        } catch (error) {
          reject(error);
        }
      });
    });

    const dialogs = await Promise.all(messagePromises);

    // Fetch additional data for groups
    for (const dialog of dialogs) {
      if (dialog.type === "group") {
        try {
          const groupQuery = "SELECT * FROM groups WHERE group_id = ?";
          const groupData = await queryAsync(groupQuery, [dialog.id]);

          dialog.login = groupData[0].group_name;
          dialog.groupName = groupData[0].group_name;
          dialog.avatarURL = groupData[0].avatarURL;
        } catch (groupError) {
          console.error("Error fetching group data:", groupError);
        }
      }
    }

    res.json(dialogs);
  } catch (error) {
    console.error("Error processing results:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function getOwnerPremium(ownerId) {
  const ownerPremiumQuery = "SELECT have_premium FROM users WHERE user_id = ?";
  const ownerPremiumResults = await queryAsync(ownerPremiumQuery, [ownerId]);

  return ownerPremiumResults.length > 0
    ? ownerPremiumResults[0].have_premium
    : null;
}

async function getGroupUsers(groupId) {
  const groupUsersQuery = "SELECT user_id FROM group_users WHERE group_id = ?";
  const groupUsers = await queryAsync(groupUsersQuery, [groupId]);
  const userIds = groupUsers.map((user) => user.user_id);
  const usersQuery = "SELECT * FROM users WHERE user_id IN (?)";
  return queryAsync(usersQuery, [userIds]);
}

function queryAsync(sql, values) {
  return new Promise((resolve, reject) => {
    connection.query(sql, values, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

async function fetchAvatars(userIds) {
  if (userIds.length === 0) {
    return {};
  }

  const avatarQuery =
    "SELECT user_id, avatar_url FROM users WHERE user_id IN (?)";

  return new Promise((resolve, reject) => {
    connection.query(
      avatarQuery,
      [userIds.join(",")],
      (avatarError, avatarResults) => {
        if (avatarError) {
          reject(avatarError);
        } else {
          const avatars = {};
          for (const result of avatarResults) {
            avatars[result.user_id] = result.avatar_url;
          }
          resolve(avatars);
        }
      }
    );
  });
}

function setUserDialog(req, res) {
  const { ownerId, id, userId } = req.body;

  const checkQuery =
    "SELECT dialog_id FROM dialogs WHERE owner_id = ? AND dialog_id = ?";
  connection.query(checkQuery, [ownerId, id], (checkError, checkResults) => {
    if (checkError) {
      console.error(
        "Ошибка при выполнении SQL-запроса для проверки:",
        checkError
      );
      res.status(500).send("Ошибка сервера");
    } else {
      if (checkResults.length > 0) {
        res.status(200).send("Диалог уже существует.");
      } else {
        const insertQuery1 =
          "INSERT INTO dialogs (owner_id, dialog_id, user_id) VALUES (?, ?, ?)";
        connection.query(
          insertQuery1,
          [ownerId, id, userId],
          (insertError, insertResults) => {
            if (insertError) {
              console.error("Ошибка при выполнении SQL-запроса:", insertError);
              res.status(500).send("Ошибка сервера");
            } else {
              res.status(200).send("Диалог успешно добавлен .");
            }
          }
        );

        const insertQuery2 =
          "INSERT INTO dialogs (owner_id, dialog_id, user_id) VALUES (?, ?, ?)";
        connection.query(
          insertQuery2,
          [userId, id, ownerId],
          (insertError, insertResults) => {
            if (insertError) {
              console.error("Ошибка при выполнении SQL-запроса:", insertError);
              res.status(500).send("Ошибка сервера");
            }
          }
        );
      }
    }
  });
}

function setNewUser(req, res) {
  const { id, newUserId } = req.body;

  const insertQuery1 =
    "INSERT INTO dialogs (owner_id, dialog_id, user_id, type) VALUES (?, ?, ?, ?)";
  connection.query(
    insertQuery1,
    [newUserId, id, newUserId, "group"],
    (insertError, insertResults) => {
      if (insertError) {
        console.error("Ошибка при выполнении SQL-запроса:", insertError);
        res.status(500).send("Ошибка сервера");
      }
    }
  );

  const insertQuery2 =
    "INSERT INTO group_users (group_id, user_id) VALUES (?, ?)";
  connection.query(
    insertQuery2,
    [id, newUserId],
    (insertError, insertResults) => {
      if (insertError) {
        console.error("Ошибка при выполнении SQL-запроса:", insertError);
        res.status(500).send("Ошибка сервера");
      }
    }
  );
}

function setUserStatusData({ userId, status }) {
  const sql = `UPDATE users SET is_Online = ? WHERE user_id = ?`;

  connection.query(sql, [status, userId], (error, results) => {
    if (error) throw error;
  });
}

function trackUser(userId, callback) {
  const getDialogsQuery = `
    SELECT dialog_id, type
    FROM dialogs
    WHERE owner_id = ?;
  `;

  connection.query(
    getDialogsQuery,
    [userId],
    async (dialogsErr, dialogsResults) => {
      if (dialogsErr) {
        console.error(
          "Ошибка при выполнении запроса для диалогов:",
          dialogsErr.message
        );
        callback(dialogsErr, null);
        return;
      }

      const usersData = [];
      let remainingQueries = dialogsResults.length;

      const handleQueryResult = () => {
        remainingQueries--;
        if (remainingQueries === 0) {
          callback(null, usersData);
        }
      };

      for (const dialogRow of dialogsResults) {
        if (dialogRow.type === "group") {
          const getGroupQuery = `
          SELECT group_id, group_name, avatarURL
          FROM groups
          WHERE group_id = ?;
        `;

          connection.query(
            getGroupQuery,
            [dialogRow.dialog_id],
            (groupErr, groupResults) => {
              if (groupErr) {
                console.error(
                  "Ошибка при выполнении запроса для группы:",
                  groupErr.message
                );
                callback(groupErr, null);
                return;
              }

              if (groupResults.length > 0) {
                const groupData = {
                  id: groupResults[0].group_id,
                  groupName: groupResults[0].group_name,
                  avatarURL: groupResults[0].avatarURL,
                  isOnline: 0,
                  type: "group",
                };

                usersData.push(groupData);
              }

              handleQueryResult();
            }
          );
        } else {
          const getUserQuery = `
          SELECT d.dialog_id, d.type, u.is_online, u.avatar_url, u.login
          FROM dialogs AS d
          INNER JOIN users AS u ON d.owner_id = u.user_id
          WHERE d.dialog_id = ?;
        `;

          connection.query(
            getUserQuery,
            [dialogRow.dialog_id],
            (userErr, userResults) => {
              if (userErr) {
                console.error(
                  "Ошибка при выполнении запроса для пользователя:",
                  userErr.message
                );
                callback(userErr, null);
                return;
              }

              const user = {
                login: userResults[0].login,
                id: Number(userResults[0].dialog_id),
                avatarURL: userResults[0].avatar_url,
                isOnline: userResults[0].is_online,
                type: userResults[0].type,
              };

              usersData.push(user);
              handleQueryResult();
            }
          );
        }
      }
    }
  );
}

function setUserAvatar(req, res) {
  if (!req.file) {
    return res.status(400).send("Файл не был загружен.");
  }

  const avatarURL = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.originalname
  }`;

  res.json({ url: avatarURL });
}

function setDialogId({ id, userId }) {
  connection.query(
    "SELECT * FROM users WHERE user_id = ?",
    [userId],
    (err, rows) => {
      if (err) {
        console.error("Ошибка при выполнении запроса:", err);
        return;
      }

      if (rows.length > 0) {
        connection.query(
          "UPDATE users SET selected_dialog_id = ? WHERE user_id = ?",
          [id, userId],
          (err) => {
            if (err) {
              console.error(
                "Ошибка при выполнении запроса на обновление:",
                err
              );
            }
          }
        );
      }
    }
  );
}

function setUsersDialogsIds({ id, messages }) {
  const senderIds = messages.map((message) => message.sender_id);

  const uniqueSenderIds = [...new Set(senderIds)];

  uniqueSenderIds.forEach((senderId) => {
    connection.query(
      "SELECT * FROM users WHERE user_id = ?",
      [senderId],
      (err, rows) => {
        if (err) {
          console.error("Ошибка при выполнении запроса:", err);
          return;
        }

        if (rows.length > 0) {
          connection.query(
            "UPDATE users SET selected_dialog_id = ? WHERE user_id = ?",
            [id, senderId],
            (updateErr) => {
              if (updateErr) {
                console.error(
                  "Ошибка при выполнении запроса на обновление:",
                  updateErr
                );
              }
            }
          );
        }
      }
    );
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
      console.error(
        "Ошибка при обновлении статуса прочтения сообщений:",
        error
      );
    }
  });
}

function blockUser(req, res) {
  const {
    adminId,
    adminLogin,
    blockedUserId,
    blockedUserLogin,
    blockedUserEmail,
  } = req.body;

  const checkAdminQuery = `SELECT is_admin FROM users WHERE user_id = ?`;

  connection.query(checkAdminQuery, [adminId], (err, result) => {
    if (err) {
      res.status(500).json({ status: false, message: "Ошибка сервера" });
    } else {
      if (result.length === 0) {
        res
          .status(404)
          .json({ status: false, message: "Пользователь не найден" });
      } else {
        const isAdmin = result[0].is_admin === 1;
        if (isAdmin) {
          const selectUserQuery = `SELECT * FROM users WHERE user_id = ?`;

          connection.query(selectUserQuery, [blockedUserId], (err, result) => {
            if (err) {
              res
                .status(500)
                .json({ status: false, message: "Ошибка сервера" });
            } else {
              if (result.length === 0) {
                res
                  .status(200)
                  .json({ status: false, message: "Пользователь не найден" });
              } else {
                const deleteMessagesQuery = `DELETE FROM messages WHERE to_id = ?`;

                connection.query(
                  deleteMessagesQuery,
                  [blockedUserId],
                  (err, result) => {
                    if (err) {
                      res
                        .status(500)
                        .json({ status: false, message: "Ошибка сервера" });
                    } else {
                      const deleteDialogsQuery = `DELETE FROM dialogs WHERE owner_id = ? OR user_id = ?`;

                      connection.query(
                        deleteDialogsQuery,
                        [blockedUserId, blockedUserId],
                        (err, result) => {
                          if (err) {
                            res.status(500).json({
                              status: false,
                              message: "Ошибка сервера",
                            });
                          } else {
                            const deleteUserQuery = `DELETE FROM users WHERE user_id = ?`;

                            connection.query(
                              deleteUserQuery,
                              [blockedUserId],
                              (err, result) => {
                                if (err) {
                                  res.status(500).json({
                                    status: false,
                                    message: "Ошибка сервера",
                                  });
                                } else {
                                  const insertBlockedUserQuery = `INSERT INTO blocked_list (admin_id, admin_login, blocked_user_id, blocked_user_login, blocked_user_email) VALUES (?, ?, ?, ?, ?)`;

                                  connection.query(
                                    insertBlockedUserQuery,
                                    [
                                      adminId,
                                      adminLogin,
                                      blockedUserId,
                                      blockedUserLogin,
                                      blockedUserEmail,
                                    ],
                                    (err, result) => {
                                      if (err) {
                                        res.status(500).json({
                                          status: false,
                                          message: "Ошибка сервера",
                                        });
                                      } else {
                                        res.status(200).json({
                                          status: true,
                                          message: "Пользователь заблокирован",
                                        });
                                      }
                                    }
                                  );
                                }
                              }
                            );
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          });
        } else {
          res.status(403).json({
            status: false,
            message: "Недостаточно прав для блокировки",
          });
        }
      }
    }
  });
}

function sendDocument(req, res) {
  if (!req.file) {
    return res.status(400).send("Файл не был загружен.");
  }

  const docURL = `${req.protocol}://${req.get("host")}/documents/${
    req.file.originalname
  }`;

  res.json({ url: docURL });
}

const setUserPremium = (req, res) => {
  const { userId, payStatus } = req.body;

  if (payStatus) {
    const updatePremiumQuery = `UPDATE users SET have_premium = true WHERE user_id = ${userId}`;

    connection.query(updatePremiumQuery, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      } else {
        res.status(200).send("Premium status updated successfully");
      }
    });
  } else {
    const updatePremiumQuery = `UPDATE users SET have_premium = false WHERE user_id = ${userId}`;

    connection.query(updatePremiumQuery, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      } else {
        res.status(200).send("Premium status updated successfully");
      }
    });
  }
};

function setNewGroupUsers(req, res) {
  const { id, users } = req.body;

  users.filter((user) => {
    const query = `
    INSERT INTO group_users (group_id, user_id)
    VALUES (?, ?)
  `;

    const values = [id, user];

    connection.query(query, values, (error, results) => {
      if (error) {
        console.error(error);
      }
    });
  });
}

function setNewGroup({ id, avatarURL, groupName, ownerId }) {
  const query = `
  INSERT INTO groups (group_id, group_name, avatarURL, owner_id)
  VALUES (?, ?, ?, ?)
`;

  const values = [id, groupName, avatarURL, ownerId];

  connection.query(query, values, (error, results) => {
    if (error) {
      console.error(error);
    }
  });
}

function setUserGroup(req, res) {
  const { id, avatarURL, login, ownerId, users, type } = req.body;

  const query = `
    INSERT INTO dialogs (dialog_id, user_id, owner_id, message_status, type)
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [id, ownerId, ownerId, 0, type];

  connection.query(query, values, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    } else {
      setNewGroup({ id, avatarURL, groupName: login, ownerId });
      setNewGroupUsers({ body: { users, id, login } }, {});
    }
  });
}

function getUserGroupData(req, res) {
  const { userId } = req.body;

  // Step 1: Retrieve dialog_id from the dialogs table based on owner_id
  const dialogQuery =
    "SELECT dialog_id, owner_id FROM dialogs WHERE owner_id = ?";
  connection.query(dialogQuery, [userId], (dialogError, dialogResults) => {
    if (dialogError) {
      console.error(dialogError);
      res.status(500).send("Internal Server Error");
      return;
    }

    if (dialogResults.length === 0) {
      res.status(404).send("Dialog not found");
      return;
    }

    const dialogId = dialogResults[0].dialog_id;
    const ownerId = dialogResults[0].owner_id;

    // Step 2: Retrieve group_id from the group_users table
    const groupUsersQuery =
      "SELECT group_id FROM group_users WHERE group_id = ?";
    connection.query(
      groupUsersQuery,
      [dialogId],
      (groupUsersError, groupUsersResults) => {
        if (groupUsersError) {
          console.error(groupUsersError);
          res.status(500).send("Internal Server Error");
          return;
        }

        if (groupUsersResults.length === 0) {
          res.status(404).send("Group not found");
          return;
        }

        const groupId = groupUsersResults[0].group_id;

        // Step 3: Retrieve data from the groups table
        const groupsQuery = "SELECT * FROM groups WHERE group_id = ?";
        connection.query(
          groupsQuery,
          [groupId],
          (groupsError, groupsResults) => {
            if (groupsError) {
              console.error(groupsError);
              res.status(500).send("Internal Server Error");
              return;
            }

            if (groupsResults.length === 0) {
              res.status(404).send("Group not found");
              return;
            }

            const groupData = {
              avatarURL: groupsResults[0].avatarURL,
              id: dialogId,
              isOnline: 0,
              groupName: groupsResults[0].group_name,
              users: [],
              ownerId,
              userId: ownerId,
              type: "group",
            };

            // Step 4: Retrieve users from the users table based on user_id from group_users
            const usersQuery =
              "SELECT * FROM users WHERE user_id IN (SELECT user_id FROM group_users WHERE group_id = ?)";
            connection.query(
              usersQuery,
              [groupId],
              (usersError, usersResults) => {
                if (usersError) {
                  console.error(usersError);
                  res.status(500).send("Internal Server Error");
                  return;
                }

                groupData.users = usersResults;

                // Step 5: Retrieve messages for each user
                const messagesQuery =
                  "SELECT * FROM messages WHERE sender_id IN (?) AND dialog_id = ?";
                const userIds = usersResults.map((user) => user.user_id);

                connection.query(
                  messagesQuery,
                  [userIds, dialogId],
                  (messagesError, messagesResults) => {
                    if (messagesError) {
                      console.error(messagesError);
                      res.status(500).send("Internal Server Error");
                      return;
                    }

                    groupData.users.forEach((user) => {
                      user.messages = messagesResults.filter(
                        (message) => message.sender_id === String(user.user_id)
                      );
                    });

                    res.json(groupData);
                  }
                );
              }
            );
          }
        );
      }
    );
  });
}

function checkIfIDExists(connection, generatedID) {
  return new Promise((resolve, reject) => {
    const query = "SELECT COUNT(*) AS count FROM dialogs WHERE id = ?";
    connection.query(query, [generatedID], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results[0].count > 0);
      }
    });
  });
}

function getGeneratedGroupID(req, res) {
  const generateAndCheckID = async () => {
    const generatedID = generateRandomUserId();
    const exists = await checkIfIDExists(connection, generatedID);

    if (exists) {
      return generateAndCheckID();
    }

    return generatedID;
  };

  generateAndCheckID()
    .then((generatedID) => {
      res.json({ id: generatedID });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
}

function saveGroupAvatar(req, res) {
  if (!req.file) {
    return res.status(400).send("Файл не был загружен.");
  }

  const avatarURL = `${req.protocol}://${req.get("host")}/groupImages/${
    req.file.originalname
  }`;

  res.json({ url: avatarURL });
}

function updateGroupInfo(req, res) {
  const { groupId, avatarURL, groupName } = req.body;

  if (!groupId || (!avatarURL && !groupName)) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  const updateGroupQuery =
    "UPDATE groups SET avatarUrl = ?, group_name = ? WHERE group_id = ?";

  connection.query(
    updateGroupQuery,
    [avatarURL, groupName, groupId],
    (error, results) => {
      if (error) {
        console.error("Error updating group info:", error);
        return res.status(500).send("Internal Server Error");
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Group not found" });
      }

      res
        .status(200)
        .json({ message: "Group information updated successfully" });
    }
  );
}

module.exports = {
  getUserGroupData,
  setUserGroup,
  getGeneratedGroupID,
  setUserPremium,
  blockUser,
  setMessagesReadStatus,
  setUserDialog,
  setNewUser,
  register,
  setDialogId,
  getUsers,
  getGroups,
  authenticate,
  getUserData,
  changeUserData,
  getRoomMessages,
  sendMessage,
  getUserDialogs,
  setUserStatusData,
  trackUser,
  setUserAvatar,
  sendDocument,
  saveGroupAvatar,
  setUsersDialogsIds,
  updateGroupInfo,
};
