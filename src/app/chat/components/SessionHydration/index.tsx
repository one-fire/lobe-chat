'use client';

import { useResponsive } from 'antd-style';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { parseAsString } from 'nuqs/parsers';
import { memo, useEffect } from 'react';
import { createStoreUpdater } from 'zustand-utils';

import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';

// sync outside state to useSessionStore
const SessionHydration = memo(() => {
  const useStoreUpdater = createStoreUpdater(useSessionStore);

  const { mobile } = useResponsive();
  useStoreUpdater('isMobile', mobile);

  const router = useRouter();
  // TODO: 后续可以把 router 从 useSessionStore 移除
  useStoreUpdater('router', router);

  // two-way bindings the url and session store
  const [session, setSession] = useQueryState(
    'session',
    parseAsString.withDefault('inbox').withOptions({ history: 'replace', throttleMs: 500 }),
  );
  useStoreUpdater('activeId', session);

  // Auth
  const [password, setSettings] = useGlobalStore((s) => [
    settingsSelectors.currentSettings(s).password,
    s.setSettings,
  ]);

  useEffect(() => {
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

    const unsubscribe = useSessionStore.subscribe(
      (s) => s.activeId,
      (state) => setSession(state),
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return null;
});

export default SessionHydration;
