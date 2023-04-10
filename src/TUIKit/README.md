```.
├── README.md
├── components
│   ├── ImageView
│   │   ├── image-viewer.component.tsx
│   │   ├── image-viewer.style.tsx
│   │   ├── image-viewer.type.tsx
│   │   └── index.ts
│   ├── ImageZoom
│   │   ├── image-zoom.component.tsx
│   │   ├── image-zoom.style.tsx
│   │   ├── image-zoom.tsx
│   │   └── image-zoom.type.tsx
│   ├── MergeMessageScreen ---合并消息展示界面，用于点击合并消息，在新的页面中展示
│   │   └── merge_message_screen.tsx
│   ├── TUIChat
│   │   ├── driver --- 控制器，用于控制键盘、表情面板、工具面板的展示隐藏逻辑
│   │   │   ├── driver.ts
│   │   │   ├── keyboardDriver.ts
│   │   │   └── viewDriver.ts
│   │   ├── index.ts
│   │   └── tui_chat.tsx --- 聊天根组件
│   ├── TUIChatHeader
│   │   ├── index.ts
│   │   └── tui_chat_header.tsx
│   ├── TUIMessage
│   │   ├── element
│   │   │   ├── audio_element.tsx ---语音消息组件
│   │   │   ├── custom_element.tsx ---自定义消息组件
│   │   │   ├── face_element.tsx ---表情消息组件
│   │   │   ├── file_element.tsx ---文件消息组件
│   │   │   ├── group_tips_element.tsx ---群提示消息组件
│   │   │   ├── image_element.tsx ---图片消息组件
│   │   │   ├── index.ts
│   │   │   ├── location_element.tsx ---地理位置消息组件
│   │   │   ├── merger_element.tsx ---合并消息组件
│   │   │   ├── message_avatar.tsx ---消息头像组件
│   │   │   ├── message_bubble.tsx ---消息气泡组件
│   │   │   ├── message_colunmn.tsx ---消息列布局组件
│   │   │   ├── message_row.tsx ---消息行布局组件
│   │   │   ├── message_sending.tsx ---消息发送中组件
│   │   │   ├── message_tooltip.tsx ---长按消息提示
│   │   │   ├── reply_element.tsx ---回复消息组件
│   │   │   ├── revoke_element.tsx ---撤回消息组件
│   │   │   ├── text_element.tsx ---文本消息组件
│   │   │   ├── time_element.tsx ---时间消息组件
│   │   │   └── video_element.tsx ---视频消息组件
│   │   └── tui_message.tsx --- 消息组件、处理不同类型的消息渲染逻辑
│   ├── TUIMessageInput
│   │   ├── emoji_data.ts ---unicode 表情数据
│   │   ├── message_service.ts ---消息服务，发送各类型消息接口
│   │   ├── styles.ts
│   │   ├── tui_message_emoji.tsx ---表情面板
│   │   ├── tui_message_input.tsx ---输入框
│   │   ├── tui_message_tool_box.tsx ---工具面板
│   │   └── tui_message_voice_button.tsx ---语音发送
│   ├── TUIMessageList
│   │   ├── index.ts
│   │   └── tui_chat_message_list.tsx ---消息列表
│   ├── VideoScreen
│   │   └── video_screen.tsx ---视频播放页面
│   └── index.ts
├── constants
│   └── index.ts
├── hooks
│   ├── useLoginUser.ts ---获取登录用户
│   ├── useMessageList.ts ---获取历史消息
│   └── withMessageMemo.ts ---memo 组件
├── index.tsx
├── interface
│   ├── index.ts
│   └── tui_chat.ts
├── store
│   ├── TUIChat --- useReducer 和 useContext 组成的store
│   │   ├── actions.ts
│   │   ├── context.tsx
│   │   ├── index.ts
│   │   ├── reducer.ts
│   │   └── selector.ts
│   └── index.ts
├── theme
│   ├── index.ts
│   └── tui_chat_theme.ts
├── type
│   └── runes.d.ts
└── utils
├── audio_player.ts ---语音播放器
├── index.ts
├── message.ts ---消息工具函数
├── message_download.ts ---文本消息下载函数
└── time.ts ---消息时间解析工具函数
```

21 directories, 70 files
