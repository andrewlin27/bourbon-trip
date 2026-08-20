'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import analytics from '@/data/statistics.json'
import highlights from '@/data/statisticsHighlights.json'
import styles from './StatisticsExperience.module.css'

type WindowKey = 'all_time' | '30_days' | '7_days'
type MetricKey = 'reactions_received' | 'reactions_given' | 'reactions_per_message' | 'reactions_per_1k_characters' | 'laughs_received' | 'laughs_given' | 'laughs_per_message' | 'laughs_per_1k_characters' | 'reps'
type Ranking = { person: string; rank: number; [key: string]: string | number }

const WINDOW_LABELS: Record<WindowKey, string> = { all_time: 'All time', '30_days': '30 days', '7_days': '7 days' }
const METRICS: { key: MetricKey; label: string; short: string }[] = [
  { key: 'reps', label: 'Bourbon reps', short: 'Reps' },
  { key: 'reactions_received', label: 'Reactions received', short: 'Reactions' },
  { key: 'laughs_received', label: 'Laughs received', short: 'Laughs' },
  { key: 'reactions_given', label: 'Reactions given', short: 'Reactors' },
  { key: 'laughs_given', label: 'Laughs given', short: 'Laugh givers' },
  { key: 'reactions_per_message', label: 'Reactions per message', short: 'Per message' },
  { key: 'reactions_per_1k_characters', label: 'Reactions per 1k characters', short: 'Per 1k chars' },
  { key: 'laughs_per_message', label: 'Laughs per message', short: 'Laugh rate' },
  { key: 'laughs_per_1k_characters', label: 'Laughs per 1k characters', short: 'Laugh density' },
]

const SLIDE_MS = 6500

function formatValue(value: number, metric?: MetricKey) {
  if (metric?.includes('per_')) return value.toFixed(2)
  return value.toLocaleString()
}

