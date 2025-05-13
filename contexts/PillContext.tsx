import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { cancelPillNotification } from '../utils/notificationUtils';

interface Pill {
  id: string;
  name: string;
  time: string;
  frequency: number;
  taken: boolean;
  notificationId?: string;
  lastTakenDate?: string;
}

interface PillContextType {
  pills: Pill[];
  addPill: (pill: Pill) => void;
  togglePillTaken: (id: string) => void;
  loadPills: () => Promise<void>;
  deletePill: (id: string) => void;
  updatePill: (updatedPill: Pill) => void;
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
  const pillsRef = useRef<Pill[]>([]);

  useEffect(() => {
    loadPills();
  }, []);

  useEffect(() => {
    pillsRef.current = pills;
  }, [pills]);

  useEffect(() => {
    const checkAndResetPills = () => {
      const currentPills = pillsRef.current;
      let needsUpdate = false;
      
      const updatedPills = currentPills.map(pill => {
        if (pill.taken && pill.lastTakenDate) {
          const lastTakenDate = new Date(pill.lastTakenDate);
          const today = new Date();
           
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
          
          if (lastTakenDay.getTime() < todayDay.getTime()) {
            console.log(`Resetando remédio ${pill.name} - último tomado em ${lastTakenDate.toLocaleDateString()}`);
            needsUpdate = true;
            return { 
              ...pill, 
              taken: false,
            };
          }
        }
        return pill;
      });
      
      if (needsUpdate) {
        setPills(updatedPills);
      }
    };

    checkAndResetPills();
    const intervalId = setInterval(checkAndResetPills, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  const loadPills = async () => {
    // Aqui você pode implementar a lógica para carregar do banco de dados
    // Por enquanto deixaremos vazio já que você implementará a lógica do banco
  };

  const addPill = (newPill: Pill) => {
    setPills(prev => [...prev, newPill]);
  };

  const togglePillTaken = (id: string) => {
    const now = new Date();
    setPills(prev => prev.map(pill =>
      pill.id === id ? { 
        ...pill, 
        taken: !pill.taken,
        lastTakenDate: !pill.taken ? now.toISOString() : null
      } : pill
    ));
  };

  const deletePill = async (id: string) => {
    const pillToDelete = pills.find(pill => pill.id === id);
    if (pillToDelete?.notificationId) {
      await cancelPillNotification(pillToDelete.notificationId);
    }
    setPills(prev => prev.filter(pill => pill.id !== id));
  };

  const updatePill = (updatedPill: Pill) => {
    setPills(prev => prev.map(pill =>
      pill.id === updatedPill.id ? updatedPill : pill
    ));
  };

  return (
    <PillContext.Provider value={{
      pills,
      addPill,
      togglePillTaken,
      loadPills,
      deletePill,
      updatePill
    }}>
      {children}
    </PillContext.Provider>
  );
};