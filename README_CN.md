[简体中文](./README_CN.md) ｜ [English](./README.md)

本项目为 React Native Chat Demo, 它是由`react-native-tim-js`及社区相关的开源包开发的 Demo 项目, 可帮助您快速开发一个即时通信聊天场景应用。

## 快速跑通 Demo

### 环境搭建

参考 React Naitve [官方文档](https://reactnative.dev/docs/environment-setup)搭建本地开发环境。
本UIKit demo提供的 React Native版本为 0.73.9，最低可支持 React Native 版本 0.68.3。

### 依赖安装

1: 在项目根目录下执行如下代码,安装项目所需依赖项:

```
// yarn
yarn
// npm
npm install
// ios
cd ios
pod install
```

### 跑通运行

1: 请参考[官方文档](https://cloud.tencent.com/document/product/269/77272)准备`SDKAppID, secret`, 您必须拥有正确的 SDKAppID，才能进行初始化。
2: 将准备好的`SDKAppID, Secret`填入到`config.ts`文件中 （在开始页面填入存在的userID会自动计算userSig）
3: 执行如下命令运行:

```
// yarn
yarn android
yarn ios
// npm
npm run android
npm run ios
```

### 代码目录
代码目录结构相见 `src/TUIKit/README.md`

### 常见问题

- 如何移植到现有项目中?
  `src/TUIKit`中为`TUIChat`等相关组件，可以直接复制到您的项目中,同时您还需要安装对应的依赖即可, 对应的依赖查看`package.json`文件。
- 在 expo 项目中如何使用?
  在`expo`中，如果您使用到的 package 包含 Native 代码，需要您使用`development build`, 具体信息可查看其[官方文档](https://docs.expo.dev/home/develop/development-builds/introduction/).
- Android 项目报错 Task :react-native-create-thumbnail:compileDebugJavaWithJavac FAILED 怎么解决?
  请参考 https://github.com/souvik-ghosh/react-native-create-thumbnail/issues/87#issuecomment-1421105553
- 出现应用闪退, 什么问题?
  请检查权限是否申请。
- 点击拍照无反应？
  要是用拍照功能，请用真机调试。
- npm run ios 失败？
  - ios 最好在xcode里面跑，若依赖中有RCT-Folly hash 报错，请从xcode点击该文件，按照提示修改报错后运行
- ios Flipper包 报错？
  - 请参考 [Flipper error](https://stackoverflow.com/questions/78244457/reactnative-app-build-failing-with-flipper-error)
- ios Architecture x86_64 报错？
  - 从xcode framework-> target -> buildSetting -> valid architectures 添加 x86_64， 请参考 [x86_64 error](https://blog.csdn.net/LY0314J/article/details/102918338)
- ios 找不到 main.js.bundle
  - 首先检查config里面相关内容是否填写，之后请参考 [cannot find main.js.bundle](https://stackoverflow.com/questions/49505446/main-jsbundle-does-not-exist-this-must-be-a-bug-with-echo-react-native)
- 使用 `react-native-reanimated` 后引入TUIKit存在报错 `Cannot assign to read-only property "validated"` 或 `Tried to synchronously call a non-worklet function on the UI thread`
  在代码中修改以下内容
  ```js
    // TUIKit/Components/TUIMessage/element/message_tooltip.tsx
      import { runOnJS } from 'react-native-reanimated';
      //原来的 gesture 函数改为一下内容
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
      // 原来的 closeTooltip 改为以下内容
      const close = () => {
        setOpen(false);
      }
      const closeTooltip = Gesture.Tap().onStart(() => {
        runOnJS(close)()
      })
      // TUIKit/components/TUIChat/tui_chat.tsx
      // 修改 gesture 函数的代码，其他不变
      const hidePanel = () => {
        driver?.hide(driverState);
      }
      const gesture = Gesture.Tap().onStart(() => {
        console.log("tap");
        runOnJS(hidepanel)()
      });
  ```
