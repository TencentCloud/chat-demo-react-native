import type { Reducer } from 'react';
import { ACTION_TYPE, TUIChatAction } from './actions';
import type { TUIChatState } from './context';

export type TUIChatReducerType = Reducer<TUIChatState, TUIChatAction>;

export const initialState = {
  messageList: [],
  repliedMessage: undefined,
  testCount: 0,
};

export const TUIChatReducer = (state: TUIChatState, action: TUIChatAction) => {
  switch (action.type) {
    case ACTION_TYPE.UPDATE_MESSAGE: {
      const messageList = [...state.messageList, ...action.value];
      state.messageList = messageList;
      return { ...state };
    }
    case ACTION_TYPE.SET_MESSAGE: {
      return {
        ...state,
        messageList: action.value,
      };
    }
    case ACTION_TYPE.UPDATE_MESSAGE_ITEM: {
      const newList = state.messageList.map((item) => {
        if (
          item.msgID === action.value.msgID ||
          (action.value.id &&
            action.value.id !== '' &&
            item.id &&
            item.id !== '' &&
            action.value.id === item.id)
        ) {
          return action.value;
        }
        return item;
      });
      state.messageList = newList;
      return {
        ...state,
      };
    }
    case ACTION_TYPE.ADD_MESSAGE_ITEM: {
      const newMessage = action.value;
      state.messageList.unshift(newMessage);
      return { ...state };
    }
    case ACTION_TYPE.UPDATE_MESSAGE_PROGRESS: {
      const { msgID, progress } = action.value;
      const index = state.messageList.findIndex((item) => item.msgID === msgID);
      const originMessage = state.messageList[index];
      if (originMessage) {
        console.log('update message progress item');
        originMessage!.progress = progress;
        originMessage!.id = new Date().getTime().toString();
        state.messageList[index] = originMessage;
      }
      return {
        ...state,
      };
    }
    case ACTION_TYPE.DELETE_MESSAGE: {
      const { msgID } = action.value;
      return {
        ...state,
        messageList: state.messageList.filter((item) => item.msgID !== msgID),
      };
    }
    case ACTION_TYPE.REVOKE_MESSAGE: {
      const { msgID } = action.value;
      return {
        ...state,
        messageList: state.messageList.map((item) => {
          if (item.msgID === msgID) {
            item.status = 6;
          }
          return item;
        }),
      };
    }
    case ACTION_TYPE.SET_REPLIED_MESSAGE: {
      const { message } = action.value;
      return {
        ...state,
        repliedMessage: message,
      };
    }
    default:
      return state;
  }
};
