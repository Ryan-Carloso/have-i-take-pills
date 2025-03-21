import AsyncStorage from '@react-native-async-storage/async-storage';

export const getUserId = async () => {
    let userId = await AsyncStorage.getItem("user_id");
  
    if (!userId) {
      const timestamp = Date.now();
      const randomValue = Math.random().toString(36).substring(2, 15);
      userId = `${timestamp}-${randomValue}`;
  
      await AsyncStorage.setItem("user_id", userId);
    }
  
    return userId;
  };
  