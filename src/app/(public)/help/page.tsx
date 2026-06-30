export default function HelpPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <p className="text-bourbon-amber text-xs font-semibold uppercase tracking-widest mb-1">How it works</p>
        <h1 className="font-serif text-3xl font-bold text-bourbon-dark">Rules</h1>
      </div>

      <div className="prose prose-stone max-w-none space-y-8 text-sm text-stone-700">
        <section>
          <h2 className="font-serif text-xl font-bold text-bourbon-dark mb-3">Point System</h2>
          <p className="mb-4">Each team earns points through events before and during the trip. Point values are as follows:</p>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-bourbon-amber mb-2">Alumni Retreat</p>
              <ul className="space-y-1">
                <li className="flex items-start gap-2 text-sm text-stone-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-bourbon-amber shrink-0 mt-1.5" />
                  <span>
                    Beer olympics (3 pts per event)
                    <ul className="mt-1 space-y-0.5">
                      {['Rage cage', 'Shotgun relay', 'Flip cup', 'Tallest tower'].map((game) => (
                        <li key={game} className="flex items-center gap-2 text-stone-700">
                          <span className="w-1 h-1 rounded-full bg-bourbon-amber shrink-0" />
                          {game}
                        </li>
                      ))}
                    </ul>
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm text-stone-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-bourbon-amber shrink-0 mt-1.5" />
                  <span>
                    Trivia night (2 pts per category)
                    <ul className="mt-1 space-y-0.5">
                      {['ACE history', 'Sports', 'Science & nature', 'Geography'].map((cat) => (
                        <li key={cat} className="flex items-center gap-2 text-stone-700">
                          <span className="w-1 h-1 rounded-full bg-bourbon-amber shrink-0" />
                          {cat}
                        </li>
                      ))}
                    </ul>
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-bourbon-amber mb-2">During the Trip</p>
              <ul className="space-y-1">
                {['Correctly answering a guide\'s question (1 pt)', 'Guide compliments one\'s knowledge (3 pts)', 'Ask a guide to ask us a question after each distillery; correctly answer (2 pts)', 'Funny moment (2 pts)'].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-stone-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-bourbon-amber shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
                <li className="flex items-start gap-2 text-sm text-stone-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-bourbon-amber shrink-0 mt-1.5" />
                  <span>
                    Legendary moment (3pts)
                    <ul className="mt-1 space-y-0.5">
                      {['Great speech', 'Incredible photo', 'Hilarious quote', 'Recruiting neutral parties at bars'].map((method) => (
                        <li key={method} className="flex items-center gap-2 text-stone-700">
                          <span className="w-1 h-1 rounded-full bg-bourbon-amber shrink-0" />
                          {method}
                        </li>
                      ))}
                    </ul>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-bourbon-dark mb-3">Post-Season Awards</h2>
          <p className="mb-3">
            Voted on after the trip — these don&apos;t count towards team total points.
          </p>
          <ul className="space-y-2">
            {[
              ['MVP', 'Most enhanced the overall trip through contribution, entertainment, and performance.'],
              ['Bus MVP', 'Most enhanced the bus experience; turned transportation time into part of the trip.'],
              ['All-Bourbon First Team', 'The best bourbon connoisseurs of the trip.'],
              ['Committee of the Year', undefined],
              ['Best Outfit', undefined],
              ['Biggest Liability', undefined],
            ].map(([title, desc]) => (
              <li key={title} className="flex gap-2 list-none">
                <span className="text-bourbon-amber font-semibold shrink-0">·</span>
                <span>
                  <span className="font-semibold text-stone-800">{title}</span>
                  {desc && ` — ${desc}`}
                </span>
              </li>
            ))}
            <li className="flex gap-2 list-none">
              <span className="text-bourbon-amber font-semibold shrink-0">·</span>
              <span>
                <span className="font-semibold text-stone-800">Rookie of the Year</span>
                {' — Most improved non-bourbon enthusiast.'}
                <span className="text-stone-500"><br></br>Eligible: Brandon Turnage, Eric McGonagle, Jess Holbert, Joseph Valenta, Juan Ardila, Juan Nerio, Kyle Dessens, Lucas Giammona, Nafi Islam, Nick Caso, Scott Trouy.</span>
              </span>
            </li>
          </ul>
        </section>

        {/* <section>
          <h2 className="font-serif text-xl font-bold text-bourbon-dark mb-3">Team Selection</h2>
          <p>
            On your profile, select your team preference of Team Lin, Team Ditty, or neither. Then optionally
            send requests to package with friends. You can only be in a maximum of one group package. Teams will 
            be manually selected by the captains based on everyone&apos;s
            preference. The players essentially choose their own fate. All revealed at Alumni Retreat.
          </p>
        </section> */}

        <section>
          <h2 className="font-serif text-xl font-bold text-bourbon-dark mb-3">Committees</h2>
          <p className="mb-3">
            Everyone not a captain must be in a committee. These committees ensure everyone has a contributing
            role in the overall trip.
          </p>
          <ul className="space-y-2">
            {[
              ['Lead (2)', 'Each team has one lead member to make group decisions and represent their team in events. \
                They are also responsible for incrementing their team\'s score on the website.'],
              ['Food (3)', 'Decide where to eat lunch/dinners and how to split the group, if necessary. \
                Note that our AirBnB has a grill in the backyard.'],
              ['Media (3)', 'Keep the shared Instagram account active and take pics/videos for the YouTube video afterwards. \
                Film interviews throughout the retreat and trip.'],
              ['Venmo Logging (2)', 'Keep receipts for all group purchases and log them in the Venmo group.'],
              ['Uber/Lyft (3)', 'Order rideshare. For 18 people we should only need three UberXL\'s at most (up to 6 each).'],
              ['Navigation & Crowd Control (3)', 'Guide the group to our next destinations. Also responsible for gathering everyone for transportation.'],
            ].map(([title, desc]) => (
              <li key={title} className="flex gap-2 list-none">
                <span className="text-bourbon-amber font-semibold shrink-0">·</span>
                <span><span className="font-semibold text-stone-800">{title}</span> — {desc}</span>
              </li>
            ))}
          </ul>
        </section>

      </div>
    </div>
  )
}
