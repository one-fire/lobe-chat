'use client';

import { useRouter } from 'next/navigation';
import { memo, useEffect } from 'react';

import { messageService } from '@/services/message';
import { sessionService } from '@/services/session';
import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';

const checkHasConversation = async () => {
  const hasMessages = await messageService.hasMessages();
  const hasAgents = await sessionService.hasSessions();
  return hasMessages || hasAgents;
};

const Redirect = memo(() => {
  const router = useRouter();
  const [switchSession] = useSessionStore((s) => [s.switchSession]);

  // Auth
  const [password, setSettings] = useGlobalStore((s) => [
    settingsSelectors.currentSettings(s).password,
    s.setSettings,
  ]);

  useEffect(() => {
    checkHasConversation().then((hasData) => {
      //获取URL中的auth参数
      const url = new URL(window.location.href);
      const auth = url.searchParams.get('auth');

      if (!password && !auth) {
        alert('非法请求。该设备首次使用时，请通过软开云系统按钮进入。');
        return;
      }

      if (auth) {
        localStorage.setItem('auth', auth);

        // 解密
        let SecretPassword = auth.split(':')[1];
        let decryptedPassword = '';
        for (let i = 0; i < SecretPassword.length; i++) {
          decryptedPassword += String.fromCharCode(SecretPassword.charCodeAt(i) + 1);
        }
        console.log(decryptedPassword);
        if (
          !decryptedPassword ||
          decryptedPassword.length < 6 ||
          decryptedPassword.length > 20 ||
          !decryptedPassword.includes('s7mn')
        ) {
          alert('非法请求。');
          return;
        }

        const password = decryptedPassword;
        setSettings({ password });
      }

      if (hasData) {
        router.replace('/chat');

        switchSession();
      } else {
        router.replace('/welcome');
      }
    });
  }, []);

  return null;
});

export default Redirect;
