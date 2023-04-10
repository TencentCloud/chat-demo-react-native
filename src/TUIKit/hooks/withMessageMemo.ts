import React from 'react';

export const withMessageMemo = (component: any) => {
  return React.memo(component, (prev, next) => {
    return (
      prev.message.msgID === next.message.msgID &&
      prev.message.timestamp === next.message.timestamp &&
      prev.message.seq === next.message.seq &&
      prev.message.id === next.message.id
    );
  });
};
