'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface User {
  id: string
  name: string
  team: string | null
}

interface Props {
  allUsers: User[]
  teamsRevealed: boolean
}

const COLORS = [
  '#C27D38', '#2C1A0E', '#8B3A1F', '#D4A017',
  '#6B4423', '#A0522D', '#8B6914', '#5C3317',
]

export default function SpinWheelClient({ allUsers, teamsRevealed }: Props) {
  const [selected, setSelected] = useState<string[]>(allUsers.map((u) => u.id))
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const [currentAngle, setCurrentAngle] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const angleRef = useRef(0)
  const animFrameRef = useRef<number | null>(null)

  const selectedUsers = allUsers.filter((u) => selected.includes(u.id))

  const drawWheel = useCallback((angle: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const n = selectedUsers.length
    if (n === 0) return

    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const r = Math.min(cx, cy) - 4
    const arc = (2 * Math.PI) / n

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let i = 0; i < n; i++) {
      const start = angle + i * arc - Math.PI / 2
      const end = start + arc

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, start, end)
      ctx.closePath()
      ctx.fillStyle = COLORS[i % COLORS.length]
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Label
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(start + arc / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#fff'
      ctx.font = `bold ${n > 12 ? 11 : 13}px Inter, sans-serif`
      const firstName = selectedUsers[i].name.split(' ')[0]
      ctx.fillText(firstName, r - 10, 5)
      ctx.restore()
    }

    // Center circle
    ctx.beginPath()
    ctx.arc(cx, cy, 18, 0, 2 * Math.PI)
    ctx.fillStyle = '#faf8f5'
    ctx.fill()
    ctx.strokeStyle = '#C27D38'
    ctx.lineWidth = 2
    ctx.stroke()
  }, [selectedUsers])

  useEffect(() => {
    drawWheel(angleRef.current)
  }, [drawWheel])

  const spin = () => {
    if (spinning || selectedUsers.length === 0) return
    setWinner(null)
    setSpinning(true)

    const extraSpins = 6 + Math.random() * 4
    const randomOffset = Math.random() * 2 * Math.PI
    const target = angleRef.current + extraSpins * 2 * Math.PI + randomOffset
    const duration = 4000
    const start = performance.now()
    const startAngle = angleRef.current

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOut(progress)
      const angle = startAngle + (target - startAngle) * eased

      angleRef.current = angle
      drawWheel(angle)

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate)
      } else {
        const n = selectedUsers.length
        const arc = (2 * Math.PI) / n
        // Pointer at top (0 from center = -PI/2 offset)
        const normalized = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
        const pointerAngle = (2 * Math.PI - normalized) % (2 * Math.PI)
        const idx = Math.floor(pointerAngle / arc) % n
        setWinner(selectedUsers[idx]?.name ?? null)
        setCurrentAngle(angle)
        setSpinning(false)
      }
    }

    animFrameRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current) }
  }, [])

  const toggleUser = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
    setWinner(null)
  }

  const filterTeam = (team: 'lin' | 'ditty') => {
    setSelected(allUsers.filter((u) => u.team === team).map((u) => u.id))
    setWinner(null)
  }

  return (
    <div className="space-y-6">
      {/* Wheel */}
      <div className="relative flex justify-center">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-0 h-0"
          style={{ borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '20px solid #C27D38' }}
        />
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="rounded-full shadow-lg cursor-pointer"
          onClick={spin}
        />
      </div>

      {/* Winner */}
      {winner && (
        <div className="text-center bg-bourbon-cream border border-bourbon-amber/40 rounded-xl py-4 px-6">
          <p className="text-xs text-bourbon-amber font-semibold uppercase tracking-widest mb-1">Selected</p>
          <p className="font-serif text-2xl font-bold text-bourbon-dark">{winner}</p>
        </div>
      )}

      <button
        onClick={spin}
        disabled={spinning || selectedUsers.length === 0}
        className="w-full bg-bourbon-amber hover:bg-bourbon-rust disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {spinning ? 'Spinning…' : 'Spin'}
      </button>

      {/* Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">
            On the wheel ({selectedUsers.length})
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => { setSelected(allUsers.map((u) => u.id)); setWinner(null) }}
              className="text-xs text-bourbon-amber underline underline-offset-2"
            >
              All
            </button>
            {teamsRevealed && (
              <>
                <button onClick={() => filterTeam('lin')} className="text-xs text-team-lin underline underline-offset-2">
                  Team Lin
                </button>
                <button onClick={() => filterTeam('ditty')} className="text-xs text-team-ditty underline underline-offset-2">
                  Team Ditty
                </button>
              </>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {allUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => toggleUser(u.id)}
              className={`text-xs px-2 py-1.5 rounded-lg border transition-colors text-left truncate ${
                selected.includes(u.id)
                  ? 'bg-bourbon-amber/10 border-bourbon-amber/40 text-bourbon-dark font-medium'
                  : 'border-stone-200 text-stone-400 line-through'
              }`}
            >
              {u.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
