import { useHotkeys, useLocalStorage } from 'bagon-hooks';
import { createContext, createEffect, createSignal, FlowComponent, on, useContext } from 'solid-js';
import { PanelGroupAPI } from 'solid-resizable-panels';

export type SideBarState = 'connections' | 'schema' | 'queryfiles';

// ===========================================================================
// Context
// ===========================================================================

export type AppContextValue = {
  sidebarFocus: () => SideBarState;
  setSidebarFocus: (state: SideBarState) => void;
  sidebarActive: () => boolean;
  setSidebarActive: (active: boolean) => void;
  setPanelGroupAPI: (api: PanelGroupAPI) => void;
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
  const [sidebarFocus, setSidebarFocus] = useLocalStorage<SideBarState>({
    key: 'snom-sql-sidebar-focus',
    defaultValue: 'connections',
  });

  const [sidebarActive, setSidebarActive] = useLocalStorage({
    key: 'snom-sql-sidebar-active',
    defaultValue: true,
  });

  const [panelGroupAPI, setPanelGroupAPI] = createSignal<PanelGroupAPI>();
  const [lastSize, setLastSize] = createSignal(32);

  useHotkeys(
    [
      ['meta+1', () => setSidebarFocus('connections')],
      ['meta+2', () => setSidebarFocus('schema')],
      ['meta+3', () => setSidebarFocus('queryfiles')],
      [
        'meta+b',
        () => {
          const api = panelGroupAPI();
          const layout = api?.getLayout();

          const sidebarCurrentSize = layout?.at(0) ?? 32;

          if (sidebarCurrentSize === 0)
            setSidebarActive(true); // Check if basically closed, cuz if it is, just always open!
          else setSidebarActive(!sidebarActive());

          if (sidebarActive()) {
            api?.expand('panel-1', lastSize() || 32);
          } else {
            setLastSize(layout?.at(0) ?? 32);
            api?.collapse('panel-1');
          }
        },
      ],
    ],
    []
  );

  // Effect when PanelGroupAPI is available.
  createEffect(
    on(panelGroupAPI, () => {
      const api = panelGroupAPI();
      if (sidebarActive()) api?.expand('panel-1', lastSize());
    })
  );

  // Honestly just repeated code, also the parameter doesn't work, but meh.
  function _setSideBarActive(active: boolean) {
    const api = panelGroupAPI();
    const layout = api?.getLayout();

    if (active) {
      setSidebarActive(true);
      api?.expand('panel-1', lastSize() || 32);
      return;
    } else {
      setSidebarActive(false);
      setLastSize(layout?.at(0) ?? 32);
      api?.collapse('panel-1');
    }
  }

  return (
    <AppContext.Provider
      value={{
        sidebarFocus,
        setSidebarFocus,
        sidebarActive,
        setSidebarActive: _setSideBarActive,
        setPanelGroupAPI,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};
