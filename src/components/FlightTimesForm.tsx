'use client'

import { useState } from 'react'

interface Props {
  initialArrival: string
  initialDeparture: string
}

function parse(value: string): { time: string; flight: string } {
  if (!value) return { time: '', flight: '' }
  const parts = value.trim().split(' ')
  if (parts.length === 1) return { time: parts[0], flight: '' }
  return { time: parts.slice(0, -1).join(' '), flight: parts[parts.length - 1] }
}

function combine(time: string, flight: string): string {
  const t = time.trim()
  const f = flight.trim()
  if (!t && !f) return ''
  return [t, f].filter(Boolean).join(' ')
}

interface FlightInputProps {
  label: string
  time: string
  flight: string
  onTimeChange: (v: string) => void
  onFlightChange: (v: string) => void
  onAnyChange: () => void
}

function FlightInput({ label, time, flight, onTimeChange, onFlightChange, onAnyChange }: FlightInputProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={time}
          onChange={(e) => { onTimeChange(e.target.value); onAnyChange() }}
          placeholder="1:20pm"
          className="w-1/2 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bourbon-amber/40"
        />
        <input
          type="text"
          value={flight}
          onChange={(e) => { onFlightChange(e.target.value.toUpperCase()); onAnyChange() }}
          placeholder="UA123"
          className="w-1/2 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bourbon-amber/40 font-mono"
        />
      </div>
    </div>
  )
}

export default function FlightTimesForm({ initialArrival, initialDeparture }: Props) {
  const [arrivalTime, setArrivalTime] = useState(parse(initialArrival).time)
  const [arrivalFlight, setArrivalFlight] = useState(parse(initialArrival).flight)
  const [departureTime, setDepartureTime] = useState(parse(initialDeparture).time)
  const [departureFlight, setDepartureFlight] = useState(parse(initialDeparture).flight)
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
        body: JSON.stringify({
          flight_arrival: combine(arrivalTime, arrivalFlight),
          flight_departure: combine(departureTime, departureFlight),
        }),
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
      <FlightInput
        label="Friday arrival (Aug 21)"
        time={arrivalTime}
        flight={arrivalFlight}
        onTimeChange={setArrivalTime}
        onFlightChange={setArrivalFlight}
        onAnyChange={() => setSaved(false)}
      />
      <FlightInput
        label="Sunday departure (Aug 23)"
        time={departureTime}
        flight={departureFlight}
        onTimeChange={setDepartureTime}
        onFlightChange={setDepartureFlight}
        onAnyChange={() => setSaved(false)}
      />

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
