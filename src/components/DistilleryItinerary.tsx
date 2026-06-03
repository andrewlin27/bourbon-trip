const ITINERARY = [
  {
    day: 'Friday, Aug 21',
    subtitle: 'Louisville',
    stops: [
      { time: '4:00 PM', name: 'Old Forester', address: '119 W Main St, Louisville, KY 40202' },
      { time: '9:00 PM', name: 'Whiskey Thief', address: '283 Crab Orchard Rd, Frankfort, KY 40601' },
    ],
  },
  {
    day: 'Saturday, Aug 22',
    subtitle: 'Frankfort',
    stops: [
      { time: '10:30 AM', name: 'Buffalo Trace', address: '113 Great Buffalo Trace, Frankfort, KY 40601' },
      { time: '1:30 PM', name: "Glenn's Creek", address: '3501 McCracken Pike, Frankfort, KY 40601' },
      { time: '3:15 PM', name: 'Woodford Reserve', address: '7785 McCracken Pike, Versailles, KY 40383' },
    ],
  },
  {
    day: 'Sunday, Aug 23',
    subtitle: 'Bardstown',
    stops: [
      { time: '10:00 AM', name: "Maker's Mark", address: '3350 Burkes Spring Rd, Loretto, KY 40037' },
      { time: '12:30 PM', name: 'Bardstown Bourbon', address: '1500 Parkway Dr, Bardstown, KY 40004' },
      { time: '2:15 PM', name: 'Heaven Hill', address: '1311 Gilkey Run Rd, Bardstown, KY 40004' },
    ],
  },
]

function mapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

export default function DistilleryItinerary() {
  return (
    <div className="space-y-6">
      {ITINERARY.map((day) => (
        <div key={day.day} className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="bg-bourbon-amber px-4 py-3">
            <p className="font-serif font-bold text-white">{day.day}</p>
            <p className="text-white/80 text-xs">{day.subtitle}</p>
          </div>
          <div className="divide-y divide-stone-100">
            {day.stops.map((stop) => (
              <div key={stop.name} className="flex items-start px-4 py-3 gap-4">
                <span className="text-xs font-mono text-stone-400 w-16 shrink-0">
                  {stop.time}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-stone-800 font-medium text-sm">{stop.name}</p>
                  <p className="text-stone-400 text-xs mt-0.5 leading-snug">{stop.address}</p>
                </div>
                <a
                  href={mapsUrl(stop.address)}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 border border-stone-200 text-stone-500 hover:text-bourbon-rust hover:border-bourbon-amber/50 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors"
                >
                  Maps
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
