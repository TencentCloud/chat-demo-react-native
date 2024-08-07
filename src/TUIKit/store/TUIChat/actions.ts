import type { V2TimMessage, V2TimMessageReceipt } from 'react-native-tim-js/lib/typescript/src/interface';

export type TUIChatAction =
  | {
      type: ACTION_TYPE.UPDATE_MESSAGE;
      value: V2TimMessage[];
    }
  | {
      type: ACTION_TYPE.SET_MESSAGE;
      value: V2TimMessage[];
    }
  | {
      type: ACTION_TYPE.UPDATE_MESSAGE_ITEM;
      value: V2TimMessage;
    }
  | {
      type: ACTION_TYPE.ADD_MESSAGE_ITEM;
      value: V2TimMessage;
    }
  | {
      type: ACTION_TYPE.UPDATE_MESSAGE_PROGRESS;
      value: {
        msgID: string;
        progress: number;
      };
    }
  | {
      type: ACTION_TYPE.DELETE_MESSAGE;
      value: {
        msgID: string;
      };
    }
  | {
      type: ACTION_TYPE.REVOKE_MESSAGE;
      value: {
        msgID: string;
      };
    } 
  | {
      type: ACTION_TYPE.SET_REPLIED_MESSAGE;
      value: {
        message?: V2TimMessage;
      };
    }
  | {
      type:ACTION_TYPE.UPDATE_MESSAGE_RECEIPT;
      value:{
        receipt:V2TimMessageReceipt[];
      }
    }
  | {
      type:ACTION_TYPE.UPDATE_C2C_MESSAGE_RECEIPT;
      value:{
        receipt:V2TimMessageReceipt[];
      }
    };
    

export enum ACTION_TYPE {
  UPDATE_MESSAGE = 'update_message',
  SET_MESSAGE = 'set_message',
  UPDATE_MESSAGE_ITEM = 'update_message_item',
  ADD_MESSAGE_ITEM = 'add_message_item',
  UPDATE_MESSAGE_PROGRESS = 'update_message_progress',
  DELETE_MESSAGE = 'delete_message',
  REVOKE_MESSAGE = 'revoke_message',
  SET_REPLIED_MESSAGE = 'set_replied_message',
  UPDATE_MESSAGE_RECEIPT = 'update_message_receipt',
  UPDATE_C2C_MESSAGE_RECEIPT = 'update_c2c_message_receipt' 
}

export const updateMessage = (value: V2TimMessage[]): TUIChatAction => {
  return {
    type: ACTION_TYPE.UPDATE_MESSAGE,
    value: value,
  };
};

export const setMessage = (value: V2TimMessage[]): TUIChatAction => {
  return {
    type: ACTION_TYPE.SET_MESSAGE,
    value: value,
  };
};

export const updateMessateItem = (value: V2TimMessage): TUIChatAction => {
  return {
    type: ACTION_TYPE.UPDATE_MESSAGE_ITEM,
    value: value,
  };
};

export const addMessageItem = (value: V2TimMessage): TUIChatAction => {
  return {
    type: ACTION_TYPE.ADD_MESSAGE_ITEM,
    value: value,
  };
};

export const updateMessageProgress = (value: {
  msgID: string;
  progress: number;
}): TUIChatAction => {
  return {
    type: ACTION_TYPE.UPDATE_MESSAGE_PROGRESS,
    value: value,
  };
};

export const deleteMessage = (value: { msgID: string }): TUIChatAction => {
  return {
    type: ACTION_TYPE.DELETE_MESSAGE,
    value: value,
  };
};

export const revokeMessage = (value: { msgID: string }): TUIChatAction => {
  return {
    type: ACTION_TYPE.REVOKE_MESSAGE,
    value: value,
  };
};

export const setRepliedMessage = (value: {
  message?: V2TimMessage;
}): TUIChatAction => {
  return {
    type: ACTION_TYPE.SET_REPLIED_MESSAGE,
    value: value,
  };
};

export const updateMessageReceipt = (value:{receipt:V2TimMessageReceipt[]}):TUIChatAction => {
  return {
    type:ACTION_TYPE.UPDATE_MESSAGE_RECEIPT,
    value:value,
  };
}

export const updateC2CMessageReceipt = (value:{receipt:V2TimMessageReceipt[]}):TUIChatAction => {
  return {
    type:ACTION_TYPE.UPDATE_C2C_MESSAGE_RECEIPT,
    value:value,
  };
}