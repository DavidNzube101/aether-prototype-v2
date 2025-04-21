import "react-native-get-random-values";
import { Buffer } from "buffer";
global.Buffer = Buffer;
import * as Crypto from 'expo-crypto';

import * as SplashScreen from 'expo-splash-screen';
import { Redirect } from "expo-router"

SplashScreen.preventAutoHideAsync();

export default function Index() {
  return <Redirect href="/start" />
}
