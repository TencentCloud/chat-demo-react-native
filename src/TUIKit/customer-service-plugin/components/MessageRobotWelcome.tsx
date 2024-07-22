import React, { useState, useRef } from 'react';
import { View, StyleSheet, Image, Text, TouchableWithoutFeedback } from 'react-native'
import { customerServicePayloadType } from '../utils/interface';
import { MessageService } from '../../components/TUIMessageInput/message_service';
import { useTUIChatContext } from '../../store';
import { useLoginUser } from '../../hooks/useLoginUser';

type MessageRobotWelcomeElementProps = {
    payload: customerServicePayloadType;
    loginUserID: string,
    convID: string,
    convType: number,
};

const styles = StyleSheet.create({
    welcomeCardContainer: {
        minWidth: 200,
    },
    welcomeCardTitle: {
        flexDirection: 'row',
        height: 30,
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    welcomeCardTitleLeft: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    formBranchItem: {
        fontWeight: '400',
        color: 'rgba(54, 141, 255, 1)',
        paddingTop: 5,
        paddingBottom: 5,
    },
});

export const MessageRobotWelcome: React.FC<MessageRobotWelcomeElementProps> = (props) => {
    const [showList, setShowList] = useState((props.payload?.content?.items || []).slice(0, 5))
    const pageNumber = useRef(1)
    const originList = props.payload?.content?.items || []
    const { dispatch } = useTUIChatContext();
    const loginUserInfo = useLoginUser(props.loginUserID);
    const messageService = new MessageService(dispatch, {
        userInfo: loginUserInfo,
        convID: props.convID,
        convType: props.convType,
    });
    const changeBranchList = () => {
        if (pageNumber.current * 5 >= originList.length) {
            pageNumber.current = 0
        }
        setShowList(originList?.slice(
            pageNumber.current * 5,
            pageNumber.current * 5 + 5,
        ))
        pageNumber.current += 1
    };
    return (
        <View style={styles.welcomeCardContainer}>
            <View style={styles.welcomeCardTitle}>
                <View style={styles.welcomeCardTitleLeft}>
                    <Image source={require('../assets/imRobotGuess.png')}></Image>
                    <Text style={{ marginLeft: 10 }}>{props.payload?.content?.title ?? ""}</Text>
                </View>
                <TouchableWithoutFeedback onPress={() => changeBranchList()}>
                    <Image source={require('../assets/refresh.png')}></Image>
                </TouchableWithoutFeedback>
            </View>
            {showList?.map((item: {
                content: string;
            }, index: number) => {
                return <TouchableWithoutFeedback key={index} onPress={() => { messageService.sendTextMessage(item?.content ?? "") }}>
                    <Text style={[
                        styles.formBranchItem,
                    ]}>{item?.content}</Text>
                </TouchableWithoutFeedback>
            })}
        </View>
    );
} 
