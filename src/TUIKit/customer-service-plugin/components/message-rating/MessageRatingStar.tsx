import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Button, Image, TouchableWithoutFeedback } from 'react-native'
import { ratingTemplateType } from '../../utils/interface';
import { MessageService } from '../../../components/TUIMessageInput/message_service';
import { useTUIChatContext } from '../../../store';
import { useLoginUser } from '../../../hooks/useLoginUser';
import { CUSTOM_MESSAGE_SRC } from '../../utils/constant';

type RatingStarElementProps = {
    ratingTemplate: ratingTemplateType;
    loginUserID: string,
    convID: string,
    convType: number,
};

const styles = StyleSheet.create({
    messageRatingContainer: {
        flexDirection: "column",
        justifyContent: 'center',
        paddingBottom: 10,
        alignItems: 'center',
        textAlign: 'center',
    },
    ratingHead: {
        fontSize: 14,
        fontWeight: '400',
        color: '#999',
        textAlign: "center",
    },
    ratingCard: {
        width: '100%',
        marginTop: 10,
        paddingTop: 20,
        paddingBottom: 20,
        flexDirection: 'column',
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: 'black',
        textAlign: "center",
    },
    starIcon: {
        width: 30,
        height: 30,
    },
    ratingTail: {
        fontSize: 14,
        fontWeight: '400',
        color: '#999',
        textAlign: 'center',
    },
    submitContianer: {
        height: 50,
        width: "60%",
        borderRadius: 8,
        marginLeft: '20%'
    }
});

export const RatingStar: React.FC<RatingStarElementProps> = (props) => {
    const [selectValue, setSelectValue] = useState(-1)
    const [hasReply, setHasReply] = useState(false)
    const [hasExpire, setHasExpire] = useState(false)
    const desc = props.ratingTemplate.menu.map(item => item.content)
    const sessionId = props?.ratingTemplate?.sessionId ?? ""
    const { dispatch } = useTUIChatContext();
    const loginUserInfo = useLoginUser(props.loginUserID);
    const messageService = new MessageService(dispatch, {
        userInfo: loginUserInfo,
        convID: props.convID,
        convType: props.convType,
    });

    useEffect(() => {
        if (props.ratingTemplate?.selected) {
            for (let i = 0; i < props.ratingTemplate.menu.length; i++) {
                if (props.ratingTemplate?.menu[i]?.id == props.ratingTemplate?.selected?.id) {
                    setHasReply(true);
                    setSelectValue(i)
                    break;
                }
            }
        }
        const timestamp = Math.floor(new Date().getTime() / 1000);
        if (timestamp > props.ratingTemplate?.expireTime) {
            setHasExpire(true)
        }
    }, [props.ratingTemplate]);

    const submitRating = () => {
        if (selectValue >= 0) {
            const submitData = {
                data: JSON.stringify({
                    src: CUSTOM_MESSAGE_SRC.MENU_SELECTED,
                    menuSelected: {
                        id: props.ratingTemplate.menu[selectValue].id,
                        content: props.ratingTemplate.menu[selectValue].content,
                        sessionId: sessionId,
                    },
                    customerServicePlugin: 0,
                }),
            };
            setHasReply(true)
            messageService.sendCustomMessage(submitData)
        }
    }

    return (
        <View style={styles.messageRatingContainer}>
            <Text style={styles.ratingHead}>{props?.ratingTemplate?.head}</Text>
            <View style={styles.ratingCard}>
                <Text style={styles.cardTitle}>请对本次服务进行评价</Text>
                <View style={{ flexDirection: 'row', paddingTop: 10, justifyContent: 'center' }}>
                    {props.ratingTemplate?.menu?.map((item, index) => {
                        return <TouchableWithoutFeedback key={index} onPress={() => {
                            if (hasReply) return
                            setSelectValue(index);
                        }}>
                            {index > selectValue ? <Image
                                source={require('../../assets/starLine.png')}
                                style={styles.starIcon}
                            /> : <Image
                                source={require('../../assets/star.png')}
                                style={styles.starIcon}
                            />}
                        </TouchableWithoutFeedback>
                    })}
                </View>
                <View style={{ marginTop: 10, marginBottom: 10 }}>
                    <Text style={{ color: 'black', textAlign: 'center', }}>{selectValue === -1 ? '如果满意请给好评哦～' : desc[selectValue]}</Text>
                </View>
                <View style={styles.submitContianer}>
                    <Button
                        onPress={() => { submitRating() }}
                        disabled={hasReply || hasExpire}
                        title="提交评价"
                        color='#0365f9'
                    />
                </View>
            </View>
            {hasReply && <Text style={styles.ratingTail}>{props.ratingTemplate?.tail}</Text>}
        </View >
    )
};
