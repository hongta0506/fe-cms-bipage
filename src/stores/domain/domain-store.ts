import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DomainStore {
  selectedDomainId: number | null;
  setSelectedDomainId: (id: number | null) => void;
}

export const useDomainStore = create<DomainStore>()(
  persist(
    (set) => ({
      selectedDomainId: null,
      setSelectedDomainId: (id) => set({ selectedDomainId: id }),
    }),
    { name: "bipage-domain" },
  ),
);
