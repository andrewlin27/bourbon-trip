'use client'

import { useEffect, useState } from 'react'

interface Props {
  targetISO: string
}

function getTimeLeft(targetISO: string) {
  const diff = new Date(targetISO).getTime() - Date.now()
  if (diff <= 0) return null
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { days, hours, minutes, seconds }
}

export default function CountdownTimer({ targetISO }: Props) {
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft>>(null)

  useEffect(() => {
    setTimeLeft(getTimeLeft(targetISO))
    const id = setInterval(() => setTimeLeft(getTimeLeft(targetISO)), 1000)
    return () => clearInterval(id)
  }, [targetISO])

  if (timeLeft === null) {
    return (
      <p className="text-bourbon-gold font-serif text-2xl font-bold">
        Teams have been revealed! 🥃
      </p>
    )
  }

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex justify-center gap-4 text-bourbon-cream">
      {[
        { label: 'Days', value: timeLeft.days },
        { label: 'Hrs', value: timeLeft.hours },
        { label: 'Min', value: timeLeft.minutes },
        { label: 'Sec', value: timeLeft.seconds },
      ].map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center">
          <span className="font-serif text-4xl font-bold text-bourbon-gold tabular-nums">
            {label === 'Days' ? value : pad(value)}
          </span>
          <span className="text-xs text-bourbon-cream/60 uppercase tracking-widest mt-1">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}
