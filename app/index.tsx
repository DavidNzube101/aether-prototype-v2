import 'react-native-get-random-values';
if (typeof Buffer === 'undefined') global.Buffer = require('buffer').Buffer;

import { Redirect } from "expo-router"

export default function Index() {
  return <Redirect href="/onboarding" />
}
