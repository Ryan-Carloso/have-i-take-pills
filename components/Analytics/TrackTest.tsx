import axios from "axios";
import * as Application from 'expo-application'; // Importando para obter o nome do app
import { getUserId } from './UserID';


const appName = Application.applicationName; // Obtendo o nome do app
const appVersion = Application.nativeApplicationVersion; // Obtendo a versão do app

// Função para rastrear a visita e enviar ao servidor
export const trackTest = async (
  message: string,
  screen?: string,
  flow?: string | null,
  flowKey?: string | null
) => {
  try {
    const userId = await getUserId();
    await axios.post("https://track-test-api.vercel.app/api/tracktest", { 
      user_id: userId,
      message: message,
      AppName: `${appName} Version: ${appVersion}`,
      screen: screen || 'unknown_screen',
      flow: flow || 'no_flow',
      flowKey: flowKey || 'no_key'
    });

    console.log(`Mensagem enviada: ${message}`); 
  } catch (error) {
    console.error("Erro ao registrar visita:", error);
  }
};