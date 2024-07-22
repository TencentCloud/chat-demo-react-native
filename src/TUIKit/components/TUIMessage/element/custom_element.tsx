import React from 'react';
import { Text } from 'react-native';
import type { V2TimMessage } from 'react-native-tim-js/lib/typescript/src/interface';
import { isCustomerServiceMessage } from '../../../customer-service-plugin/utils';
import MessageCustomerService from '../../../customer-service-plugin/components/MessageCustomerService';

export const CustomElement = (props: {
  message: V2TimMessage,
}) => {
  const { message } = props;
  return (isCustomerServiceMessage(message) ?
    <MessageCustomerService message={message} loginUserID={message.userID ?? ""} convID={message.userID ?? ""} convType={1}></MessageCustomerService > :
    < Text > ["自定义消息"]</Text >
  )
};
