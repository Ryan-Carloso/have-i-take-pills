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
    const updatedPills = pills.map(pill =>
      pill.id === id ? { ...pill, taken: !pill.taken } : pill
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