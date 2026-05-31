'use client'

import { useState } from 'react'
import { Profile, PROMPT_BANK, PromptQuestion } from '@/types/index'

interface Props {
  initialProfile: Profile | null
}

export default function PromptAnswerForm({ initialProfile }: Props) {
  const [q1, setQ1] = useState<PromptQuestion | ''>(initialProfile?.prompt1_question ?? '')
  const [a1, setA1] = useState(initialProfile?.prompt1_answer ?? '')
  const [q2, setQ2] = useState<PromptQuestion | ''>(initialProfile?.prompt2_question ?? '')
  const [a2, setA2] = useState(initialProfile?.prompt2_answer ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const valid = q1 !== '' && a1.trim() !== '' && q2 !== '' && a2.trim() !== '' && q1 !== q2

  const handleSave = async () => {
    if (!valid) return
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const res = await fetch('/api/profiles/upsertProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt1_question: q1, prompt1_answer: a1, prompt2_question: q2, prompt2_answer: a2 }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const available = (excluding: PromptQuestion | '') =>
    PROMPT_BANK.filter((p) => p !== excluding)

  return (
    <div className="space-y-5">
      {/* Prompt 1 */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Prompt 1</label>
        <select
          value={q1}
          onChange={(e) => { setQ1(e.target.value as PromptQuestion); setSaved(false) }}
          className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-bourbon-amber/40 bg-white"
        >
          <option value="">Choose a prompt…</option>
          {available(q2 as PromptQuestion).map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {q1 && (
          <input
            type="text"
            value={a1}
            onChange={(e) => { setA1(e.target.value); setSaved(false) }}
            placeholder="Your answer"
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bourbon-amber/40"
          />
        )}
      </div>

      {/* Prompt 2 */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Prompt 2</label>
        <select
          value={q2}
          onChange={(e) => { setQ2(e.target.value as PromptQuestion); setSaved(false) }}
          className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-bourbon-amber/40 bg-white"
        >
          <option value="">Choose a prompt…</option>
          {available(q1 as PromptQuestion).map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {q2 && (
          <input
            type="text"
            value={a2}
            onChange={(e) => { setA2(e.target.value); setSaved(false) }}
            placeholder="Your answer"
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bourbon-amber/40"
          />
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {saved && <p className="text-green-600 text-sm">✓ Saved</p>}

      <button
        onClick={handleSave}
        disabled={!valid || saving}
        className="w-full bg-bourbon-amber hover:bg-bourbon-rust disabled:opacity-40 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
      >
        {saving ? 'Saving…' : 'Save prompts'}
      </button>
    </div>
  )
}
