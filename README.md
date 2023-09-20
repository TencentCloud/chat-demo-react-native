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

1. Fill in the prepared `SDKAppID, UserSig` into the `config.ts` file.
2. Execute the following command to run:

```
// yarn
yarn android
yarn ios

// npm
npm run android
npm run ios
```

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
