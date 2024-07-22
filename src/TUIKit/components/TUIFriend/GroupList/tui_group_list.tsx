import { ListItem } from "@rneui/base";
import React from "react";
import { FlatList, ListRenderItem, View } from "react-native";
import FastImage from "react-native-fast-image";
import { V2TimGroupInfo } from "react-native-tim-js"

interface TUIGroupListProps {
    groupList:V2TimGroupInfo[];
    onGroupTap?:(group:V2TimGroupInfo)=>void;
}
export const TUIGroupList = (props:TUIGroupListProps)=>{
    const {groupList,onGroupTap} = props;
    const defaultFaceUrl =
    "https://qcloudimg.tencent-cloud.cn/raw/2c6e4177fcca03de1447a04d8ff76d9c.png";
    const renderGroupItem:ListRenderItem<V2TimGroupInfo>=({item})=>{
        return(
            <ListItem bottomDivider
            onPress={()=>{
                if(onGroupTap){
                    onGroupTap(item);
                }
            }}
            >
                <FastImage
                    style={{ width: 40, height: 40, borderRadius: 5 }}
                    source={{
                        uri: item.faceUrl ? item.faceUrl : defaultFaceUrl,
                    }}
                    resizeMode={FastImage.resizeMode.contain}
                    />
                <ListItem.Content>
                <ListItem.Title>{item.groupName?item.groupName:item.groupID}</ListItem.Title>
                </ListItem.Content>
            </ListItem>
        );
    }
    return(
        <View style={{flex:1}}>
            <FlatList 
                style={{ flex: 1, width: "100%" }} 
                data={groupList} 
                renderItem={renderGroupItem}/>
        </View>
    );
}