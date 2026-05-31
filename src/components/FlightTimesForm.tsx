'use client'

import { useState } from 'react'

interface Props {
  initialArrival: string
  initialDeparture: string
}

export default function FlightTimesForm({ initialArrival, initialDeparture }: Props) {
  const [arrival, setArrival] = useState(initialArrival)
  const [departure, setDeparture] = useState(initialDeparture)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const res = await fetch('/api/users/updateUser', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flight_arrival: arrival, flight_departure: departure }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">
          Friday arrival (Aug 21)
        </label>
        <input
          type="text"
          value={arrival}
          onChange={(e) => { setArrival(e.target.value); setSaved(false) }}
          placeholder="e.g. Fri 6:30pm SDF"
          className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bourbon-amber/40"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">
          Sunday departure (Aug 23)
        </label>
        <input
          type="text"
          value={departure}
          onChange={(e) => { setDeparture(e.target.value); setSaved(false) }}
          placeholder="e.g. Sun 4:15pm SDF"
          className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bourbon-amber/40"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {saved && <p className="text-green-600 text-sm">✓ Saved</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-bourbon-amber hover:bg-bourbon-rust disabled:opacity-40 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
      >
        {saving ? 'Saving…' : 'Save flight times'}
      </button>
    </div>
  )
}
