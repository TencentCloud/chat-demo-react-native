import {Image} from '@rneui/themed';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {V2TimMessage, TencentImSDKPlugin} from 'react-native-tim-js';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {MessageUtils} from '../../../utils/message';
import ImageViewer from '../../ImageView';
import Modal from 'react-native-modal';
import {MessageDownload} from '../../../utils/message_download';
import RNFS from 'react-native-fs';
import {Gesture} from 'react-native-gesture-handler';
import {ScreenWidth} from '@rneui/base';
import FastImage from 'react-native-fast-image';

export const ImageElement = (props: {
  message: V2TimMessage;
  isReplyMessage?: boolean;
}) => {
  const [visible, setIsVisible] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const {imageElem, msgID, progress} = props.message;
  const maxImageElementWidth = props.isReplyMessage ? 150 : ScreenWidth * 0.5;
  const maxImageHeight = props.isReplyMessage ? 100 : 256;
  const [imagePath, setImagePath] = useState(' ');
  const smallImage = MessageUtils.getImageFromImageList(
    imageElem?.imageList,
    'Small',
  );
  const originalImg = MessageUtils.getImageFromImageList(
    imageElem?.imageList,
    'Original',
  );

  const haveOriginalLocalUrl = !!originalImg?.localUrl;
  const haveSmallLocalUrl = !!smallImage?.localUrl;
  const haveImgPath = !!imageElem?.path;

  useEffect(() => {
    const haveLocalUrl = !!imageElem!.imageList![0]!.localUrl;
    if (
      msgID &&
      msgID !== '' &&
      (!haveLocalUrl || imageElem!.imageList![0]!.localUrl! === '') &&
      progress !== 1 &&
      !haveImgPath
    ) {
      MessageDownload.avoidUpdateTask.push(msgID!);
      const _messageService =
        TencentImSDKPlugin.v2TIMManager.getMessageManager();
      _messageService.downloadMessage(msgID!, 3, 0, false);
      _messageService.downloadMessage(msgID!, 3, 1, false);
      _messageService.downloadMessage(msgID!, 3, 2, false);
    }
    getImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getImage = async (localPathAvailable = true) => {
    let imgPath;
    if (haveImgPath && localPathAvailable) {
      imgPath = 'file:///' + imageElem.path;
      setImagePath(imgPath!);
      const isExist = await RNFS.exists(imgPath!);
      console.log('isExist', isExist);
      if (isExist) {
        setImagePath(imgPath!);
      } else {
        getImage(false);
      }
      return;
    } else if (haveOriginalLocalUrl) {
      imgPath = originalImg.localUrl;
    } else if (haveSmallLocalUrl) {
      imgPath = smallImage.localUrl;
    } else {
      imgPath = smallImage?.url;
    }
    if (imgPath) {
      setImagePath(imgPath);
    }
  };

  const getImageSize = () => {
    const size = {
      width: 0,
      height: 0,
    };
    let ratio = 0;
    let displayWidth = 0;
    if (haveImgPath) {
      displayWidth = Math.min(maxImageElementWidth, originalImg!.width!);
      ratio = originalImg!.width! / originalImg!.height!;
    } else if (haveOriginalLocalUrl) {
      displayWidth = Math.min(maxImageElementWidth, originalImg!.width!);
      ratio = displayWidth / originalImg!.height!;
    } else {
      if (!smallImage) {
        displayWidth = 50;
        ratio = 1;
      } else {
        displayWidth = Math.min(maxImageElementWidth, smallImage!.width!);
        ratio = displayWidth / smallImage!.height!;
      }
    }
    const displayHeight = displayWidth / ratio;
    size.width = displayWidth;
    size.height = Math.min(displayHeight, maxImageHeight);
    return size;
  };

  const renderFooter = () => {
    return (
      <View style={{...styles.footer, width: ScreenWidth}}>
        <Image
          source={require('../../../../assets/close.png')}
          style={styles.icon}
          onPress={() => {
            setIsVisible(false);
          }}
        />

        <Image
          source={require('../../../../assets/download.png')}
          style={styles.icon}
          onPress={() => {
            saveToLocal();
          }}
        />
      </View>
    );
  };

  const saveToLocal = async () => {
    // const result = check(PERMISSIONS.IOS.PHOTO_LIBRARY);
    // console.log(result);
    if (imagePath) {
      const response = await CameraRoll.save(imagePath);
      console.log('response', response);
    }
  };

  const longPressGesture = Gesture.Tap().onStart(() => {
    setOpacity(1);
    setIsVisible(true);
    console.log(' press start in element');
  });

  return (
    // <GestureDetector gesture={longPressGesture}>
    <View>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          console.log('press');
          setOpacity(1);
          setIsVisible(true);
        }}>
        <Image
          ImageComponent={FastImage}
          containerStyle={[
            styles.img,
            {
              width: getImageSize().width,
              height: getImageSize().height,
            },
          ]}
          source={{
            uri: imagePath,
          }}
        />
      </TouchableOpacity>

      <Modal
        isVisible={visible}
        backdropColor="black"
        backdropOpacity={opacity}
        animationIn="fadeIn"
        animationOut="fadeOutDown"
        style={{margin: 0}}>
        <ImageViewer
          swipeDownThreshold={100}
          onSwipeDown={() => setIsVisible(false)}
          onClick={() => setIsVisible(false)}
          renderFooter={renderFooter}
          enableSwipeDown
          enableImageZoom
          imageUrls={[
            {
              url: imagePath,
            },
          ]}
        />
      </Modal>
    </View>
    // </GestureDetector>
  );
};

const styles = StyleSheet.create({
  img: {
    borderRadius: 10,
  },
  icon: {
    width: 30,
    height: 30,
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 50,
    paddingLeft: 10,
    paddingRight: 10,
  },
});
