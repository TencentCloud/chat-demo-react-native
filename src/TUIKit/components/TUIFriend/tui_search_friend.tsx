import React from 'react'
import { Button, Modal, Text, View } from "react-native";

interface TUISearchFriendProps {
    cancelSearch?:()=>void;
}

export const TUISearchFriend = (props:TUISearchFriendProps)=>{
    const {cancelSearch} = props;
    return(
        <Modal>
            <View>
                <Text>search friend here</Text>
                 <Button title='cancel'onPress={cancelSearch}></Button></View>
        </Modal>
    );
}