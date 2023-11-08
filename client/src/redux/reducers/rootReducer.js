import { LOADDIALOGS, UPDATEDIALOGBYID, SETMESSAGES, SETNEWDIALOG, SETDIALOGS, SELECTDIALOG, SENDMESSAGE, SETAUTHSTATUS, SETUSERDATA, SETUSERLOGIN, SETUSERSETTINGS, CHECKEXISTSDIALOGS, MARKMESSAGESASREADLOCALLY, CLAERDIALOGS } from "../../types";

const initialState = {
  serverConfig: {
    port: 3001,
    socketPort: 4000,
    host: `http://localhost:`

  },
  user: {
    id: null,
    login: null,
    bio: null,
    firstName: null,
    lastName: null,
    password: null,
    email: null,
    isAuth: false,
    isAdmin: false,
    avatarURL: "https://cdn.icon-icons.com/icons2/1812/PNG/512/4213460-account-avatar-head-person-profile-user_115386.png",
    dialogsNotifications: 0,
    selectedDialog: null,
    defaultAvatar: "https://cdn.icon-icons.com/icons2/1812/PNG/512/4213460-account-avatar-head-person-profile-user_115386.png",
    dialogs: [],
    message: '',
  },
};


const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case MARKMESSAGESASREADLOCALLY:
      const { dialogId, userId } = action.payload;

      const markMessagesUpdatedDialogs = state.dialogs.map((dialog) => {
        if (dialog.id === dialogId) {
          dialog.messages = dialog.messages.map((message) => {
            if (message.sender !== userId && !message.isRead) {
              return { ...message, isRead: true };
            }
            return message;
          });
        }
        return dialog;
      });

      return {
        ...state,
        dialogs: markMessagesUpdatedDialogs,
      };

      case CLAERDIALOGS:

        return {
          ...state,
          user: {
            ...state.user,
            dialogs: [],
          },
        };

    case UPDATEDIALOGBYID:
      const { id } = action.dialog;
      const newDialogs = state.user.dialogs.map((dialog) => {

        if (dialog.id === id) {
          return {
            ...dialog,
            ...action.dialog,
          };
        }
        return dialog;
      });

      return {
        ...state,
        user: {
          ...state.user,
          dialogs: newDialogs,
        },
      };

    case CHECKEXISTSDIALOGS:
      const newUpdatedDialogs = state.user.dialogs;
      const dialogsToAdd = action.dialogs;

      dialogsToAdd.forEach(dialogToAdd => {
        const dialogExists = newUpdatedDialogs.some(dialog => dialog.id === dialogToAdd.id);

        if (!dialogExists) {
          newUpdatedDialogs.push(dialogToAdd);
        }
      });

      return {
        ...state,
        user: {
          ...state.user,
          dialogs: newUpdatedDialogs,
        },
      };


    case SETMESSAGES:
      const updatedMessages = state.user.dialogs.map((dialog) => {
        if (dialog.id === state.user.selectedDialog.id) {
          return {
            ...dialog,
            messages: action.messages,
          };
        }
        return dialog;
      });

      return {
        ...state,
        user: {
          ...state.user,
          dialogs: updatedMessages,
        },
      };

    case SETNEWDIALOG:
      return {
        ...state,
        user: {
          ...state.user,
          dialogs: [...state.user.dialogs, action.dialog],
        },
      };

    case SETDIALOGS:
      return {
        ...state,
        user: {
          ...state.user,
          dialogs: action.dialogs,
        },
      };

    case SETUSERLOGIN:
      return {
        ...state,
        user: {
          ...state.user,
          login: action.login,
        },
      };

    case SETAUTHSTATUS:
      return {
        ...state,
        user: {
          ...state.user,
          isAuth: action.isAuth,
        },
      };

    case LOADDIALOGS:
      return {
        ...state,
        user: {
          ...state.user,
          dialogs: action.dialogs,
        },
      };
    case SELECTDIALOG:
      return {
        ...state,
        user: {
          ...state.user,
          selectedDialog: action.dialog,
        },
      };
    case SETUSERDATA:
      return {
        ...state,
        user: {
          ...state.user,
          login: action.userData.login,
          password: action.userData.password,
          email: action.userData.email,
        },
      };
    case SETUSERSETTINGS:

    return {
        ...state,
        user: {
          ...state.user,
          id: action.data.user_id,
          isAdmin: action.data.is_admin,
          login: action.data.login,
          password: action.data.password,
          email: action.data.email,
          avatarURL: action.data.avatar_url,
          dialogsNotifications: action.data.dialogs_notifications,
          firstName: action.data.first_name,
          lastName: action.data.last_name,
          bio: action.data.bio,
        },
      };
    case SENDMESSAGE:
      const updatedDialogs = state.user.dialogs.map((dialog) => {
        if (dialog.id === state.user.selectedDialog.id) {
          return {
            ...dialog,
            messages: [...dialog.messages, action.message],
          };
        }
        return dialog;
      });
      return {
        ...state,
        user: {
          ...state.user,
          dialogs: updatedDialogs,
        },
      };
    default:
      return state;
  }
};

export default rootReducer;