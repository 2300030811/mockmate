"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { User, RealtimeChannel } from "@supabase/supabase-js";
import { Profile } from "@/types";

const supabase = createClient();

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
  refresh: async () => {},
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
        setProfile(JSON.parse(cached));
      } catch (e) {
        console.error("Error parsing cached profile:", e);
      }
    }

    const { data } = await supabase
      .from("profiles")
      .select("id, nickname, avatar_icon, role, updated_at")
      .eq("id", userId)
      .single();
    
    if (data && typeof window !== 'undefined') {
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
      setProfile(data);
    }
    return data;
  };

  const pollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const pollAndSetProfile = async (userId: string) => {
    let attempts = 0;
    const maxAttempts = 10;
    
    // Clear any existing poll loop
    if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
    }

    const executePoll = async () => {
      try {
        const profileData = await fetchProfile(userId);
        if (profileData) {
          setProfile(profileData);
          return true;
        }
      } catch (err) {
        console.error("Polling profile error:", err);
      }
      
      if (attempts < maxAttempts) {
        attempts++;
        const delay = attempts < 3 ? 200 : 800;
        pollTimeoutRef.current = setTimeout(executePoll, delay);
      }
    };
    
    executePoll();
  };

  const refresh = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      pollAndSetProfile(user.id);
    } else {
      setProfile(null);
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

    // Check active sessions and sets the user
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        setupProfileSubscription(currentUser.id);
        
        // Try to load from cache immediately even before polling
        const cacheKey = `mockmate_profile_${currentUser.id}`;
        const cached = typeof window !== 'undefined' ? sessionStorage.getItem(cacheKey) : null;
        if (cached) {
          try {
            setProfile(JSON.parse(cached));
          } catch (e) {}
        }

        pollAndSetProfile(currentUser.id);
      }
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        setupProfileSubscription(currentUser.id);
        pollAndSetProfile(currentUser.id);
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
