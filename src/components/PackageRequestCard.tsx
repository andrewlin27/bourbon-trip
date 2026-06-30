'use client'

import { useState } from 'react'
import { PackageRequest } from '@/types/index'
import Spinner from './Spinner'

interface Props {
  request: PackageRequest & { requester: { id: string; name: string } }
  groupMembers: { id: string; name: string; status: string }[]
  alreadyInGroup: boolean
  onRespond: (id: string, status: 'accepted' | 'declined') => void
}

export default function PackageRequestCard({ request, groupMembers, alreadyInGroup, onRespond }: Props) {
  const [loading, setLoading] = useState<'accepted' | 'declined' | null>(null)
  const [done, setDone] = useState(false)
  const [result, setResult] = useState<'accepted' | 'declined' | null>(null)
  const [error, setError] = useState('')

  const respond = async (status: 'accepted' | 'declined') => {
    setLoading(status)
    setError('')
    try {
      const res = await fetch(`/api/packages/respondPackage/${request.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Something went wrong')
        return
      }
      setResult(status)
      setDone(true)
      setTimeout(() => onRespond(request.id, status), 1200)
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
      {groupMembers.length > 0 && (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-stone-400 font-medium">Also in this group:</p>
          {groupMembers.map((m) => (
            <div key={m.id} className="flex items-center justify-between text-xs">
              <span className="text-stone-600">{m.name}</span>
              <span className={`font-medium ${m.status === 'accepted' ? 'text-green-600' : 'text-amber-600'}`}>
                {m.status === 'accepted' ? 'Accepted' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-stone-500 mt-0.5">You'll all be placed on the same team.</p>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      <div className="mt-3">
        {alreadyInGroup ? (
          <p className="text-xs text-stone-400 mb-2 italic">You've already accepted another group request.</p>
        ) : (
          <p className="text-xs text-stone-400 mb-2 italic">Accepting is final — neither you nor {request.requester.name} will be able to join another group. Your team preference will be updated to match {request.requester.name}&apos;s, though you can still change it afterward.</p>
        )}
        <div className="flex gap-2">
          {!alreadyInGroup && (
            <button
              onClick={() => respond('accepted')}
              disabled={loading !== null}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
            >
              {loading === 'accepted' ? <span className="flex items-center justify-center gap-2"><Spinner className="w-4 h-4" />…</span> : 'Accept'}
            </button>
          )}
          <button
            onClick={() => respond('declined')}
            disabled={loading !== null}
            className="flex-1 bg-white hover:bg-stone-50 disabled:opacity-50 text-stone-600 text-sm font-medium py-2 rounded-lg border border-stone-300 transition-colors"
          >
            {loading === 'declined' ? <span className="flex items-center justify-center gap-2"><Spinner className="w-4 h-4" />…</span> : 'Decline'}
          </button>
        </div>
      </div>
    </div>
  )
}
