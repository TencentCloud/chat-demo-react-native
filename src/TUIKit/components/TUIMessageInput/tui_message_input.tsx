import { Icon, Image, makeStyles, Text } from "@rneui/themed";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Keyboard,
  NativeSyntheticEvent,
  TextInput,
  TextInputSubmitEditingEventData,
} from "react-native";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLoginUser } from "../../hooks/useLoginUser";
import { setRepliedMessage, useTUIChatContext } from "../../store";
import { MessageService } from "./message_service";
import { VoiceButton } from "./tui_message_voice_button";
import runes from "runes";
import { useRepliedMessage } from "../../store/TUIChat/selector";
import { MessageUtils } from "../../utils/message";
import FastImage from "react-native-fast-image";
import { TUIMessageAtListPopup } from "./tui_message_at_list";
import { V2TimGroupMemberFullInfo } from "react-native-tim-js";
import { Utils } from "./utils";

interface TUIMessageInputInterface {
  loginUserID: string;
  convID: string;
  convType: number;
  driverName?: string;
  onEmojiTap: () => void;
  onToolBoxTap: () => void;
  hideAllPanel: () => void;
  showSound?: boolean;
  showFace?: boolean;
  showToolBox?: boolean;
  onMessageSend?:()=>void;
}

export interface TUIMessageInputRef {
  getTextInputRef: () => React.MutableRefObject<TextInput | null>;
  addTextValue: (text: string) => void;
  deleteTextValue: () => void;
  hanldeSubmiting: () => void;
}

export const TUIMessageInput = forwardRef<
  TUIMessageInputRef,
  TUIMessageInputInterface