export default function StatisticsExperience() {
  const reduceMotion = useReducedMotion()
  const [mode, setMode] = useState<'story' | 'stats'>('story')
  const [slide, setSlide] = useState(0)
  const [paused, setPaused] = useState(false)
  const [windowKey, setWindowKey] = useState<WindowKey>('all_time')
  const [metric, setMetric] = useState<MetricKey>('reps')
  const [showMethod, setShowMethod] = useState(false)
  const [showRepsMethod, setShowRepsMethod] = useState(false)
  const data = useMemo(() => analytics.find((item) => item.window === windowKey)!, [windowKey])
  const leaders = data.rankings[metric] as Ranking[]
  const topLaugh = (analytics[0].rankings.laughs_received as Ranking[])[0]
  const topRep = (analytics[0].rankings.reps as Ranking[])[0]
  const topReactor = (analytics[0].rankings.reactions_given as Ranking[])[0]
  const topEfficiency = (analytics[0].rankings.reactions_per_message as Ranking[])[0]
  const funniestMember = (analytics[0].rankings.laughs_per_message as Ranking[])[0]
  const { socialButterfly, mostLovable, officialEditor } = highlights.awards
  const relationship = analytics[0].relationships[0]
  const maxLeaderValue = Math.max(...leaders.map((row) => Number(row[metric])))

  const slides = [
    { kicker: 'WWT · 2026', title: 'The group chat, wrapped.', subtitle: 'Months of bonding and elite tapbacks.', copy: 'The jokes. The reactions. The bourbon-fueled dedication. Here is what 1,855 messages say about us.' },
    { kicker: 'The big number', number: analytics[0].summary.laughs, title: 'laughs landed', subtitle: 'The group chat kept the good times rolling.', copy: `That is one laugh for every ${analytics[0].summary.messages_per_laugh.toFixed(1)} messages sent.` },
    { kicker: 'Crowd favorite', title: topLaugh.person, subtitle: `${topLaugh.person} has the unofficial comedy special.`, copy: `They earned ${topLaugh.laughs_received} laugh reactions — the most in the chat.`, board: (analytics[0].rankings.laughs_received as Ranking[]).slice(0, 3), metric: 'laughs_received' as MetricKey },
    { kicker: 'Chief encouragement officer', title: topReactor.person, subtitle: `${topReactor.person} kept the tapback economy alive.`, copy: `${topReactor.reactions_given} reactions given. No message left behind.` },
    { kicker: 'Most reliable audience', title: relationship.from, subtitle: 'Find someone who supports your material like this.', copy: `They laughed at ${relationship.to} ${relationship.laughs} times. A creative partnership, whether they knew it or not.` },
    { kicker: 'Maximum efficiency', title: topEfficiency.person, subtitle: `${topEfficiency.person} believes in quality over quantity.`, copy: `${Number(topEfficiency.reactions_per_message).toFixed(2)} reactions landed per message.` },
    { kicker: 'Funniest member', title: funniestMember.person, subtitle: `${funniestMember.person} had the highest laugh-to-message ratio.`, copy: `${Number(funniestMember.laughs_per_message).toFixed(2)} laughs per message, across ${funniestMember.messages_sent} messages.` },
    { kicker: 'Reaction social butterfly', title: socialButterfly.person, subtitle: 'No clique. No favorites. Just widespread support.', copy: `${socialButterfly.person} reacted to ${socialButterfly.value} different members — the widest audience in the chat.` },
    { kicker: 'Most lovable', title: mostLovable.person, subtitle: 'Apparently the group chat has a heart after all.', copy: `${mostLovable.person} received ${mostLovable.value} love reactions.` },
    { kicker: 'Official editor', title: officialEditor.person, subtitle: 'Every group chat needs peer review.', copy: `${officialEditor.person} gave ${officialEditor.value} of the chat’s ${officialEditor.total} ✍️ reactions.` },
    { kicker: 'The reps podium', title: topRep.person, subtitle: `${topRep.person} is ready for the trip.`, copy: `${topRep.reps} evidence-backed bourbon posts put them on top.`, board: (analytics[0].rankings.reps as Ranking[]).slice(0, 3), metric: 'reps' as MetricKey },
    { kicker: 'The final pour', title: 'That was our year in the chat.', subtitle: 'The numbers are in. The arguments may now begin.', copy: 'Explore every leaderboard, switch the time window, and inspect all the receipts.' },
  ]

  useEffect(() => {
    if (mode !== 'story' || paused || reduceMotion) return
    const timer = window.setTimeout(() => slide === slides.length - 1 ? setPaused(true) : setSlide((value) => value + 1), SLIDE_MS)
    return () => window.clearTimeout(timer)
  }, [mode, paused, reduceMotion, slide, slides.length])

  const active = slides[slide]
  const go = (next: number) => setSlide(Math.max(0, Math.min(slides.length - 1, next)))

  if (mode === 'story') return (
    <section className={styles.shell} aria-label="Group chat wrapped">
      <div className={styles.story}>
        <div className={styles.grain} />
        <div className={styles.progress} aria-label={`Story ${slide + 1} of ${slides.length}`}>
          {slides.map((_, index) => <span className={styles.track} key={index}><motion.span className={styles.fill} initial={false} animate={{ scaleX: index < slide ? 1 : index === slide ? (paused || reduceMotion ? 1 : 1) : 0 }} transition={{ duration: index === slide && !paused && !reduceMotion ? SLIDE_MS / 1000 : .25, ease: 'linear' }} style={{ display: 'block' }} /></span>)}
        </div>
        <AnimatePresence mode="wait">
          <motion.div className={styles.storyCard} key={slide} initial={reduceMotion ? false : { opacity: 0, y: 36, rotate: -1 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -26 }} transition={{ duration: .55, ease: [0.2, 0.8, 0.2, 1] }}>
            <p className={styles.eyebrow}>{active.kicker}</p>
            {'number' in active && <motion.p className={styles.displayNumber} initial={{ scale: .72 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 120 }}>{active.number}</motion.p>}
            <h1 className={styles.title}>{active.title}</h1>
            <motion.p className={styles.storySubtitle} initial={reduceMotion ? false : { opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .18 }}>{active.subtitle}</motion.p>
            <p className={styles.storyCopy}>{active.copy}</p>
            {'board' in active && active.board && <div className={styles.miniBoard}>{active.board.map((row) => <div className={styles.miniRow} key={row.person}><span>#{row.rank}</span><strong>{row.person}</strong><strong>{formatValue(Number(row[active.metric!]), active.metric)}</strong></div>)}</div>}
            {slide === slides.length - 1 && <div className="flex flex-wrap gap-3"><button className={styles.primary} onClick={() => setMode('stats')}>View all stats</button><button className="rounded-full border border-white/40 px-5 py-3 font-bold" onClick={() => { setSlide(0); setPaused(false) }}>Rewatch</button></div>}
          </motion.div>
        </AnimatePresence>
        <div className={styles.controls}>
          <button className={styles.roundButton} onClick={() => go(slide - 1)} disabled={slide === 0} aria-label="Previous story">←</button>
          <button className="text-xs font-bold uppercase tracking-widest text-white/70" onClick={() => setPaused((value) => !value)}>{paused ? 'Play' : 'Pause'}</button>
          {slide < slides.length - 1 ? <button className={styles.roundButton} onClick={() => go(slide + 1)} aria-label="Next story">→</button> : <span className="w-12" />}
        </div>
      </div>
    </section>
  )

  return (
    <section className={styles.dashboard}>
      <div className={styles.dashboardInner}>
        <header className={styles.dashHeader}>
          <div><p className="mb-3 text-xs font-black uppercase tracking-[.22em] text-bourbon-rust">WWT chat analytics</p><h1 className={styles.dashTitle}>The receipts.</h1><p className="mt-3 text-stone-500">Numbers don&apos;t lie. Group chats occasionally do.</p></div>
          <div className="flex flex-wrap gap-2">
            <div className={styles.tooltipWrap}>
              <button aria-expanded={showMethod} aria-controls="statistics-method" className="rounded-full border border-stone-400 px-4 py-2 text-sm font-bold hover:bg-white" onClick={() => setShowMethod((value) => !value)}>ⓘ How we counted</button>
              <AnimatePresence>{showMethod && <motion.div id="statistics-method" role="tooltip" className={styles.tooltip} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                <strong className="mb-2 block text-sm text-white">Hours in the Lab</strong>
                Messages and received reactions use the original message date; reactions given use the reaction date. Removed reactions cancel their originals. Per-message and per-1,000-character rankings use minimum activity thresholds for each window, so one lucky text cannot steal the crown. Windows are anchored to the latest chat activity in the export.
              </motion.div>}</AnimatePresence>
            </div>
            <button className="rounded-full border border-stone-400 px-4 py-2 text-sm font-bold hover:bg-white" onClick={() => { setMode('story'); setSlide(0); setPaused(false) }}>↻ Rewatch</button>
          </div>
        </header>
        <div className={styles.pillRow} aria-label="Time window">{(Object.keys(WINDOW_LABELS) as WindowKey[]).map((key) => <button key={key} onClick={() => setWindowKey(key)} className={`${styles.pill} ${windowKey === key ? styles.pillActive : ''}`}>{WINDOW_LABELS[key]}</button>)}</div>
        <div className={styles.summaryGrid}>
          <article className={styles.summaryCard}><span className="flex items-center justify-between gap-2">Bourbon reps <button className={styles.infoButton} aria-expanded={showRepsMethod} aria-controls="reps-method" onClick={() => setShowRepsMethod((value) => !value)}>?</button></span><strong className={styles.summaryValue}>{data.summary.reps}</strong>{showRepsMethod && <motion.div id="reps-method" role="tooltip" className={styles.repsTooltip} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}><strong>How Reps work</strong><p>One qualifying real-world alcohol photo post earns one Rep. Bottle count does not multiply the score.</p><p><b>OCR</b> reads labels for alcohol terms and brands. <b>Vision models</b> add general image labels and zero-shot scene scores for bottles, pours, collections, shelves, purchases, and other alcohol containers.</p><p>Screenshot detection takes priority and excludes screenshots. Split image-and-caption bubbles from the same sender within 30 seconds are paired and counted once. Human-reviewed overrides settle verified edge cases, while ambiguous images remain excluded until reviewed.</p></motion.div>}</article>
          <article className={styles.summaryCard}><span>Messages sent</span><strong className={styles.summaryValue}>{data.summary.messages.toLocaleString()}</strong></article>
          <article className={styles.summaryCard}><span>Laugh reactions</span><strong className={styles.summaryValue}>{data.summary.laughs}</strong></article>
          <article className={styles.summaryCard}><span>Messages per laugh</span><strong className={styles.summaryValue}>{data.summary.messages_per_laugh.toFixed(1)}</strong></article>
        </div>
        <div className={`${styles.pillRow} mb-4`} aria-label="Leaderboard metric">{METRICS.map((item) => <button key={item.key} onClick={() => setMetric(item.key)} className={`${styles.pill} ${metric === item.key ? styles.pillActive : ''}`}>{item.short}</button>)}</div>
        <motion.div className={styles.board} key={`${windowKey}-${metric}`} initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles.boardHeader}><div><p className="text-xs font-bold uppercase tracking-widest text-stone-500">Leaderboard</p><h2 className="text-xl font-black">{METRICS.find((item) => item.key === metric)?.label}</h2></div><span className="text-sm text-stone-500">{WINDOW_LABELS[windowKey]}</span></div>
          {leaders.map((row) => <div className={styles.boardRow} key={row.person}><span className={styles.rank}>{row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : row.rank === 3 ? '🥉' : `#${row.rank}`}</span><span className={styles.person}>{row.person}<motion.span className={styles.valueBar} initial={{ scaleX: 0 }} animate={{ scaleX: Number(row[metric]) / maxLeaderValue }} transition={{ duration: .55, delay: Math.min(row.rank, 10) * .05 }} /></span><span className={styles.value}>{formatValue(Number(row[metric]), metric)}</span></div>)}
        </motion.div>
        <div className={styles.featureGrid}>
          <article className={styles.featureCard}><p className={styles.eyebrow}>Funniest member</p><p className={styles.quote}>{(data.rankings.laughs_per_message as Ranking[])[0].person}</p><p className="text-sm text-white/60">{Number((data.rankings.laughs_per_message as Ranking[])[0].laughs_per_message).toFixed(2)} laughs per message · minimum activity rules apply</p></article>
          <article className={`${styles.featureCard} !bg-bourbon-rust`}><p className={styles.eyebrow}>Who laughs at who</p><p className={styles.quote}>{data.relationships[0].from} <span className="text-bourbon-gold">→</span> {data.relationships[0].to}</p><p className="text-sm text-white/70">{data.relationships[0].laughs} laugh reactions. Find someone who supports your material like this.</p></article>
        </div>
        <section className={styles.highlightsSection}>
          <div className={styles.sectionHeading}><div><p className="text-xs font-black uppercase tracking-[.2em] text-bourbon-rust">Recent momentum</p><h2>Chat acceleration</h2></div><p>Last 7 days compared with the preceding 23 days</p></div>
          <div className={styles.accelerationCard}>
            <div><span className={styles.accelerationNumber}>↑ {highlights.acceleration[1].change}%</span><strong>Laughs are arriving faster</strong><p>The closer the trip gets, the livelier the chat becomes.</p></div>
            <div className={styles.accelerationGrid}>{highlights.acceleration.map((item) => <motion.div key={item.label} initial={reduceMotion ? false : { opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><strong>+{item.change}%</strong><span>{item.label}</span></motion.div>)}</div>
          </div>
        </section>
        <section className={styles.highlightsSection}>
          <div className={styles.sectionHeading}><div><p className="text-xs font-black uppercase tracking-[.2em] text-bourbon-rust">Unofficial titles</p><h2>Chat Reps</h2></div><p>Three highly scientific personality assessments</p></div>
          <div className={styles.chatRepsGrid}>{highlights.chatReps.map((item, index) => <motion.article className={styles.chatRepCard} key={item.title} initial={reduceMotion ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .08 }}><span>0{index + 1}</span><p>{item.title}</p><h3>{item.person}</h3><strong>{item.value}</strong><small>{item.caption}</small></motion.article>)}</div>
        </section>
        <section className={styles.highlightsSection}>
          <div className={styles.sectionHeading}><div><p className="text-xs font-black uppercase tracking-[.2em] text-bourbon-rust">Special awards</p><h2>More ways to win</h2></div></div>
          <div className={styles.awardsGrid}>
            <article><span>🦋</span><div><small>Reaction social butterfly</small><strong>{socialButterfly.person}</strong><p>{socialButterfly.value} members supported</p></div></article>
            <article><span>❤️</span><div><small>Most lovable</small><strong>{mostLovable.person}</strong><p>{mostLovable.value} loves received</p></div></article>
            <article><span>✍️</span><div><small>Official editor</small><strong>{officialEditor.person}</strong><p>{officialEditor.value} pen reactions</p></div></article>
          </div>
        </section>
      </div>
    </section>
  )
}
