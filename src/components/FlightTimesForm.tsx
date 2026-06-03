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
}

function FlightInput({ label, time, flight, onTimeChange, onFlightChange }: FlightInputProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          placeholder="1:20pm"
          className="w-1/2 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bourbon-amber/40"
        />
        <input
          type="text"
          value={flight}
          onChange={(e) => onFlightChange(e.target.value.toUpperCase())}
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
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setSaving(true)
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
      setShowModal(true)
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
      />
      <FlightInput
        label="Sunday departure (Aug 23)"
        time={departureTime}
        flight={departureFlight}
        onTimeChange={setDepartureTime}
        onFlightChange={setDepartureFlight}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-bourbon-amber hover:bg-bourbon-rust disabled:opacity-40 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
      >
        {saving ? 'Saving…' : 'Save flight times'}
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-xl font-bold text-bourbon-dark">Flight times saved!</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Friday arrival</span>
                <span className="font-medium text-right">
                  {combine(arrivalTime, arrivalFlight) || <span className="text-stone-400 italic">Not set</span>}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Sunday departure</span>
                <span className="font-medium text-right">
                  {combine(departureTime, departureFlight) || <span className="text-stone-400 italic">Not set</span>}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-bourbon-amber hover:bg-bourbon-rust text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
