import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [networkState, setNetworkState] = useState<NetInfoState | null>(null);

  useEffect(() => {
    let isMounted = true;

    NetInfo.fetch().then((state) => {
      if (isMounted) {
        setNetworkState(state);
      }
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (isMounted) {
        setNetworkState(state);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return {
    isConnected: networkState?.isConnected ?? true,
    type: networkState?.type ?? 'unknown'
  };
}
