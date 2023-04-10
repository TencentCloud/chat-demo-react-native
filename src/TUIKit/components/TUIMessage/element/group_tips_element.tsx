import {makeStyles, Text} from '@rneui/themed';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import type {V2TimMessage} from 'react-native-tim-js';
import {MessageUtils} from '../../../utils/message';

export const GroupTipsElement = (props: {message: V2TimMessage}) => {
  const [groupTipsAbstractText, setGroupTipsAvstractText] = useState('');
  const {
    message: {groupTipsElem},
  } = props;
  const styles = useStyles();

  useEffect(() => {
    const getMessageAbstractText = async () => {
      const res = await MessageUtils.groupTipsMessageAbstract(groupTipsElem!);
      setGroupTipsAvstractText(res ?? '');
    };
    getMessageAbstractText();
  }, [groupTipsElem]);

  return (
    <View style={styles.text}>
      <Text h4 style={{color: styles.text.color}}>
        {groupTipsAbstractText}
      </Text>
    </View>
  );
};

const useStyles = makeStyles(theme => ({
  text: {
    display: 'flex',
    alignItems: 'center',
    color: theme.colors.grey4,
    marginTop: 20,
    marginBottom: 20,
  },
}));
