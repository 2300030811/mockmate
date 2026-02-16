import { useState, useEffect } from 'react';

interface DailyStreakState {
  streak: number;
  points: number;
  lastSolvedDate: string | null;
  history: string[]; // List of dates solved
}

export function useDailyStreak() {
  const [state, setState] = useState<DailyStreakState>({
    streak: 0,
    points: 0,
    lastSolvedDate: null,
    history: []
  });
  const [solvedToday, setSolvedToday] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('mockmate_daily_streak');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
        checkStreakValidity(parsed);
      } catch (e) {
        console.error("Failed to parse daily streak data", e);
      }
    } else {
       // Initialize if new
       setIsLoaded(true);
    }
  }, []);

  const checkStreakValidity = (currentState: DailyStreakState) => {
    const today = new Date().toDateString();
    const lastDate = currentState.lastSolvedDate ? new Date(currentState.lastSolvedDate).toDateString() : null;

    if (lastDate === today) {
        setSolvedToday(true);
        setIsLoaded(true);
        return;
    }

    if (lastDate) {
        const diff = new Date(today).getTime() - new Date(lastDate).getTime();
        const diffDays = diff / (1000 * 3600 * 24);

        if (diffDays > 1 && diffDays < 2) {
            // Consecutive day (roughly) - streak is fine, waiting for completion
        } else if (diffDays >= 2) {
            // Streak broken
            setState(prev => ({ ...prev, streak: 0 }));
        }
    }
    
    setSolvedToday(false);
    setIsLoaded(true);
  };

  const completeChallenge = (pointsEarned: number) => {
    if (solvedToday) return; // Recently solved

    const today = new Date().toDateString();
    
    setState(prev => {
        const newStreak = prev.streak + 1; // Simplistic increment. 
        // If streak was broken (checked in useEffect), it might need reset. 
        // But checkStreakValidity handles the reset on load.
        // If the user sat on the page for 2 days, we might have an issue, but acceptable for MVP.
        
        // Correct logic:
        // If lastSolvedDate was Yesterday, streak++.
        // If lastSolvedDate was Today, ignore (handled by guard).
        // If lastSolvedDate was older, streak = 1.
        
        let calculatedStreak = 1;
        if (prev.lastSolvedDate) {
             const lastDate = new Date(prev.lastSolvedDate);
             const now = new Date();
             // Reset hours to compare dates only
             lastDate.setHours(0,0,0,0);
             now.setHours(0,0,0,0);
             
             const diffTime = Math.abs(now.getTime() - lastDate.getTime());
             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
             
             if (diffDays === 1) {
                 calculatedStreak = prev.streak + 1;
             } else if (diffDays === 0) {
                 calculatedStreak = prev.streak; // Should not happen due to guard
             } else {
                 calculatedStreak = 1; // Broken
             }
        }

        const newState = {
            streak: calculatedStreak,
            points: prev.points + pointsEarned,
            lastSolvedDate: new Date().toISOString(),
            history: [...prev.history, new Date().toISOString()]
        };
        
        localStorage.setItem('mockmate_daily_streak', JSON.stringify(newState));
        return newState;
    });
    
    setSolvedToday(true);
  };

  return {
    streak: state.streak,
    points: state.points,
    solvedToday,
    completeChallenge,
    isLoaded
  };
}
