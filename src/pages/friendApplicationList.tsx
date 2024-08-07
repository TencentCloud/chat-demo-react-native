import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../interface";
import React, {useEffect} from 'react';
import { View } from "react-native";
import { TUIApplicationList } from "../TUIKit/components/TUIFriend/ApplicationList/tui_application_list";
type Props = NativeStackScreenProps<RootStackParamList, 'FriendApplicationList'>;
export function FriendApplicationPage({route,navigation}:Props){
    const {applicationList} = route.params;
    return(
        <View style={{flex:1}}>
            <TUIApplicationList applicationList={applicationList}></TUIApplicationList>
        </View>
    );
}