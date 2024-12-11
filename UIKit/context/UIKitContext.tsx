import React, { PropsWithChildren, useContext, createContext } from 'react';
import type { Conversation } from '@tencentcloud/chat';

interface UIKitProviderProps {
  language?: string;
  theme?: string;
  colors?: Record<string, string>;
  customClasses?: string;
  activeConversation?: Conversation;
}

export const UIKitContext = createContext<UIKitProviderProps | undefined>(undefined);

export function UIKitProvider({ children, value }: PropsWithChildren<{
  value?: UIKitProviderProps;
}>) {
  return (
    <UIKitContext.Provider value={value}>
      {children}
    </UIKitContext.Provider>
  );
}

export const useUIKitContext = (componentName?: string) => {
  const uikitContext = useContext(UIKitContext);
  if (!uikitContext) {
    throw new Error(`${componentName} useUIKit must be used within a UIKitProvider`);
  }
  return uikitContext;
};
