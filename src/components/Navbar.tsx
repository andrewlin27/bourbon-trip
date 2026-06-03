'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import LoginModal from '@/components/LoginModal'

const NAV_LINKS = [
  { href: '/roster', label: 'Roster' },
  { href: '/score', label: 'Score' },
  { href: '/power-rankings', label: 'Rankings' },
  { href: '/spin', label: 'Spin' },
  { href: '/help', label: 'Help' },
]

const PRIVATE_NAV_LINKS = [
  { href: '/flights', label: 'Flights' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [isCaptain, setIsCaptain] = useState(false)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const loadUser = async (userId: string | undefined) => {
      if (!userId) { setIsCaptain(false); return }
      const { data } = await supabase.from('users').select('is_captain').eq('id', userId).single()
      setIsCaptain(data?.is_captain ?? false)
    }

    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session)
      loadUser(data.session?.user?.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session)
      loadUser(session?.user?.id)
    })
    return () => subscription.unsubscribe()
  }, [])

  const profileButton = loggedIn ? (
    <Link
      href="/profile"
      onClick={() => setOpen(false)}
      className="bg-bourbon-amber text-white px-3 py-1.5 rounded-md text-sm hover:bg-bourbon-rust transition-colors"
    >
      My Profile
    </Link>
  ) : (
    <button
      onClick={() => { setShowLogin(true); setOpen(false) }}
      className="bg-bourbon-amber text-white px-3 py-1.5 rounded-md text-sm hover:bg-bourbon-rust transition-colors"
    >
      Sign In
    </button>
  )
  const visibleLinks = loggedIn ? [...NAV_LINKS, ...PRIVATE_NAV_LINKS] : NAV_LINKS

  return (
    <>
      <nav className="bg-bourbon-dark text-bourbon-cream sticky top-0 z-50 shadow-md">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Brand */}
          <Link
            href="/"
            className="font-serif text-lg font-bold tracking-wide text-bourbon-gold"
          >
            ACE Bourbon Trip
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-bourbon-gold transition-colors ${
                  pathname === link.href ? 'text-bourbon-gold' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isCaptain && (
              <Link
                href="/admin"
                className={`hover:text-bourbon-gold transition-colors ${pathname === '/admin' ? 'text-bourbon-gold' : ''}`}
              >
                Admin
              </Link>
            )}
            {profileButton}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <div className="space-y-1.5">
              <span className={`block w-6 h-0.5 bg-bourbon-cream transition-transform ${open ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-6 h-0.5 bg-bourbon-cream transition-opacity ${open ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 bg-bourbon-cream transition-transform ${open ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="md:hidden border-t border-bourbon-rust/30 px-4 pb-4 flex flex-col gap-3 pt-3 text-sm font-medium">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`hover:text-bourbon-gold transition-colors ${
                  pathname === link.href ? 'text-bourbon-gold' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isCaptain && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className={`hover:text-bourbon-gold transition-colors ${pathname === '/admin' ? 'text-bourbon-gold' : ''}`}
              >
                Admin
              </Link>
            )}
            <div>{profileButton}</div>
          </div>
        )}
      </nav>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}
