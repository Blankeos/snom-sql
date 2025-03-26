import { createContext, createSignal, FlowComponent, useContext } from 'solid-js';

export type SideBarState = 'connections' | 'schema' | 'queryfiles';

// ===========================================================================
// Context
// ===========================================================================

export type AppContextValue = {
  sidebarFocus: () => SideBarState;
  setSidebarFocus: (state: SideBarState) => void;
  // mainStuff: [];
};

const AppContext = createContext({
  sidebarFocus: () => 'connections',
} as AppContextValue);

// ===========================================================================
// Hook
// ===========================================================================
export const useAppContext = () => useContext(AppContext);

// ===========================================================================
// Provider
// ===========================================================================
export const AppContextProvider: FlowComponent = (props) => {
  const [sidebarFocus, setSidebarFocus] = createSignal<SideBarState>('connections');

  return (
    <AppContext.Provider
      value={{
        sidebarFocus,
        setSidebarFocus,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};
