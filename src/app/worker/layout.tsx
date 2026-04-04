'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-browser'
import { LayoutDashboard, FileText, ShieldCheck, User, LogOut, Bell, IndianRupee, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user: authUser } = useAuth()
  const [checking, setChecking] = useState(true)
  const [firstName, setFirstName] = useState<string>('Partner')
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return; }
      const profile = await supabase.from('worker_profiles').select('full_name').eq('id', user.id).single()
      if (profile.data?.full_name) setFirstName(profile.data.full_name.split(' ')[0])
      setChecking(false)
    }
    check()
  }, [router])

  const handleSignout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (checking) return (
    <div className="wl-checking">
      <div className="wl-check-spinner" />
      <style>{layoutStyle}</style>
    </div>
  )

  const navItems = [
    { name: 'Dashboard',     path: '/worker/dashboard',     icon: LayoutDashboard },
    { name: 'My Claims',     path: '/worker/my-claims',     icon: FileText },
    { name: 'My Policies',   path: '/worker/my-policy',     icon: ShieldCheck },
    { name: 'Weekly Payout', path: '/worker/weekly-payout', icon: IndianRupee },
    { name: 'Profile',       path: '/worker/profile',       icon: User },
  ]

  return (
    <div className="wl-page">
      <style>{layoutStyle}</style>

      {/* Sidebar */}
      <aside className={`wl-sidebar ${isExpanded ? 'wl-sidebar--expanded' : 'wl-sidebar--collapsed'}`}>
        {/* Logo */}
        <div className={`wl-logo ${isExpanded ? '' : 'wl-logo--collapsed'}`}>
          <div className="wl-logo-mark">G</div>
          {isExpanded && <span className="wl-logo-text">GigShield</span>}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`wl-toggle-btn ${isExpanded ? 'wl-toggle-btn--expanded' : 'wl-toggle-btn--collapsed'}`}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="wl-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (pathname?.startsWith(item.path + '/') && item.path !== '/worker/dashboard')
            return (
              <Link
                key={item.name}
                href={item.path}
                title={!isExpanded ? item.name : undefined}
                className={`wl-nav-link ${isActive ? 'wl-nav-link--active' : ''} ${isExpanded ? '' : 'wl-nav-link--icon-only'}`}
              >
                <item.icon size={18} className="wl-nav-icon" />
                {isExpanded && <span>{item.name}</span>}
                {isActive && isExpanded && <span className="wl-nav-active-dot" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="wl-sidebar-footer">
          <div className={`wl-user-chip ${isExpanded ? '' : 'wl-user-chip--collapsed'}`}>
            {authUser?.profilePic ? (
              <img
                src={authUser.profilePic}
                className="wl-user-avatar-img"
                alt="Profile"
                title={!isExpanded ? (firstName || 'Worker') : undefined}
              />
            ) : (
              <div
                className="wl-user-avatar"
                title={!isExpanded ? (firstName || 'Worker') : undefined}
              >
                {firstName.charAt(0)}
              </div>
            )}
            {isExpanded && (
              <div className="wl-user-details">
                <p className="wl-user-name">{firstName || 'Worker'}</p>
                <p className="wl-user-role">Delivery Partner</p>
              </div>
            )}
          </div>

          <button
            onClick={handleSignout}
            title={!isExpanded ? 'Sign out' : undefined}
            className={`wl-signout-btn ${isExpanded ? '' : 'wl-signout-btn--icon-only'}`}
          >
            <LogOut size={16} />
            {isExpanded && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="wl-content">
        <header className="wl-header">
          <div className="wl-header-right">
            <div className="wl-status-pill">
              <span className="wl-status-dot" />
              <span>Actively protected</span>
            </div>
            <button className="wl-bell-btn" title="Notifications">
              <Bell size={17} />
            </button>
            {authUser?.profilePic ? (
              <img src={authUser.profilePic} className="wl-header-avatar wl-header-avatar--img" alt="Profile" />
            ) : (
              <div className="wl-header-avatar">{firstName.charAt(0)}</div>
            )}
          </div>
        </header>

        <main className="wl-main">
          <div className="wl-main-inner">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

const layoutStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

  /* Page */
  .wl-page {
    display: flex; min-height: 100vh; background: #0d0d1a;
    color: #fff; font-family: 'Sora', sans-serif;
  }

  /* Loading */
  .wl-checking {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #0d0d1a; font-family: 'Sora', sans-serif;
  }
  .wl-check-spinner {
    width: 36px; height: 36px; border: 2px solid rgba(99,102,241,0.2);
    border-top-color: #6366f1; border-radius: 50%; animation: wl-spin 0.8s linear infinite;
  }
  @keyframes wl-spin { to { transform: rotate(360deg); } }

  /* Sidebar */
  .wl-sidebar {
    background: #10101f; border-right: 1px solid rgba(255,255,255,0.06);
    display: flex; flex-direction: column; flex-shrink: 0;
    padding: 24px 14px; transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
    position: relative; overflow: hidden;
  }
  .wl-sidebar--expanded  { width: 248px; }
  .wl-sidebar--collapsed { width: 72px; }

  /* Logo */
  .wl-logo {
    display: flex; align-items: center; gap: 11px;
    margin-bottom: 36px; padding: 0 6px; position: relative;
  }
  .wl-logo--collapsed { justify-content: center; }
  .wl-logo-mark {
    width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
    background: linear-gradient(135deg, #f97316, #ea580c);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 15px; color: #fff;
    box-shadow: 0 4px 14px rgba(249,115,22,0.35);
  }
  .wl-logo-text { font-size: 18px; font-weight: 700; color: #fff; letter-spacing: -0.02em; white-space: nowrap; }

  .wl-toggle-btn {
    position: absolute; right: -20px; top: 50%; transform: translateY(-50%);
    width: 22px; height: 22px; border-radius: 50%;
    background: #1a1a2e; border: 1px solid rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.5); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s; z-index: 10;
  }
  .wl-toggle-btn--collapsed { right: -18px; }
  .wl-toggle-btn:hover { background: #22223a; color: #fff; border-color: rgba(255,255,255,0.2); }

  /* Nav */
  .wl-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
  .wl-nav-link {
    display: flex; align-items: center; gap: 11px;
    padding: 11px 12px; border-radius: 12px; text-decoration: none;
    color: rgba(255,255,255,0.5); font-size: 14px; font-weight: 500;
    transition: all 0.18s; position: relative; white-space: nowrap; overflow: hidden;
  }
  .wl-nav-link--icon-only { justify-content: center; padding: 11px; }
  .wl-nav-link:hover:not(.wl-nav-link--active) { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.85); }
  .wl-nav-link--active {
    background: rgba(99,102,241,0.12); color: #818cf8;
    border: 1px solid rgba(99,102,241,0.15);
  }
  .wl-nav-icon { flex-shrink: 0; }
  .wl-nav-link--active .wl-nav-icon { color: #818cf8; }
  .wl-nav-active-dot {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    width: 5px; height: 5px; border-radius: 50%; background: #818cf8;
    box-shadow: 0 0 8px rgba(129,140,248,0.7);
  }

  /* Footer */
  .wl-sidebar-footer { margin-top: auto; display: flex; flex-direction: column; gap: 6px; }

  .wl-user-chip {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 12px;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    overflow: hidden;
  }
  .wl-user-chip--collapsed { justify-content: center; padding: 10px; }
  .wl-user-avatar {
    width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, #3b82f6, #06b6d4);
    display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;
  }
  .wl-user-avatar-img { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
  .wl-user-details { overflow: hidden; }
  .wl-user-name { font-size: 13px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .wl-user-role { font-size: 11px; color: rgba(255,255,255,0.35); white-space: nowrap; }

  .wl-signout-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 12px;
    background: none; border: none; color: rgba(255,255,255,0.35);
    font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Sora', sans-serif;
    transition: all 0.18s; width: 100%; text-align: left;
  }
  .wl-signout-btn--icon-only { justify-content: center; }
  .wl-signout-btn:hover { background: rgba(248,113,113,0.08); color: #fca5a5; }

  /* Content */
  .wl-content { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow-y: auto; max-height: 100vh; }

  /* Header */
  .wl-header {
    display: flex; align-items: center; justify-content: flex-end;
    padding: 16px 28px; border-bottom: 1px solid rgba(255,255,255,0.05);
    background: rgba(13,13,26,0.8); backdrop-filter: blur(12px);
    position: sticky; top: 0; z-index: 10;
  }
  .wl-header-right { display: flex; align-items: center; gap: 12px; }
  .wl-status-pill {
    display: flex; align-items: center; gap: 7px;
    background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2);
    padding: 6px 13px; border-radius: 99px; font-size: 12px; color: #4ade80; font-weight: 500;
  }
  .wl-status-dot {
    width: 7px; height: 7px; border-radius: 50%; background: #22c55e;
    box-shadow: 0 0 8px rgba(34,197,94,0.6); animation: statusPulse 2s ease infinite;
  }
  @keyframes statusPulse {
    0%, 100% { box-shadow: 0 0 6px rgba(34,197,94,0.5); }
    50%       { box-shadow: 0 0 12px rgba(34,197,94,0.8); }
  }
  .wl-bell-btn {
    width: 36px; height: 36px; border-radius: 10px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.6); cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .wl-bell-btn:hover { background: rgba(255,255,255,0.09); color: #fff; }
  .wl-header-avatar {
    width: 34px; height: 34px; border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6, #06b6d4);
    display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700;
    border: 2px solid rgba(255,255,255,0.1);
  }
  .wl-header-avatar--img { object-fit: cover; }

  /* Main */
  .wl-main { flex: 1; padding: 32px 28px; }
  .wl-main-inner { max-width: 900px; animation: wl-fadeUp 0.35s ease both; }
  @keyframes wl-fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
`