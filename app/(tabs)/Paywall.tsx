import React from "react";
import { withIAPContext } from "react-native-iap";
import Subscriptions from '../../components/Paywall/PaywallOnboard'

const WrappedSubscriptions = withIAPContext(Subscriptions);

export default function App() {
  return <WrappedSubscriptions />;
}