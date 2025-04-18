import { useLocalStorage } from 'bagon-hooks';
import { createContext, FlowComponent, useContext, type Accessor, type Setter } from 'solid-js';

// ===========================================================================
// Context
// ===========================================================================

export type VimModeContextValue = {
  vimModeEnabled: Accessor<boolean>;
  setVimModeEnabled: Setter<boolean>;
  toggleVimMode: () => void;
};

const VimModeContext = createContext({
  vimModeEnabled: () => false,
  setVimModeEnabled: () => {},
  toggleVimMode: () => {},
} as VimModeContextValue);

// ===========================================================================
// Hook
// ===========================================================================
export const useVimModeContext = () => useContext(VimModeContext);

// ===========================================================================
// Provider
// ===========================================================================
export const VimModeContextProvider: FlowComponent = (props) => {
  const [vimModeEnabled, setVimModeEnabled] = useLocalStorage<boolean>({
    key: 'vimModeEnabled',
    defaultValue: true,
  });

  function toggleVimMode() {
    setVimModeEnabled(!vimModeEnabled());
  }

  return (
    <VimModeContext.Provider
      value={{
        vimModeEnabled,
        setVimModeEnabled,
        toggleVimMode,
      }}
    >
      {props.children}
    </VimModeContext.Provider>
  );
};
