import { customerServicePayloadType } from './interface';
import { CUSTOM_MESSAGE_SRC } from './constant';
import type { V2TimMessage } from 'react-native-tim-js/lib/typescript/src/interface';
import {
  MessageElemType,
} from 'react-native-tim-js';

// Determine if it is a JSON string
export function isJSON(str: string): boolean {
  if (typeof str === 'string') {
    try {
      const data = JSON.parse(str);
      if (data) {
        return true;
      }
      return false;
    } catch (error: any) {
      return false;
    }
  }
  return false;
}

// Determine if it is a JSON string
export function JSONToObject(str: string) {
  if (!isJSON(str)) {
    return str;
  }
  return JSON.parse(str);
}

export function isCustomerServiceMessage(message: V2TimMessage): boolean {
  const customerServicePayload: customerServicePayloadType = JSONToObject(message?.customElem?.data ?? "");
  return Number(customerServicePayload?.customerServicePlugin) === 0 || Number(customerServicePayload?.chatbotPlugin) === 1;
}

export const isMessageInvisible = (message: V2TimMessage): boolean => {
  const customerServicePayload: customerServicePayloadType = JSONToObject(message?.customElem?.data ?? "");
  const robotCommandArray = ['feedback', 'updateBotStatus'];
  const whiteList = [
    CUSTOM_MESSAGE_SRC.MENU,
    CUSTOM_MESSAGE_SRC.BRANCH,
    CUSTOM_MESSAGE_SRC.FROM_INPUT,
    CUSTOM_MESSAGE_SRC.PRODUCT_CARD,
    CUSTOM_MESSAGE_SRC.ORDER_CARD,
    CUSTOM_MESSAGE_SRC.RICH_TEXT,
    CUSTOM_MESSAGE_SRC.WELCOME_CARD,
  ];
  const isCustomerMessage = message.elemType === MessageElemType.V2TIM_ELEM_TYPE_CUSTOM;
  const isCustomerInvisible = customerServicePayload?.src && !whiteList.includes(customerServicePayload?.src);
  const isRobot = customerServicePayload?.src === CUSTOM_MESSAGE_SRC.ROBOT && robotCommandArray.indexOf(customerServicePayload?.content?.command) !== -1;
  return isCustomerMessage && (isCustomerInvisible || isRobot);
};
