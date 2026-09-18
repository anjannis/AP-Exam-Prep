// questions/l2.js
// Question bank for Chapter 2. 20 questions, 12 mc / 8 short (ratio 0.60).
// The eight short answers are the script's own end-of-chapter exam questions,
// in the course's wording, with model answers a marker would accept.
//
// Answer-key hygiene, enforced by checkAnswerBalance and checkOptionLengthBias
// in tools/validate.js: correctIndex is spread three each across 0-3, and the
// four options of every question are written to comparable length so that
// neither position nor length signals the answer. Explanations quote option
// text rather than option numbers, so they survive any later reordering.
//
// Plain browser script: no imports, no exports. It pushes onto the QUESTIONS
// array declared in questions.js.

QUESTIONS.push(
  {
    id: 'l2-001',
    lecture: 2,
    topic: 'aliasing',
    mode: 'mc',
    question: 'Why must anti-aliasing filtering happen in analog hardware, before the ADC, rather than in software afterwards?',
    options: [
      'A digital low-pass cannot be made steep enough to reject everything above half of the sampling rate',
      'A software filter cannot be made to run fast enough to keep pace with the converter at the sampling rate',
      'The converter itself adds a phase distortion that only an analog filter placed ahead of it can correct',
      'Once sampled, aliased content is indistinguishable from genuine signal, so no later filter separates it'
    ],
    correctIndex: 3,
    answer: 'Aliasing folds everything above f_s/2 down into the band of interest at the moment of sampling. After that the aliased energy occupies the same frequencies as genuine signal, so it is not separable by any filter of any order, however steep or however fast. The only prevention is to remove those frequencies before the sampler sees them, which means analog.',
    contentRef: 'l2-antialiasing-analog'
  },

  {
    id: 'l2-002',
    lecture: 2,
    topic: 'aliasing',
    mode: 'mc',
    question: 'A colleague sends you run.npy containing nothing but the samples of an sEMG recording. What does the missing sampling rate cost you?',
    options: [
      'Rectifying and averaging still work, but no time axis in seconds or frequency axis in hertz can be labelled',
      'Nothing is lost, because NumPy stores the sampling rate in the array’s dtype metadata when the file is written',
      'Neither RMS nor ARV can be computed any more, because both are defined as averages taken per unit of time',
      'Neither filtfilt nor lfilter will run, because SciPy reads the sampling rate from the array that it is given'
    ],
    correctIndex: 0,
    answer: 'The array carries values only; f_s is metadata that lives outside it. Sample-index operations such as rectification, RMS and ARV still work, because none of them refers to time. What fails is labelling: t = n/f_s and the bin-to-hertz mapping k·f_s/N both need f_s, so no timing or spectral result can be given units. No NumPy dtype carries such a field, and SciPy takes fs as an argument rather than reading it from the data. Hence the rule: np.savez("run01.npz", x=x, fs=fs).',
    contentRef: 'l2-fs-metadata'
  },

  {
    id: 'l2-003',
    lecture: 2,
    topic: 'spectra',
    mode: 'mc',
    question: 'You take a single FFT of a two-second sEMG record and get a jagged spectrum. You repeat the recording under identical conditions and the spectrum is visibly different, though the same overall shape shows through. What does this tell you?',
    options: [
      'The sampling rate is too low, so content above f_s/2 is folding into the band and adding the roughness',
      'The record is too short: a longer epoch lowers the variance in each bin and would smooth the curve out',
      'sEMG is random, so one FFT is a single noisy estimate of a true spectrum; it must be averaged, not lengthened',
      'Leakage from the implicit rectangular window is smearing every peak, and a Hanning window would remove it'
    ],
    correctIndex: 2,
    answer: 'A deterministic tool applied to a random signal gives an answer that changes with every recording: the spectra of successive epochs are estimates, and each one is noisy. Lengthening the epoch buys finer resolution, Δf = 1/T_epoch, but the variance per bin does not improve, so "a longer epoch lowers the variance in each bin" is exactly backwards. Leakage is a real effect but a different one, and it would not change from run to run. Only averaging many segments — Welch’s method — reduces the variance.',
    contentRef: 'l2-random-tool-mismatch'
  },

  {
    id: 'l2-005',
    lecture: 2,
    topic: 'rms',
    mode: 'mc',
    question: 'Why is RMS, and not peak amplitude, the basis of every clinical activity index built on sEMG?',
    options: [
      'The peak is undefined for a random signal such as sEMG, so it cannot be computed in the first place',
      'RMS is the mean of the rectified signal, so it discards the sign and is insensitive to isolated noise spikes',
      'RMS is a fixed factor 0.707 of the peak, so it carries exactly the same information in a steadier unit',
      'For a zero-mean signal the RMS is the standard deviation, a stable estimate, while the peak is one sample'
    ],
    correctIndex: 3,
    answer: 'Two reasons converge on RMS, and the statistical one is the clinical one: sEMG is zero-mean because the amplifier is AC-coupled, so its RMS is the standard deviation σ, and σ grows with the number and firing rate of active motor units. The peak of a random signal is a single unlucky sample and is unstable from repetition to repetition. "The mean of the rectified signal" describes ARV, not RMS, and the 0.707 relation holds for a pure sinusoid only — for sEMG there is no fixed factor between peak and RMS at all.',
    contentRef: 'l2-why-rms'
  },

  {
    id: 'l2-006',
    lecture: 2,
    topic: 'rms',
    mode: 'mc',
    question: 'An sEMG envelope computed with a 400 ms moving average shows each burst beginning earlier and ending later than the raw signal does. What is the correct description of this effect?',
    options: [
      'High bias: a long window spreads an abrupt onset over its whole length, the price of the low variance it buys',
      'High variance: the window averages too few samples, so the trace wanders either side of the true onset time',
      'Aliasing: the smoothing has dropped the envelope’s effective sampling rate below twice its own bandwidth limit',
      'Causal group delay, which would disappear if the very same smoothing were applied with filtfilt instead'
    ],
    correctIndex: 0,
    answer: 'The window length is a bias–variance trade-off in disguise. A long window averages many samples, so variance is low, but a genuinely abrupt onset is smeared across the whole window — that smearing is bias. Note that it is symmetric, spreading the burst in both directions, so it is not causal lag: filtfilt has zero phase distortion and would not remove it. Nothing here concerns the sampling rate. About 25 ms is the clinical sweet spot for sEMG.',
    contentRef: 'l2-envelope-window'
  },

  {
    id: 'l2-007',
    lecture: 2,
    topic: 'causality',
    mode: 'short',
    question: 'You must compute an envelope of an sEMG signal for a real-time prosthesis controller. Which SciPy function do you use, and what is the consequence of that choice?',
    answer: 'lfilter, or an equivalent causal moving average, because only past samples exist in real time. The consequence is a group delay of roughly half the window length, which must be counted against the roughly 50 ms closed-loop latency budget. filtfilt is unusable here because it needs future samples.',
    contentRef: 'l2-causality'
  },

  {
    id: 'l2-008',
    lecture: 2,
    topic: 'causality',
    mode: 'mc',
    question: 'An offline figure must show muscle onset times without shifting them. Which choice is right, and for which reason?',
    options: [
      'lfilter, because one forward pass distorts the waveform less than running the filter twice over it does',
      'filtfilt, because running the filter twice halves its effective order and so reduces ringing at the edges',
      'filtfilt, because the forward and backward passes have equal and opposite phase distortion, which cancels',
      'lfilter with its group delay subtracted afterwards, the only route to genuinely zero phase distortion'
    ],
    correctIndex: 2,
    answer: 'filtfilt runs the filter forwards and then backwards; the two phase distortions are equal and opposite and cancel exactly, so edges are not shifted at all. It is legitimate here because the record is complete. "Halves its effective order" is the wrong mechanism with the right function — two passes double the effective order. Subtracting a measured group delay from an lfilter output is a real technique, but it is not the zero-phase method the chapter names, and it cannot recover what the causal filter has already smeared.',
    contentRef: 'l2-lfilter-vs-filtfilt'
  },

  {
    id: 'l2-009',
    lecture: 2,
    topic: 'spectra',
    mode: 'mc',
    question: 'A Welch spectrum of an sEMG recording shows a broad peak near 80 Hz. What may you legitimately conclude from it?',
    options: [
      'A population of motor units must be firing at a rate of roughly 80 impulses per second',
      'Most of the signal’s energy lies near 80 Hz; a spectrum reports energy, not what produced it',
      'The record contains a deterministic 80 Hz sinusoid, which can now be identified and subtracted',
      'The sampling rate was at least 160 Hz, since otherwise no peak could appear at that frequency'
    ],
    correctIndex: 1,
    answer: 'The sinusoids of a decomposition are mathematical abstractions — there is no neuron firing at 80 Hz. The spectrum reports how energy is distributed over frequency and says nothing about the generating mechanism. The remark about the sampling rate is a true statement about the recording, but it does not answer what the peak means; and there is no deterministic tone present to identify or subtract.',
    contentRef: 'l2-spectrum-not-mechanism'
  },

  {
    id: 'l2-010',
    lecture: 2,
    topic: 'spectra',
    mode: 'mc',
    question: 'Why multiply a record by np.hanning(N) before calling the FFT?',
    options: [
      'To strip out the DC component, so that bin 0 does not tower over the rest of the plotted spectrum',
      'To band-limit the record before it is transformed, so that Nyquist’s condition is satisfied by the data',
      'To pad the record out to a power-of-two length, which is what makes the fast transform actually fast',
      'Because taking a finite record is already a rectangular windowing, which smears peaks into neighbours'
    ],
    correctIndex: 3,
    answer: 'Taking a finite record is itself a multiplication by a rectangular window, and a rectangular window has abrupt edges whose spectrum leaks energy from a sharp peak into its neighbouring bins. A tapered window such as Hanning reduces that leakage. Nyquist is a property of the sampler and cannot be repaired at transform time; removing DC and padding to a power of two are separate, real concerns that do nothing about leakage.',
    contentRef: 'l2-spectral-leakage'
  },

  {
    id: 'l2-011',
    lecture: 2,
    topic: 'spectra',
    mode: 'short',
    question: 'Explain what Welch’s method does and what it costs.',
    answer: 'It splits the record into (usually overlapping) segments, windows and transforms each, and averages the resulting power spectra. This reduces the variance of the estimate roughly by the number of segments, giving a repeatable spectrum for a random signal. The cost is frequency resolution: Δf = 1/T_segment, and the segments are shorter than the whole record.',
    contentRef: 'l2-welch'
  },

  {
    id: 'l2-012',
    lecture: 2,
    topic: 'spectra',
    mode: 'mc',
    question: 'You halve nperseg in scipy.signal.welch while keeping the same record. What happens to the estimate?',
    options: [
      'Resolution coarsens to Δf = 1/T_seg, while variance per bin falls because twice as many segments average',
      'Resolution improves to Δf = 1/T_seg and variance per bin rises, since each FFT now sees fewer samples',
      'Resolution coarsens to Δf = 1/T_seg and variance per bin rises with it, since each FFT sees fewer samples',
      'Only the overlap between segments changes, since resolution is fixed by the record length and not nperseg'
    ],
    correctIndex: 0,
    answer: 'Segment length sets resolution and segment count together, in opposite directions. Halving nperseg halves T_seg, so Δf = 1/T_seg doubles — coarser, not finer — while N_seg doubles, so the variance, which falls as 1/N_seg, halves. The two near-misses that get the resolution right then invert the variance: a single short FFT is indeed noisier, but averaging twice as many of them more than compensates, and that is precisely what Welch buys. Resolution is set by the segment length, never by the length of the whole record.',
    contentRef: 'l2-welch-segment'
  },

  {
    id: 'l2-013',
    lecture: 2,
    topic: 'spectra',
    mode: 'short',
    question: 'Why does the mean frequency of the sEMG drop during a fatiguing contraction?',
    answer: 'Fatigue slows muscle-fibre conduction velocity. Slower propagation stretches each motor unit action potential in time; a waveform stretched in time is compressed in frequency; so the power spectrum shifts towards lower frequencies and its centroid falls.',
    contentRef: 'l2-mean-frequency'
  },

  {
    id: 'l2-014',
    lecture: 2,
    topic: 'aliasing',
    mode: 'mc',
    question: 'A 90 Hz sine is sampled at 100 Hz, and the plotted trace clearly shows a 10 Hz oscillation. What is the status of that 10 Hz trace?',
    options: [
      'A plotting artefact: the samples are correct, and a denser interpolation would redraw the 90 Hz wave',
      'It is the data: 90 Hz folded to 10 Hz at the sampler, and both signals give identical samples',
      'A leakage effect: the 90 Hz peak has smeared down into the low bins, and a Hanning window removes it',
      'A quantisation effect: the converter’s rounding error beats against the 90 Hz input to produce 10 Hz'
    ],
    correctIndex: 1,
    answer: 'Aliasing is a property of the sampler, not of the display. Content above f_s/2 is folded into the base band at the moment of sampling: a 90 Hz sine sampled at 100 Hz produces exactly the same sample values as a 10 Hz sine, so nothing downstream can tell them apart, because there is nothing left to tell apart. No interpolation, window or extra bit recovers the original. That irreversibility is why the anti-aliasing filter has to be analog and sit ahead of the converter.',
    contentRef: 'l2-aliasing'
  },

  {
    id: 'l2-015',
    lecture: 2,
    topic: 'filtering',
    mode: 'short',
    question: 'Why can a high-pass filter not remove a motion artefact?',
    answer: 'Because a motion artefact contains a sharp transient. A sharp edge has energy at all frequencies, including throughout the sEMG pass-band. A filter can only discriminate by frequency, so it removes the artefact’s low-frequency tail and leaves the in-band component untouched. Only better recording technique helps.',
    contentRef: 'l2-motion-artefact'
  },

  {
    id: 'l2-016',
    lecture: 2,
    topic: 'aliasing',
    mode: 'short',
    question: 'State Nyquist’s theorem and explain why an anti-aliasing filter must be analog and must sit before the converter.',
    answer: 'Perfect reconstruction requires f_s > 2 f_max, where f_max is the highest frequency present in the signal. Any content above f_s/2 is folded into the base band by the act of sampling and becomes indistinguishable from genuine low-frequency content. Since the folding happens during conversion, it must be prevented before conversion; a digital filter applied afterwards operates on already-corrupted samples and cannot separate them.',
    contentRef: 'l2-nyquist'
  },

  {
    id: 'l2-017',
    lecture: 2,
    topic: 'quantisation',
    mode: 'mc',
    question: 'A 12-bit A/D converter is specified as ±2.5 V. What is one LSB?',
    options: [
      'About 0.61 mV: the 2.5 V in the specification is the full-scale range, spread over 4 096 levels',
      'About 1.22 mV, and it is the largest input step the converter can follow from one sample to the next',
      'About 1.22 mV: the range spans 5 V across 4 096 levels, and each sample is rounded within half a step',
      'About 2.44 mV, because a signed converter spends one bit on the sign and leaves 2 048 magnitude levels'
    ],
    correctIndex: 2,
    answer: 'q = V_FS/2ⁿ, where V_FS is the whole span. A ±2.5 V converter spans 5 V, so q = 5 V/4 096 ≈ 1.22 mV, and round-to-nearest bounds each sample’s error at q/2 ≈ 0.61 mV. Reading the ±2.5 V as the full-scale range halves the span wrongly. No bit is spent on a sign: all 4 096 codes are available across the bipolar range. And the LSB is an amplitude resolution, not a limit on how fast the input may move between samples.',
    contentRef: 'l2-quantisation-step'
  },

  {
    id: 'l2-018',
    lecture: 2,
    topic: 'quantisation',
    mode: 'short',
    question: 'A 16-bit converter has a full-scale range of ±2.5 V and is preceded by an amplifier of gain 1000. What is the smallest voltage change at the electrode that the system can resolve?',
    answer: 'Full scale is 5 V, so q = 5/65 536 ≈ 76.3 µV at the converter input. Referred to the electrode, divide by the gain: 76.3 µV/1 000 ≈ 76 nV.',
    contentRef: 'l2-gain-and-bits'
  },

  {
    id: 'l2-019',
    lecture: 2,
    topic: 'rms',
    mode: 'mc',
    question: 'x is a zero-mean sEMG array. Which NumPy expression gives its RMS?',
    options: [
      'np.mean(np.sqrt(x**2)), which is the same computation with the square root moved inside the average',
      'np.sqrt(np.mean(x**2)), squaring first, then averaging, and only then taking the square root',
      'np.sqrt(np.mean(x)**2), which averages the samples first and then takes the root of that squared mean',
      'np.mean(np.abs(x))**2, the squared average rectified value, which restores the units of the signal'
    ],
    correctIndex: 1,
    answer: 'RMS = √(mean(x²)): square, then average, then take the root — np.sqrt(np.mean(x**2)). Moving the root inside is not the same computation: √(x²) is |x|, so np.mean(np.sqrt(x**2)) is the ARV, a different measure. Averaging before squaring gives the magnitude of the mean, which for zero-mean sEMG is approximately zero regardless of how strong the signal is. Squaring the ARV gives neither, and its units are those of power rather than amplitude.',
    contentRef: 'l2-rms'
  },

  {
    id: 'l2-020',
    lecture: 2,
    topic: 'adc',
    mode: 'short',
    question: 'Name the places in the acquisition chain where information is destroyed irreversibly, and state what prevents or limits each.',
    answer: 'The script counts three. Aliasing at the sampler: content above f_s/2 is folded into the base band and becomes indistinguishable from genuine signal, prevented only by an adequate f_s together with an analog anti-aliasing low-pass ahead of the converter. Quantisation at the converter: each sample is rounded to the nearest of 2ⁿ levels with an error of up to q/2, mitigated only by more bits or more gain in front, since q_eff = q/A. Overlap in frequency at the filter: once signal and noise share a band, no filter of any order can separate them, and only better recording technique helps. Everything else in the chain is recoverable — gain and scaling are invertible factors, the storage format is a re-encoding, and offline filtering can be redone from the raw array. The one caveat is that gain is an invertible factor only while the signal stayed inside the converter’s full-scale range: samples driven past it are clipped rather than rounded, and clipped samples are as irrecoverable as aliased ones.',
    contentRef: 'l2-acquisition-chain'
  },

  {
    id: 'l2-021',
    lecture: 2,
    topic: 'filtering',
    mode: 'mc',
    question: 'A motion artefact’s energy falls squarely inside the sEMG pass-band, and a colleague proposes going from a 4th-order to an 8th-order band-pass filter to remove it. What happens?',
    options: [
      'No filter order fixes it: once two contributions share a frequency band, that information is gone, and only better recording technique helps',
      'The steeper 8th-order filter removes the artefact almost completely, since it attenuates in-band noise far more than the 4th-order filter did',
      'The extra order only helps if the filter is run with filtfilt rather than lfilter, since the double pass supplies the missing rejection',
      'The artefact disappears, but a longer start-up transient appears at each end of the record and must be trimmed afterward'
    ],
    correctIndex: 0,
    answer: 'A filter separates signal from noise only by frequency; once the motion artefact’s energy occupies the same band as the sEMG itself, that information is already gone and no filter order, however steep, can separate them. The remedy is better recording technique — electrode preparation, cable strain relief, skin impedance — not a higher-order filter.',
    contentRef: 'l2-overlapping-bands'
  }
);
