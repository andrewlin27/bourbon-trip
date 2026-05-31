const ITINERARY = [
  {
    day: 'Friday, Aug 21',
    subtitle: 'Louisville',
    stops: [
      { time: '4:00 PM', name: 'Old Forester' },
      { time: '9:00 PM', name: 'Whiskey Thief' },
    ],
  },
  {
    day: 'Saturday, Aug 22',
    subtitle: 'Frankfort',
    stops: [
      { time: '10:30 AM', name: 'Buffalo Trace' },
      { time: '1:30 PM', name: "Glenn's Creek" },
      { time: '3:15 PM', name: 'Woodford Reserve' },
    ],
  },
  {
    day: 'Sunday, Aug 23',
    subtitle: 'Bardstown',
    stops: [
      { time: '10:00 AM', name: "Maker's Mark" },
      { time: '12:30 PM', name: 'Bardstown Bourbon' },
      { time: '2:15 PM', name: 'Heaven Hill' },
    ],
  },
]

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
              <div key={stop.name} className="flex items-center px-4 py-3 gap-4">
                <span className="text-xs font-mono text-stone-400 w-16 shrink-0">
                  {stop.time}
                </span>
                <span className="text-stone-800 font-medium text-sm">{stop.name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
