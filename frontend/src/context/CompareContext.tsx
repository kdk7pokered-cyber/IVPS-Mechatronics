import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MachineCardData } from '../types';
import { useToast } from './ToastContext';

interface CompareContextType {
  compareList: MachineCardData[];
  addToCompare: (machine: MachineCardData) => void;
  removeFromCompare: (id: number) => void;
  clearCompare: () => void;
  isCompared: (id: number) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [compareList, setCompareList] = useState<MachineCardData[]>([]);
  const { showToast } = useToast();

  const isCompared = (id: number) => compareList.some((m) => m.id === id);

  const addToCompare = (machine: MachineCardData) => {
    if (isCompared(machine.id)) {
      removeFromCompare(machine.id);
      return;
    }
    if (compareList.length >= 4) {
      showToast('You can compare up to 4 machines at a time', 'info');
      return;
    }
    setCompareList((prev) => [...prev, machine]);
    showToast(`Added ${machine.title.substring(0, 24)}... to comparison matrix`, 'success');
  };

  const removeFromCompare = (id: number) => {
    setCompareList((prev) => prev.filter((m) => m.id !== id));
    showToast('Machine removed from comparison', 'info');
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isCompared }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) throw new Error('useCompare must be used within a CompareProvider');
  return context;
};
