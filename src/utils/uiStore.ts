import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface UiState {
  mobileCollectionScopeCollapsed: boolean;
}

interface UiActions {
  setMobileCollectionScopeCollapsed: (collapsed: boolean) => void;
}

type UiStore = UiState & UiActions;

export const uiStore = create<UiStore>()(
  persist(
    (set) => ({
      mobileCollectionScopeCollapsed: false,
      setMobileCollectionScopeCollapsed: (collapsed) =>
        set(() => ({ mobileCollectionScopeCollapsed: collapsed })),
    }),
    {
      name: 'typesense-ui-store',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
