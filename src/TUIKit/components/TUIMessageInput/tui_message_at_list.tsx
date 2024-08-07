import { Overlay } from "@rneui/base";
import { BottomSheet, ListItem } from "@rneui/themed";
import React, { useRef } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { ListRenderItem } from "react-native";
import FastImage from "react-native-fast-image";
import { FlatList } from "react-native-gesture-handler";
import { GroupMemberFilterTypeEnum, TencentImSDKPlugin, V2TimGroupMemberFullInfo } from "react-native-tim-js";

interface TUIMessageAtListProps {
    groupID:string;
    userInput:string;
    selectionStart:number;
    atListSelected?:(item?:V2TimGroupMemberFullInfo)=>void;
    
}

export const TUIMessageAtListPopup = (props:TUIMessageAtListProps) => {
    const {groupID,userInput,selectionStart,atListSelected} = props;
    const [memberList,setMemberList] = React.useState<V2TimGroupMemberFullInfo[]>([]);
    const [displayList,setDisplayList] = React.useState<V2TimGroupMemberFullInfo[]>([]);
    const defaultFaceUrl =
    "https://qcloudimg.tencent-cloud.cn/raw/2c6e4177fcca03de1447a04d8ff76d9c.png";
    const refPopup = useRef(null);
    React.useEffect(() => {
        getMemberList();
      }, [groupID]);

    React.useEffect(()=>{
        const newList = memberList.filter(v => v.nickName?.includes(userInput) || v.nameCard?.includes(userInput));
        setDisplayList(newList);
    },[userInput,memberList])
    const getMemberList = async()=>{
        const res = await TencentImSDKPlugin.v2TIMManager.getGroupManager().getGroupMemberList(
            groupID,
            GroupMemberFilterTypeEnum.V2TIM_GROUP_MEMBER_FILTER_ALL ,
            '0', 
            100,
            0);
        if(res.code == 0){
            const atAll = {userID:"__kImSDK_MessageAtALL__",nickName:"All"}
            setMemberList([atAll,...res.data?.memberInfoList!]);
            setDisplayList([atAll,...res.data?.memberInfoList!]);
        }
    }
    
    const itemPressed = (item:V2TimGroupMemberFullInfo) => {
        console.log('item pressed '+item.nickName);
        if(atListSelected){
            atListSelected(item);
        }
    }


    const renderMemberItem:ListRenderItem<V2TimGroupMemberFullInfo> = ({item}) => {
        return(
            <ListItem 
            onPress={()=>{
                itemPressed(item);
            }}
            
            >
                <FastImage
                style={{ width: 30, height: 30, borderRadius: 5 }}
                source={{
                    uri: item.faceUrl ? item.faceUrl : defaultFaceUrl,
                }}
                resizeMode={FastImage.resizeMode.contain}
                />
                <ListItem.Content>
                    <ListItem.Title>{item.nickName}</ListItem.Title>
                </ListItem.Content>
            </ListItem>
            // <Pressable onPress={()=>{itemPressed(item)}} style={styles.item}>

            //     <Text style={styles.title}>{item.nickName}</Text>
            // </Pressable>
        );
    }


    return(
        <SafeAreaView style={{flex: 1}}>
            <BottomSheet modalProps={{}} isVisible={true} >
            <ListItem 
            onPress={()=>{
                if(atListSelected){
                    atListSelected();
                }
            }}
            style={styles.cancel}
            >
                <ListItem.Content>
                    <ListItem.Title style={styles.cancelText}>Cancel</ListItem.Title>
                </ListItem.Content>
            </ListItem>
                    <FlatList style={styles.list}
                    data={displayList}
                    renderItem={renderMemberItem}/>
                <ScrollView style={styles.list}>
                </ScrollView>
                
            </BottomSheet>
            
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    list:{
        backgroundColor:'white',
        // height:50,
        flex:1,
    },
    cancel:{
        // backgroundColor:'white',
    },
    cancelText:{
        fontSize:20,
        color:'red',
        textAlign: 'right',
    },
    item: {
    //   backgroundColor: '#f9c2ff',
    //   padding: 10,
      marginVertical: 3,
      marginHorizontal: 10,
      borderBottomWidth:0.3,
      borderBottomColor:'grey'
    },
    title: {
      fontSize: 22,
    },
  });