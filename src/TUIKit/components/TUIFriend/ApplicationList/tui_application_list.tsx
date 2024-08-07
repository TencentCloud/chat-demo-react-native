import React from 'react'
import { ListItem } from "@rneui/base";
import { FlatList, ListRenderItem, View } from "react-native";
import FastImage from "react-native-fast-image";
import { V2TimFriendApplication } from "react-native-tim-js/lib/typescript/src/interface/v2TimFriendApplication";

interface TUIFriendApplicationListProps {
    applicationList:V2TimFriendApplication[]
}

export const TUIApplicationList=(props:TUIFriendApplicationListProps)=>{
    const {applicationList} = props;
    const defaultFaceUrl =
    "https://qcloudimg.tencent-cloud.cn/raw/2c6e4177fcca03de1447a04d8ff76d9c.png";
    const renderApplicationItem:ListRenderItem<V2TimFriendApplication>=({item}) => {
        return(<ListItem bottomDivider
            onPress={()=>{
               
            }}
            containerStyle={{
                marginVertical:-4,
                marginHorizontal: -6,
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
              <ListItem.Title>{item.nickName ? item.nickName:item.userID}</ListItem.Title>
            </ListItem.Content>
          </ListItem>);
    }
    return(<View style={{flex:1}}>
         <FlatList style={{ flex: 1, width: "100%" }}data={applicationList} renderItem={renderApplicationItem}/>
    </View>);
}