// content/l9.js
// Chapter 9 of the exam script: "The Big Picture: How Everything Connects"
// (printed pages 83-90). This is the payoff chapter: it has no lecture deck
// and no Appendix A section of its own, because its job is to look back
// across the seven lectures that came before the final project and say what
// they were, together, secretly about. Sections follow the script's own
// order: 9.1 the spine, 9.2 the four recurring ideas, 9.3 the pipeline read
// forwards and backwards, 9.4 the one-sentence summaries.
//
// Every item here that touches ground already covered by another chapter is
// deliberately not a restatement of it. Several of the closest calls:
//   - l5-simulation-lod-tradeoff already names bias-variance's "four
//     costumes"; the items below add the shared arithmetic and a diagnostic,
//     not another listing of the four.
//   - l6-handshake-as-contract already ties the ADC handshake to the
//     project's MVVM contract; the item below is the different claim that
//     the course's own seven-lecture structure is itself an instance of the
//     same discipline.
//   - l4-spectral-overlap-motivates-decomposition already ties L4's
//     decomposition to L2's "no filter can fix an overlap" limit; the item
//     below is the complete three-point enumeration and the recoverability
//     argument for why only those three are permanent, which no single
//     chapter states from inside itself.
//
// Plain browser script: no imports, no exports. It pushes onto the LECTURES
// array declared in content.js.

