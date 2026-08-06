export const demoZhCN = {
  demo: {
    login: {
      title: 'Tuikit Chat',
      subtitle: '请使用腾讯云 IM 账号登录',
      sdkAppIdLabel: 'SDKAppID',
      userIdLabel: 'UserID',
      userIdPlaceholder: '请输入用户 ID',
      userIdEmpty: '请输入 UserID',
      loginButton: '登 录',
      switchingAccount: '切换账号失败',
      loginFailed: '登录失败',
      userSigFailed: '生成 UserSig 失败',
      unknownError: '未知错误',
      tip: '提示',
      help: '提示：UserSig 由 debug/GenerateTestUserSig.js 用 SDKAppID 对应的 SecretKey 自动生成（仅用于本地调试）',
    },
    tabBar: {
      message: '消息',
      relation: '通讯录',
    },
    language: {
      label: '语言',
      system: '跟随系统',
      zhCN: '简体中文',
      en: 'English',
      currentChanged: '已切换为 {{name}}',
    },
    screens: {
      conversationList: {
        title: '消息',
        searchEntryPlaceholder: '搜索',
        menu: {
          c2c: '发起单聊',
          createGroup: '创建群聊',
        },
      },
      contactList: {
        title: '通讯录',
        searchEntryPlaceholder: '搜索',
        menu: {
          addFriend: '添加好友',
          addGroup: '添加群聊',
        },
      },
      addFriend: {
        title: '添加好友',
      },
      addGroup: {
        title: '添加群聊',
        joinedAlready: '已加入该群组',
      },
      blackList: {
        title: '黑名单',
      },
      createGroup: {
        title: '创建群聊',
      },
      friendApplicationList: {
        title: '新的联系人',
      },
      groupApplicationList: {
        title: '群通知',
      },
      groupList: {
        title: '我的群聊',
      },
      groupManagement: {
        title: '群管理',
      },
      groupMemberList: {
        title: '群成员列表',
      },
      groupTypeInfo: {
        title: '群类型',
      },
      setRemark: {
        title: '修改备注',
      },
      userFilter: {
        title: '筛选用户',
      },
      applicationVerify: {
        title: {
          friend: '申请添加好友',
          group: '申请加入群聊',
        },
      },
      contactInfo: {
        title: {
          addFriend: '添加好友',
          newContact: '新的联系人',
          friend: '好友详情',
          default: '联系人详情',
        },
      },
      search: {
        placeholder: '搜索联系人、群聊、聊天记录',
      },
      searchInConversation: {
        placeholder: '搜索聊天记录',
      },
      userPicker: {
        title: {
          default: '选择联系人',
          selectGroupAtUser: '选择提醒的人',
        },
      },
      chatSetting: {
        title: {
          c2c: '设置',
          c2cProfile: '个人设置',
          group: '群设置',
        },
      },
      chat: {
        title: {
          default: '聊天',
          group: '群聊',
        },
        notInGroup: '您已不在群内，无法进行此操作',
        notInGroupTip: '提示',
      },
    },
  },
} as const
