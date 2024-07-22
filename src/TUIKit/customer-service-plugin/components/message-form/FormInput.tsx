import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native'
import { MessageService } from '../../../components/TUIMessageInput/message_service';
import { useTUIChatContext } from '../../../store';
import { useLoginUser } from '../../../hooks/useLoginUser';

type FormInputElementProps = {
    title: string,
    loginUserID: string,
    convID: string,
    convType: number,
};

const styles = StyleSheet.create({
    formInputTitle: {
        marginBottom: 8
    },
    formInputBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    formInput: {
        flex: 1,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 0,
        height: 40
    },
    formButton: {
        backgroundColor: '#007BFF',
        borderRadius: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formButtonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        verticalAlign: 'middle',
        lineHeight: 40,
        width: 40,
    },
});

export const FormInput: React.FC<FormInputElementProps> = (props) => {
    const [text, setText] = useState('');
    const [disabled, setDisabled] = useState(false);
    const { dispatch } = useTUIChatContext();
    const loginUserInfo = useLoginUser(props.loginUserID);
    const messageService = new MessageService(dispatch, {
        userInfo: loginUserInfo,
        convID: props.convID,
        convType: props.convType,
    });

    return (
        <View style={{ width: 200 }}>
            <View style={styles.formInputTitle}>
                <Text>{props.title}</Text>
            </View>
            <View style={styles.formInputBox}>
                <TextInput
                    value={text}
                    onChangeText={setText}
                    style={styles.formInput}
                />
                <TouchableOpacity
                    style={[styles.formButton, disabled && styles.formButtonDisabled]}
                    onPress={() => {
                        setDisabled(true);
                        messageService.sendTextMessage(text)
                    }}
                    disabled={disabled || text.length === 0}
                >
                    <Text style={styles.buttonText}>{'>'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
} 
