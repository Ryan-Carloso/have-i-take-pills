import {StyleSheet, Dimensions} from 'react-native'
import { THEME } from "@/components/Theme";


  const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({

    EulaText: {
        color: THEME.primary,
        fontSize: 16,
        fontWeight: 'bold',
      },
      button: {
        paddingVertical: 12,        // Vertical padding
        paddingHorizontal: 20,      // Horizontal padding
        borderRadius: 8,           // Rounded corners
        alignItems: 'center',      // Center text
        marginVertical: 10,        // Space between buttons
      },

  });