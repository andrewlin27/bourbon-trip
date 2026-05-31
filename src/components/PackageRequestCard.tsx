'use client'

import { useState } from 'react'
import { PackageRequest } from '@/types/index'

interface Props {
  request: PackageRequest & { requester: { id: string; name: string } }
  onRespond: (id: string) => void
}

export default function PackageRequestCard({ request, onRespond }: Props) {
  const [loading, setLoading] = useState<'accepted' | 'declined' | null>(null)
  const [done, setDone] = useState(false)
  const [result, setResult] = useState<'accepted' | 'declined' | null>(null)

  const respond = async (status: 'accepted' | 'declined') => {
    setLoading(status)
    try {
      await fetch(`/api/packages/respondPackage/${request.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setResult(status)
      setDone(true)
      setTimeout(() => onRespond(request.id), 1200)
    } finally {
      setLoading(null)
    }
  }

  if (done) {
    return (
      <div className={`rounded-xl border px-4 py-3 text-sm ${result === 'accepted' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-stone-50 border-stone-200 text-stone-500'}`}>
        {result === 'accepted' ? `✓ Joined ${request.requester.name}'s package` : `Declined ${request.requester.name}'s invite`}
      </div>
    )
  }

  return (
    <div className="bg-bourbon-cream border border-bourbon-amber/30 rounded-xl px-4 py-4">
      <p className="text-sm font-medium text-bourbon-dark">
        <span className="font-semibold">{request.requester.name}</span> wants to package with you
      </p>
      <p className="text-xs text-stone-500 mt-0.5">You'll be placed on the same team.</p>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => respond('accepted')}
          disabled={loading !== null}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          {loading === 'accepted' ? '…' : 'Accept'}
        </button>
        <button
          onClick={() => respond('declined')}
          disabled={loading !== null}
          className="flex-1 bg-white hover:bg-stone-50 disabled:opacity-50 text-stone-600 text-sm font-medium py-2 rounded-lg border border-stone-300 transition-colors"
        >
          {loading === 'declined' ? '…' : 'Decline'}
        </button>
      </div>
    </div>
  )
}