LECTURES.push({
  id: 9,
  name: 'The Big Picture: How Everything Connects',
  shortName: 'Big Picture',
  sections: [
    {
      heading: 'The spine: one object, seen five times',
      items: [
        {
          id: 'l9-spine-object',
          type: 'definition',
          term: 'The unifying object of the module',
          body: 'Every lecture in the module is ultimately about one object: an array of numbers with a sampling rate attached. Everything upstream of that array explains where it came from and what it can be trusted to mean; everything downstream explains what you may legitimately do with it.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l9-lecture1-gives-meaning',
          type: 'fact',
          term: 'What Lecture 1 contributes to the array',
          body: 'Lecture 1 gives the array physical meaning: forces, torques and levers are why the muscle contracted, and why the number that eventually gets plotted is proportional to something a physiotherapist cares about. Without this layer an "activation index" is a number with no referent.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l9-lecture4-gives-generator',
          type: 'fact',
          term: 'What Lecture 4 contributes to the array',
          body: 'Lecture 4 gives the array a generator: it is the algebraic sum of motor-unit action potential trains. That single fact explains why it looks random, why RMS rather than peak is the right amplitude descriptor, why its spectrum is a hump rather than a set of lines, and why the spectrum shifts down in frequency as the muscle fatigues.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l9-lecture67-give-provenance',
          type: 'fact',
          term: 'What Lectures 6 and 7 contribute to the array',
          body: 'Lectures 6 and 7 give the array a provenance: electrode, amplifier, RC filter, sample-and-hold, converter, serial link, and every one of those blocks stamps itself onto the numbers. The amplifier gain sets the effective LSB, the anti-aliasing cut-off sets which frequencies survived, the bit depth sets the noise floor, and the multiplexer sets the per-channel rate.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l9-lecture2-gives-rules',
          type: 'fact',
          term: 'What Lecture 2 contributes to the array',
          body: 'Lecture 2 gives the array its rules. Nyquist says whether the array still contains the signal at all; quantisation says the smallest change it can express; RMS, ARV, the envelope, the FFT, Welch and the mean frequency are the legitimate summaries of it; and causality says which of those summaries may be computed in real time.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l9-lecture3-gives-operations',
          type: 'fact',
          term: 'What Lecture 3 contributes to the array',
          body: 'Lecture 3 gives the array its operations. Every algorithm ever run on it — smoothing, filtering, feature extraction, classification, decoding — decomposes into exactly three: the dot product, the matrix product and convolution.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l9-lecture5-gives-alternative',
          type: 'fact',
          term: 'What Lecture 5 contributes when there is no array',
          body: 'Lecture 5 gives the array an alternative: when there is no sensor and therefore no array, you simulate instead, and immediately face the identical trade-off restated in different words — level of detail in place of window length, but still detail against stability.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'Four ideas that recur in every lecture',
      items: [
        {
          id: 'l9-bias-variance-shared-arithmetic',
          type: 'fact',
          term: 'Why the bias–variance costumes are one trade-off, not four',
          body: 'In every appearance — the envelope window, the Welch segment, the convolution kernel length, the simulation level of detail — the knob controls how many samples or elements get pooled together. Pooling more lowers variance because averaging narrows the spread of the estimate, but raises bias because the pooled region now spans a stretch where the true value was not constant; that single piece of arithmetic, not four separate coincidences, is why the same question keeps reappearing in a new costume.',
          formula: null,
          symbols: null,
          crossRef: ['bias-variance']
        },
        {
          id: 'l9-bias-variance-diagnostic',
          type: 'distinction',
          term: 'Diagnosing which side of the trade-off you are on',
          body: 'A result that is jagged and unrepeatable from run to run is variance-limited: pool more. A result that is systematically smeared, delayed or too coarse to show a real feature is bias-limited: pool less. Every costume in the module fails in exactly one of these two directions at a time, never both, which is what makes the one-line differential diagnosis transfer to a costume the exam invents that was never on any lecture’s own list.',
          formula: null,
          symbols: null,
          crossRef: ['bias-variance']
        },
        {
          id: 'l9-convolution-cnn',
          type: 'fact',
          term: 'A CNN is the same operation with a learned kernel',
          body: 'Every other appearance of y = x * h in the module uses a kernel the designer chose by formula: a uniform moving average, a Hanning window, an RC network’s exponential decay. A convolutional neural network’s layer is the identical operation with the kernel’s numbers learned from data instead — the same sliding dot product, only the source of the weights differs.',
          formula: null,
          symbols: null,
          crossRef: ['convolution']
        },
        {
          id: 'l9-convolution-pitfalls-transfer',
          type: 'fact',
          term: 'Convolution facts transfer to costumes they were never stated for',
          body: 'Because the digital moving average, the RC filter and the EMG generation model are literally the same operation, a rule learned in one costume holds in the others without restatement: the boundary-mode choice that matters for np.convolve is the same edge effect an RC filter shows on power-up, and forgetting to normalise a kernel breaks the moving-average envelope for exactly the reason it would break any other convolution.',
          formula: null,
          symbols: null,
          crossRef: ['convolution']
        },
        {
          id: 'l9-three-losses-and-why-only-three',
          type: 'distinction',
          term: 'Information is destroyed at exactly three places, and everywhere else is recoverable',
          body: 'Only three points in the whole acquisition chain destroy information irreversibly: aliasing at the sampler, quantisation at the converter, and overlap in frequency at the filter, each preventable or mitigable only before it happens rather than after. Every other stage is a re-encoding rather than a loss: gain is an invertible multiplication as long as the signal stays inside the converter’s range, the storage format is a re-encoding of the same numbers, and offline filtering can always be redone from the untouched raw array — which is exactly why the three permanent losses are worth memorising by name and the rest are not.',
          formula: null,
          symbols: null,
          crossRef: ['information-loss']
        },
        {
          id: 'l9-course-structure-is-separation-of-concerns',
          type: 'distinction',
          term: 'The seven-lecture structure is itself separation of concerns',
          body: 'The reason Lecture 1 can be understood without Lecture 4, and Lecture 4 without Lecture 6, is not accidental: the module is organised so that each lecture owns exactly one layer of the array’s life — meaning, generation, provenance, rules, operations, or an alternative to sensing altogether — and does not need any other layer’s internals to be correct within its own. The same discipline that keeps the amplifier ignorant of the converter’s logic (L6) and the View ignorant of the socket (L8) is why this course’s own map in Figure 9.1 works as a map at all.',
          formula: null,
          symbols: null,
          crossRef: ['separation-of-concerns']
        }
      ]
    },

    {
      heading: 'Reading the pipeline in both directions',
      items: [
        {
          id: 'l9-forwards-chain',
          type: 'fact',
          term: 'Forwards: from motoneuron to pixel',
          body: 'A motoneuron discharges, every fibre of its motor unit depolarises, and the resulting action potentials propagate towards the tendons at roughly 4 m/s; an electrode picks up the algebraic sum of every active unit’s contribution at the skin. An instrumentation amplifier raises microvolts to volts, a passive RC network band-limits the signal, a sample-and-hold freezes the voltage, and a SAR converter turns it into a number obeying Nyquist and rounded to one LSB. A serial link carries the bits to a host, which packs many channels of samples into a byte frame on a TCP stream, and the client reassembles it, band-passes and computes an RMS envelope, then draws the result on screen at a fixed refresh rate.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l9-forwards-two-convolutions',
          type: 'fact',
          term: 'The client-side pipeline runs on two convolutions',
          body: 'The two operations the client applies to every incoming packet — band-pass filtering and computing an RMS envelope — are both convolutions of the buffered signal with a kernel, one an approximately rectangular impulse response and the other a moving-average window. Recognising both as y = x * h is what makes the client’s per-packet cost predictable rather than mysterious.',
          formula: null,
          symbols: null,
          crossRef: ['convolution']
        },
        {
          id: 'l9-backwards-principle',
          type: 'distinction',
          term: 'Backwards: from a wrong number to its cause',
          body: 'Running the chain in reverse is a debugging discipline: a flat trace suspects the buffer never being filled, a scrambled trace suspects packet boundaries being assumed rather than checked, and a baseline that wanders suspects drift or motion at the electrode. Each symptom names a stage, and each stage names the lecture that explains it — the real value of the map in Figure 9.1 is that it turns "the number looks wrong" into "which stage", rather than a guess.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l9-backwards-aliasing-symptom',
          type: 'fact',
          term: 'A symptom that moves with fₛ points at the sampler, not later',
          body: 'If a high-frequency-looking component appears or shifts whenever the sampling rate is changed, the cause is aliasing at the sampler, because that is the only stage in the chain where the choice of fₛ determines what content is even present in the array. No downstream fix — filtering, more bits, a different window — can address a symptom created here, since the fold happened before any of those stages ever saw the data.',
          formula: null,
          symbols: null,
          crossRef: ['information-loss']
        },
        {
          id: 'l9-backwards-gain-symptom',
          type: 'fact',
          term: 'A visibly stepped amplitude points at insufficient gain, not resolution',
          body: 'If a trace looks quantised into visible steps, the usual cause is not too few bits at the converter but too little gain in front of it: the signal spans only a handful of LSBs, so q_eff = q/A is too large. Reading the symptom backwards this way explains why raising the amplifier gain, not swapping to a higher-resolution converter, is usually the first thing to try.',
          formula: null,
          symbols: null,
          crossRef: ['information-loss']
        },
        {
          id: 'l9-backwards-event-loop',
          type: 'fact',
          term: 'A frozen GUI is the software form of reading before ready',
          body: 'A GUI that freezes when the user presses "Connect" is blocking the same Qt event loop that would otherwise deliver the signal telling the interface a new packet has arrived — the software counterpart of reading the converter’s data line before its status line says the result is ready. Both failures come from the same cause, ignoring the handshake that says when it is safe to read, and both produce a fault that is intermittent rather than a fault that is total.',
          formula: null,
          symbols: null,
          crossRef: ['separation-of-concerns']
        }
      ]
    },

    {
      heading: 'The one-sentence summary of each lecture',
      items: [
        {
          id: 'l9-summary-l1',
          type: 'fact',
          term: 'Lecture 1 in one sentence',
          body: 'Muscles produce forces whose torques move levers; the lever arm, not the force, is what usually decides the outcome.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l9-summary-l2',
          type: 'fact',
          term: 'Lecture 2 in one sentence',
          body: 'A continuous signal becomes an array through sampling and quantisation; time-domain, frequency-domain and filtering tools then describe it, subject to Nyquist.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l9-summary-l3',
          type: 'fact',
          term: 'Lecture 3 in one sentence',
          body: 'Dot product, matrix product and convolution are the three operations from which every algorithm in the module is built.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l9-summary-l4',
          type: 'fact',
          term: 'Lecture 4 in one sentence',
          body: 'The EMG is the convolutive sum of motor-unit action potential trains, and it can be decomposed back into the spike trains that generated it.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l9-summary-l5',
          type: 'fact',
          term: 'Lecture 5 in one sentence',
          body: 'When you must simulate rather than measure, spend fidelity where it is observable and approximate everywhere else.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l9-summary-l6',
          type: 'fact',
          term: 'Lecture 6 in one sentence',
          body: 'An ADC never measures a voltage; it asks a sequence of comparator questions, and you must not read the answer before it says it is ready.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l9-summary-l7',
          type: 'fact',
          term: 'Lecture 7 in one sentence',
          body: 'The same theory in your hand: six functions, an RC filter, PWM instead of a DAC, and a serial line for everything you cannot see.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l9-summary-project',
          type: 'fact',
          term: 'The final project in one sentence',
          body: 'Software that carries the array from the socket to the screen without letting any layer know more than it should.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    }
  ]
});
