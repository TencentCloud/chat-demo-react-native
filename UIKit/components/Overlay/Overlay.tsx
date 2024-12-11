import React, { PropsWithChildren, useEffect, useState } from 'react';
import {
  StyleSheet,
  Modal,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';

interface IOverlayProps {
  isVisible: boolean;
  style?: ViewStyle;
  animationType?: 'none' | 'slide' | 'fade';
  onClose?: () => void;
}

export function Overlay(props: PropsWithChildren<IOverlayProps>) {
  const {
    children,
    isVisible,
    style: propsStyle = {},
    onClose,
    animationType = 'slide',
  } = props;

  const [modalVisible, setModalVisible] = useState(false);

  const closeOverlay = () => {
    setModalVisible(false);
    onClose && onClose();
  };

  useEffect(() => {
    setModalVisible(isVisible);
  }, [isVisible, setModalVisible]);

  return (
    <Modal
      animationType={animationType}
      transparent={true}
      onRequestClose={closeOverlay}
      visible={modalVisible}
    >
      <TouchableOpacity
        delayPressIn={0}
        activeOpacity={1}
        style={StyleSheet.flatten([styles.container, propsStyle])}
        onPress={closeOverlay}
      >
        {children}
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#00000099',
  },
});
