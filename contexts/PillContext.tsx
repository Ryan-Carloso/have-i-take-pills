import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cancelPillNotification } from '../utils/notificationUtils';

interface Pill {
  id: string;
  name: string;
  time: string;
  frequency: number;
  taken: boolean;
  notificationId?: string;
  lastTakenDate?: string; // Added lastTakenDate
}

interface PillContextType {
  pills: Pill[];
  addPill: (pill: Pill) => void;
  togglePillTaken: (id: string) => void;
  loadPills: () => Promise<void>;
  deletePill: (id: string) => void;
  updatePill: (updatedPill: Pill) => void; // Added updatePill
}

const PillContext = createContext<PillContextType | undefined>(undefined);

export const usePills = () => {
  const context = useContext(PillContext);
  if (context === undefined) {
    throw new Error('usePills must be used within a PillProvider');
  }
  return context;
};

export const PillProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pills, setPills] = useState<Pill[]>([]);

  useEffect(() => {
    loadPills();
  }, []);

  // Add a new effect to check and reset pills at midnight
  useEffect(() => {
    // Function to check if pills need to be reset
    const checkAndResetPills = () => {
      const now = new Date();
      const updatedPills = pills.map(pill => {
        // If pill was taken and the lastTakenDate exists
        if (pill.taken && pill.lastTakenDate) {
          const lastTakenDate = new Date(pill.lastTakenDate);
          const today = new Date();
          
          // Compare only the date parts (year, month, day)
          const lastTakenDay = new Date(
            lastTakenDate.getFullYear(),
            lastTakenDate.getMonth(),
            lastTakenDate.getDate()
          );
          
          const todayDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          );
          
          // If the last taken date is different from today, reset the pill
          // This will work when crossing midnight to a new day
          if (lastTakenDay.getTime() < todayDay.getTime()) {
            console.log(`Resetting pill ${pill.name} - last taken on ${lastTakenDate.toLocaleDateString()}`);
            return { 
              ...pill, 
              taken: false,
              // Keep the lastTakenDate for history purposes
              // This preserves the Supabase record while allowing new takes
            };
          }
        }
        return pill;
      });
      
      // Only update if there are changes
      if (JSON.stringify(updatedPills) !== JSON.stringify(pills)) {
        setPills(updatedPills);
        savePills(updatedPills);
        console.log('Pills reset for new day');
      }
    };

    // Check immediately when component mounts
    checkAndResetPills();
    
    // Set up interval to check every minute
    const intervalId = setInterval(checkAndResetPills, 60000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [pills]);

  const loadPills = async () => {
    try {
      const storedPills = await AsyncStorage.getItem('pills');
      if (storedPills) {
        setPills(JSON.parse(storedPills));
      }
    } catch (error) {
      console.error('Error loading pills:', error);
    }
  };

  const savePills = async (updatedPills: Pill[]) => {
    try {
      await AsyncStorage.setItem('pills', JSON.stringify(updatedPills));
    } catch (error) {
      console.error('Error saving pills:', error);
    }
  };

  const addPill = (newPill: Pill) => {
    const updatedPills = [...pills, newPill];
    setPills(updatedPills);
    savePills(updatedPills);
  };

  const togglePillTaken = (id: string) => {
    const now = new Date();
    const updatedPills = pills.map(pill =>
      pill.id === id ? { 
        ...pill, 
        taken: !pill.taken,
        // Update lastTakenDate when marking as taken, otherwise keep it null
        lastTakenDate: !pill.taken ? now.toISOString() : null
      } : pill
    );
    setPills(updatedPills);
    savePills(updatedPills);
  };

  const deletePill = async (id: string) => {
    const pillToDelete = pills.find(pill => pill.id === id);
    if (pillToDelete?.notificationId) {
      await cancelPillNotification(pillToDelete.notificationId);
    }

    const updatedPills = pills.filter(pill => pill.id !== id);
    setPills(updatedPills);
    savePills(updatedPills);
  };

  const updatePill = (updatedPill: Pill) => {
    const updatedPills = pills.map(pill =>
      pill.id === updatedPill.id ? updatedPill : pill
    );
    setPills(updatedPills);
    savePills(updatedPills);
  }; // Added updatePill function

  return (
    <PillContext.Provider value={{
      pills,
      addPill,
      togglePillTaken,
      loadPills,
      deletePill,
      updatePill // Added updatePill to the context
    }}>
      {children}
    </PillContext.Provider>
  );
};