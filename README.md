[简体中文](./README_CN.md) ｜ [English](./README.md)

## IM(Chat) React Native Demo

This project is React Native Chat Demo, which is a Demo project developed by [react-native-tim-js](https://www.npmjs.com/package/react-native-tim-js) and community-related open source packages. It can help you quickly develop an instant messaging chat scenario application.

## Perquisites

[Signed up](https://www.tencentcloud.com/document/product/378/17985?from=unity) for a Tencent Cloud account and completed [identity verification](https://www.tencentcloud.com/document/product/378/3629?from=unity).

1. Created a chat application as instructed in [Creating and Upgrading an Application](https://www.tencentcloud.com/document/product/1047/34577?from=unity) and recorded the SDKAppID.
   > The same Tencent Cloud account can create up to 300 instant messaging IM applications. If there are already 300 applications, you can [deactivate and delete](https://www.tencentcloud.com/document/product/1047/34540?lang=en&pg=) the unused applications before creating new ones . \*_After the application is deleted, all data and services corresponding to the SDKAppID cannot be recovered, please operate with caution._ > ![](https://main.qcloudimg.com/raw/15e61a874a0640d517eeb67e922a14bc.png)
2. Record the SDKAppID. You can view the status, business version, SDKAppID, label, creation time, and expiration time of the newly created application on the console overview page.
   ![](https://main.qcloudimg.com/raw/7954cc2882d050f68cd5d1df2ee776a6.png)
3. Click the created application, click **Auxiliary Tools**>**UserSig Generation & Verification** in the left navigation bar, create a UserID and its corresponding UserSig, copy the signature information, and use it for subsequent logins.
   ![](https://main.qcloudimg.com/raw/2286644d987d24caf565142ae30c4392.png)

## How to start

### Environment setup

Refer to React Naitve [official document](https://reactnative.dev/docs/environment-setup) to build a local development environment.
The React Native version provided by this UIKit demo is 0.73.9, and the minimum supported React Native version is 0.68.3.

### Install dependences

1: Execute the following code in the project root directory to install the dependencies required for the project:

```
// yarn
yarn
// npm
npm install
// ios
cd ios
pod install
```

### Run
0. Get `SDKAppID, Secret` from the console.
1. Fill in the prepared `SDKAppID, Secret` into the `config.ts` file. (Filling in the existing userID on the start page will automatically calculate userSig and log in.)
2. Execute the following command to run:

```
// yarn
yarn android
yarn ios

// npm
npm run android
npm run ios
```

### Code Directory
The code directory structure can be found in `src/TUIKit/README.md`

### FAQ

- How to integrate into existing projects?

  `src/TUIKit` contains `TUIChat` and other related components, which can be copied directly to your project. At the same time, you also need to install the corresponding dependencies. For the corresponding dependencies, check the `package.json` file.

- How to use it in Expo?

  In `expo`, if the package you use contains Native code, you need to use `development build`. For detailed information, please check its [official document](https://docs.expo.dev/home/develop/development-builds/introduction/).

- How to solve the Android project error `Task:react-native-create-thumbnail:compileDebugJavaWithJavac FAILED`?

  Please refer to https://github.com/souvik-ghosh/react-native-create-thumbnail/issues/87#issuecomment-1421105553

- App crash occurs?

  Please check whether permission is applied.

- No response when clicking to take a photo?

  To use the camera function, please use a real device for debugging.
- npm run ios failed?
  - It is best to run ios in xcode. If there is an error in the dependency RCT-Folly hash, please click the file in xcode and follow the prompts to modify the error and try to run again.
- iOS Flipper package error?
  - Please refer to [Flipper error](https://stackoverflow.com/questions/78244457/reactnative-app-build-failing-with-flipper-error)
- iOS Architecture x86_64 error?
  - Add x86_64 from xcode framework-> target -> buildSetting -> valid architectures, please refer to [x86_64 error](https://blog.csdn.net/LY0314J/article/details/102918338)
- iOS cannot find main.js.bundle
  - First check whether the relevant content in config is filled in, then refer to [cannot find main.js.bundle](https://stackoverflow.com/questions/49505446/main-jsbundle-does-not-exist-this-must-be-a-bug-with-echo-react-native)
- After using `react-native-reanimated`, there is an error `Cannot assign to read-only property "validated"` or `Tried to synchronously call a non-worklet function on the UI thread` when introducing TUIKit
Modify the following content in the code
```js
    // TUIKit/Components/TUIMessage/element/message_tooltip.tsx
      import { runOnJS } from 'react-native-reanimated';
      //The original gesture function is changed to the following content
      const handleOnLongPress = (absoluteY: number, y: number) => {
        const halfHeight = componentPosition!.height
        if (Keyboard.isVisible()) {
          setTimeout(() => {
            setPositionY(
            absoluteY - y + halfHeight +
            (props.keyboardHeight ?? 0) - 25,
            )
            setOpen(true)
          }, 200)
        } else {
          setPositionY(absoluteY - y + halfHeight)
          setOpen(true)
        }
      }
      const gesture = Gesture.LongPress().onStart((event:
        { absoluteY: any; y: any }) => {
        const { absoluteY, y } = event
        runOnJS(handleOnLongPress)(absoluteY, y)
      })
      // The original closeTooltip is changed to the following
      const close = () => {
        setOpen(false);
      }
      const closeTooltip = Gesture.Tap().onStart(() => {
        runOnJS(close)()
      })
      // TUIKit/components/TUIChat/tui_chat.tsx
      // Modify the code of gesture function, and keep other functions unchanged
      const hidePanel = () => {
        driver?.hide(driverState);
      }
      const gesture = Gesture.Tap().onStart(() => {
        console.log("tap");
        runOnJS(hidepanel)()
      });
  ```