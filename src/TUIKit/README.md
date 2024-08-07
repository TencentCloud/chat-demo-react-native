.
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
│   ├── MergeMessageScreen -- page for showing merge message after mergeMessage is clicked
│   │   └── merge_message_screen.tsx
│   ├── TUIChat
│   │   ├── driver -- Controller, used to control the display and hiding logic of the keyboard, expression panel, and tool panel
│   │   │   ├── driver.ts
│   │   │   ├── keyboardDriver.ts
│   │   │   └── viewDriver.ts
│   │   ├── index.ts
│   │   ├── merge_message_receiver.tsx
│   │   └── tui_chat.tsx --- Chat root component, including the history message page & all functions of sending messages, you can jump directly to TUIChat from conversation
│   ├── TUIChatHeader --- Header in the chat page, showing the conversation id and the return button
│   │   ├── index.ts
│   │   └── tui_chat_header.tsx
│   ├── TUIConversation -- conversation list component
│   │   ├── index.ts
│   │   ├── tui_conversation_item.tsx
│   │   └── tui_conversation_list.tsx
│   ├── TUIFriend -- relationship list components, including friend list, friend application list, block list and group list 
│   │   ├── ApplicationList
│   │   │   └── tui_application_list.tsx
│   │   ├── BlockList
│   │   │   └── tui_block_list.tsx
│   │   ├── GroupList
│   │   │   └── tui_group_list.tsx
│   │   ├── tui_friend_item.tsx
│   │   ├── tui_friend_list.tsx
│   │   └── tui_search_friend.tsx
│   ├── TUIMessage -- message elements in message list
│   │   ├── element
│   │   │   ├── audio_element.tsx
│   │   │   ├── custom_element.tsx
│   │   │   ├── face_element.tsx
│   │   │   ├── file_element.tsx
│   │   │   ├── group_tips_element.tsx
│   │   │   ├── image_element.tsx
│   │   │   ├── index.ts
│   │   │   ├── location_element.tsx
│   │   │   ├── merger_element.tsx
│   │   │   ├── message_avatar.tsx
│   │   │   ├── message_bubble.tsx
│   │   │   ├── message_colunmn.tsx
│   │   │   ├── message_row.tsx
│   │   │   ├── message_sending.tsx
│   │   │   ├── message_tooltip.tsx
│   │   │   ├── reply_element.tsx
│   │   │   ├── revoke_element.tsx
│   │   │   ├── text_element.tsx
│   │   │   ├── time_element.tsx
│   │   │   └── video_element.tsx
│   │   └── tui_message.tsx
│   ├── TUIMessageInput 
│   │   ├── emoji_data.ts
│   │   ├── message_service.ts
│   │   ├── styles.ts
│   │   ├── tui_message_at_list.tsx
│   │   ├── tui_message_emoji.tsx
│   │   ├── tui_message_input.tsx
│   │   ├── tui_message_tool_box.tsx
│   │   ├── tui_message_voice_button.tsx
│   │   └── utils.ts
│   ├── TUIMessageList
│   │   ├── index.ts
│   │   └── tui_chat_message_list.tsx
│   ├── VideoScreen
│   │   └── video_screen.tsx
│   └── index.ts
├── constants
│   └── index.ts
├── hooks
│   ├── useLoginUser.ts
│   ├── useMessageList.ts
│   └── withMessageMemo.ts
├── index.tsx
├── interface
│   ├── index.ts
│   └── tui_chat.ts
├── store
│   ├── TUIChat
│   │   ├── actions.ts
│   │   ├── context.tsx
│   │   ├── index.ts
│   │   ├── reducer.ts
│   │   └── selector.ts
│   ├── TUIConversation
│   └── index.ts
├── theme
│   ├── index.ts
│   └── tui_chat_theme.ts
├── type
│   └── runes.d.ts
└── utils
    ├── audio_player.ts
    ├── index.ts
    ├── message.ts
    ├── message_download.ts
    └── time.ts

27 directories, 82 files
