import React, { useRef, useLayoutEffect } from 'react';
import {
  Animated,
  StyleSheet,
  ViewStyle,
  View,
  Image,
  LayoutChangeEvent,
} from 'react-native';
import TUIChatEngine, { IMessageModel } from '@tencentcloud/chat-uikit-engine';

import { MessageContent } from '../Message/MessageContent';
import { ActionsPanel } from './ActionsPanel';
import { Overlay } from '../Overlay';

import { getWindowSize } from '../../utils';

interface IMessagePosition {
  x: number | undefined;
  y: number | undefined;
  width: number | undefined;
  height: number | undefined;
}

interface IMessageActionsProps {
  visible: boolean;
  message: IMessageModel;
  messagePosition: IMessagePosition | undefined;
  onCloseMessageAction: () => void;
}

const MessageActions = (props: IMessageActionsProps) => {
  const {
    visible,
    message,
    messagePosition,
    onCloseMessageAction,
  } = props;

  const MARGIN_TOP = 10;
  const OFFSET_FOR_TRANSLATE_Y = 80;
  const { width: screenWidth, height: screenHeight } = getWindowSize();
  const { x = 0, y = 0, width = 0, height = 0 } = messagePosition || {};

  const ActionPanelPosition = {
    top: y + height,
    marginTop: MARGIN_TOP,
    offsetForTranslateY: OFFSET_FOR_TRANSLATE_Y,
  };

  const actionsItemRef = useRef<View>(null);
  const translateY = useRef(new Animated.Value(0)).current;

  useLayoutEffect(() => {
    // move top message
    if (y < 0) {
      const offsetForDown = -y + OFFSET_FOR_TRANSLATE_Y;
      actionsContainerMove(offsetForDown);
    }
  });

  const computeMessageContentStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      position: 'absolute',
      top: y,
      left: x,
      width: width + 2,
      height: height,
    };
    if (message.type === TUIChatEngine.TYPES.MSG_IMAGE || message.type === TUIChatEngine.TYPES.MSG_VIDEO) {
      return {
        ...baseStyle,
        borderWidth: 0,
        borderBottomRightRadius: 0,
        backgroundColor: 'transparent',
      };
    }

    return baseStyle;
  };

  const actionsContainerMove = (offsetHeight: number) => {
    Animated.timing(translateY, {
      toValue: offsetHeight,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };
  // get ActionsPanel Layout
  const actionsPanelLayout = (event: LayoutChangeEvent) => {
    if (event.nativeEvent.layout) {
      const { height } = event.nativeEvent.layout;
      const overFlowHeight = screenHeight - (
        ActionPanelPosition.top
        + ActionPanelPosition.marginTop
        + height
      );
      // move top message
      if (overFlowHeight < 0) {
        const offsetForUp = overFlowHeight - ActionPanelPosition.offsetForTranslateY;
        actionsContainerMove(offsetForUp);
      }
    }
  };

  const computeMessageActionsStyle = () => {
    const positionForTop = ActionPanelPosition.top + ActionPanelPosition.marginTop;
    const isMessageFlowIn = message.flow === 'in';
    const baseStyle = {
      position: 'absolute',
      top: positionForTop,
    };
    return isMessageFlowIn
      ? { ...baseStyle, left: x }
      : { ...baseStyle, right: screenWidth - x - width };
  };

  return (
    <Overlay
      isVisible={visible}
      onClose={onCloseMessageAction}
    >
      <Image
        style={styles.messageActionContainer}
        resizeMode="cover"
        source={require('../../assets/message-actions.png')}
        blurRadius={10}
      />
      <Animated.View
        style={[styles.messageActionContainer,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <MessageContent
          messageContentStyle={computeMessageContentStyle() as ViewStyle}
          message={message}
        />
        <ActionsPanel
          ref={actionsItemRef}
          onLayout={actionsPanelLayout}
          style={computeMessageActionsStyle() as ViewStyle}
          message={message}
          onCloseMessageAction={onCloseMessageAction}
        />
      </Animated.View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  messageActionContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  },
});

export { MessageActions };
export type { IMessagePosition };
