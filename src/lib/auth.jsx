import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import { clearSession, storeToken, forceLogout } from "./session";
import { fetchWithAuth, parseApiResponse } from "./api";

const AuthContext = createContext(null);
let inFlightProfile = null;
let lastProfileSessionId = null;

const PROFILE_ENDPOINT = import.meta.env.VITE_PROFILE_ENDPOINT || "/api/me";

async function fetchProfile() {
  if (!PROFILE_ENDPOINT) return null;
  const res = await fetchWithAuth(PROFILE_ENDPOINT);
  const parsed = await parseApiResponse(res);
  const payload = parsed.data || {};
  if (!parsed.ok || payload?.ok === false) {
    const error = new Error(parsed.data?.msg || `HTTP ${parsed.status}`);
    error.status = parsed.status;
    throw error;
  }
  return payload;
}

function deriveRole(session, profile) {
  if (profile?.role) return profile.role;
  const appRole = session?.user?.app_metadata?.role;
  if (appRole) return appRole;
  const userRole = session?.user?.user_metadata?.role;
  if (userRole) return userRole;
  return null;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  const loadProfile = useCallback(async (sessionId) => {
    if (sessionId && lastProfileSessionId === sessionId && profile) {
      return profile;
    }
    if (inFlightProfile) return inFlightProfile;
    setProfileLoading(true);
    setProfileError("");
    inFlightProfile = (async () => {
      try {
        const data = await fetchProfile();
        setProfile(data);
        if (sessionId) lastProfileSessionId = sessionId;
        return data;
      } catch (err) {
        setProfile(null);
        const msg = err?.message ? String(err.message) : "No se pudo cargar el perfil.";
        setProfileError(msg);
        throw err;
      } finally {
        setProfileLoading(false);
        inFlightProfile = null;
      }
    })();
    return inFlightProfile;
  }, [profile]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!nextSession) {
        clearSession();
        setSession(null);
        setProfile(null);
        return;
      }

      storeToken(nextSession.access_token);
      setSession(nextSession);
      const sessionId = nextSession?.user?.id || nextSession?.user?.sub;
      await loadProfile(sessionId);
    });

    (async () => {
      try {
        const { data: initial } = await supabase.auth.getSession();
        if (!initial.session) {
          clearSession();
          setSession(null);
          setProfile(null);
        } else {
          storeToken(initial.session.access_token);
          setSession(initial.session);
          const sessionId = initial.session?.user?.id || initial.session?.user?.sub;
          await loadProfile(sessionId);
        }
      } finally {
        setReady(true);
      }
    })();

    return () => {
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const value = useMemo(() => {
    const role = deriveRole(session, profile);
    return {
      session,
      profile,
      role,
      ready,
      profileLoading,
      profileError,
      isAuthenticated: !!session,
      reloadProfile: loadProfile,
      logout: forceLogout,
    };
  }, [session, profile, ready, profileLoading, profileError, loadProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
