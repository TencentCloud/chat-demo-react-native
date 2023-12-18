/* eslint-disable @typescript-eslint/no-shadow */
import { makeStyles, Text } from "@rneui/themed";
import React from "react";
import { View } from "react-native";
import { MessageElemType, V2TimMessage } from "react-native-tim-js";
import { withMessageMemo } from "../../hooks/withMessageMemo";
import { DISPLAY_CENTER_MESSAGE } from "../../constants";
import { MessageRow } from "./element/message_row";
import { MessageColunmn } from "./element/message_colunmn";
import { MessageUtils } from "../../utils/message";
import type { BaseElements, MessageElement } from "../../interface";
import { MessageBubble } from "./element";

type ElementsWithMessage = BaseElements & { message: V2TimMessage };

type TUICenterMessageProps = {
  message: V2TimMessage;
  TimeElement: MessageElement;
  GroupTipsElement: MessageElement;
};

type TUINormalMessage = WithElementProps & { message: V2TimMessage };

interface WithElementProps extends BaseElements {
  showAvatar?: boolean;
  showNickName?: boolean;
}

export const withElement = (props: WithElementProps) => {
  return (prop: { message: V2TimMessage }) => {
    const { message } = prop;

    return <TUIMessage message={message} {...props} />;
  };
};

const TUIMessage = (props: ElementsWithMessage) => {
  const { TimeElement, RevokeElement, message, GroupTipsElement } = props;

  const elementType = message.elemType;
  const isCenterMessage = DISPLAY_CENTER_MESSAGE.includes(elementType ?? 0);
  const isRevokeMessage = message.status === 6;

  if (isRevokeMessage) {
    return <RevokeElement message={message} />;
  }
  if (isCenterMessage) {
    return (
      <TUICenterMessage
        message={message}
        TimeElement={TimeElement}
        GroupTipsElement={GroupTipsElement}
      />
    );
  }

  return <TUINormalMessage {...props} />;
};

const TUINormalMessage = withMessageMemo((props: TUINormalMessage) => {
  const styles = useStyles();
  const {
    message,
    // MessageBubble,
    TextElement,
    ImageElement,
    AudioElement,
    FileElement,
    VideoElement,
    ReplyElement,
    CustomElement,
    LocationElement,
    GroupTipsElement,
    FaceElement,
    MergerElement,
    MessageAvatar,
    showAvatar = true,
    showNickName = true,
  } = props;
  const isSelf = message.isSelf ?? false;
  const { nickName } = message;

  const NormalElement = ({ message }: { message: V2TimMessage }) => {
    const elementType = message.elemType ?? 0;
    if (elementType === MessageElemType.V2TIM_ELEM_TYPE_TEXT) {
      if (MessageUtils.isReplyMessage(message)) {
        return <ReplyElement message={message} />;
      }
      return <TextElement message={message} />;
    }
    if (elementType === MessageElemType.V2TIM_ELEM_TYPE_IMAGE) {
      return <ImageElement message={message} />;
    }
    if (elementType === MessageElemType.V2TIM_ELEM_TYPE_SOUND) {
      return <AudioElement message={message} />;
    }
    if (elementType === MessageElemType.V2TIM_ELEM_TYPE_VIDEO) {
      return <VideoElement message={message} />;
    }
    if (elementType === MessageElemType.V2TIM_ELEM_TYPE_FILE) {
      return <FileElement message={message} />;
    }
    if (elementType === MessageElemType.V2TIM_ELEM_TYPE_CUSTOM) {
      return <CustomElement message={message} />;
    }
    if (elementType === MessageElemType.V2TIM_ELEM_TYPE_FACE) {
      return <FaceElement message={message} />;
    }
    if (elementType === MessageElemType.V2TIM_ELEM_TYPE_LOCATION) {
      return <LocationElement message={message} />;
    }
    if (elementType === MessageElemType.V2TIM_ELEM_TYPE_MERGER) {
      return <MergerElement message={message} />;
    }
    if (elementType === MessageElemType.V2TIM_ELEM_TYPE_GROUP_TIPS) {
      return <GroupTipsElement message={message} />;
    }
    return <Text>["未知消息"]</Text>;
  };

  return (
    <MessageRow isSelf={isSelf}>
      {showAvatar && <MessageAvatar message={message} />}
      <MessageColunmn isSelf={isSelf}>
        {showNickName && (
          <Text h4 style={styles.text}>
            {nickName}
          </Text>
        )}
        <MessageBubble message={message}>
          <NormalElement message={message} />
        </MessageBubble>
      </MessageColunmn>
    </MessageRow>
  );
});

const TUICenterMessage = withMessageMemo((props: TUICenterMessageProps) => {
  const { message, TimeElement, GroupTipsElement } = props;
  const { elemType } = message;

  switch (elemType) {
    case 11:
      return <TimeElement message={message} />;
    case 9:
      return <GroupTipsElement message={message} />;
    default:
      return <View />;
  }
});

const useStyles = makeStyles((theme) => ({
  text: {
    color: theme.colors.grey4,
    marginBottom: 4,
  },
}));
