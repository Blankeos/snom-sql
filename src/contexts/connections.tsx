import { useHotkeys } from 'bagon-hooks';
import {
  createContext,
  createSignal,
  FlowComponent,
  Setter,
  useContext,
  type Accessor,
} from 'solid-js';

// ===========================================================================
// Context
// ===========================================================================

export type ConnectionsContextValue = {
  selectedId: Accessor<number | null>;
  setSelectedId: Setter<number | null>;
};

const ConnectionsContext = createContext({
  selectedId: () => null,
  setSelectedId: () => {},
} as ConnectionsContextValue);

// ===========================================================================
// Hook
// ===========================================================================
export const useConnectionsContext = () => useContext(ConnectionsContext);

// ===========================================================================
// Provider
// ===========================================================================
export const ConnectionsContextProvider: FlowComponent = (props) => {
  const [selectedId, setSelectedId] = createSignal<number | null>(null);

  useHotkeys([
    [
      'meta+w',
      () => {
        setSelectedId(null);
      },
    ],
  ]);

  return (
    <ConnectionsContext.Provider
      value={{
        selectedId,
        setSelectedId,
      }}
    >
      {props.children}
    </ConnectionsContext.Provider>
  );
};
