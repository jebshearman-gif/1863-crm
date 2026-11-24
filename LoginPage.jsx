import { useState } from 'react'
import { supabase } from './supabase.js'

/* ── Design C: Split panel login ─────────────────────────────────────────── */

const T = {
  bg:      '#040c14',
  panel:   '#0a1a24',
  left:    '#054760',
  border:  '#143044',
  gold:    '#f58c30',
  text:    '#e8edf0',
  muted:   '#4a6475',
  red:     '#f87171',
  redDim:  'rgba(248,113,113,0.1)',
}

/* Real vector paths extracted from the official 1863 brand PDF */
function LogoMark({ size = 80 }) {
  const w = size * (109.402 / 113.466)
  return (
    <svg width={w} height={size} viewBox="0 0 109.402 113.466"
      xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="lg-login" gradientUnits="userSpaceOnUse"
          x1="0" y1="0" x2="109.402" y2="113.466">
          <stop offset="0%"   stopColor="#8BE4FA" />
          <stop offset="45%"  stopColor="#52AAEC" />
          <stop offset="100%" stopColor="#1844B8" />
        </linearGradient>
      </defs>
      <path d="M34.528 44.411C32.502 44.411 30.517 44.586 28.586 44.921L46.756 11.812L32.380 11.812L4.786 61.391C4.570 61.755 4.362 62.123 4.160 62.496C1.507 67.385 0.000 72.986 0.000 78.939C0.000 98.008 15.459 113.466 34.528 113.466C35.341 113.466 36.147 113.437 36.945 113.382L45.129 98.705C41.972 100.402 38.363 101.365 34.528 101.365C22.142 101.365 12.102 91.324 12.102 78.939C12.102 66.553 22.142 56.512 34.528 56.512C46.455 56.512 56.207 65.823 56.913 77.573L65.104 62.884C59.325 51.901 47.801 44.411 34.528 44.411" fill="url(#lg-login)" />
      <path d="M104.845 49.398C101.816 43.907 97.681 39.408 92.552 36.023C89.890 34.283 86.870 32.826 83.577 31.692L82.505 31.323L96.819 0.000L55.559 0.000L49.886 11.758L77.129 11.758L69.451 29.226L68.015 32.416L62.897 43.966L64.332 43.526C66.778 42.776 69.252 42.395 71.684 42.395C75.088 42.395 78.376 43.063 81.457 44.380C84.531 45.699 87.231 47.504 89.480 49.746C91.735 51.996 93.545 54.686 94.860 57.743C96.180 60.813 96.850 64.091 96.850 67.486C96.850 70.990 96.179 74.296 94.858 77.314C93.540 80.323 91.728 82.961 89.472 85.154C87.217 87.344 84.521 89.118 81.457 90.426C78.378 91.741 75.089 92.408 71.684 92.408C66.745 92.408 62.126 91.072 57.952 88.436L57.934 88.424C55.625 86.885 53.593 84.992 51.895 82.798C50.191 80.603 48.881 78.150 48.002 75.511L47.992 75.478C47.790 74.805 47.644 74.081 47.560 73.326L47.492 72.717L34.265 72.717L34.400 73.516C35.279 78.715 37.135 83.531 39.915 87.828C43.046 92.670 47.079 96.649 51.905 99.656C57.951 103.386 64.606 105.278 71.684 105.278C76.919 105.278 81.885 104.290 86.445 102.343C91.012 100.394 95.044 97.689 98.429 94.304C101.811 90.922 104.516 86.890 106.467 82.321C108.414 77.759 109.402 72.793 109.402 67.560C109.402 60.996 107.869 54.885 104.845 49.398" fill="url(#lg-login)" />
    </svg>
  )
}

const inpBase = {
  width: '100%',
  background: 'rgba(4,12,20,0.8)',
  border: `1px solid ${T.border}`,
  borderRadius: '3px',
  padding: '11px 13px',
  color: T.text,
  fontSize: '13px',
  outline: 'none',
  fontFamily: "'DM Sans', sans-serif",
  marginBottom: '10px',
  transition: 'border-color 0.15s',
}

