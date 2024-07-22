import React from 'react'
import { ListItem } from "@rneui/base";
import { V2TimFriendInfo } from "react-native-tim-js"
import FastImage from 'react-native-fast-image';

interface TUIFriendItemProps {
    item:V2TimFriendInfo,
    onFriendTap?:(friend:V2TimFriendInfo)=>void
}
export const TUIFriendItem = (props:TUIFriendItemProps) => {
    const {item,onFriendTap} = props;
    const defaultFaceUrl =
    "https://qcloudimg.tencent-cloud.cn/raw/2c6e4177fcca03de1447a04d8ff76d9c.png";
    const getShowName = ()=>{
        return item.friendRemark? item.friendRemark:item.userID;
    }
    return(<ListItem bottomDivider
        onPress={()=>{
            if(onFriendTap){
                onFriendTap(item);
            }
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
          <ListItem.Title>{getShowName()}</ListItem.Title>
        </ListItem.Content>
      </ListItem>);
}