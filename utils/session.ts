import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = 'mockmate_session_id';
const NICKNAME_KEY = 'mockmate_nickname';

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server_session';
  
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function getStoredNickname(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(NICKNAME_KEY);
}

export function setStoredNickname(nickname: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NICKNAME_KEY, nickname);
}
