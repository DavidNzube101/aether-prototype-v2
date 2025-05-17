// services/connectivity.ts
import NetInfo from '@react-native-community/netinfo';

/**
 * Subscribe to changes in network state.
 * Returns an unsubscribe function.
 */
export function onConnectivityChange(
  handler: (isConnected: boolean) => void
) {
  const unsubscribe = NetInfo.addEventListener(state => {
    handler(!!state.isConnected);
  });
  return unsubscribe;
}

/**  Fetch current connectivity once. */
export async function checkInternet(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return !!state.isConnected;
}
