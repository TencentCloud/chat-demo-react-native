const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * 关键：强制 react / react-native 单例（v10 修复）
 * tuikit-atomicx-react-native 自己 node_modules 里有 react（v10 之前装的），
 * 与 host app 的 react 是不同物理文件 → ReactCurrentDispatcher 上下文不共享
 * → LoginScreen 调 useState 时 dispatcher.current 是 null → "Cannot read property 'useState' of null"
 *
 * 用 extraNodeModules 强制把 `import 'react'` 解析到 host app 的 react，
 * 兜底：物理 symlink 软链包 node_modules/react → host react（v10 验证）
 *
 * v18.74 调整：新增 chat-uikit-react-native 外部包接入
 * - watchFolders 加上新包根目录（Metro 必须 watch 目标才能通过 symlink 读源码）
 * - nodeModulesPaths 加上新包 node_modules（peer 依赖解析：i18next/react-i18next/@react-native-async-storage 等）
 * - 新包自身 node_modules 也有 react/react-native，但被 extraNodeModules 强制走 host 单例
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const projectRoot = __dirname;
const tuikitAtomicxRoot = path.resolve(projectRoot, '../tuikit-atomicx-react-native');
const chatUikitRoot = path.resolve(projectRoot, '../chat-uikit-react-native');
const hostReactPath = path.resolve(projectRoot, 'node_modules/react');
const hostReactNativePath = path.resolve(projectRoot, 'node_modules/react-native');
const hostReactDomPath = path.resolve(projectRoot, 'node_modules/react-dom');

const config = {
  watchFolders: [tuikitAtomicxRoot, chatUikitRoot],
  resolver: {
    unstable_enableSymlinks: true,
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(tuikitAtomicxRoot, 'node_modules'),
      path.resolve(chatUikitRoot, 'node_modules'),
    ],
    // 强制 react / react-native 走 host app 的副本（v10 根治 React 多实例）
    extraNodeModules: {
      react: hostReactPath,
      'react-native': hostReactNativePath,
      'react-dom': hostReactDomPath,
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
