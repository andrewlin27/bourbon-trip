'use client'

import { useState } from 'react'
import { combineFlightValue, parseFlightValue } from '@/utils/flights'

interface Props {
  initialArrival: string
  initialDeparture: string
}

interface FlightInputProps {
  label: string
  airport: string
  time: string
  flight: string
  onAirportChange: (v: string) => void
  onTimeChange: (v: string) => void
  onFlightChange: (v: string) => void
}

function FlightInput({
  label,
  airport,
  time,
  flight,
  onAirportChange,
  onTimeChange,
  onFlightChange,
}: FlightInputProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">{label}</label>
      <div className="grid grid-cols-[0.7fr_1fr_1fr] gap-2">
        <input
          type="text"
          value={airport}
          onChange={(e) => onAirportChange(e.target.value.toUpperCase().slice(0, 3))}
          placeholder="SDF"
          maxLength={3}
          className="min-w-0 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bourbon-amber/40 font-mono uppercase"
        />
        <input
          type="text"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          placeholder="1:20pm"
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
  const [arrivalAirport, setArrivalAirport] = useState(initialArrivalParsed.airport)
  const [arrivalTime, setArrivalTime] = useState(initialArrivalParsed.time)
  const [arrivalFlight, setArrivalFlight] = useState(initialArrivalParsed.flight)
  const [departureAirport, setDepartureAirport] = useState(initialDepartureParsed.airport)
  const [departureTime, setDepartureTime] = useState(initialDepartureParsed.time)
  const [departureFlight, setDepartureFlight] = useState(initialDepartureParsed.flight)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')

  const arrivalSummary = combineFlightValue(arrivalAirport, arrivalTime, arrivalFlight)
  const departureSummary = combineFlightValue(departureAirport, departureTime, departureFlight)

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
        airport={arrivalAirport}
        time={arrivalTime}
        flight={arrivalFlight}
        onAirportChange={setArrivalAirport}
        onTimeChange={setArrivalTime}
        onFlightChange={setArrivalFlight}
      />
      <FlightInput
        label="Sunday departure (Aug 23)"
        airport={departureAirport}
        time={departureTime}
        flight={departureFlight}
        onAirportChange={setDepartureAirport}
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
