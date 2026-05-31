'use client'

import { useState, useEffect, useRef } from 'react'

interface Props {
  onClose: () => void
}

export default function LoginModal({ onClose }: Props) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to send link')
      setSent(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-1/3 -translate-y-1/3 z-50 bg-white rounded-2xl shadow-xl p-6 max-w-sm mx-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 text-lg leading-none"
          aria-label="Close"
        >
          ×
        </button>

        {sent ? (
          <div className="text-center space-y-3 py-2">
            <div className="text-3xl">📬</div>
            <p className="font-semibold text-stone-800">Check your email</p>
            <p className="text-stone-400 text-sm">
              We sent a magic link to <span className="font-medium text-stone-600">{email}</span>.
              Tap it to sign in.
            </p>
            <button onClick={onClose} className="text-xs text-stone-400 underline underline-offset-2 mt-2">
              Close
            </button>
          </div>
        ) : (
          <>
            <p className="font-semibold text-stone-800 mb-1">Sign in</p>
            <p className="text-xs text-stone-400 mb-4">
              Enter your email — we&apos;ll send you a magic link.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bourbon-amber/40"
              />
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-bourbon-amber hover:bg-bourbon-rust disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                {loading ? 'Sending…' : 'Send magic link'}
              </button>
            </form>
          </>
        )}
      </div>
    </>
  )
}
