import React, { createContext, useContext } from 'react';

type AppContextType = {
  onLogout: () => void;
};

const AppContext = createContext<AppContextType>({ onLogout: () => {} });

export const AppProvider = AppContext.Provider;
export const useAppContext = () => useContext(AppContext);
