import React, {useEffect} from 'react';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../interface";
import { View } from "react-native";
import { TUIBlockList } from '../TUIKit/components/TUIFriend/BlockList/tui_block_list';

type Props = NativeStackScreenProps<RootStackParamList, 'BlockList'>;
export function BlockListPage({route}:Props){
    const {blockList} = route.params;
    return(
        <View style={{flex:1}}>
            <TUIBlockList blockList={blockList}></TUIBlockList>
        </View>
    );
}