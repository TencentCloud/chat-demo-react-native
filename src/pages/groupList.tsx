import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';
import { RootStackParamList } from '../interface';
import { View } from 'react-native';
import { TUIGroupList } from '../TUIKit/components/TUIFriend/GroupList/tui_group_list';
type Props = NativeStackScreenProps<RootStackParamList, 'GroupList'>;
export function GroupListPage({route,navigation}:Props) {
    const {groupList,onGroupTap} = route.params;
    return(
        <View style={{flex:1}}>
            <TUIGroupList groupList={groupList} onGroupTap={onGroupTap}></TUIGroupList>
        </View>
    );
}