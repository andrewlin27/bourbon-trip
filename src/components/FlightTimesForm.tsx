'use client'

import { useState } from 'react'
import {
  combineFlightValue,
  formatTimeInputValue,
  parseFlightValue,
} from '@/utils/flights'

interface Props {
  initialArrival: string
  initialDeparture: string
}

interface FlightInputProps {
  label: string
  time: string
  flight: string
  onTimeChange: (v: string) => void
  onFlightChange: (v: string) => void
}

function FlightInput({
  label,
  time,
  flight,
  onTimeChange,
  onFlightChange,
}: FlightInputProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">{label}</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          type="time"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          className="min-w-0 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bourbon-amber/40"
        />
        <input
          type="text"
          value={flight}
          onChange={(e) => onFlightChange(e.target.value.toUpperCase())}
          placeholder="UA123"
          className="min-w-0 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bourbon-amber/40 font-mono"
        />
      </div>
    </div>
  )
}

export default function FlightTimesForm({ initialArrival, initialDeparture }: Props) {
  const initialArrivalParsed = parseFlightValue(initialArrival)
  const initialDepartureParsed = parseFlightValue(initialDeparture)
  const [arrivalTime, setArrivalTime] = useState(formatTimeInputValue(initialArrivalParsed.time))
  const [arrivalFlight, setArrivalFlight] = useState(initialArrivalParsed.flight)
  const [departureTime, setDepartureTime] = useState(formatTimeInputValue(initialDepartureParsed.time))
  const [departureFlight, setDepartureFlight] = useState(initialDepartureParsed.flight)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')

  const arrivalSummary = combineFlightValue('', arrivalTime, arrivalFlight)
  const departureSummary = combineFlightValue('', departureTime, departureFlight)

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/users/updateUser', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flight_arrival: arrivalSummary,
          flight_departure: departureSummary,
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
              <div className="flex justify-between gap-4">
                <span className="text-stone-500">Friday arrival</span>
                <span className="font-medium text-right">
                  {arrivalSummary || <span className="text-stone-400 italic">Not set</span>}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-stone-500">Sunday departure</span>
                <span className="font-medium text-right">
                  {departureSummary || <span className="text-stone-400 italic">Not set</span>}
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
