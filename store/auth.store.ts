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

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  initializing: true,

  init: async () => {
    // Bootstrap from Supabase
    const { data } = await supabase.auth.getSession();
    const session = data.session ?? null;
    set({ session, user: session?.user ?? null, initializing: false });

    // Subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      set({ session: sess ?? null, user: sess?.user ?? null });
    });

    // Optional: return unsubscribe function if you want to call it somewhere
    // (In app root, you can re-run init on app mount. Supabase handles refresh.)
  },

  setSession: (s) => set({ session: s, user: s?.user ?? null }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));
