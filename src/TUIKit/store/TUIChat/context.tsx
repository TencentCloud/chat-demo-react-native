import React, {
  createContext,
  Dispatch,
  PropsWithChildren,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import type { V2TimMessage } from 'react-native-tim-js/lib/typescript/src/interface';
import type { TUIChatAction } from './actions';
import { initialState, TUIChatReducer, TUIChatReducerType } from './reducer';

export interface TUIChatState {
  messageList: V2TimMessage[];
  repliedMessage?: V2TimMessage;
}

interface IContext {
  state: TUIChatState;
  dispatch: Dispatch<TUIChatAction>;
}

const Context = createContext<IContext>({
  state: initialState,
  dispatch: () => {},
});

export const TUIChatContextProvider = <
  T extends { initialMesage?: V2TimMessage[] }
>(
  props: PropsWithChildren<T>
) => {
  const [state, dispatch] = useReducer<TUIChatReducerType>(TUIChatReducer, {
    ...initialState,
    messageList: props.initialMesage ?? initialState.messageList,
  });

  const value = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state, dispatch]
  );

  return <Context.Provider value={value}>{props.children}</Context.Provider>;
};

export const useTUIChatContext = () => {
  return useContext(Context);
};
