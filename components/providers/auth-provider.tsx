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
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
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
          setProfile(payload.new);
        })
        .subscribe();
    };

    // Check active sessions and sets the user
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        setupProfileSubscription(currentUser.id);
        try {
          const profileData = await fetchProfile(currentUser.id);
          if (profileData) {
              setProfile(profileData);
          } else {
              // Retry once after a short delay if profile is missing (race condition helper)
              setTimeout(async () => {
                  const retryData = await fetchProfile(currentUser.id);
                  if (retryData) setProfile(retryData);
              }, 1500);
          }
        } catch (error) {
          console.error("Error fetching profile in getSession:", error);
        }
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
