import React from 'react';
import { customerServicePayloadType } from '../utils/interface';
import { JSONToObject } from '../utils';
import { View } from "react-native";
import { CUSTOM_MESSAGE_SRC } from '../utils/constant';
import type { V2TimMessage } from 'react-native-tim-js/lib/typescript/src/interface';
import { ProductCard } from './MessageProductCard';
import { MessageRating } from './message-rating';
import { MessageForm } from './message-form';
import { MessageBranch } from './MessageBranch';
import { MessageRichText } from './MessageRichText';
import { MessageRobotWelcome } from './MessageRobotWelcome';

type MessageCustomerServiceProps = {
    message: V2TimMessage;
    loginUserID: string,
    convID: string,
    convType: number,
};

const MessageCustomerService: React.FC<MessageCustomerServiceProps> = ({ message, loginUserID, convID, convType }) => {
    const customerServicePayload: customerServicePayloadType = JSONToObject(message?.customElem?.data ?? "");
    return (
        <View>
            {customerServicePayload.src === CUSTOM_MESSAGE_SRC.MENU && (
                <MessageRating payload={customerServicePayload} loginUserID={loginUserID} convID={convID} convType={convType}></MessageRating>)}
            {customerServicePayload.src === CUSTOM_MESSAGE_SRC.BRANCH && (
                <MessageBranch payload={customerServicePayload} loginUserID={loginUserID} convID={convID} convType={convType}></MessageBranch>
            )}
            {customerServicePayload.src === CUSTOM_MESSAGE_SRC.FROM_INPUT && (
                <MessageForm payload={customerServicePayload} loginUserID={loginUserID} convID={convID} convType={convType}></MessageForm>
            )}
            {customerServicePayload.src === CUSTOM_MESSAGE_SRC.PRODUCT_CARD && (
                <ProductCard payload={customerServicePayload}></ProductCard>
            )}
            {customerServicePayload.src === CUSTOM_MESSAGE_SRC.RICH_TEXT && (
                <MessageRichText payload={customerServicePayload}></MessageRichText>
            )}
            {(customerServicePayload.src === CUSTOM_MESSAGE_SRC.WELCOME_CARD && customerServicePayload.subtype !== 'welcome_msg') && (
                <MessageBranch payload={customerServicePayload} loginUserID={loginUserID} convID={convID} convType={convType}></MessageBranch>
            )}
            {(customerServicePayload.src === CUSTOM_MESSAGE_SRC.WELCOME_CARD && customerServicePayload.subtype === 'welcome_msg') && (
                <MessageRobotWelcome payload={customerServicePayload} loginUserID={loginUserID} convID={convID} convType={convType}></MessageRobotWelcome>
            )}
        </View>
    );
};

export default MessageCustomerService;
