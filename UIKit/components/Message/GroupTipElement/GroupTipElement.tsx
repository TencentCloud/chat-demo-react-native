import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

interface IGroupTipElementProps {
  data: Record<string, string>;
}

export const GroupTipElement = (props: IGroupTipElementProps) => {
  const { data } = props;
  return (
    <View style={styles.groupTipElementContainer}>
      <Text
        style={styles.text}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {data.text || TUITranslateService.t('Chat.GROUP_NOTIFICATION')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  groupTipElementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 60,

  },
  text: {
    color: '#00000066',
    fontSize: 14,
    textAlign: 'center',
  },
});
