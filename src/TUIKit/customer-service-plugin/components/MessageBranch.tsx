import React from 'react';
import { View, StyleSheet, Text, TouchableWithoutFeedback } from 'react-native'
import { MessageService } from '../../components/TUIMessageInput/message_service';
import { useTUIChatContext } from '../../store';
import { useLoginUser } from '../../hooks/useLoginUser';
import { customerServicePayloadType } from '../utils/interface';

type MessageBranchElementProps = {
    payload: customerServicePayloadType;
    loginUserID: string,
    convID: string,
    convType: number,
};

const styles = StyleSheet.create({
    formBranchTitle: {
        marginBottom: 8
    },
    formBranchItem: {
        fontWeight: '400',
        color: 'rgba(54, 141, 255, 1)',
        paddingTop: 5,
        paddingBottom: 5,
        borderStyle: 'dotted'
    },
});

export const MessageBranch: React.FC<MessageBranchElementProps> = (props) => {
    const { dispatch } = useTUIChatContext();
    const loginUserInfo = useLoginUser(props.loginUserID);
    const messageService = new MessageService(dispatch, {
        userInfo: loginUserInfo,
        convID: props.convID,
        convType: props.convType,
    });
    const title = props?.payload?.content?.header || props?.payload?.content?.title || props?.payload?.content?.content

    return (
        <View>
            {title && <Text style={styles.formBranchTitle}>{title}</Text>}
            {props?.payload?.content?.items?.map((item: {
                content: string;
                desc: string;
            }, index: number) => {
                return <TouchableWithoutFeedback key={index} onPress={() => { messageService.sendTextMessage(item?.content ?? "") }}>
                    <Text style={[
                        styles.formBranchItem,
                        title ? { borderTopWidth: 1 } : { borderBottomWidth: 1 }
                    ]}>{item?.content}</Text>
                </TouchableWithoutFeedback>
            })}
        </View>
    );
} 
