本项目为 React Native Chat Demo, 它是由`react-native-tim-js`及社区相关的开源包开发的 Demo 项目, 可帮助您快速开发一个即时通信聊天场景应用。

## 快速跑通 Demo

### 环境搭建

参考 React Naitve [官方文档](https://reactnative.dev/docs/environment-setup)搭建本地开发环境。

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

1: 请参考[官方文档](https://cloud.tencent.com/document/product/269/77272)准备`SDKAppID, UserSig`, 您必须拥有正确的 SDKAppID，才能进行初始化。
2: 将准备好的`SDKAppID, UserSig`填入到`config.ts`文件中
3: 执行如下命令运行:

```
// yarn
yarn android
yarn ios
// npm
npm run android
npm run ios
```

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
