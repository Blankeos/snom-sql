import { createContext, FlowComponent, useContext } from 'solid-js';

export type SideBarState = {};

// ===========================================================================
// Context
// ===========================================================================

export type AppContextValue = {
  // sidebarFocus: () => 'connections' | 'schema';
  // mainStuff: [];
};

const AppContext = createContext({} as AppContextValue);

// ===========================================================================
// Hook
// ===========================================================================
export const useAppContext = () => useContext(AppContext);

// ===========================================================================
// Provider
// ===========================================================================
export const AppContextProvider: FlowComponent = (props) => {
  return <AppContext.Provider value={{}}>{props.children}</AppContext.Provider>;
};
