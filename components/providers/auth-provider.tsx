"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { User, RealtimeChannel } from "@supabase/supabase-js";
import { Profile } from "@/types";
import { getCurrentUser } from "@/app/actions/auth";

const supabase = createClient();

// Helper to add timeout to any promise, useful for blocked ISP networks
const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Request timed out')), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refresh: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    // Check session storage first for instant hydration
    const cacheKey = `mockmate_profile_${userId}`;
    const cached = typeof window !== 'undefined' ? sessionStorage.getItem(cacheKey) : null;

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setProfile(parsed);
      } catch (e) {
        console.error("Error parsing cached profile:", e);
      }
    }

    // Add a timeout to prevent hanging infinitely when blocked by ISPs
    const fetchPromise = supabase
      .from("profiles")
      .select("id, nickname, avatar_icon, role, updated_at")
      .eq("id", userId)
      .single();

    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Profile fetch timeout')), 5000);
    });

    try {
      const { data } = await Promise.race([fetchPromise, timeoutPromise]).finally(() => clearTimeout(timeoutId)) as any;
      if (data && typeof window !== 'undefined') {
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
        setProfile(data);
      }
      return data;
    } catch (err) {
      console.warn("Profile fetch error/timeout. Network might be blocked:", err);
      // Return cached data if available rather than null when offline
      if (cached) {
        try { return JSON.parse(cached); } catch (e) { return null; }
      }
      return null;
    }
  };

  const refresh = async () => {
    try {
      // Instead of relying on client-side Supabase network calls which fail in India,
      // we funnel everything through Server Actions (Vercel) to successfully proxy the request.
      const serverUser = await withTimeout(getCurrentUser(), 8000);

      if (serverUser) {
        setUser(serverUser as any); // Safely map to UI context
        const profileObj = {
          id: serverUser.id,
          nickname: serverUser.nickname,
          role: serverUser.role,
          avatar_icon: serverUser.avatar_icon
        };
        setProfile(profileObj as Profile);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`mockmate_profile_${serverUser.id}`, JSON.stringify(profileObj));
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (error: any) {
      if (error?.message !== 'Request timed out') {
        console.warn("Auth refresh via Server Action failed:", error);
      }
    }
  };

  useEffect(() => {
    let profileSubscription: RealtimeChannel | null = null;

    const setupProfileSubscription = (userId: string) => {
      if (profileSubscription) profileSubscription.unsubscribe();

      profileSubscription = supabase
        .channel(`profile:${userId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        }, (payload) => {
          const newData = payload.new as Profile;
          setProfile(newData);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(`mockmate_profile_${userId}`, JSON.stringify(newData));
          }
        })
        .subscribe();
    };

    const initializeAuth = async () => {
      // Step 1: Attempt offline/local cookie read for instant hydration
      try {
        const { data: { session } } = await withTimeout(supabase.auth.getSession(), 2000);
        const currentUser = session?.user;

        if (currentUser) {
          setUser(currentUser);
          const cached = typeof window !== 'undefined' ? sessionStorage.getItem(`mockmate_profile_${currentUser.id}`) : null;
          if (cached) {
            try { setProfile(JSON.parse(cached)); } catch (e) { }
          }
        }
      } catch (err) {
        console.warn("Local cookie check timed out - network might be blocking cookie refresh checks.", err);
      }

      // Step 2: Ensure valid user via Server Action (Bypasses Supabase direct client calls)
      try {
        const serverUser = await withTimeout(getCurrentUser(), 8000);
        if (serverUser) {
          setUser(serverUser as any);
          setupProfileSubscription(serverUser.id);
          const p = {
            id: serverUser.id,
            nickname: serverUser.nickname,
            role: serverUser.role,
            avatar_icon: serverUser.avatar_icon
          };
          setProfile(p as Profile);
          if (typeof window !== 'undefined') sessionStorage.setItem(`mockmate_profile_${serverUser.id}`, JSON.stringify(p));
        } else {
          // Sever returned no user
          setUser(null);
          setProfile(null);
        }
      } catch (err: any) {
        if (err?.message !== 'Request timed out') {
          console.warn("Server action auth verification failed", err);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        setupProfileSubscription(currentUser.id);
        refresh(); // use the new server action refresh to grab everything robustly
      } else {
        setProfile(null);
        // Clear all mockmate profile caches on logout
        if (typeof window !== 'undefined') {
          Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('mockmate_profile_')) {
              sessionStorage.removeItem(key);
            }
          });
        }
        if (profileSubscription) {
          profileSubscription.unsubscribe();
          profileSubscription = null;
        }
      }
      setLoading(false);
    });

    return () => {
      authSubscription.unsubscribe();
      if (profileSubscription) profileSubscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
