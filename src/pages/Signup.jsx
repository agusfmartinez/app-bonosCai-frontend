// src/pages/Signup.jsx
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()
  const [otpSent, setOtpSent] = useState(false)

  async function sendCode() {
    const emailClean = email.trim().toLowerCase()
    if (!emailClean) {
      setMsg('Ingresá tu email.')
      return
    }
    setLoading(true); setMsg('')
    const { error } = await supabase.auth.signInWithOtp({
      email: emailClean,
      options: { shouldCreateUser: true }
    })
    setLoading(false)
    if (error) return setMsg(error.message)
    setMsg('Te enviamos un código al mail. Espera aprobación del administrador.')
    sessionStorage.setItem('pendingEmail', emailClean)
    sessionStorage.setItem('otpSent', '1')
    setOtpSent(true)
    navigate('/pending', { state: { email:emailClean, otpSent: true } })
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-red-900">
      <div className="bg-red-800 p-6 rounded-xl w-[360px]">
        <h2 className="text-xl font-bold text-white mb-4">Registrate</h2>


            <input
              type="email"
              placeholder="tu@email.com"
              className="w-full mb-3 p-2 rounded"
              value={email}
              onChange={e=>setEmail(e.target.value)}
            />
            <button
              disabled={loading}
              onClick={sendCode}
              className="w-full bg-sky-500 text-white py-2 rounded hover:bg-sky-400"
            >
              Enviar código
            </button>

            <p className="text-sm text-white mt-4 text-center">
              <Link to="/login" className="text-sky-300 hover:text-sky-200">
                Volver
              </Link>
            </p>


        
        {msg && <p className="text-sm text-white mt-3">{msg}</p>}
      </div>
    </div>
  )
}
