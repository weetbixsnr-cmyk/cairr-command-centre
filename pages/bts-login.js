import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function BtsLogin() {
  const router = useRouter()
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const res = await fetch('/api/bts-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, pass })
      })
      const data = await res.json()
      
      if (data.ok) {
        const from = router.query.from || '/bts-seo'
        router.push(from)
      } else {
        setError('Invalid credentials')
        setPass('')
      }
    } catch {
      setError('Login failed — try again')
    }
    setLoading(false)
  }

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>BTS SEO Dashboard — Login</title>
        <style>{`
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#08080a;color:#e0e0e0;min-height:100vh;display:flex;align-items:center;justify-content:center}
          .login-card{background:#0d0d10;border:1px solid #1a1a22;border-radius:16px;padding:40px 36px;width:min(400px,90vw);text-align:center}
          .logo{font-size:36px;margin-bottom:8px}
          h1{font-size:18px;color:#fff;margin-bottom:4px;font-weight:700}
          .subtitle{font-size:11px;color:#999;margin-bottom:28px}
          .field{margin-bottom:14px;text-align:left}
          .field label{display:block;font-size:9px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;font-weight:600}
          .field input{width:100%;padding:10px 12px;background:#111;border:1px solid #222;border-radius:8px;color:#fff;font-size:13px;outline:none;transition:border-color .2s}
          .field input:focus{border-color:#10b981}
          .field input::placeholder{color:#777}
          .btn{width:100%;padding:12px;background:#10b981;border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;margin-top:8px}
          .btn:hover{background:#0d9668}
          .btn:disabled{opacity:0.5;cursor:not-allowed}
          .error{color:#ef4444;font-size:11px;margin-top:10px;font-weight:600}
          .footer{font-size:8px;color:#222;margin-top:20px}
        `}</style>
      </Head>

      <div className="login-card">
        <div className="logo">🎓</div>
        <h1>Better Training Solutions</h1>
        <div className="subtitle">SEO Dashboard — Client Portal</div>
        
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Username</label>
            <input
              type="text"
              value={user}
              onChange={e => setUser(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        {error && <div className="error">{error}</div>}
        <div className="footer">Powered by CAIRR · cairr.ai</div>
      </div>
    </>
  )
}
