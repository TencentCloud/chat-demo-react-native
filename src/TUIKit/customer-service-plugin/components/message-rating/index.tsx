import React from 'react';
import { View } from 'react-native'
import { customerServicePayloadType } from '../../utils/interface';
import { RATING_TEMPLATE_TYPE } from '../../utils/constant';
import { RatingStar } from './MessageRatingStar';
import { RatingNumber } from './MessageRatingNumber';

type RatingElementProps = {
    payload: customerServicePayloadType;
    loginUserID: string,
    convID: string,
    convType: number,
};

export const MessageRating: React.FC<RatingElementProps> = (props) => (
    <View>
        {props.payload?.menuContent && (props.payload?.menuContent?.type === RATING_TEMPLATE_TYPE.STAR ?
            <RatingStar ratingTemplate={props.payload?.menuContent} loginUserID={props.loginUserID} convID={props.convID} convType={props.convType} /> :
            <RatingNumber ratingTemplate={props.payload?.menuContent} loginUserID={props.loginUserID} convID={props.convID} convType={props.convType} />)}
    </View>
);
