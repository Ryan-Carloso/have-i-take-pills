import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Pill {
  id: string;
  name: string;
  time: string;
  frequency: number;
  taken: boolean;
}

interface PillContextType {
  pills: Pill[];
  addPill: (pill: Pill) => void;
  togglePillTaken: (id: string) => void;
  loadPills: () => Promise<void>;
  deletePill: (id: string) => void;
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

  const deletePill = (id: string) => {
    const updatedPills = pills.filter(pill => pill.id !== id);
    setPills(updatedPills);
    savePills(updatedPills);
  };

  return (
    <PillContext.Provider value={{ 
      pills, 
      addPill, 
      togglePillTaken, 
      loadPills,
      deletePill 
    }}>
      {children}
    </PillContext.Provider>
  );
};