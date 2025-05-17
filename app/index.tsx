import "react-native-get-random-values";
import { Buffer } from "buffer";
import * as Crypto from 'expo-crypto';

import * as SplashScreen from 'expo-splash-screen';
import { Redirect } from "expo-router"
global.Buffer = Buffer;

SplashScreen.preventAutoHideAsync();

export default function Index() {
  return <Redirect href="/start" />
}
