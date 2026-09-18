// questions/l4.js
// Question bank for Chapter 4. 18 questions, 11 mc / 7 short (ratio 0.61).
// The seven short answers are the script's own end-of-chapter exam questions,
// in the course's wording, with model answers a marker would accept.
//
// Answer-key hygiene, enforced by checkAnswerBalance and checkOptionLengthBias
// in tools/validate.js: correctIndex is spread as close to evenly as an 11-mc
// set allows (0:3, 1:3, 2:3, 3:2), and the four options of every question are
// written to comparable length so that neither position nor length signals
// the answer. Explanations quote option text rather than option numbers, so
// they survive any later reordering.
//
// Plain browser script: no imports, no exports. It pushes onto the QUESTIONS
// array declared in questions.js.

QUESTIONS.push(
  {
    id: 'l4-001',
    lecture: 4,
    topic: 'motor-unit',
    mode: 'mc',
    question: 'A single α-motoneuron fires one action potential. What happens in the muscle fibres of its motor unit?',
    options: [
      'Every fibre of the muscle unit fires almost simultaneously, because innervation at the motor unit is all-or-none',
      'Only the fibres nearest the neuromuscular junction depolarise, and the rest activate only once firing continues',
      'The fibres depolarise in order of their diameter, so the slowest and smallest fibres respond noticeably first',
      'None of the fibres fire yet; a single discharge only raises their membrane potential a little toward threshold'
    ],
    correctIndex: 0,
    answer: 'Because innervation at the motor unit is all-or-none, one discharge in the motoneuron produces an action potential in essentially every fibre of its muscle unit at once; there is no partial activation, order-dependent recruitment within a unit, or subthreshold response.',
    contentRef: 'l4-all-or-none-activation'
  },

  {
    id: 'l4-002',
    lecture: 4,
    topic: 'motor-unit',
    mode: 'mc',
    question: 'Why is the motoneuron pool described as the "final common pathway" for movement?',
    options: [
      'Because it is the last structure a signal reaches before crossing the neuromuscular junction into muscle',
      'Because every contribution from the brain, spinal circuits and sensory feedback is funnelled through its discharge',
      'Because motoneurons regenerate faster than any other neuron type after peripheral nerve injury',
      'Because a single motoneuron pool controls every muscle group in the body through shared axon collaterals'
    ],
    correctIndex: 1,
    answer: 'Everything the brain, the spinal circuits and the sensory system have to say about a movement is funnelled through the discharge of spinal motoneurons — Gandevia’s formulation is that this output constitutes the ultimate neural code for movement execution. It is not merely the last anatomical stop before the synapse, and the other two claims are not true of motoneurons.',
    contentRef: 'l4-final-common-pathway'
  },

  {
    id: 'l4-003',
    lecture: 4,
    topic: 'motor-unit',
    mode: 'mc',
    question: 'According to Henneman’s size principle, in what order are motor units recruited as descending drive increases?',
    options: [
      'Large, fast-fatiguing units first, so that peak force is available immediately if it should be needed',
      'Units are recruited in a random order that depends only on which sensory afferent happens to fire first',
      'Small, low-threshold, fatigue-resistant units first, with large, fast-fatiguing units recruited last',
      'All units already firing at their maximum rate first, with new units added only near maximal effort'
    ],
    correctIndex: 2,
    answer: 'Henneman’s size principle orders recruitment by size: small, low-threshold, fatigue-resistant units are recruited first, and large, high-threshold, fast-fatiguing units are recruited last. Recruiting the largest units first would waste their limited fatigue resistance on tasks that rarely need it, and the order is neither random nor reserved for near-maximal effort.',
    contentRef: 'l4-henneman-size-principle'
  },

  {
    id: 'l4-004',
    lecture: 4,
    topic: 'rms',
    mode: 'mc',
    question: 'Why can sEMG amplitude not be read directly as a calibrated measurement of force?',
    options: [
      'Amplitude is dominated by electrode impedance, which drifts independently of any muscle activity',
      'Amplitude reflects rate coding only; contributions from newly recruited units are filtered out beforehand',
      'Force cannot be measured on the same limb as the recording, so no comparison is ever possible',
      'The amplitude-force relationship is non-linear and muscle-dependent, so amplitude only indexes activation'
    ],
    correctIndex: 3,
    answer: 'Both recruitment and rate coding add energy to the signal as force rises, so amplitude does grow with force — but the relationship is non-linear and differs between muscles, so amplitude is an index of activation rather than a calibrated force measurement. Amplitude reflects both mechanisms, not rate coding alone, and force and EMG are routinely recorded together.',
    contentRef: 'l4-semg-amplitude-not-force'
  },

  {
    id: 'l4-005',
    lecture: 4,
    topic: 'motor-unit',
    mode: 'mc',
    question: 'An electrode records the sum of contributions from many active motor units. What is this recorded signal called, as distinct from a MUAP or a MUAPT?',
    options: [
      'The interference EMG, the algebraic sum of many overlapping MUAP trains from different units',
      'A single MUAPT, since all firing units are treated together as one composite spike train',
      'The innervation-zone potential, the field measured directly above where the axon terminates',
      'A quadrifilar signal, named for the electrode configuration first used to separate overlapping units'
    ],
    correctIndex: 0,
    answer: 'The interference EMG is the recorded signal: the algebraic sum of many overlapping motor unit action potential trains (MUAPTs). A MUAP is one unit’s single waveform and a MUAPT is that unit’s own train; "innervation-zone potential" and "quadrifilar signal" are not the term for the summed recording.',
    contentRef: 'l4-interference-emg'
  },

  {
    id: 'l4-006',
    lecture: 4,
    topic: 'convolution',
    mode: 'mc',
    question: 'In the convolutive model x_j(t) = Σᵢ(sᵢ*h_ij)(t) + n_j(t), what does h_ij(t) represent?',
    options: [
      'The binary firing pattern of motor unit i, with a one at each of its discharge times',
      'The MUAP waveform that motor unit i produces at electrode j, given its geometry',
      'The noise floor at electrode j, independent of which motor units happen to be active',
      'The overall interference pattern recorded at electrode j once every unit is summed'
    ],
    correctIndex: 1,
    answer: 'h_ij(t) is the MUAP waveform contributed by motor unit i as seen specifically at electrode j; its shape depends on the geometry between that unit and that electrode. The binary firing pattern is s_i(t), the noise term is n_j(t), and the full interference pattern is the left-hand side x_j(t), not h_ij alone.',
    contentRef: 'l4-convolutive-model'
  },

  {
    id: 'l4-007',
    lecture: 4,
    topic: 'decomposition',
    mode: 'mc',
    question: 'Why does high-density surface EMG make non-invasive decomposition practical when a single pair of surface electrodes does not?',
    options: [
      'It amplifies the signal to a far higher voltage than a needle electrode can safely achieve',
      'It removes the need for any noise term, since averaging across channels cancels n_j(t) exactly',
      'Its many electrodes each see a slightly different spatial mixture, giving units a spatial signature',
      'It records only fully synchronous motor units, which is the population decomposition requires'
    ],
    correctIndex: 2,
    answer: 'HD-sEMG covers the muscle with a two-dimensional grid, so each electrode records a slightly different mixture of the same underlying sources — MUAP shape depends on geometry, so the same unit looks different at different electrodes. That spatial signature is exactly what decomposition exploits; a single surface pair gives only one mixture to work with. Neither gain nor noise cancellation explains the difference, and decomposition targets asynchronous units, not synchronous ones.',
    contentRef: 'l4-hd-semg'
  },

  {
    id: 'l4-008',
    lecture: 4,
    topic: 'filtering',
    mode: 'mc',
    question: 'Different motor units’ MUAPs occupy essentially the same frequency band in the interference EMG. What follows for separating them?',
    options: [
      'A band-pass filter narrow enough still isolates each unit, provided its order is high enough',
      'They can be separated in frequency only after resampling the record at a higher rate',
      'Separation becomes possible once the record is long enough for Welch’s method to average out the overlap',
      'No filter of any order can separate them by frequency, so decomposition uses spatial and sparsity structure instead'
    ],
    correctIndex: 3,
    answer: 'When sources share a frequency band, the information that would distinguish them there is simply gone, and no filter of any order recovers it — the same limitation Chapter 2 states for signal and noise. Decomposition sidesteps the problem by using properties frequency does not touch: each electrode’s distinct spatial view of the sources and the sparsity of each spike train. Resampling and averaging change neither the underlying overlap nor the frequency band.',
    contentRef: 'l4-spectral-overlap-motivates-decomposition'
  },

  {
    id: 'l4-009',
    lecture: 4,
    topic: 'decomposition',
    mode: 'mc',
    question: 'In the matrix form x(k) = H s(k) that an HD-sEMG grid produces, what do the columns of H represent?',
    options: [
      'Each motor unit’s MUAP response across the whole electrode array, one column per unit',
      'The successive time samples of the recording, one column for every instant k',
      'The set of candidate separation vectors that ICA will search over during optimisation',
      'The extended delayed copies of a single channel, used only after the extension step'
    ],
    correctIndex: 0,
    answer: 'H is the matrix of MUAP responses h_ij; each column corresponds to one motor unit’s waveform as it appears across all electrodes simultaneously, and x(k) = H s(k) mixes those columns according to which sources are active at sample k. Time samples index k itself, not the columns of H, and separation vectors and delayed copies belong to the later extension and ICA steps.',
    contentRef: 'l4-matrix-form-model'
  },

  {
    id: 'l4-010',
    lecture: 4,
    topic: 'decomposition',
    mode: 'mc',
    question: 'The vector obtained by extending a channel with its own delayed copies is, by construction, strongly dependent on the original. What does this mean for applying ICA directly to extended EMG data?',
    options: [
      'It is harmless, because ICA only ever requires the mixing to be linear and instantaneous',
      'It violates the independence assumption ICA relies on, so sparsity is used as the separation criterion instead',
      'It improves ICA’s performance, since dependent extended sources are easier to renormalise',
      'It only affects the noise term n_j(t), leaving the separation of the true sources unaffected'
    ],
    correctIndex: 1,
    answer: 'Extension deliberately builds each source from delayed copies of itself, so the extended sources are manifestly dependent — exactly the assumption ICA’s non-Gaussianity criterion needs. That is why sparsity, not independence, is what actually drives EMG decomposition. Linearity and instantaneousness are necessary for ICA but do not rescue the independence violation, dependence does not ease renormalisation, and it is the sources themselves that are affected, not only the noise term.',
    contentRef: 'l4-sparsity-not-independence'
  },

  {
    id: 'l4-011',
    lecture: 4,
    topic: 'rms',
    mode: 'mc',
    question: 'What does state-of-the-art commercial myoelectric control actually feed into its classifier or regressor?',
    options: [
      'Fully decomposed motor-unit spike trains recovered from an implanted quadrifilar electrode',
      'The raw interference EMG waveform, sampled directly into the control model without preprocessing',
      'RMS and similar amplitude features computed over a handful of surface channels',
      'Neural modules extracted by ICA-based decomposition of a high-density surface grid'
    ],
    correctIndex: 2,
    answer: 'Commercial myocontrol, as in Hahne et al. (2018), works on amplitude features — RMS and similar indices over a handful of channels — feeding a regression or classification model that drives several degrees of freedom at once. Decomposed spike trains and ICA-based neural modules belong to the research pipeline described earlier in the chapter, not to deployed prostheses, and the raw waveform is not fed in unprocessed.',
    contentRef: 'l4-myoelectric-prostheses'
  },

  {
    id: 'l4-012',
    lecture: 4,
    topic: 'motor-unit',
    mode: 'short',
    question: 'Define a motor unit and explain why it, rather than the muscle fibre, is called the smallest functional unit of movement.',
    answer: 'A motor unit is one α-motoneuron together with all the muscle fibres it innervates. It is the smallest functional unit because the nervous system cannot address individual fibres: an action potential in the motoneuron activates every fibre of its muscle unit in an all-or-none fashion.',
    contentRef: 'l4-motor-unit-vs-muscle-unit'
  },

  {
    id: 'l4-013',
    lecture: 4,
    topic: 'convolution',
    mode: 'short',
    question: 'State the convolutive model of EMG generation and identify each term.',
    answer: 'x_j(t) = Σᵢ(sᵢ*h_ij)(t) + n_j(t). Here sᵢ is the binary spike train of motor unit i, h_ij is the MUAP waveform of unit i as seen at electrode j, the convolution produces that unit’s MUAP train, the sum over i produces the interference pattern, and n_j is additive noise.',
    contentRef: 'l4-convolutive-model'
  },

  {
    id: 'l4-014',
    lecture: 4,
    topic: 'motor-unit',
    mode: 'short',
    question: 'Why is sEMG treated as a random signal even though each MUAP is a fixed deterministic waveform?',
    answer: 'Because many motor units discharge asynchronously and independently. The sum of many such quasi-deterministic trains has, by the central limit theorem, statistics close to those of a random process, so only statistical descriptors (RMS, averaged spectra) are stable estimators.',
    contentRef: 'l4-why-semg-random'
  },

  {
    id: 'l4-015',
    lecture: 4,
    topic: 'decomposition',
    mode: 'short',
    question: 'Explain the role of the extension step in EMG decomposition.',
    answer: 'Extension replaces each channel by that channel plus R delayed copies of itself, and each source by itself plus its delayed copies. In this extended space the convolutive mixture x = H*s becomes a linear instantaneous product x̃ = H̃s̃, which brings standard blind-source-separation machinery into range.',
    contentRef: 'l4-extension-trick'
  },

  {
    id: 'l4-016',
    lecture: 4,
    topic: 'decomposition',
    mode: 'short',
    question: 'ICA maximises non-Gaussianity. Why is this criterion insufficient for EMG decomposition, and what replaces it?',
    answer: 'Because the extended sources are delayed copies of one another and therefore not independent, so the independence assumption underlying ICA is violated. Sparsity replaces it: a motor-unit spike train is overwhelmingly zeros with rare isolated impulses, a property that is both strong and specific enough to drive the separation.',
    contentRef: 'l4-sparsity-not-independence'
  },

  {
    id: 'l4-017',
    lecture: 4,
    topic: 'motor-unit',
    mode: 'short',
    question: 'Describe the two mechanisms by which the nervous system grades muscle force, and state the principle that governs the order of the first.',
    answer: 'Recruitment (activating additional motor units) and rate coding (increasing the discharge rate of already-active units). Recruitment follows Henneman’s size principle: small, low-threshold, fatigue-resistant units are recruited first and large, high-threshold, fast-fatiguing units last.',
    contentRef: 'l4-recruitment'
  },

  {
    id: 'l4-018',
    lecture: 4,
    topic: 'rms',
    mode: 'short',
    question: 'Two recordings from the same muscle have the same RMS. Can you conclude that the same force was produced, and that the same neural strategy was used?',
    answer: 'Neither with confidence. sEMG amplitude is an index of activation, not a calibrated force measurement, and the amplitude-force relation is non-linear and muscle-specific. Moreover the same amplitude can arise from many units firing slowly or fewer units firing fast, so the underlying recruitment/rate-coding strategy may differ.',
    contentRef: 'l4-semg-amplitude-not-force'
  }
);
