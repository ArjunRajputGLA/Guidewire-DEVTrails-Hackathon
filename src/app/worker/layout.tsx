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
      if (!user) {
        router.replace('/login')
        return
      }
      
      const profile = await supabase.from('worker_profiles').select('full_name').eq('id', user.id).single()
      if (profile.data?.full_name) {
        setFirstName(profile.data.full_name.split(' ')[0])
      }
      
      setChecking(false)
    }
    check()
  }, [router])

  const handleSignout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (checking) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0f0f1a', color: '#fff'
      }}>
        <div style={{ width: 40, height: 40, border: '2px solid rgba(249,115,22,0.3)', borderTop: '2px solid #f97316', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const s: Record<string, React.CSSProperties> = {
    page:    { display: 'flex', minHeight: '100vh', background: '#0f0f1a', color: '#fff', fontFamily: '"DM Sans", sans-serif' },
    sidebar: { 
      width: isExpanded ? '280px' : '80px', 
      background: '#131320', 
      borderRight: '1px solid rgba(255,255,255,0.05)', 
      padding: isExpanded ? '24px 20px' : '24px 10px', 
      display: 'flex', 
      flexDirection: 'column' as const,
      transition: 'width 0.3s ease'
    },
    logoContainer: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: 12, 
      marginBottom: 48, 
      padding: isExpanded ? '0 8px' : '0',
      justifyContent: isExpanded ? 'flex-start' : 'center',
      position: 'relative' as const
    },
    nav: { display: 'flex', flexDirection: 'column' as const, gap: 8, flex: 1 },
    navLink: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: 12, 
      padding: isExpanded ? '12px 16px' : '12px', 
      justifyContent: isExpanded ? 'flex-start' : 'center',
      borderRadius: 12, 
      color: 'rgba(255,255,255,0.6)', 
      textDecoration: 'none', 
      transition: 'all 0.2s', 
      fontSize: 15, 
      fontWeight: 500 
    },
    navLinkActive: { background: 'rgba(249,115,22,0.1)', color: '#f97316' },
    contentArea: { flex: 1, display: 'flex', flexDirection: 'column' as const, maxHeight: '100vh', overflowY: 'auto' as const },
    header:  { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(15,15,26,0.8)', backdropFilter: 'blur(10px)', position: 'sticky' as const, top: 0, zIndex: 10 },
    main:    { padding: '32px', maxWidth: 840, width: '100%', margin: '0 auto' },
  }

  const navItems = [
    { name: 'Dashboard', path: '/worker/dashboard', icon: LayoutDashboard },
    { name: 'My Claims', path: '/worker/my-claims', icon: FileText },
    { name: 'My Policies', path: '/worker/my-policy', icon: ShieldCheck },
    { name: 'Weekly Payout', path: '/worker/weekly-payout', icon: IndianRupee },
    { name: 'Profile', path: '/worker/profile', icon: User },
  ]

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>

      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.logoContainer}>
          <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, background: 'linear-gradient(135deg,#f97316,#ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#fff', boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }}>
            G
          </div>
          {isExpanded && <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em', color: '#fff' }}>GigShield</span>}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ 
              position: 'absolute', right: isExpanded ? -32 : -22, top: 4,
              background: '#131320', border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '50%', padding: 4, cursor: 'pointer', color: '#a1a1aa', zIndex: 10
            }}
          >
            {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        <nav style={s.nav}>
          {navItems.map((item) => {
            const isActive = pathname === item.path || (pathname?.startsWith(item.path + '/') && item.path !== '/worker/dashboard')
            return (
              <Link 
                key={item.name} 
                href={item.path} 
                title={!isExpanded ? item.name : undefined}
                style={{
                  ...s.navLink,
                  ...(isActive ? s.navLinkActive : {})
                }}
              >
                <item.icon size={20} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.6 }} />
                {isExpanded && item.name}
              </Link>
            )
          })}
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: isExpanded ? '12px 16px' : '12px',
            justifyContent: isExpanded ? 'flex-start' : 'center',
            borderRadius: 12, marginBottom: 12,
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)'
          }}>
            {authUser?.profilePic ? (
              <img src={authUser.profilePic} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} alt="Profile" title={!isExpanded ? (firstName || 'Worker') : undefined} />
            ) : (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#3b82f6', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }} title={!isExpanded ? (firstName || 'Worker') : undefined}>
                {firstName.charAt(0)}
              </div>
            )}
            {isExpanded && (
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {firstName || 'Worker'}
              </p>
            )}
          </div>

          <button 
            onClick={handleSignout} 
            title={!isExpanded ? 'Sign out' : undefined}
            style={{ 
              width: '100%',
              display: 'flex', alignItems: 'center', gap: 12, padding: isExpanded ? '12px 16px' : '12px', borderRadius: 12, 
              color: 'rgba(255,255,255,0.5)', background: 'transparent', border: 'none', cursor: 'pointer',
              justifyContent: isExpanded ? 'flex-start' : 'center',
              fontSize: 15, fontWeight: 500, fontFamily: 'inherit', textAlign: 'left',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
            onMouseOut={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'transparent' }}
          >
            <LogOut size={20} style={{ flexShrink: 0, opacity: 0.6 }} />
            {isExpanded && 'Sign out'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={s.contentArea}>
        <header style={s.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.1)', padding: '6px 12px', borderRadius: 20, border: '1px solid rgba(34,197,94,0.2)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
              <span style={{ fontSize: 13, color: '#4ade80', fontWeight: 500 }}>Actively protected</span>
            </div>
            <button style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
              <Bell size={18} />
            </button>
            {authUser?.profilePic ? (
              <img src={authUser.profilePic} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} alt="Profile" />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>
                {firstName.charAt(0)}
              </div>
            )}
          </div>
        </header>

        <main style={s.main}>
          <div className="animate-fade-in" style={{ animation: 'fadeIn 0.3s ease' }}>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}