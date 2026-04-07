// src/lib/api.js
export function fetchWithAuth(path, options = {}) {
  const token = localStorage.getItem('bp_token')
  const headers = {
    ...(options.headers || {}),
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'x-client': 'web',
  }
  return fetch(path, { ...options, headers })
}

export async function parseApiResponse(response) {
  const raw = await response.text();

  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw || null;
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}
