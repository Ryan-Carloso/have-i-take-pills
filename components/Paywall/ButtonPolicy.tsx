import React from 'react';
import { Text,View,TouchableOpacity, Linking } from "react-native";
import { styles } from "./styles";


export default function ButtonPolicy() {
  return (
    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center',}} > 
    <TouchableOpacity
      style={styles.button}
      onPress={() =>
        Linking.openURL(
          "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
        ).catch((err) => console.error("Failed to open URL:", err))
      }
    >
      <Text style={styles.EulaText}>Apple EULA</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.button}
      onPress={() =>
        Linking.openURL(
          "https://www.privacypolicies.com/live/1e1a987d-bc0d-4591-b8e1-858a05bd2af8"
        ).catch((err) => console.error("Failed to open URL:", err))
      }
    >
      <Text style={styles.EulaText}>Privacy policy</Text>
    </TouchableOpacity>
    </View>  );
}