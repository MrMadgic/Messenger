import { LOADDIALOGS, SELECTDIALOG, SENDMESSAGE, SETAUTHSTATUS, SETUSERDATA } from "../../types";

const initialState = {
  user: {
    login: "Vladmir003",
    password: "asd",
    email: "0002",
    isAuth: false,
    avatarURL: "https://w7.pngwing.com/pngs/832/44/png-transparent-advertising-service-blog-internet-avatar-woman-face-black-hair-service-thumbnail.png",
    dialogsNotifications: 0,
    selectedDialog: null,
    dialogs: [
      {
        id: 1,
        login: 'Кирилл',
        isOnline: true,
        avatarURL: "https://img.freepik.com/premium-vector/cute-banana-cartoon-vector-icon-illustration-logo-mascot-hand-drawn-concept-trandy-cartoon_519183-187.jpg?w=740",
        messages: [
          {
            text: 'Как дела?',
            sender: 'Кирилл',
            timestamp: new Date('2023-09-22 10:05:00'),
          },
          {
            text: 'Привет??',
            sender: 'Кирилл',
            timestamp: new Date('2023-10-23 10:05:00'),
          },
          {
            text: 'Как дела?',
            sender: 'Кирилл',
            timestamp: new Date('2023-09-22 10:05:00'),
          },
          {
            text: 'Привет??',
            sender: 'Кирилл',
            timestamp: new Date('2023-10-23 10:05:00'),
          },
          {
            text: 'Как дела?',
            sender: 'Кирилл',
            timestamp: new Date('2023-09-22 10:05:00'),
          },
          {
            text: 'Привет??',
            sender: 'Кирилл',
            timestamp: new Date('2023-10-23 10:05:00'),
          },
          {
            text: 'Как дела?',
            sender: 'Кирилл',
            timestamp: new Date('2023-09-22 10:05:00'),
          },
          {
            text: 'Привет??',
            sender: 'Кирилл',
            timestamp: new Date('2023-10-23 10:05:00'),
          },
          {
            text: 'Как дела?',
            sender: 'Кирилл',
            timestamp: new Date('2023-09-22 10:05:00'),
          },
          {
            text: 'Привет??',
            sender: 'Кирилл',
            timestamp: new Date('2023-10-23 10:05:00'),
          },
          {
            text: 'Привет как дела я сегодня пошел гулять и играл много!',
            sender: 'me',
            timestamp: new Date('2023-10-23 11:16:30'),
          },
        ],
      },
      {
        id: 2,
        login: 'Пользователь 2',
        isOnline: false,
        avatarURL: "https://img.freepik.com/premium-vector/cute-banana-cartoon-vector-icon-illustration-logo-mascot-hand-drawn-concept-trandy-cartoon_519183-187.jpg?w=740",
        messages: [],
      },
      {
        id: 3,
        login: 'Пользователь 3',
        isOnline: true,
        avatarURL: "https://img.freepik.com/premium-vector/cute-banana-cartoon-vector-icon-illustration-logo-mascot-hand-drawn-concept-trandy-cartoon_519183-187.jpg?w=740",
        messages: [],
      },
    ],
    message: '',
  },
};


const rootReducer = (state = initialState, action) => {
  switch (action.type) {
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