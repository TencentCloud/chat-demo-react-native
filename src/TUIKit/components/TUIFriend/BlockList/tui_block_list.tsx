import React from 'react'
import { Dialog, ListItem, Text } from "@rneui/base";
import { FlatList, ListRenderItem, View } from "react-native";
import { TencentImSDKPlugin, V2TimFriendInfo } from "react-native-tim-js";
import FastImage from 'react-native-fast-image';

interface TUIBlockListProps {
    blockList: V2TimFriendInfo[];
    deleteFromBlockList?:(friend:V2TimFriendInfo)=>void
}

export const TUIBlockList = (props:TUIBlockListProps)=>{
    const {blockList,deleteFromBlockList} = props;
    const [dialog,setDialog] = React.useState(false);
    const [selectedFriend,setSelectedFriend] = React.useState({} as V2TimFriendInfo);
    const defaultFaceUrl =
    "https://qcloudimg.tencent-cloud.cn/raw/2c6e4177fcca03de1447a04d8ff76d9c.png";
    const getShowName = (item:V2TimFriendInfo)=>{
        return item.friendRemark? item.friendRemark:item.userID;
    }
    const toggleDialog=()=>{
        setDialog(false);
    }
    const deleteFriendFromBlockList=()=>{
        if(deleteFromBlockList){
            deleteFromBlockList(selectedFriend);
        }
    }
    const renderBlockItem:ListRenderItem<V2TimFriendInfo>=({item})=>{
        return(<ListItem bottomDivider
            onPress={()=>{
                setSelectedFriend(item);
                setDialog(true);
            }}
            containerStyle={{
                marginVertical:-4,
                marginHorizontal: -6,
            }}
            >
            <FastImage
                  style={{ width: 40, height: 40, borderRadius: 5 }}
                  source={{
                    uri: item.userProfile?.faceUrl ? item.userProfile?.faceUrl : defaultFaceUrl,
                  }}
                  resizeMode={FastImage.resizeMode.contain}
                />
            <ListItem.Content>
              <ListItem.Title>{getShowName(item)}</ListItem.Title>
            </ListItem.Content>
          </ListItem>);
    }
    return(<View style={{flex:1}}>
        <FlatList style={{ flex: 1, width: "100%" }}data={blockList} renderItem={renderBlockItem}/>
        <Dialog
        isVisible={dialog}
        onBackdropPress={toggleDialog}
        >
        <Dialog.Title title="Dialog Title"/>
        <Text>Remove {selectedFriend.userID} from Block List? </Text>
        <Dialog.Actions>
            <Dialog.Button title="Remove" onPress={() => console.log('Primary Action Clicked!')}/>
            <Dialog.Button title="cancel" onPress={()=>{console.log("selected "+selectedFriend.userID); setDialog(false)}}/>
        </Dialog.Actions>
        </Dialog>
    </View>);
}