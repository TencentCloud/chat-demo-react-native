import React from 'react';
import { View, StyleSheet, Text, TouchableWithoutFeedback } from 'react-native'
import { MessageService } from '../../../components/TUIMessageInput/message_service';
import { useTUIChatContext } from '../../../store';
import { useLoginUser } from '../../../hooks/useLoginUser';

type FormBranchElementProps = {
    list: {
        content: string;
        desc: string;
    }[],
    title: string,
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
        paddingBottom: 5
    },
});

export const FormBranch: React.FC<FormBranchElementProps> = (props) => {
    const { dispatch } = useTUIChatContext();
    const loginUserInfo = useLoginUser(props.loginUserID);
    const messageService = new MessageService(dispatch, {
        userInfo: loginUserInfo,
        convID: props.convID,
        convType: props.convType,
    });

    return (
        <View>
            <Text style={styles.formBranchTitle}>{props?.title}</Text>
            {props.list.map((item, index) => {
                return <TouchableWithoutFeedback key={index} onPress={() => { messageService.sendTextMessage(item?.content ?? "") }}>
                    <Text style={styles.formBranchItem}>{item?.content}</Text>
                </TouchableWithoutFeedback>
            })}
        </View>
    );
} 
