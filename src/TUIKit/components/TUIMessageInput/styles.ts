import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  emoji: {
    height: 320,
    marginTop: 10,
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: '#EDEDED',
    borderTopWidth: 1,
    borderTopColor: 'rgba(224,224,224,0.8)',
    display: 'flex',
    alignItems: 'center',
  },
  toolbox: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#EDEDED',
    flexWrap: 'wrap',
    marginTop: 10,
    paddingTop: 10,
    height: 240,
    borderTopWidth: 1,
    borderTopColor: 'rgba(224,224,224,0.8)',
  },
  text: {
    fontSize: 48,
    color: 'darkgray',
  },
  toolBoxItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 20,
  },
  toolBoxImg: {
    width: 64,
    height: 64,
    marginBottom: 4,
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    position: 'absolute',
    alignItems: 'center',
    right: 20,
    backgroundColor: '#EDEDED',
    paddingLeft: 20,
    paddingRight: 10,
  },
  delImg: {
    width: 36,
    height: 25,
  },
  sendBtn: {
    backgroundColor: '#147AFF',
    borderRadius: 3,
  },
});
