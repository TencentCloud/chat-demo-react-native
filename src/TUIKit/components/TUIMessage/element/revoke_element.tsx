import {makeStyles, Text} from '@rneui/themed';
import React from 'react';
import {Pressable} from 'react-native';
import {View} from 'react-native';
import {MessageElemType, V2TimMessage} from 'react-native-tim-js';

export const RevokeElement = (props: {
  message: V2TimMessage;
  callback?: (message: V2TimMessage) => void;
}) => {
  const styles = useStyles();
  const {isSelf, nickName, sender, elemType, timestamp} = props.message;
  const displayName = isSelf ? '您' : nickName ?? sender;
  const isTextElement = elemType === MessageElemType.V2TIM_ELEM_TYPE_TEXT;

  const isRevokable = (stamp: number) =>
    Math.ceil(new Date().getTime() / 1000) - stamp < 120;

  const isEditable = isSelf && isTextElement && isRevokable(timestamp!);

  return (
    <View style={styles.text}>
      <Text h4 style={{color: styles.text.color}}>
        {`${displayName}撤回了一条消息`}
      </Text>
      {isEditable && (
        <Pressable
          onPress={() => {
            if (props.callback) {
              props.callback(props.message);
            }
            // console.log('onPress');
          }}>
          <Text h4 style={styles.revokeText}>
            重新编辑
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export const withEditableRevokeMessage = (
  callback: (message: V2TimMessage) => void,
) => {
  return (props: {message: V2TimMessage}) => (
    <RevokeElement message={props.message} callback={callback} />
  );
};

const useStyles = makeStyles(theme => ({
  text: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    color: theme.colors.grey4,
    marginTop: 20,
    marginBottom: 20,
  },
  revokeText: {
    color: '#147AFF',
  },
}));
