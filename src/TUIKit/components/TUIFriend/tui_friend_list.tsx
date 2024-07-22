import { TencentImSDKPlugin, V2TimFriendInfo, V2TimGroupInfo } from "react-native-tim-js"
import React from "react";
import { ListRenderItem, View } from "react-native";
import { BottomSheet, Header, ListItem, Text } from "@rneui/base";
import { FlatList, GestureHandlerRootView } from "react-native-gesture-handler";
import { TUIFriendItem } from "./tui_friend_item";
import { TUIGroupList } from "./GroupList/tui_group_list";
interface TUIFriendListProps {
    onFriendTap?:(friend:V2TimFriendInfo)=>void;
}
export const TUIFriendList = (props:TUIFriendListProps) => {
    const {onFriendTap} = props;
    const [friendList,setFriendList] = React.useState<V2TimFriendInfo[]>([]);
    const [groupList,setGroupList] = React.useState<V2TimGroupInfo[]>([]);
    const [groupVisible, setgroupVisible] = React.useState(false);
    React.useEffect(()=>{
        getFriendList();
        addFriendListener();
    },[])

    const getFriendList = async () => {
        const{code,data} = await TencentImSDKPlugin.v2TIMManager.getFriendshipManager().getFriendList();
        if(code == 0){
            setFriendList((prevState)=>{
                const newFriendList = [...prevState,...data!];
                const friends = Array.from(new Set(newFriendList.map(friend => friend.userID)))
                .map(id => newFriendList.find(friend => friend.userID === id))
                .filter(conversation => conversation !== undefined) as V2TimFriendInfo[];
                return friends;
                    })
            
        }
    }

    

    const onFriendInfoChanged = async (infoList:V2TimFriendInfo[])=>{
        setFriendList((prevState) => {
            let temp:V2TimFriendInfo[] = [];
            infoList.map((item)=>{
                temp = prevState.map((i)=>{
                    if(item.userID === i.userID){
                        return item;
                    } else{
                        return i;
                    }
                })
            });
            return temp;
        })
    }

    const onFriendListAdded = async (friendList:V2TimFriendInfo[]) => {
        setFriendList((prevState)=>{
            return [...prevState,...friendList];
        })
    }
    
    const friendListener = {
        onFriendInfoChanged:onFriendInfoChanged,
        onFriendListAdded:onFriendListAdded
    }
    const addFriendListener = async () => {
        TencentImSDKPlugin.v2TIMManager.getFriendshipManager().addFriendListener(friendListener);
    }
    const renderFriendItem: ListRenderItem<V2TimFriendInfo> = ({item})=>{
        return TUIFriendItem({item,onFriendTap:onFriendTap});
        // return(
        //     <Text>{item.userID}</Text>
        // );
    }
    return (
        <GestureHandlerRootView>
            <View style={{flex:1}}>
                <Header
                    containerStyle={{
                        backgroundColor: '#e1e8ee',
                        paddingLeft: 20,
                    }}
                    centerComponent={{ text: "好友列表", style: {color: 'black',
                        fontSize: 16} }}
                    />
                    <ListItem bottomDivider>
                        <ListItem.Content>
                            <ListItem.Title>好友申请列表</ListItem.Title>
                        </ListItem.Content>
                    </ListItem>
                    <ListItem bottomDivider onPress={()=>{setgroupVisible(true)}}>
                        <ListItem.Content>
                            <ListItem.Title>群组列表</ListItem.Title>
                        </ListItem.Content>
                    </ListItem>
                    <ListItem bottomDivider>
                        <ListItem.Content>
                            <ListItem.Title>黑名单</ListItem.Title>
                        </ListItem.Content>
                    </ListItem>
                    <FlatList 
                        style={{ flex: 1, width: "100%" }} 
                        data={friendList} 
                        renderItem={renderFriendItem}/>
            </View>
            <BottomSheet modalProps={{}} isVisible={groupVisible}>
                <TUIGroupList groupList={[]}></TUIGroupList>
                <ListItem
                onPress={()=>{setgroupVisible(false)}}
                >
                <ListItem.Content>
                    <ListItem.Title>cancel</ListItem.Title>
                </ListItem.Content>
                </ListItem>
            </BottomSheet>
        </GestureHandlerRootView>
        
    );
}
