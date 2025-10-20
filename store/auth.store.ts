import { supabase } from "@/utils/supabase";
import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";

type AuthState = {
  session: Session | null;
  user: User | null;
  initializing: boolean;

  init: () => Promise<void>;
  setSession: (s: Session | null) => void;
  signOut: () => Promise<void>;
};

let authListenerBound = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  initializing: true,

  init: async () => {
    const { data } = await supabase.auth.getSession();
    const session = data.session ?? null;
    set({ session, user: session?.user ?? null, initializing: false });

    if (!authListenerBound) {
      supabase.auth.onAuthStateChange((_event, s) => {
        set({ initializing: false, session: s ?? null, user: s?.user ?? null });
      });
      authListenerBound = true;
    }
  },

  setSession: (s) => set({ session: s, user: s?.user ?? null }),

  signOut: async () => {
    await supabase.auth.signOut();
  },
}));
