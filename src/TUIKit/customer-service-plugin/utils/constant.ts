
// 在线客服自定义消息类型
export const CUSTOM_MESSAGE_SRC = {
  // 公众号
  OFFICIAL_ACCOUNT: '1',
  // 小程序
  MINI_APP: '2',
  // 小程序服务号
  MINI_APP_SERVICE_ACCOUNT: '3',
  // 后台内部
  BACKEND_INTERNAL: '4',
  // 网页
  WEB: '5',
  // 会话消息分割
  SESSION_MESSAGE_SLICE: '6',
  // 小程序自动触发
  MINI_APP_AUTO: '7',
  // 内部会话
  INTERNAL: '8',
  // 菜单消息
  MENU: '9',
  // 菜单选择
  MENU_SELECTED: '10',
  // 客户端在线状态
  CLIENT_STATE: '11',
  // 输入状态
  TYPING_STATE: '12',
  // 文本机器人
  ROBOT: '13',
  // 分支消息
  BRANCH: '15',

  MEMBER: '17',
  // 没有客服在线
  NO_SEAT_ONLINE: '18',
  // 会话结束
  END: '19',
  // 超时结束
  TIMEOUT: '20',
  // 表单输入
  FROM_INPUT: '21',
  // 卡片
  PRODUCT_CARD: '22',
  //
  SATISFACTION_CON: '23',
  //
  USER_SATISFACTION: '24',
  // 会话机器人状态
  ROBOT_STATUS: '25',
  // 会话人工状态
  SEAT_STATUS: '26',
  // 用户主动结束会话
  USER_END_SESSION: '27',
  // 订单消息
  ORDER_CARD: '28',
  // 机器人欢迎卡片
  WELCOME_CARD: '29',
  // 机器人富文本
  RICH_TEXT: '30',
  // 自定义透传消息
  EXTRA_DATA: '31',
};

// im message extra type
export const IM_MESSAGE_EXTRA_TYPE = {
  INFO: 'INFO',
  ROBERT_REPLAY_PLACEHOLDER: 'ROBOT_REPLAY_PLACEHOLDER',
};

// rating template type
export const RATING_TEMPLATE_TYPE = {
  STAR: 1,
  NUMBER: 2,
};

// rating state
export const RATING_STATE = {
  NONE: 1,
  IN_PROGRESS: 2,
  DONE: 3,
};

// rating send rule
export const RATING_SEND_RULE = {
  ALLOW_AUTO_SEND: 1,
  ALLOW_SERVICE_SEND: 2,
  ALLOW_CLIENT_SEND: 4,
};

// send rating error code
export const SEND_RATING_ERROR_CODE = {
  SESSION_EXPIRED_OR_NOT_START: 10150,
  ACCESS_DATA_ERROR: 10151,
  DUPLICATE_SUBMIT: 10152,
  INTERNAL_ERROR: 10153,
  NO_STAFF: 10154,
};
// clent state
export const CLIENT_STATE = {
  ONLINE: '1',
  OFFLINE: '2',
};

// IM message type
export const IM_TYPE = {
  WEB: 'web',
  H5: 'h5',
};

// IM message status
export const IM_STATUS = {
  SUCCESS: 'success',
  FAIL: 'fail',
  UN_SEND: 'unSend',
  READ: 'read',
};

// robot command
export const ROBOT_COMMAND = {
  UPDATE_BUBBLE: 'updateBubble',
  UPDATE_SEARCH_TIPS: 'updateSearchTips',
  SHOW_DIALOG: 'showDialog',
  FEEDBACK: 'feedback',
  SELECT_RECOMMEND: 'selectRecommend',
  SELECT_SEARCH_TIP: 'selectSearchTips',
  UPDATE_BOT_STATUS: 'updateBotStatus',
};

// robot message type
export const ROBOT_MESSAGE_TYPE = {
  SIMPLE_TEXT: 'simpleText',
  RICH_TEXT: 'richText',
  MULTI_LINE_TEXT: 'multiLineText',
  CANDIDATE_ANSWER: 'candidateAnswer',
  QUESTION_LIST: 'questionList',
};

// robot status
export const ROBOT_STATUS = {
  IN: 'inBot',
  LEAVE: 'leaveBot',
};

