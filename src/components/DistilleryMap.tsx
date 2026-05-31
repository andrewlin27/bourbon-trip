export default function DistilleryMap() {
  return (
    <div className="rounded-xl overflow-hidden border border-stone-200 shadow-sm">
      <iframe
        src="https://www.google.com/maps/d/u/0/embed?mid=18eETK-W2bt4-s9ju4Uxc6e0SeBHcuy4&ehbc=2E312F&noprof=1"
        width="640"
        height="480"
        className="w-full"
        loading="lazy"
        title="ACE Bourbon Trip Distilleries"
      />
    </div>
  )
}
