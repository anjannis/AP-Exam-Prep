// content/l4.js
// Chapter 4 of the exam script: "The Electromyogram" (printed pages 33-40).
// Sections follow the script's own subsection order, so the Reference Bank
// mirrors the chapter a reader already knows.
//
// EMG is the running example for the whole module: this chapter opens the
// box on what the signal physically is, so several items here are the ones
// later chapters point back to (the convolutive generation model, the
// motor-unit/muscle-unit distinction, the spatial signature that both makes
// decomposition possible and makes the HD-sEMG grid the same object as
// Chapter 1's field and Chapter 2's array).
//
// Plain browser script: no imports, no exports. It pushes onto the LECTURES
// array declared in content.js.

LECTURES.push({
  id: 4,
  name: 'The Electromyogram',
  shortName: 'The Electromyogram',
  sections: [
    {
      heading: 'The motor unit',
      items: [
        {
          id: 'l4-motor-unit-vs-muscle-unit',
          type: 'distinction',
          term: 'Motor unit vs. muscle unit',
          body: 'The muscle fibres innervated by one α-motoneuron are the muscle unit; the motoneuron together with that muscle unit is the motor unit, and it is the smallest element of force production the nervous system can address. The distinction matters because the nervous system never controls a single fibre: it controls motor units, and the motoneuron cell body sits in the ventral horn of the spinal cord.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l4-all-or-none-activation',
          type: 'fact',
          term: 'All-or-none activation within a motor unit',
          body: 'Because every fibre in a muscle unit is contacted at its own neuromuscular junction by the same axon, one action potential in the motoneuron produces one action potential in essentially every fibre of the muscle unit, simultaneously and completely. There is no partial activation of a motor unit.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l4-final-common-pathway',
          type: 'definition',
          term: 'The motoneuron pool as the final common pathway',
          body: 'Everything the brain, the spinal circuits and the sensory system have to say about a movement is funnelled through the discharge of spinal motoneurons, which is why the motoneuron pool is called the final common pathway. Gandevia’s formulation, quoted in the lecture, is that the output from spinal motor neurons constitutes the ultimate neural code for movement execution.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l4-decoding-intent-motivation',
          type: 'fact',
          term: 'Why decoding motoneurons matters for an AI student',
          body: 'If motoneuron discharges are the final neural code for movement, decoding them from the skin is decoding intent, non-invasively — the premise behind the neural-interfacing research this course sits in, and the reason the course project streams 32 channels rather than one.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'How force is graded',
      items: [
        {
          id: 'l4-recruitment',
          type: 'definition',
          term: 'Recruitment',
          body: 'Recruitment is the switching-on of additional motor units as descending drive increases. Units are recruited in a reliable order rather than randomly, which is the content of Henneman’s size principle.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l4-henneman-size-principle',
          type: 'fact',
          term: 'Henneman’s size principle',
          body: 'Motor units are recruited in order of size: small, low-threshold, fatigue-resistant units first, and large, high-threshold, fast-fatiguing units last. The order follows from motoneuron and muscle-fibre properties, not from task demands, so it holds however gently or forcefully a contraction begins.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l4-rate-coding',
          type: 'definition',
          term: 'Rate coding',
          body: 'Rate coding is the second mechanism that grades force: each already-active motor unit fires faster as the drive rises, and a faster train contributes more force through the fusion of successive twitches. Recruitment and rate coding always operate together.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l4-semg-amplitude-not-force',
          type: 'pitfall',
          term: 'sEMG amplitude is an index of activation, not a force measurement',
          body: 'sEMG amplitude grows with force because both recruitment and rate coding add energy to the signal, but the relationship is non-linear and differs between muscles, so amplitude is an index of activation rather than a calibrated force measurement. The same total force can also be produced by different combinations of recruitment and rate coding, so two recordings with identical RMS can reflect quite different neural strategies.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'Where the electrical signal comes from',
      items: [
        {
          id: 'l4-fibre-conduction-velocity',
          type: 'fact',
          term: 'Where the action potential propagates from',
          body: 'A muscle fibre depolarises at the neuromuscular junction, roughly at the middle of the fibre, and the resulting action potential propagates in both directions towards the tendons at about 4 m/s — the same conduction velocity computed from the electrode grid in Chapter 1. The propagating depolarisation carries an extracellular current field that produces the potential difference surface electrodes pick up.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l4-muap-definition',
          type: 'definition',
          term: 'Motor unit action potential (MUAP)',
          body: 'The MUAP is the waveform contributed by a single motor unit — the summed field of all its fibres, as seen at one electrode. Its shape depends on geometry: fibre depth, fibre orientation, distance from the innervation zone, and electrode size and spacing, so the same motor unit looks different at different electrodes, and that spatial signature is what makes decomposition possible.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l4-interference-emg',
          type: 'definition',
          term: 'Interference EMG',
          body: 'The interference EMG is the signal an electrode actually records: the algebraic sum of many overlapping motor unit action potential trains (MUAPTs) plus noise. A MUAP is one unit’s single waveform, a MUAPT is that unit’s own train of MUAPs, and the interference EMG is the sum over all active units.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l4-du-bois-reymond',
          type: 'fact',
          term: 'Historical origin of EMG',
          body: 'The field starts with Emil du Bois-Reymond (1818-1896), who demonstrated electrical currents in nerve and muscle by immersing the index fingers of both hands in saline connected to a multiplicator, an adapted galvanometer. The principle has not changed since; only the amplifier has.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l4-convolutive-model',
          type: 'formula',
          term: 'The convolutive model of EMG generation',
          body: 'A motor unit fires at a sparse set of times; convolving that spike train with the unit’s fixed MUAP waveform at an electrode gives its MUAP train there, and the recorded signal at each electrode is the sum of every active unit’s MUAP train plus noise. This is the single most important equation in the chapter, and it is the same operation as Chapter 3’s kernels and Chapter 2’s moving-average smoothing.',
          formula: 'x_j(t) = \\sum_{i=1}^{M} (s_i * h_{ij})(t) + n_j(t)',
          symbols: 'x_j(t) is the signal recorded at electrode j; M is the number of active motor units; s_i(t) is the binary spike train of motor unit i (a one at each discharge time, zero elsewhere); h_ij(t) is the MUAP waveform of unit i as seen at electrode j; * denotes convolution, so (s_i*h_ij)(t) is unit i’s MUAP train (MUAPT) at electrode j; n_j(t) is additive noise.',
          crossRef: ['convolution']
        },
        {
          id: 'l4-why-semg-random',
          type: 'fact',
          term: 'Why the interference pattern looks random',
          body: 'Each individual MUAPT is quasi-deterministic — a fixed shape at irregularly-spaced times — but many units fire asynchronously and independently, so their algebraic sum behaves statistically like a random signal. This is the justification, promised in Chapter 2, for treating sEMG as stochastic and describing it with RMS and averaged spectra rather than closed-form equations.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'Electrodes',
      items: [
        {
          id: 'l4-electrode-tradeoff',
          type: 'distinction',
          term: 'Which electrode for which job',
          body: 'Intramuscular needle and wire electrodes are highly selective — they see very few units very clearly — but are invasive and sample only a tiny volume. Surface electrodes are non-invasive and comfortable, but each one integrates over a large volume, so many units overlap in the recording; high-density surface EMG covers the muscle with a two-dimensional grid of many small electrodes, trading a little of the needle’s selectivity for enough spatial information to make non-invasive decomposition practical.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l4-intramuscular-electrode-types',
          type: 'fact',
          term: 'Named intramuscular electrode designs',
          body: 'Single-fibre, concentric and monopolar needle electrodes go back to Adrian and Bronk (1929); fine-wire electrodes are Basmajian’s; the quadrifilar electrode is De Luca’s (1972). All trade invasiveness for the ability to see very few motor units very clearly.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l4-hd-semg',
          type: 'definition',
          term: 'High-density surface EMG (HD-sEMG)',
          body: 'HD-sEMG covers the muscle with a two-dimensional grid of many small surface electrodes; research sleeves with 160 channels exist. It is the technology that makes non-invasive decomposition practical, and the reason the course project’s data format carries 32 channels.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l4-grid-one-object',
          type: 'fact',
          term: 'One object, three lectures',
          body: 'The HD-sEMG grid recording is exactly the scalar field introduced in Chapter 1 and exactly the (rows, cols, T) array of Chapter 2: the same object, examined first as a physical field, then as a NumPy array, and now as the physiological signal that produces it.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'Decomposition: recovering the sources',
      items: [
        {
          id: 'l4-decomposition-problem',
          type: 'definition',
          term: 'Decomposition as an inverse problem',
          body: 'The recorded channels are mixtures and the motor-unit spike trains are the sources. Decomposition is the inverse problem: given many mixtures, recover the sources that produced them.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l4-spectral-overlap-motivates-decomposition',
          type: 'fact',
          term: 'Decomposition as the answer to spectral overlap',
          body: 'Individual MUAPs occupy essentially the same frequency band as every other MUAP and as much of the noise, so no filter of any order can separate one motor unit’s contribution from another’s — the identical limitation Chapter 2 states for signal and noise sharing a band. Because frequency cannot resolve the sources, decomposition abandons frequency altogether and exploits two other properties instead: each electrode’s distinct spatial view of the same sources, and the sparsity of each spike train.',
          formula: null,
          symbols: null,
          crossRef: ['information-loss']
        },
        {
          id: 'l4-matrix-form-model',
          type: 'formula',
          term: 'The mixing model in matrix form',
          body: 'Written as a matrix equation, the HD-sEMG grid mixes sources through the matrix of MUAP responses, but this is still a convolutive mixture: each source contributes not only its current sample but a whole delayed waveform, so the equation cannot yet be inverted with ordinary linear algebra.',
          formula: 'x(k) = H\\,s(k)',
          symbols: 'x(k) is the vector of samples across all electrodes at time k, s(k) the vector of motor-unit source spike trains, and H the matrix of MUAP responses h_ij; each column of H is one motor unit’s MUAP response across the whole array.',
          crossRef: []
        },
        {
          id: 'l4-extension-trick',
          type: 'formula',
          term: 'Extension: turning the mixture linear and instantaneous',
          body: 'Following Holobar and Farina, replace each observed channel by itself plus R delayed copies, and extend each source correspondingly with L+R-1 delayed copies, where L is the MUAP duration in samples. In this extended space the convolutive mixture collapses into a linear instantaneous mixture, which is exactly the model independent component analysis is built for.',
          formula: '\\tilde{x}_j(k) = \\bigl(x_j(k), x_j(k-1), \\dots, x_j(k-R)\\bigr), \\qquad \\tilde{x}(k) = \\tilde{H}\\,\\tilde{s}(k)',
          symbols: 'R is the number of delayed copies appended to each observed channel and x̃_j(k) the resulting extended vector for electrode j; L is the MUAP duration in samples, so each source is extended with L+R-1 delayed copies. H̃ and s̃(k) are the extended mixing matrix and source vector, related by the plain matrix product x̃ = H̃s̃.',
          crossRef: ['convolution']
        },
        {
          id: 'l4-ica-nongaussianity',
          type: 'definition',
          term: 'ICA and non-Gaussianity',
          body: 'Independent component analysis separates sources by searching for the direction in which the projected data is maximally non-Gaussian. The justification is the central limit theorem: a mixture of independent sources is more Gaussian than any one source alone, so maximising non-Gaussianity moves the estimate back towards a single source, iteratively updating and renormalising a separation vector.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l4-sparsity-not-independence',
          type: 'pitfall',
          term: 'Separation criterion: sparsity, not independence',
          body: 'The sources ICA needs to be independent are, after extension, delayed copies of the same spike train and therefore strongly dependent by construction — so plain ICA independence is the wrong criterion for EMG. What is actually used is sparsity: a motor-unit spike train is almost entirely zeros with occasional isolated ones, a strong and unusual structural property, and optimising for it rather than for independence is what makes EMG decomposition work.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l4-spike-train-sparsity',
          type: 'fact',
          term: 'Sparsity of a motor-unit spike train',
          body: 'A motor-unit spike train is almost entirely zeros, punctuated by rare, isolated ones at each discharge. This is a strong and specific structural property that plain independence does not capture, which is exactly why sparsity, rather than independence, is what a decomposition algorithm optimises for.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l4-decomposition-outcome',
          type: 'fact',
          term: 'From voltage to spike trains',
          body: 'Once a separation vector is found, applying it to the extended data yields a source estimate whose peaks mark the discharge times of one motor unit; repeating and deflating recovers a full set of spike trains. At that point the analysis has crossed from a voltage measured on the skin to the firing times of individual spinal motoneurons in a living human, entirely non-invasively.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'Applications',
      items: [
        {
          id: 'l4-tetraplegia-decoding',
          type: 'fact',
          term: 'Decoding intent below a spinal lesion',
          body: 'Ting, Del Vecchio and colleagues placed an HD-sEMG sleeve on the forearm of a person with tetraplegia. Below the level of the lesion some motoneurons remain connected to muscle even though voluntary movement is absent, and when the participant attempts a movement those surviving units still discharge and the sleeve still records their MUAPs; decomposition recovers the spike trains, which are grouped into neural modules — one for attempted flexion, one for attempted extension — and a classifier maps combinations of unit activity onto individual digit actions to drive a 3D hand model or a prosthesis.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l4-mu-tracking-longitudinal',
          type: 'fact',
          term: 'Tracking the same motor unit across sessions',
          body: 'A motor unit’s spatial amplitude map across the electrode grid acts as a fingerprint, so the same units can be re-identified in a later recording session, before and after an intervention. That is what makes longitudinal studies of training and rehabilitation possible, and it depends on the same spatial signature that makes decomposition possible in the first place.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l4-myoelectric-prostheses',
          type: 'fact',
          term: 'Amplitude-based myocontrol',
          body: 'Commercial myoelectric prostheses do not decompose spike trains: they compute RMS and similar amplitude features over a handful of channels and feed a regression or classification model that drives several degrees of freedom simultaneously. Hahne et al. (2018) demonstrated exactly this — simultaneous control of several functions of a bionic hand by end users.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l4-tmr',
          type: 'definition',
          term: 'Targeted muscle reinnervation (TMR)',
          body: 'TMR is the surgical counterpart to myoelectric control: nerves that formerly innervated a missing limb are rerouted to remaining muscles, so that the intention to close the hand produces a recordable EMG pattern in, for example, the chest or upper arm rather than nowhere at all.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l4-three-signal-modes',
          type: 'fact',
          term: 'The three signal modes as three levels of interpretation',
          body: 'The 32-channel stream in the course project stands in for exactly the data this chapter describes, and its three signal modes correspond to three levels of interpretation: original is the raw interference pattern, filtered is that pattern with artefacts and mains hum removed so the MUAPs become visible, and RMS is the activation index a myocontrol system would actually feed to its classifier.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    }
  ]
});
