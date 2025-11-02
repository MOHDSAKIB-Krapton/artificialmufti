import { LatLng } from "@/hooks/permissions/useLocation";
import { create } from "zustand";

type LocationState = {
  location: LatLng | null;
  permission: "loading" | "granted" | "denied";
  error: string | null;
  setLocation: (location: LatLng) => void;
  setPermission: (status: "loading" | "granted" | "denied") => void;
  setError: (error: string | null) => void;
};

export const useLocationStore = create<LocationState>((set) => ({
  location: null,
  permission: "loading",
  error: null,
  setLocation: (location) => set({ location }),
  setPermission: (permission) => set({ permission }),
  setError: (error) => set({ error }),
}));
