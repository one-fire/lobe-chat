import { useCallback } from 'react';

import { useChatStore } from '@/store/chat';
import { filesSelectors, useFileStore } from '@/store/file';

export const useSendMessage = () => {
  const [sendMessage, updateInputMessage] = useChatStore((s) => [
    s.sendMessage,
    s.updateInputMessage,
  ]);

  return useCallback((onlyAddUserMessage?: boolean) => {
    const store = useChatStore.getState();
    if (!!store.chatLoadingId) return;
    if (!store.inputMessage) return;

    const imageList = filesSelectors.imageUrlOrBase64List(useFileStore.getState());

    const auth = localStorage.getItem('auth');
    if (auth) {
      const headerAuth = auth.split(':')[0];
      fetch('https://xd.inpm.top/api/v1/ai/log/create', {
        body: JSON.stringify({
          use_model: 'gpt-35-turbo',
        }),
        headers: {
          'Authorized': headerAuth,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          console.log(data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    } else {
      alert('非法请求。该设备首次使用时，请通过软开云系统按钮进入！');
      return;
    }

    sendMessage({
      files: imageList,
      message: store.inputMessage,
      onlyAddUserMessage: onlyAddUserMessage,
    });

    updateInputMessage('');
    useFileStore.getState().clearImageList();
  }, []);
};
