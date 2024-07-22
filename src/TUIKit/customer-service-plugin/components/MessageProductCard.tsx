import React from 'react';
import { View, TouchableWithoutFeedback, Linking, StyleSheet, Text, Image } from 'react-native'
import { customerServicePayloadType } from '../utils/interface';

type CardElementProps = {
    payload: customerServicePayloadType;
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: 'white',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#d1d2d3',
        borderRadius: 8,
        padding: 5,
        flexDirection: 'row'
    },
    cardImg: {
        width: 86,
        height: 86,
    },
    cardContent: {
        flexDirection: 'column',
        padding: 0,
        margin: 10,
        justifyContent: 'space-between',
    },
    cardContentHeader: {
        width: 100,
        fontSize: 12,
    },
    cardContentDesc: {
        width: 100,
        fontSize: 12,
    }
});


export const ProductCard: React.FC<CardElementProps> = (props) => {
    return (
        <TouchableWithoutFeedback
            onPress={() => {
                Linking.openURL(props?.payload?.content?.url)
            }}
        >
            <View style={styles.cardContainer}>
                <Image source={{ uri: props?.payload?.content?.pic }} style={styles.cardImg} />
                <View style={styles.cardContent}>
                    <Text style={styles.cardContentHeader} numberOfLines={3} ellipsizeMode="tail">{props?.payload?.content?.header ?? ''}</Text>
                    <Text style={styles.cardContentDesc} numberOfLines={1} ellipsizeMode="tail">{props?.payload?.content?.desc ?? ''}</Text>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}
