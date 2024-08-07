import { CheckBox } from '@rneui/base';
import type {PropsWithChildren} from 'react';
import React from 'react';
import {Image, StyleSheet, View} from 'react-native';

interface MessageRowProps {
  isSelf: boolean;
  isSelected:boolean;
  isSelectMode?:boolean;
  messageSelctedCallback?:(isAdd:boolean)=>void;
}
export const MessageRow = <T extends MessageRowProps>(
  props: PropsWithChildren<T>,
) => {
  const {isSelf,isSelected,isSelectMode, children} = props;
  const [isChecked,setIsChecked] = React.useState(false);
  React.useEffect(()=>{
    setIsChecked(false);
  },[props.isSelectMode]);
  return (
    <View>
          {isSelectMode &&  <View style={{flexDirection:'row'}}>
          <View style={{alignSelf:'flex-start'}}>
            <CheckBox checked={isChecked}
              checkedIcon={
                <Image style={{ width:15,height:15 }} source={require('../../../../assets/check-box.png')}/>
              }
              uncheckedIcon={
                <Image style={{ width:15,height:15 }} source={require('../../../../assets/blank-check-box.png')}/>
              }
              onPress={()=>{
                // console.log("onpress checkbox");
                if(props.messageSelctedCallback){
                  props.messageSelctedCallback(!isChecked)
                }
                setIsChecked(!isChecked);
                
                
              }}
          />
          </View>
          
          <View style={isSelf ? styles.messageRowForSelf : styles.messageRow}>
            <View
              style={isSelf ? styles.messageElementForSelf : styles.messageElement}>
              {children}
            </View>
          </View>
        </View>
      }
      {
        !isSelectMode && <View style={isSelf ? styles.messageRowForSelf : styles.messageRow}>
        <View
          style={isSelf ? styles.messageElementForSelf : styles.messageElement}>
          {children}
        </View>
      </View>
      }
    </View>
    
  );
};

const styles = StyleSheet.create({
  messageRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 20,
    paddingLeft: 15,
  },
  messageRowForSelf: {
    display: 'flex',
    flex:1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
    paddingRight: 15,
  },
  messageElement: {
    display: 'flex',
    flexDirection: 'row',
  },
  messageElementForSelf: {
    display: 'flex',
    flexDirection: 'row-reverse',
  },
});
