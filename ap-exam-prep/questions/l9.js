// questions/l9.js
// Question bank for Chapter 9. 18 questions, 11 mc / 7 short (ratio 0.61).
// The seven short-answer questions are drawn from the script's own ten
// cross-lecture questions in section 9.5, in the course's wording, with
// model answers a marker would accept. The mc questions test the four
// recurring ideas (bias-variance, convolution, information-loss,
// separation-of-concerns), the spine, and the forwards/backwards reading of
// the pipeline.
//
// Answer-key hygiene, enforced by checkAnswerBalance and checkOptionLengthBias
// in tools/validate.js: correctIndex is spread across 0-3 with all four
// positions used, and options within a question are written to comparable
// length so neither position nor length signals the answer. Explanations
// quote option text rather than option numbers.
//
// Plain browser script: no imports, no exports. It pushes onto the QUESTIONS
// array declared in questions.js.

QUESTIONS.push(
  {
    id: 'l9-001',
    lecture: 9,
    topic: 'aliasing',
    mode: 'mc',
    question: 'An action potential propagates along a muscle fibre at roughly 4 m/s, and two surface electrodes are placed 5 mm apart along the fibre. To resolve the resulting propagation delay with several samples, what sampling rate does Lecture 1’s number force on Lecture 2’s choice?',
    options: [
      'On the order of kilohertz, since the 1.25 ms delay must span several sample intervals for the timing to be visible at all',
      'Exactly 2 kHz, because Nyquist requires twice the 1 kHz bandwidth typically assumed for sEMG regardless of electrode spacing',
      'On the order of hertz, since only the mean torque and activation level are ever computed from a delay this short',
      'Whatever rate the amplifier’s gain was calibrated at, because gain and sampling rate are fixed together at the factory'
    ],
    correctIndex: 0,
    answer: 'The delay is 5 mm / 4 m/s = 1.25 ms. If it is to be resolved rather than merely present, the delay must span several sample intervals, which forces sampling on the order of kilohertz. The constraint comes indirectly, through what you intend to compute: a slow quantity such as mean torque or activation level would need only a low rate, but conduction velocity does not.',
    contentRef: 'l9-forwards-chain'
  },

  {
    id: 'l9-002',
    lecture: 9,
    topic: 'spectra',
    mode: 'mc',
    question: 'A student band-pass filters sEMG at a pass-band only slightly wider than the signal’s own bandwidth, then tracks the mean frequency through a fatiguing contraction, and finds it barely moves. What is the most likely methodological explanation?',
    options: [
      'Mean frequency is undefined for a band-passed signal, so the number reported is meaningless in either direction',
      'The pass-band is narrow enough that the filter’s own shape, not the muscle’s physiology, now dominates the measured centroid',
      'Fatigue only ever shifts the peak frequency, never the centroid, so a stable mean frequency is the expected result',
      'The conduction velocity must already have reached its slowest possible value before the recording even began'
    ],
    correctIndex: 1,
    answer: 'The filter itself shapes the spectrum. If the pass-band is narrow relative to the signal’s own bandwidth, the centroid is dominated by the filter’s shape rather than by the signal’s, so a genuine physiological shift is compressed almost out of view. Comparing mean frequencies is only meaningful if the identical, sufficiently wide filter is applied to every condition.',
    contentRef: 'l9-lecture4-gives-generator'
  },

  {
    id: 'l9-003',
    lecture: 9,
    topic: 'bias-variance',
    mode: 'mc',
    question: 'A new sensor pipeline pools 50 consecutive frames of a noisy depth map before use, and a colleague worries this will blur fast-moving edges. Without knowing anything else about the sensor, what can you predict from the module’s bias–variance pattern alone?',
    options: [
      'Pooling that many frames removes noise for free, since only the window shape, not its length, ever affects blur',
      'Fifty frames is too few to matter either way; the trade-off in this module only appears above a few hundred samples',
      'Pooling that many frames will make the estimate noticeably less noisy, and it will smear fast motion in exchange — both are expected',
      'Pooling reduces blur as well as noise, because averaging more data always makes an estimate strictly more accurate'
    ],
    correctIndex: 2,
    answer: 'Every costume of this trade-off shares the same arithmetic: pooling more elements lowers variance because averaging narrows the spread, but raises bias because the pooled region now spans a stretch where the true value changes. Fifty frames is a lot of pooling, so both consequences should be expected together, regardless of what the sensor happens to measure.',
    contentRef: 'l9-bias-variance-shared-arithmetic'
  },

  {
    id: 'l9-004',
    lecture: 9,
    topic: 'bias-variance',
    mode: 'mc',
    question: 'Two RMS envelopes of the same sEMG burst are shown: one is jagged and changes shape on repetition of the contraction, the other is smooth but its onset visibly starts earlier than the raw burst does. What is wrong with each, in the module’s own terms?',
    options: [
      'Both are variance-limited; the fix in either case is a longer window, since variance always falls with length',
      'The jagged one is bias-limited from too long a window; the smooth one is variance-limited from too short a window',
      'Neither is a bias–variance symptom; the jaggedness is quantisation noise and the early onset is aliasing',
      'The jagged one is variance-limited and needs more pooling; the smooth one is bias-limited and needs less'
    ],
    correctIndex: 3,
    answer: 'A trace that is jagged and unrepeatable is variance-limited and calls for more pooling; a trace that is smooth but smears a real feature such as the onset time is bias-limited and calls for less. The two chapter-specific fixes are the same one-line rule read in two directions, and neither symptom here is quantisation or aliasing.',
    contentRef: 'l9-bias-variance-diagnostic'
  },

  {
    id: 'l9-005',
    lecture: 9,
    topic: 'convolution',
    mode: 'mc',
    question: 'What distinguishes a convolutional neural network’s convolution layer from the moving-average envelope, the RC low-pass filter and the EMG generation model, given that all four are described in this module as the same operation?',
    options: [
      'Only where the kernel’s numbers come from: learned from data for the CNN, chosen by a formula for the other three',
      'The CNN layer alone performs a true sliding dot product; the other three only approximate one with a fixed formula',
      'The CNN layer operates on images only, so it is a genuinely different operation from a 1D signal convolution',
      'The CNN layer cannot be written as y = x ∗ h, because its kernel changes from one input to the next'
    ],
    correctIndex: 0,
    answer: 'All four are the identical sliding dot product, y = x * h. The moving average, the RC filter and the EMG model each use a kernel fixed by a formula — uniform, exponential, or the MUAP shape — while the CNN layer uses a kernel whose numbers are learned from data instead. The operation itself does not change; only the source of the weights does.',
    contentRef: 'l9-convolution-cnn'
  },

  {
    id: 'l9-006',
    lecture: 9,
    topic: 'convolution',
    mode: 'mc',
    question: 'You already know that forgetting to normalise a moving-average kernel silently rescales an sEMG envelope. Why does this same worry apply, without new reasoning, to the RC low-pass filter of Lecture 7?',
    options: [
      'It does not apply: an RC filter is built from physical components, so its gain is fixed by hardware and cannot drift',
      'Because the RC filter is the identical operation, a convolution with a kernel, so an unnormalised kernel rescales its output too',
      'It applies only if the RC filter is simulated in SciPy rather than built as a real circuit, since only code can misnormalise it',
      'It applies only at DC, because normalisation is a statement about a kernel’s response at zero frequency alone'
    ],
    correctIndex: 1,
    answer: 'The moving average and the RC filter are the same operation, a convolution with a kernel of a particular shape. A rule that follows from the operation itself — an unnormalised kernel changes the output’s scale — therefore holds for both without being re-derived; recognising the shared operation is what makes the transfer automatic.',
    contentRef: 'l9-convolution-pitfalls-transfer'
  },

  {
    id: 'l9-007',
    lecture: 9,
    topic: 'quantisation',
    mode: 'mc',
    question: 'Which of the following is recoverable after the fact, unlike the module’s three permanent information losses?',
    options: [
      'Content above fₛ/2 that was folded down into the band of interest during sampling',
      'A sample that was rounded to the nearest of the converter’s available quantisation levels',
      'A gain that was set too low, provided the signal never left the converter’s full-scale range',
      'A noise source that shares its frequency band exactly with the signal it was recorded alongside'
    ],
    correctIndex: 2,
    answer: 'Gain is an invertible multiplication as long as the signal stayed within the converter’s range: dividing it back out afterwards recovers the original scale. Aliasing, quantisation and same-band overlap are the three losses that destroy information at the moment they happen, and nothing later in the pipeline can undo any of them.',
    contentRef: 'l9-three-losses-and-why-only-three'
  },

  {
    id: 'l9-008',
    lecture: 9,
    topic: 'aliasing',
    mode: 'mc',
    question: 'While debugging a live trace, you notice that a high-frequency-looking wiggle changes shape whenever you change the sampling rate in software, with no hardware changes at all. What does that single observation rule out?',
    options: [
      'It rules out aliasing specifically, since aliasing would look identical no matter what rate you chose afterwards',
      'It rules out quantisation, since quantisation error is independent of the sampling rate by definition',
      'It rules out nothing: a wiggle that depends on the chosen rate is exactly what a stable filtering artefact looks like',
      'It rules out every downstream cause: the fold already happened at the sampler before any of them could act'
    ],
    correctIndex: 3,
    answer: 'A symptom that moves with fₛ is the signature of the sampler stage: the fold happened there, before quantisation, before filtering, before anything downstream ever saw the data, so none of those later stages can be responsible. This is the one symptom in the diagnostic ladder that no amount of downstream fixing can address.',
    contentRef: 'l9-backwards-aliasing-symptom'
  },

  {
    id: 'l9-009',
    lecture: 9,
    topic: 'mvvm',
    mode: 'mc',
    question: 'Why can Lecture 4 be understood without having first read Lecture 6, even though both describe the same recorded array?',
    options: [
      'Each lecture owns one layer of the array’s life and does not depend on another layer’s internals to be correct within its own',
      'Lecture 6 is strictly optional background, added only for students who intend to build the hardware themselves',
      'The two lectures describe two different arrays that happen to share a name, so no dependency exists between them',
      'Lecture 4 was written before Lecture 6 existed in the module, so no dependency could have been designed in'
    ],
    correctIndex: 0,
    answer: 'The module is organised so that each lecture owns exactly one layer — meaning, generation, provenance, rules, operations — and can be read without the others’ internals, the same discipline that keeps the amplifier ignorant of the converter’s logic and the View ignorant of the socket. That is why the map in Figure 9.1 works as a map at all.',
    contentRef: 'l9-course-structure-is-separation-of-concerns'
  },

  {
    id: 'l9-010',
    lecture: 9,
    topic: 'filtering',
    mode: 'mc',
    question: 'A live sEMG trace shows a strong, steady component exactly at 50 Hz that was not present in a recording taken with the same hardware in a different room. Reading the diagnostic ladder backwards, what should you suspect first?',
    options: [
      'Aliasing, because 50 Hz is a plausible fold of some higher frequency the anti-aliasing filter let through',
      'Mains interference or a grounding problem, fixable with a notch filter or by improving the grounding',
      'A motion artefact, since any transient at the electrode has energy across the entire sEMG band',
      'Insufficient bit depth, because 50 Hz sits close to the noise floor of a low-resolution converter'
    ],
    correctIndex: 1,
    answer: 'A strong, steady line exactly at 50 Hz that changes with the room is the classic signature of mains interference or a grounding fault, and the diagnostic ladder’s remedy is a notch filter or better grounding, not a change to sampling, bit depth or anti-aliasing.',
    contentRef: 'l9-backwards-principle'
  },

  {
    id: 'l9-011',
    lecture: 9,
    topic: 'adc',
    mode: 'mc',
    question: 'Which one-sentence summary is Lecture 6’s own description of itself?',
    options: [
      'A continuous signal becomes an array through sampling and quantisation, described by time-domain and frequency-domain tools subject to Nyquist',
      'Software that carries the array from the socket to the screen without letting any layer know more than it should',
      'An ADC never measures a voltage; it asks a sequence of comparator questions, and you must not read the answer before it says it is ready',
      'The same theory in your hand: six functions, an RC filter, PWM instead of a DAC, and a serial line for everything you cannot see'
    ],
    correctIndex: 2,
    answer: 'Lecture 6’s own summary is that an ADC never measures a voltage directly; it asks a sequence of comparator questions and must not be read before it signals that the result is ready. The other three sentences summarise Lecture 2, the final project, and Lecture 7 respectively.',
    contentRef: 'l9-summary-l6'
  },

  {
    id: 'l9-012',
    lecture: 9,
    topic: 'quantisation',
    mode: 'short',
    question: 'Your sEMG amplifier has a gain of 1000 and feeds a 12-bit converter over ±5 V, sampling at 2 kHz. A colleague suggests raising the gain to 5000. What improves, and what new risk appears?',
    answer: 'The effective LSB referred to the electrode falls from about 2.44 µV to about 0.49 µV, so small signals are resolved better and quantisation noise drops. The risk is clipping: at 5000× gain the converter saturates at about ±1 mV at the electrode, so any larger burst or artefact is flattened and its waveform destroyed; amplifier and electrode noise are also amplified more, so beyond some point nothing further is gained.',
    contentRef: 'l9-backwards-gain-symptom'
  },

  {
    id: 'l9-013',
    lecture: 9,
    topic: 'causality',
    mode: 'short',
    question: 'Why does the same window length that gives a good envelope for offline figures give a sluggish prosthesis?',
    answer: 'Offline smoothing can be non-causal (filtfilt) and introduces no delay, whereas real-time smoothing must be causal and delays the output by roughly half the window. A 400 ms window that looks clean in a figure adds about 200 ms of lag, which is about four times the roughly 50 ms closed-loop latency budget and feels unresponsive.',
    contentRef: 'l9-bias-variance-diagnostic'
  },

  {
    id: 'l9-014',
    lecture: 9,
    topic: 'handshake',
    mode: 'short',
    question: 'Relate the ADC handshake of Lecture 6 to the thread and signal design of your project.',
    answer: 'Both are protocols against reading data that is not ready. The ADC asserts BUSY/DRDY and the MCU must wait; the worker thread emits packet_received and the GUI must not touch the buffer before it. In both cases ignoring the protocol produces the same failure mode: intermittently wrong values, invisible in testing, dependent on timing.',
    contentRef: 'l9-backwards-event-loop'
  },

  {
    id: 'l9-015',
    lecture: 9,
    topic: 'sensors',
    mode: 'short',
    question: 'You have 32 EMG channels and a single ADC. What must change in your Nyquist calculation, and what hardware precaution becomes necessary?',
    answer: 'The per-channel rate becomes the converter’s total throughput divided by 32, so the anti-aliasing filter must be set relative to that lower per-channel rate, not to the converter’s raw throughput. The precaution is settling time: the multiplexer and sample-and-hold must be allowed to settle after each channel switch, or every channel carries a ghost of its predecessor.',
    contentRef: 'l9-forwards-chain'
  },

  {
    id: 'l9-016',
    lecture: 9,
    topic: 'filtering',
    mode: 'short',
    question: 'Argue both sides: should the live view in your application use filtfilt or a stateful lfilter?',
    answer: 'For lfilter: it is causal, so what is displayed is what a real-time system could actually have produced; its state carries across packets, so there is no repeated start-up transient; and the work per packet is constant. For filtfilt: it gives zero phase, so features are not shifted relative to the raw trace, and it lets the live and offline views share one code path. The honest resolution is lfilter live and filtfilt offline, noted in the documentation so the two views are not expected to agree exactly at every edge.',
    contentRef: 'l9-forwards-two-convolutions'
  },

  {
    id: 'l9-017',
    lecture: 9,
    topic: 'lod',
    mode: 'short',
    question: 'How does the simulation lecture’s "region of interest" idea reappear in your GUI?',
    answer: 'As the rolling window and the redraw rate. Full fidelity is kept only for the data currently on screen and within the current window; older data is kept in a cheaper form, unprocessed until the offline view asks for it, and the display redraws at a rate matched to human perception rather than to the packet rate. Both are decisions to spend computation only where it is observable.',
    contentRef: 'l9-bias-variance-shared-arithmetic'
  },

  {
    id: 'l9-018',
    lecture: 9,
    topic: 'quantisation',
    mode: 'short',
    question: 'A recording contains a sharp spike every time the participant’s cable is touched. Trace the problem through the pipeline and say at which stage it can, and cannot, be fixed.',
    answer: 'The spike is a movement artefact entering at the electrode-skin interface, the very first stage. A sharp transient has energy at all frequencies, so it overlaps the entire sEMG band and cannot be removed by any filter placed after the amplifier, nor by higher bit depth or a faster sample rate. It can only be fixed where it originates: skin preparation, better electrode adhesion, cable strain relief — the "limits of filtering" idea in concrete form.',
    contentRef: 'l9-three-losses-and-why-only-three'
  }
);
