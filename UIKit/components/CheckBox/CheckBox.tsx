import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ViewStyle,
} from 'react-native';

export interface ICheckBoxProps {
  checked: boolean;
  label?: string;
  containerStyle?: ViewStyle;
}
export const CheckBox = (props: ICheckBoxProps) => {
  const {
    label = '',
    checked,
    containerStyle,
  } = props;

  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={[
          styles.checkboxContainer,
          checked && styles.checkboxContainerSelected,
        ]}
      >
        {checked && (
          <Image
            source={require('../../assets/selected.png')}
            style={[styles.checkbox]}
          />
        )}
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    width: 18,
    height: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  checkboxContainerSelected: {
    borderWidth: 0,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
  },
});