export default function LoginPage() {
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)
  const [mode,       setMode]       = useState('login')   // 'login' | 'reset'
  const [resetSent,  setResetSent]  = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset`,
    })
    if (error) setError(error.message)
    else setResetSent(true)
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@900&family=Barlow+Condensed:wght@300&family=Inter:wght@300;400;500;600&family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:${T.bg};}
        ::placeholder{color:#2a3f52;}
        .lp-left::before{
          content:'';position:absolute;inset:0;
          background:radial-gradient(ellipse at 30% 60%,rgba(82,170,236,0.08) 0%,transparent 65%);
          pointer-events:none;
        }
        .lp-left::after{
          content:'';position:absolute;bottom:-80px;right:-80px;
          width:300px;height:300px;border-radius:50%;
          background:radial-gradient(circle,rgba(245,140,48,0.04) 0%,transparent 70%);
          pointer-events:none;
        }
        .lp-inp:focus{border-color:${T.gold}!important;}
        .lp-btn{transition:opacity 0.15s;}
        .lp-btn:hover:not(:disabled){opacity:0.88;}
      `}</style>

      <div style={{
        minHeight:'100vh', display:'flex',
        background: T.bg, fontFamily:"'DM Sans',sans-serif",
      }}>
        {/* ── Left branding panel ───────────────────────────────────────── */}
        <div className="lp-left" style={{
          flex:1,
          background:`linear-gradient(155deg,${T.left} 0%,#092030 55%,${T.bg} 100%)`,
          display:'flex', flexDirection:'column',
          justifyContent:'center', alignItems:'flex-start',
          padding:'60px 56px', position:'relative', overflow:'hidden',
        }}>
          {/* Logo wordmark */}
          <div style={{marginBottom:'52px'}}>
            <div style={{
              fontFamily:"'Barlow',sans-serif", fontWeight:900,
              fontSize:'13px', letterSpacing:'0.22em',
              color: T.text, textTransform:'uppercase', marginBottom:'7px',
            }}>EIGHTEEN</div>
            <LogoMark size={88} />
            <div style={{
              fontFamily:"'Barlow Condensed',sans-serif", fontWeight:300,
              fontSize:'10px', letterSpacing:'0.28em',
              color: T.muted, textTransform:'uppercase', marginTop:'8px',
            }}>sports &amp; entertainment</div>
          </div>

          {/* Tagline */}
          <div style={{maxWidth:'340px'}}>
            <div style={{
              fontFamily:"'Barlow',sans-serif", fontWeight:900,
              fontSize:'28px', lineHeight:1.15,
              color: T.text, letterSpacing:'-0.01em',
              marginBottom:'14px',
            }}>Intelligence<br/>Platform</div>
            <div style={{
              fontSize:'13px', color: T.muted,
              lineHeight:1.7, fontWeight:300,
            }}>
              Real-time player intelligence, club matching and scouting analytics — built for the modern football agency.
            </div>
          </div>

          {/* Decorative accent line */}
          <div style={{
            position:'absolute', top:'50%', right:0,
            width:'1px', height:'40%', transform:'translateY(-50%)',
            background:`linear-gradient(to bottom,transparent,${T.border},transparent)`,
          }}/>
        </div>

        {/* ── Right form panel ──────────────────────────────────────────── */}
        <div style={{
          width:'400px', flexShrink:0,
          background: T.panel,
          display:'flex', flexDirection:'column',
          justifyContent:'center', padding:'56px 48px',
          borderLeft:`1px solid ${T.border}`,
        }}>
          {/* Small logo in corner */}
          <div style={{marginBottom:'40px'}}>
            <div style={{
              fontFamily:"'Space Mono',monospace",
              fontSize:'8px', letterSpacing:'0.18em',
              color: T.muted, textTransform:'uppercase',
              marginBottom:'4px',
            }}>1863 Sports &amp; Entertainment</div>
            <div style={{height:'1px',background:T.border}}/>
          </div>

          <div style={{
            fontFamily:"'Barlow',sans-serif", fontWeight:900,
            fontSize:'22px', color: T.text, letterSpacing:'-0.01em',
            marginBottom:'4px',
          }}>
            {mode === 'login' ? 'Sign in' : 'Reset password'}
          </div>
          <div style={{
            fontSize:'12px', color: T.muted, marginBottom:'28px',
            lineHeight:1.6,
          }}>
            {mode === 'login'
              ? 'Access the 1863 player database'
              : 'Enter your email to receive a reset link'}
          </div>

          {error && (
            <div style={{
              background: T.redDim, border:`1px solid ${T.red}`,
              borderRadius:'3px', padding:'10px 12px',
              marginBottom:'16px', fontSize:'12px', color: T.red,
            }}>
              {error}
            </div>
          )}

          {resetSent ? (
            <div style={{textAlign:'center',padding:'16px 0'}}>
              <div style={{fontSize:'28px',marginBottom:'12px'}}>✉</div>
              <div style={{fontSize:'14px',color:T.text,marginBottom:'8px',fontWeight:500}}>Reset link sent</div>
              <div style={{fontSize:'12px',color:T.muted}}>Check your email for a password reset link</div>
              <button onClick={() => { setMode('login'); setResetSent(false) }}
                style={{marginTop:'20px',background:'none',border:'none',color:T.gold,
                  cursor:'pointer',fontSize:'12px',fontFamily:'inherit'}}>
                ← Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={mode === 'login' ? handleLogin : handleReset}>
              <div style={{fontSize:'9px',color:T.muted,letterSpacing:'0.12em',
                marginBottom:'6px',fontFamily:"'Space Mono',monospace"}}>EMAIL</div>
              <input
                className="lp-inp"
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="your@email.com"
                style={inpBase}
              />

              {mode === 'login' && (
                <>
                  <div style={{fontSize:'9px',color:T.muted,letterSpacing:'0.12em',
                    marginBottom:'6px',fontFamily:"'Space Mono',monospace"}}>PASSWORD</div>
                  <input
                    className="lp-inp"
                    type="password" value={password} onChange={e => setPassword(e.target.value)}
                    required placeholder="••••••••"
                    style={inpBase}
                  />
                </>
              )}

              <button type="submit" disabled={loading} className="lp-btn"
                style={{
                  width:'100%', background: T.gold,
                  border:'none', borderRadius:'3px',
                  padding:'12px', marginTop:'8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily:"'Space Mono',monospace",
                  fontSize:'10px', fontWeight:700,
                  color:'#0a0a0a', letterSpacing:'0.12em',
                  opacity: loading ? 0.6 : 1,
                }}>
                {loading ? 'PLEASE WAIT…' : mode === 'login' ? 'SIGN IN' : 'SEND RESET LINK'}
              </button>

              <div style={{textAlign:'center',marginTop:'16px'}}>
                <button type="button"
                  onClick={() => { setMode(mode === 'login' ? 'reset' : 'login'); setError(null) }}
                  style={{background:'none',border:'none',color:T.muted,
                    cursor:'pointer',fontSize:'11px',fontFamily:'inherit'}}>
                  {mode === 'login' ? 'Forgot password?' : '← Back to sign in'}
                </button>
              </div>
            </form>
          )}

          <div style={{
            marginTop:'auto', paddingTop:'40px',
            fontFamily:"'Space Mono',monospace",
            fontSize:'8px', color:'#1e3a4a',
            textAlign:'center', letterSpacing:'0.1em',
          }}>
            STRICTLY PRIVATE &amp; CONFIDENTIAL
          </div>
        </div>
      </div>
    </>
  )
}
