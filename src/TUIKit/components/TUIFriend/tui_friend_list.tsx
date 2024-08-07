import { TencentImSDKPlugin, V2TimFriendInfo, V2TimGroupChangeInfo, V2TimGroupInfo } from "react-native-tim-js"
import React from "react";
import { Image, ListRenderItem, StyleSheet, TouchableOpacity, View } from "react-native";
import { BottomSheet, Header, ListItem, Text } from "@rneui/base";
import { FlatList, GestureHandlerRootView } from "react-native-gesture-handler";
import { TUIFriendItem } from "./tui_friend_item";
import { TUIGroupList } from "./GroupList/tui_group_list";
import { V2TimFriendApplication } from "react-native-tim-js/lib/typescript/src/interface/v2TimFriendApplication";
import { TUISearchFriend } from "./tui_search_friend";
interface TUIFriendListProps {
    onFriendTap?:(friend:V2TimFriendInfo)=>void;
    onGroupListTap?:(groupList:V2TimGroupInfo[])=>void;
    onBlockListTap?:(blockList:V2TimFriendInfo[]) => void;
    onApplicationListTap?:(applicationList:V2TimFriendApplication[])=>void;
}
export const TUIFriendList = (props:TUIFriendListProps) => {
    const {onFriendTap,onGroupListTap,onBlockListTap,onApplicationListTap} = props;
    const [friendList,setFriendList] = React.useState<V2TimFriendInfo[]>([]);
    const [groupList,setGroupList] = React.useState<V2TimGroupInfo[]>([]);
    const [blockList,setBlockList] = React.useState<V2TimFriendInfo[]>([]);
    const [applicationList,setApplicationList] = React.useState<V2TimFriendApplication[]>([]);
    const [searchFriend,setSearchFriend] = React.useState<boolean>(false);
    React.useEffect(()=>{
        getFriendList();
        addFriendListener();
        getGroupList();
        addGroupListener();
        getBlockList();
        getApplicationList();
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

    const getGroupList = async()=>{
        const {code,data} = await TencentImSDKPlugin.v2TIMManager.getGroupManager().getJoinedGroupList();
        if(code == 0){
            setGroupList((prevState)=>{
                const newGroupList = [...prevState,...data!];
                const groups = Array.from(new Set(newGroupList.map(group => group.groupID)))
                .map(id=>newGroupList.find(group => group.groupID === id))
                .filter(group => group!==undefined) as V2TimGroupInfo[];
                return groups;
            })
        }
    }

    const getBlockList = async()=>{
        const {code,data} = await TencentImSDKPlugin.v2TIMManager.getFriendshipManager().getBlackList();
        if(code == 0){
            setBlockList((prevState)=>{
                const newBlockList = [...prevState,...data!];
                const friends = Array.from(new Set(newBlockList.map(friend => friend.userID)))
                .map(id => newBlockList.find(friend => friend.userID === id))
                .filter(conversation => conversation !== undefined) as V2TimFriendInfo[];
                return friends;
            })
            
        }
    }

    const getApplicationList = async () => {
        const {code,data} = await TencentImSDKPlugin.v2TIMManager.getFriendshipManager().getFriendApplicationList();
        if(code == 0){
            setApplicationList((prevState)=>{
                const newList = [...prevState,...data?.friendApplicationList!];
                const applications = Array.from(new Set(newList.map(index => index.userID)))
                .map(id => newList.find(friend =>friend.userID == id))
                .filter(application => application !== undefined) as V2TimFriendApplication[];
                return applications;
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
    
    const onBlockListDeleted = async(userList:string[])=>{
        setBlockList((prevState)=>{
            return prevState.filter((friend)=>!userList.includes(friend.userID))
        })
    }

    const friendListener = {
        onFriendInfoChanged:onFriendInfoChanged,
        onFriendListAdded:onFriendListAdded,
        onBlockListDeleted
    }
    const addFriendListener = async () => {
        TencentImSDKPlugin.v2TIMManager.getFriendshipManager().addFriendListener(friendListener);
    }
    const renderFriendItem: ListRenderItem<V2TimFriendInfo> = ({item})=>{
        return TUIFriendItem({item,onFriendTap:onFriendTap});
    }

    const groupChangedInfo=(group:V2TimGroupInfo,changeInfos:V2TimGroupChangeInfo[])=>{
        let aftergroup = group;
        changeInfos.map((info)=>{
            switch (info.type) {
                case 1:
                    aftergroup.groupName = info.value;
                    break;
                case 2:
                    aftergroup.introduction = info.value;
                    break;
                case 3:
                    aftergroup.notification = info.value;
                    break;
                case 4:
                    aftergroup.faceUrl = info.value;
                    break;
                case 5:
                    aftergroup.owner = info.value;
                case 6:
                    aftergroup.isAllMuted = info.boolValue;
                    break;
                default:
                    break;
            }
        });
        return aftergroup;
    }

    const onGroupInfoChanged = async(groupID:string, changeInfos:V2TimGroupChangeInfo[])=>{
        setGroupList((prevState)=>{
            let groups:V2TimGroupInfo[]=[];
            groups = prevState.map((group)=>{
                if(group.groupID){
                    return groupChangedInfo(group,changeInfos);
                }else{
                    return group;
                }
            })
            return groups;
        });
    }
    const groupListener = {
        onGroupInfoChanged:onGroupInfoChanged
    }
    const addGroupListener = async()=>{
        TencentImSDKPlugin.v2TIMManager.addGroupListener(groupListener);
    }
    const cancelSearch=()=>{
        setSearchFriend(false);
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
                        rightComponent={
                            <View style={styles.headerRight}>
                              <TouchableOpacity
                                style={{ marginLeft: 10 }}
                                onPress={()=>{console.log("pressed");setSearchFriend(true);}}
                              >
                                <Image style={styles.headerIcon} source={require('../../../assets/add_friend.png')}/>
                              </TouchableOpacity>
                            </View>
                        }
                    />
                    <ListItem bottomDivider onPress={()=>{
                        if(onApplicationListTap){
                            console.log("has application tap")
                            onApplicationListTap(applicationList);
                        }
                    }}>
                        <ListItem.Content>
                            <ListItem.Title>好友申请列表</ListItem.Title>
                        </ListItem.Content>
                    </ListItem>
                    <ListItem bottomDivider onPress={()=>{
                        // setgroupVisible(true)
                        if(onGroupListTap){
                            onGroupListTap(groupList);
                        }
                        }}>
                        <ListItem.Content>
                            <ListItem.Title>群组列表</ListItem.Title>
                        </ListItem.Content>
                    </ListItem>
                    <ListItem bottomDivider
                        onPress={()=>{
                            if(onBlockListTap){
                                onBlockListTap(blockList);
                            }
                        }}
                    >
                        <ListItem.Content>
                            <ListItem.Title>黑名单</ListItem.Title>
                        </ListItem.Content>
                    </ListItem>
                    <FlatList 
                        style={{ flex: 1, width: "100%" }} 
                        data={friendList} 
                        renderItem={renderFriendItem}/>
                {searchFriend && <TUISearchFriend cancelSearch={cancelSearch}/>}
            </View>
        </GestureHandlerRootView>
        
    );
}
const styles = StyleSheet.create({
    headerRight: {
        display: 'flex',
        flexDirection: 'row',
        marginTop: 5,
      },
    headerIcon:{
        width:20,
        height:20,
    }
})