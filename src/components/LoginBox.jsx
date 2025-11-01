import React, { useState } from 'react'

const inputClass =
  'w-full rounded-lg border border-red-700 bg-red-950/60 px-3 py-2 text-sm text-white placeholder-red-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40'
const baseButtonClass =
  'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400'
const loginButtonClass =
  `${baseButtonClass} border border-red-700 text-white hover:border-sky-400 hover:text-sky-200 disabled:cursor-not-allowed disabled:opacity-50`

export default function LoginBox({
  isLogged,
  running,
  email,
  setEmail,
  password,
  setPassword,
  onLogin,
}) {
  const [showPass, setShowPass] = useState(false)

  const statusChipClass = `inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
    isLogged
      ? 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30'
      : 'bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/30'
  }`

  const canLogin = !running && email.trim() && password.trim()

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && canLogin) onLogin()
  }

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
      <label className="flex flex-col gap-2 text-sm font-medium text-white">
        <span className="text-xs uppercase tracking-wide text-white">Email</span>
        <input
          className={inputClass}
          type="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={running}
          autoComplete="email"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-white">
        <span className="text-xs uppercase tracking-wide text-white">Password</span>
        <div className="relative">
          <input
            className={`${inputClass} pr-10`}
            type={showPass ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={running}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-300 hover:text-slate-100"
            onClick={() => setShowPass((v) => !v)}
            tabIndex={-1}
          >
            {showPass ? 'Ocultar' : 'Ver'}
          </button>
        </div>
      </label>

      <div className="flex items-center gap-3">
        <button
          onClick={onLogin}
          disabled={!canLogin}
          className={loginButtonClass}
        >
          {isLogged ? 'Reiniciar login' : 'Iniciar login'}
        </button>
        <span className={statusChipClass}>
          <span className="block h-2 w-2 rounded-full bg-current" />
          {isLogged ? 'Sesión iniciada' : 'Sin sesión'}
        </span>
      </div>
    </div>
  )
}
