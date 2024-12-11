# Quick Run Demo

## About chat-uikit-react-native

[chat-uikit-react-native](https://www.npmjs.com/package/@tencentcloud/chat-uikit-react-native) is a React Native UI component library based on Tencent Cloud Chat SDK. It provides universally used UI components that include ConversationList, Chat, and Group components. Leveraging these meticulously crafted UI components, you can quickly construct an elegant, reliable, and scalable Chat application.

> [!IMPORTANT]
> In respect for the copyright of the emoji design, the Chat Demo/UIKit project does not include the cutouts of large emoji elements. Please replace them with your own designed or copyrighted emoji packs before the official launch for commercial use. The default small yellow face emoji pack is copyrighted by Tencent Cloud and can be authorized for a fee. If you wish to obtain authorization, please submit a ticket to contact us.
> 
> submit a ticket url：https://console.tencentcloud.com/workorder/category?level1_id=29&level2_id=40&source=14&data_title=Chat&step=1

![image](https://cloudcache.intl.tencent-cloud.com/cms/backend-cms/314a8601a26911efa0b3525400bdab9d.png)

#### 👉🏻 Try Online Demo

### Quick Run Demo
#### Step 1：Install Demo Source Code

```shell
git clone https://github.com/TencentCloud/chat-demo-react-native.git
```

```shell
cd chat-demo-react-native/Demo
```

```shell
npm i --legacy-peer-deps
```

#### Step 2：Secure SDKAppID and secretKey
Set the relevant parameters `SDKAppID` and `SECRETKEY` in the example code of the debug/GenerateTestUserSig.js file:
SDKAppID and SecretKey can be accessed by the [Chat Console](https://console.trtc.io/app):
![image](https://github.com/TencentCloud/chat-uikit-react/assets/57951148/09c7c16b-5ff8-4b2d-bb1b-b0bf72a754ed)

#### Step 3：Getting permissions
Client apps must acquire permission from users to get access to their media library and save files to their mobile storage. Once the permission is granted, users can send images and videos to other users and save media files.

#### Android
Add the following permissions to your android/app/src/main/AndroidManifest.xml file.
```javascript
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

#### iOS
Add the following permission usage descriptions to your info.plist file.
```javascript
<key>NSCameraUsageDescription</key>
<string> we would like to use your camera</string>
<key>NSPhotoLibraryUsageDescription</key>
<string> we would like to use your photo library</string>
<key>NSMicrophoneUsageDescription</key>
<string>we would like to use your microphone</string>
```

#### Step 4：Run Demo
To compile and run the project, you need to use a real device or an emulator. It is recommended to use a real device. You can refer to the React Native official website [running-on-device](https://reactnative.dev/docs/running-on-device) for connecting a real device for debugging.

#### Android
- Enable Developer Mode on the phone and turn on the USB Debugging switch.
- Connect the phone with a USB cable, it is recommended to choose the Transfering File option, do not choose the Charge Only option.
- After confirming the phone is successfully connected, execute npm run android to compile and run the project.

```javascript
npm run android
```

#### iOS
- Connect the phone with a USB cable and open the project ios directory with Xcode.
- Configure the signing information according to the [running-on-device](https://reactnative.dev/docs/running-on-device?platform=ios) section on the React Native official website.
- Go to the ios directory and install dependencies.

```javascript
cd ios
pod install
```
- Go back to the root directory and execute npm run ios to compile and run the project.

```javascript
cd ../
npm run ios
```

## Documentation
- [Home page](https://trtc.io/document/66036?platform=react%20native&product=chat&menulabel=uikit)
- [@tencentcloud/chat-uikit-react-native npm](https://www.npmjs.com/package/@tencentcloud/chat-uikit-react-native)
- [Chat SDK](https://trtc.io/document/34309?platform=web&product=chat)

## Contact Us
Join a Tencent Cloud Chat developer group for Reliable technical support & Product details & Constant exchange of ideas.
- Telegram group (EN): [join](https://t.me/+1doS9AUBmndhNGNl)
- WhatsApp group (EN): [join](https://chat.whatsapp.com/Gfbxk7rQBqc8Rz4pzzP27A)
- Telegram group (ZH): [join](https://t.me/tencent_imsdk)
- WhatsApp group (ZH): [join](https://chat.whatsapp.com/IVa11ZkVmKTEwSWsAzSyik)



