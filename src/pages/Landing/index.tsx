import { useNavigate } from 'react-router-dom'
import { KageLandingPage } from '@designcodeio/threeui'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="bg-black">
      {/* Fixed-height hero section: the Kage frame needs an ancestor with an
          explicit (not just min-) height for its 100% CSS sizing to resolve. */}
      <div className="relative h-screen w-full overflow-hidden bg-black">
        {/* Immersive Kage scene — the exact, unmodified registered ThreeUI component. */}
        <KageLandingPage
          headingFont="onest"
          bodyFont="onest"
          headingWeight="400"
          bodyWeight="300"
          primaryColor="#e0231c"
          headingSize={46}
          bodySize={17}
          headingLetterSpacing={-0.012}
          className="h-full"
        />

        {/* HumanizeAI product overlay. Positioned above the Kage frame, pointer
            events only on the interactive controls so the underlying scene's
            scroll/drag interactions are never blocked. */}
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
          <div className="flex flex-1 flex-col items-start justify-center px-6 sm:px-12 lg:px-20">
            <div className="pointer-events-auto max-w-xl">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#e0231c]">
                HumanizeAI
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/humanize')}
                  className="rounded-full bg-[#e0231c] px-7 py-3 text-sm font-medium text-white shadow-[0_0_30px_rgba(224,35,28,0.35)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
                >
                  Humanize Content
                </button>
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                  className="rounded-full border border-white/20 px-7 py-3 text-sm font-medium text-white/90 backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/5"
                >
                  See How It Works
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section
        id="how-it-works"
        className="relative z-10 border-t border-white/10 bg-black px-6 py-24 sm:px-12 lg:px-20"
      >
        <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-3">
          {[
            {
              step: '01',
              title: 'Paste or upload',
              body: 'Bring in text, TXT, DOCX, PDF or PPTX. Code stays protected by default.',
            },
            {
              step: '02',
              title: 'Choose a level',
              body: 'Light to Professional — the engine adapts tone while preserving facts and structure.',
            },
            {
              step: '03',
              title: 'Review and export',
              body: 'Compare original and humanized side by side, then download in your format.',
            },
          ].map((s) => (
            <div key={s.step}>
              <span className="text-xs font-medium tracking-[0.2em] text-[#e0231c]">{s.step}</span>
              <h3 className="mt-3 font-editorial text-xl text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
