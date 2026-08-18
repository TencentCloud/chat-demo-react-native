# TuikitAtomicX Demo

Demo app for [`tuikit-atomicx-react-native`](https://www.npmjs.com/package/tuikit-atomicx-react-native) — the React Native bridge for Tencent Cloud's `atomicxcore` chat SDK. Try 9 chat states (contacts / conversation list / group / messages / search / …) end-to-end on iOS or Android.

## Screenshots

<p align="center">
  <img src="https://web.sdk.qcloud.com/im/assets/images/react_native_image.png" alt="Demo screenshot" />
</p>

## Before getting started

This section shows the prerequisites you need to check to use Chat UIKit for React-Native.

### Requirements
- React Native `>= 0.80`
- Node `>= 22`
- iOS `>= 16`
- Android `>= 24`

More details, please see https://reactnative.dev/docs/environment-setup

<br/>

## Install

```bash
npm install --legacy-peer-deps

# iOS — install pods
cd ios && pod install && cd ..
```

#### Secure SDKAppID and secretKey
Set the relevant parameters `SDKAppID` and `SECRETKEY` in the example code of the `debug/GenerateTestUserSig.js` file:
SDKAppID and SecretKey can be accessed by the [Chat Console](console.trtc.io/chat/detail):
![image](https://github.com/TencentCloud/chat-uikit-react/assets/57951148/09c7c16b-5ff8-4b2d-bb1b-b0bf72a754ed)

## Run

> **Before first login**, edit `src/screens/LoginScreen.tsx` and set your `SDKAppID` / `SecretKey`.

Two terminals:

```bash
# terminal 1 — Metro bundler
npm start

# terminal 2 — pick a platform
npm run ios      # iOS simulator
npm run android  # Android emulator / device
```

---
