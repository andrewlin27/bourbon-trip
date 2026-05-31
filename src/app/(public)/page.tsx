import CountdownTimer from '@/components/CountdownTimer'
import DistilleryItinerary from '@/components/DistilleryItinerary'
import DistilleryMap from '@/components/DistilleryMap'

export default function LandingPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-12">
      {/* Hero */}
      <section className="text-center space-y-2">
        <p className="text-bourbon-amber text-sm font-semibold uppercase tracking-widest">
          August 21–23, 2026
        </p>
        <h1 className="font-serif text-4xl font-bold text-bourbon-dark">
          ACE Bourbon Trip
        </h1>
        <p className="text-stone-500 text-sm">Kentucky Bourbon Trail · Team Lin vs. Team Ditty</p>
      </section>

      {/* Countdown */}
      <section className="bg-bourbon-dark rounded-2xl px-6 py-8 text-center space-y-3">
        <p className="text-bourbon-cream text-sm font-medium uppercase tracking-widest">
          Alumni Retreat Countdown
        </p>
        <p className="text-bourbon-cream/60 text-xs">June 27, 2026 · 12:00 PM CST · Kyle&apos;s Ranch</p>
        <CountdownTimer targetISO="2026-06-27T18:00:00.000Z" />
        <p className="text-bourbon-cream/50 text-xs mt-2">Teams revealed at Alumni Retreat</p>
      </section>

      {/* Itinerary */}
      <section>
        <h2 className="font-serif text-2xl font-bold text-bourbon-dark mb-5">
          Distillery Itinerary
        </h2>
        <DistilleryItinerary />
      </section>

      {/* Map */}
      <section>
        <h2 className="font-serif text-2xl font-bold text-bourbon-dark mb-5">
          The Trail
        </h2>
        <DistilleryMap />
      </section>

    </div>
  )
}
