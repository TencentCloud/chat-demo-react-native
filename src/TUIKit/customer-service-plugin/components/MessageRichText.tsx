import React from 'react';
import { customerServicePayloadType } from '../utils/interface';
import Markdown from 'react-native-markdown-display';
import { StyleSheet, View } from 'react-native';

type MessageRichTextElementProps = {
    payload: customerServicePayloadType;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
    },
});

const markdownStyles = {
    body: {
        width: 200
    },
};

export const MessageRichText: React.FC<MessageRichTextElementProps> = (props) => (
    <View style={styles.container}>
        <Markdown style={markdownStyles}>
            {props.payload?.content ?? ""}
        </Markdown>
    </View>

);
