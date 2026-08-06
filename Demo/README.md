# tuikit-atomicx-react-native

Tuikit AtomicX Chat Store for React Native —— 腾讯云 atomicxcore SDK 的 RN 桥接层。

## 功能

- **9 个 chat state**（来自 uniapp atomic-x state_uniappx 1:1 转化）：
  - `useContactState` — 联系人/好友/好友申请
  - `useConversationGroupState` — 会话分组
  - `useConversationListState` — 会话列表
  - `useGroupState` — 群组
  - `useGroupMemberState` — 群成员
  - `useMessageActionState` — 消息操作
  - `useMessageInputState` — 消息输入
  - `useMessageListState` — 消息列表
  - `useSearchState` — 搜索
- **1 个 login state**：`useLoginState` / `loginStore`（基于 atomic-x/reactnative 已有实现）
- **桥接 API**：`callAPI` / `addListener` / `removeListener` / `onAtomicXEvent` / `reportUIPlatform`
- **工具函数**：`callNativeAPI`（含超时/重试）/ `validateRequired`

## 安装

```bash
npm install tuikit-atomicx-react-native
# 或
yarn add tuikit-atomicx-react-native
```

### iOS

```bash
cd ios && pod install
```

依赖会自动链接：
- `AtomicXCore`（来自 `atomic-x/ios/devops`）
- `TXIMSDK_Plus_iOS_XCFramework ~> 8.9`
- `SnapKit`

### Android

`MainApplication.kt` 中需要注册 `NativeAtomicXPackage`（autolink 通常会自动处理）：

```kotlin
import com.tuikitatomicx.nativex.NativeAtomicXPackage

override val reactHost: ReactHost by lazy {
  getDefaultReactHost(
    context = applicationContext,
    packageList = PackageList(this).packages.apply {
      add(NativeAtomicXPackage())
    },
  )
}
```

确保 `android/build.gradle` 配了 atomicxcore maven 仓库：

```gradle
allprojects {
  repositories {
    maven { url = uri("https://mirrors.tencent.com/nexus/repository/maven-public/") }
    maven { url = uri("https://repo1.maven.org/maven2/") }
    google()
    mavenCentral()
  }
}
```

## 使用

```tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useConversationListState } from 'tuikit-atomicx-react-native';

export default function ChatList() {
  const conversationList = useConversationListState('default');
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    if (!conversationList) return;

    // 拉取会话
    conversationList.loadConversationsWithCount(20);

    // 订阅会话变化
    const unsubscribe = conversationList.onConversationListChanged?.((list: any[]) => {
      setConversations(list);
    });

    return () => unsubscribe?.();
  }, [conversationList]);

  return (
    <FlatList
      data={conversations}
      keyExtractor={(item) => item.conversationID}
      renderItem={({ item }) => <Text>{item.showName}</Text>}
    />
  );
}
```

## 桥接 API 进阶

```ts
import { callAPI, addListener, removeListener } from 'tuikit-atomicx-react-native';

// 直接调 atomicxcore API
const response = await callAPI(JSON.stringify({
  api: 'getUserInfo',
  params: { userID: 'user_123' },
}));
const result = JSON.parse(response);
if (result.code === 0) {
  console.log(result.data);
}

// 订阅 store 变化
addListener('Contact', JSON.stringify({
  storeName: 'Contact',
  instanceId: 'default',
}));

// 清理
removeListener('Contact');
```

## 架构

```
src/
├── native/           # TurboModule 适配层
│   ├── NativeAtomicX.ts    # Codegen Spec
│   ├── HybridBridge.ts     # 业务封装（callAPI/addListener/...）
│   └── index.ts
├── bridge/           # 高级封装（loginStore 用）
│   └── HybridBridge.ts
├── store/            # 9 chat states + loginState
│   ├── contactStore/
│   ├── conversationListStore/
│   ├── ... (8 more)
│   ├── loginStore/
│   └── index.ts
├── types/            # 共享类型
│   ├── index.ts
│   ├── conversation.ts
│   ├── message.ts
│   └── ... (12 more)
├── utils/            # 业务工具
│   └── index.ts
└── index.ts          # 主入口
```

## License

MIT
