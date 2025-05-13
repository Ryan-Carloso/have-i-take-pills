import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const handleRestore = async () => {
  try {
    // Get the subscription status from AsyncStorage
    const subscriptionStatus = await AsyncStorage.getItem('subscription_status');

    // Handle null value
    if (subscriptionStatus === null) {
      Alert.alert('No Purchase Found', 'There are no purchases to restore.');
      console.log('No subscription status found in AsyncStorage');
      return; //Exit early if no status is found.
    }

    if (subscriptionStatus === 'active') {
      Alert.alert('Restoration Successful', 'Your subscription is active!');
      console.log('Subscription restored: active');
    } else {
      Alert.alert('Expired or Invalid Subscription', 'Your subscription status is: ' + subscriptionStatus);
      console.log('Subscription status:', subscriptionStatus);
    }
  } catch (err) {
    console.error('Error restoring purchases:', err);
    Alert.alert('Restoration Failed', 'An error occurred while restoring your purchases. Details: ' + err.message); //More informative error message
  }
};

export default handleRestore;