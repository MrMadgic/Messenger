import { LOADDIALOGS, CLAERDIALOGS, CHECKEXISTSDIALOGS, SETUSERLOGIN, SELECTDIALOG, SENDMESSAGE, SETAUTHSTATUS, SETUSERDATA, SETUSERSETTINGS, SETNEWDIALOG, SETMESSAGES, SETDIALOGS, UPDATEDIALOGBYID, MARKMESSAGESASREADLOCALLY } from "../../types";


export const setNewDialog = (dialog) => {
  return {
    type: SETNEWDIALOG,
    dialog,
  };
};

export const clearDialogs = () => {
  return {
    type: CLAERDIALOGS,
  };
};

export const setAuthStatus = (isAuth) => {
  return {
    type: SETAUTHSTATUS,
    isAuth,
  };
};

export const checkExistsDialogs = (dialogs) => {
  return {
    type: CHECKEXISTSDIALOGS,
    dialogs,
  };
};

export const markMessagesAsReadLocally = (dialogId, userId) => {
  return {
    type: MARKMESSAGESASREADLOCALLY,
    payload: { dialogId, userId },
  };
};

export const updatedDialogById = (dialog) => {
  return {
    type: UPDATEDIALOGBYID,
    dialog,
  };
};

export const setUserLogin = (login) => {
  return {
    type: SETUSERLOGIN,
    login,
  };
};

export const setUserSettings = (data) => {
  return {
    type: SETUSERSETTINGS,
    data,
  };
};

export const setDialogs = (dialogs) => {
  return {
    type: SETDIALOGS,
    dialogs,
  };
};

export const loadDialogs = (dialogs) => {
  return {
    type: LOADDIALOGS,
    dialogs,
  };
};

export const selectDialog = (dialog) => {
  return {
    type: SELECTDIALOG,
    dialog,
  };
};

export const sendMessage = (message) => {
  return {
    type: SENDMESSAGE,
    message,
  };
};

export const setUserData = (userData) => {
  return {
    type: SETUSERDATA,
    userData,
  };
};

export const setMessages = (messages) => {
  return {
    type: SETMESSAGES,
    messages,
  };
};
