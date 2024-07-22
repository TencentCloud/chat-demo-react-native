import React from 'react';
import { View } from 'react-native'
import { customerServicePayloadType } from '../../utils/interface';
import { FormBranch } from './FormBranch';
import { FormInput } from './FormInput';

type MessageFormElementProps = {
    payload: customerServicePayloadType;
    loginUserID: string,
    convID: string,
    convType: number,
};

export const MessageForm: React.FC<MessageFormElementProps> = (props) => (
    <View>
        {props.payload?.content && (props.payload?.content?.type === 1 ?
            <FormBranch title={props.payload?.content?.header ?? ""} list={props.payload?.content?.items ?? []} loginUserID={props.loginUserID} convID={props.convID} convType={props.convType} /> :
            <FormInput title={props.payload?.content?.header ?? ""} loginUserID={props.loginUserID} convID={props.convID} convType={props.convType} />)}
    </View>
);
