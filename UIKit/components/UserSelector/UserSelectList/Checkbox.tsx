import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
} from 'react-native';

export interface ICheckboxProps {
  label?: string;
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
}
export const Checkbox = (props: ICheckboxProps) => {
  const { label, isChecked, onChange } = props;
  const userSelected = () => {
    onChange(!isChecked);
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity
        delayPressIn={0}
        activeOpacity={1}
        style={[
          styles.checkboxContainer,
          isChecked ? styles.checkboxContainerSelected : '',
        ]}
        onPress={userSelected}
      >
        {isChecked && (
          <View style={styles.checkbox}>
            <Image
              source={require('../../../assets/selected.png')}
              style={[styles.checkbox]}
            />
          </View>
        )}
      </TouchableOpacity>
      <Text style={styles.label}>{label || ''}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
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
