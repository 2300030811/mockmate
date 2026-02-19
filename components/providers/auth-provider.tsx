"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

const supabase = createClient();

interface AuthContextType {
  user: User | null;
  profile: any | null;
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
  const [profile, setProfile] = useState<any | null>(null);
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
      .select("*")
      .eq("id", userId)
      .single();
    
    if (data && typeof window !== 'undefined') {
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
      setProfile(data);
    }
    return data;
  };

  const refresh = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    let profileSubscription: any = null;

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
          const newData = payload.new;
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

        // Fast polling for profile creation (helps with race conditions from DB triggers)
        let attempts = 0;
        const maxAttempts = 10;
        const pollProfile = async () => {
          try {
            const profileData = await fetchProfile(currentUser.id);
            if (profileData) {
              setProfile(profileData);
              return true;
            }
          } catch (err) {
            console.error("Polling profile error:", err);
          }
          return false;
        };

        const executePoll = async () => {
          const found = await pollProfile();
          if (!found && attempts < maxAttempts) {
            attempts++;
            const delay = attempts < 3 ? 200 : 800; // Fast first 3 attempts, then slower
            setTimeout(executePoll, delay);
          }
        };

        executePoll();
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
        try {
          const profileData = await fetchProfile(currentUser.id);
          setProfile(profileData);
        } catch (error) {
          console.error("Error fetching profile in onAuthStateChange:", error);
        }
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