>((props: TUIMessageInputInterface, ref) => {
  const {
    convID,
    convType,
    driverName,
    hideAllPanel,
    showFace = true,
    showSound = true,
    showToolBox = true,
    onMessageSend
  } = props;
  const styles = useStyles();
  const [text, setText] = useState<string>("");
  const repliedMessage = useRepliedMessage();
  const [showVoiceRecord, setShowVoiceRecord] = useState(false);
  const textInputRef = useRef<TextInput | null>(null);
  const loginUserInfo = useLoginUser(props.loginUserID);
  const { dispatch } = useTUIChatContext();
  const [showAtList,setShowAtList] = useState(false);
  const [atUserList,setAtUserList] = useState<V2TimGroupMemberFullInfo[]>([]);
  const [selectionCor,setSelectionCor] = useState(0);
  const [atNameInput,setAtNameInput] = useState('');
  const [oldInputText,setOldInputText] = useState('');
  const messageService = new MessageService(dispatch, {
    userInfo: loginUserInfo,
    convID,
    convType,
  });

  const handleTextChange = (value: string) => {
    setText(value);
    const textArr = value.split('@');
    const lastInput = textArr[textArr.length - 1]; 
    setAtNameInput(lastInput);
    // mentioning member in group
    if(convType == 2){
      let {characters,index,isAddText} = Utils.compareString(oldInputText,value);
      if(!isAddText){
        setShowAtList(false);
        console.log("=====setShowAtList false====")
        let atIndex = oldInputText.lastIndexOf('@',Utils.max(0,index-1));
        let removedLabelList = [];
        if(atIndex != -1 && characters!='@'){
          removedLabelList.push(oldInputText.substring(atIndex+1,index));
          let spaceIndex = index;
          let count = 0;
          while(spaceIndex != -1 && count < 5){
            spaceIndex = oldInputText.indexOf(' ',spaceIndex+1);
            if(spaceIndex!= -1){
              removedLabelList.push(oldInputText.substring(atIndex+1,spaceIndex));
              count++;
            }else{
              removedLabelList.push(oldInputText.substring(atIndex+1));
            }
          }
          let mentionedUserExist = removedLabelList.some((item)=>atUserList.some((a)=>a.nickName == item));
          if(mentionedUserExist){
            let updatedList = atUserList.filter((item)=> !removedLabelList.includes(item.nickName!))
            setAtUserList(updatedList);
          }
        }
      }
    }
    setOldInputText(value);
  };

  useImperativeHandle(ref, () => ({
    getTextInputRef: () => textInputRef,
    addTextValue: (newText: string) => {
      setText(text + newText);
    },
    deleteTextValue: () => {
      setText(runes(text).slice(0, -1).join(""));
    },
    hanldeSubmiting: () => hanldeSubmiting(),
  }));

  const hanldeSubmiting = (
    event?: NativeSyntheticEvent<TextInputSubmitEditingEventData>
  ) => {
    console.log("hanldeSubmiting here")
    if (text && text !== "") {
      sendTextMessage();
      setText("");
    }
    if(textInputRef.current){
      textInputRef.current.clear();
    }
    if(onMessageSend){
      onMessageSend();
    }
    event?.preventDefault();
  };

  const sendTextMessage = () => {
    if (repliedMessage) {
      messageService.sendRepliedMessage(text, repliedMessage);
    } 
    else if(atUserList.length > 0){
      let list:string[] = [];
      atUserList.forEach((item)=>{
        list.push(item.userID!);
      });
      messageService.sendTextAtMessage(text,list);
      setAtUserList([]);
    }else {
      messageService.sendTextMessage(text);
    }
  };

  const sendSoundMessage = (soundPath: string, duration: number) => {
    messageService.sendSoundMessage(soundPath, duration);
  };

  const handleBackSpaceTap = () => {
    dispatch(
      setRepliedMessage({
        message: undefined,
      })
    );
  };

  const getRepliedMessage = () => {
    return `${MessageUtils.getDisplayName(
      repliedMessage!
    )}: ${MessageUtils.getAbstractMessageAsync(repliedMessage!)}`;
  };

  const atListSelected = (item?:V2TimGroupMemberFullInfo)=>{
    
    if(item){
      if(atNameInput != ''){
        const lastIndex = text.lastIndexOf('@'); // 查找最后一个 "@" 的索引
        const result = text.substring(0, lastIndex+1);
        
        setText(result+item.nickName+' ');
        
      }else{
        setText((prevState)=>{
          // console.log("text "+prevState + item.nickName);
          return prevState + item.nickName + ' ';
        })
      }
      setAtUserList((prevState)=>{
        return [...prevState,item]
      });
    }
    console.log("====showAtList false====")
    setAtNameInput('');
    setShowAtList(false);
  }

  const onTextInputBlur = () => {
    console.log('onTextInputBlur');
  }



  return (
    <SafeAreaView
      style={styles.safeAreaContainer}
      edges={["right", "bottom", "left"]}
    >
      {repliedMessage && (
        <View style={styles.repliedMessageContainer}>
          <Text
            ellipsizeMode="tail"
            numberOfLines={3}
            h3
            style={{ color: "#8f959e" }}
          >
            {getRepliedMessage()}
          </Text>
          <Icon
            name={"clear"}
            size={18}
            color="#8f959e"
            onPress={handleBackSpaceTap}
          />
        </View>
      )}
      <View style={styles.rowContainer}>
        {showSound && (
          <Image
            // ImageComponent={FastImage}
            source={
              showVoiceRecord
                ? require("../../../assets/keyboard.png")
                : require("../../../assets/voice.png")
            }
            style={styles.iconSize}
            onPress={() => {
              if (showVoiceRecord) {
                setTimeout(() => {
                  textInputRef.current?.focus();
                });
              } else {
                if (driverName) {
                  hideAllPanel();
                }
              }
              setShowVoiceRecord(!showVoiceRecord);
            }}
          />
        )}

        <View style={styles.inputContainer}>
          {showVoiceRecord ? (
            <VoiceButton onSend={sendSoundMessage} />
          ) : (
            <TextInput
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === "Backspace") {
                  if (repliedMessage && text === "") {
                    handleBackSpaceTap();
                  }
                  // console.log("====showAtList false====")
                  // setShowAtList(false);
                } else if(nativeEvent.key === '@' && convType ==2) {
                  setShowAtList(true);
                  return '@';
                } 
                // else{
                //   setShowAtList(false);
                // }
              }}
              ref={(input) => (textInputRef.current = input)}
              onChangeText={handleTextChange}
              onSubmitEditing={hanldeSubmiting}
              onBlur={onTextInputBlur}
              onSelectionChange={(e) => {setSelectionCor(e.nativeEvent.selection.start);}}
              style={styles.inputStyle}
              returnKeyType="send"
              value={text}
            />
          )
          }
          {
            !showVoiceRecord && showAtList && <TUIMessageAtListPopup groupID={convID} userInput={atNameInput} selectionStart={selectionCor} atListSelected={atListSelected}/>
          }
        </View>
        {showFace && (
          <Image
            // ImageComponent={FastImage}
            source={
              driverName === "emoji"
                ? require("../../../assets/keyboard.png")
                : require("../../../assets/face.png")
            }
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
              ...styles.iconSize,
              marginRight: 10,
            }}
            onPress={() => {
              props.onEmojiTap();
              if (showVoiceRecord) {
                setShowVoiceRecord(false);
              }
            }}
          />
        )}
        {showToolBox && (
          <Image
            // ImageComponent={FastImage}
            source={require("../../../assets/more.png")}
            style={styles.iconSize}
            onPress={props.onToolBoxTap}
          />
        )}
      </View>
    </SafeAreaView>
  );
});

const useStyles = makeStyles((theme) => {
  return {
    safeAreaContainer: {
      backgroundColor: "#EDEDED",
    },
    iconSize: {
      height: 28,
      width: 28,
    },
    rowContainer: {
      display: "flex",
      flexDirection: "row",
      paddingLeft: 15,
      paddingRight: 15,
      // height: 35,
      backgroundColor: "#EDEDED",
      alignItems: "center",
      paddingTop: 10,
      paddingBottom: 10,
    },
    inputStyle: {
      height: 38,
      backgroundColor: theme.colors.white,
      paddingLeft: 4,
    },
    inputContainer: {
      flex: 1,
      marginLeft: 10,
      marginRight: 10,
      fontSize: 16,
    },
    repliedMessageContainer: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      backgroundColor: "#EDEDED",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
  };
});
