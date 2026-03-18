import { supabase } from "./supabase";

const TOKEN_KEY = 'bp_token'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || null
}

export function storeToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
}

export async function forceLogout() {
  clearSession();
  try {
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
}