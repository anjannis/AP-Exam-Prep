// content/l2.js
// Chapter 2 of the exam script: "Signals: Time, Frequency and the Digital
// World" (printed pages 11-22). Sections follow the script's own subsection
// order, so the Reference Bank mirrors the chapter a reader already knows.
//
// Plain browser script: no imports, no exports. It pushes onto the LECTURES
// array declared in content.js.

LECTURES.push({
  id: 2,
  name: 'Signals: Time, Frequency and the Digital World',
  shortName: 'Signals & Frequency',
  sections: [
    {
      heading: 'What a signal is',
      items: [
        {
          id: 'l2-signal-definition',
          type: 'definition',
          term: 'Signal',
          body: 'A signal is a function: one quantity that depends on another, most often on time. Voltage at an electrode, the angle of an elbow and the force under a foot are each a function y(t); temperature T(x, y) and brightness across an image depend on space instead; the surface potential produced by a travelling action potential, v(x, y, t), depends on both.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l2-signal-in-code',
          type: 'definition',
          term: 'A signal in code: array plus sampling rate',
          body: 'In code a signal is an np.ndarray plus a sampling rate. The array carries the values; everything semantic — units, channel names, sensor model and above all the sampling frequency fₛ — lives outside the array and has to be carried alongside it deliberately. An array on its own is just bytes.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l2-signal-dimensionality',
          type: 'fact',
          term: 'Dimensionality is array shape',
          body: 'The shape of the array is the dimensionality of the signal. A 1D time series has shape (T,) — voltage(t), elbow angle(t); a 2D snapshot has shape (rows, cols) — an image, or one electrode-grid frame at a single instant; a 3D movie has shape (rows, cols, T) — MUAP propagation, video, fMRI.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l2-deterministic-vs-random',
          type: 'distinction',
          term: 'Deterministic vs. random signals',
          body: 'A deterministic signal can be written down as an equation — a pure sinusoid, a pulse train, an evoked potential — so its exact spectrum follows in closed form. A random (stochastic) signal cannot: sEMG, EEG, thermal noise and the algebraic sum of many motor-unit action potential trains are describable only by their statistics, so their quantities are not computed but estimated, with RMS, ARV and averaged spectra. Between the two sits the quasi-deterministic case, a deterministic shape whose parameters drift slowly, of which the ECG and a motor-unit action potential train are the standard examples.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l2-random-tool-mismatch',
          type: 'pitfall',
          term: 'Applying a deterministic tool to a random signal',
          body: 'A deterministic tool applied to a random signal returns an answer that changes every time the recording is repeated, and nothing in the result tells you which answer to believe. A single FFT of an sEMG record is exactly this mistake; the whole point of Welch’s method is to repair that failure.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'The time domain',
      items: [
        {
          id: 'l2-sinusoid',
          type: 'formula',
          term: 'The sinusoid',
          body: 'A sinusoid is the periodic waveform that three numbers fix completely: amplitude, frequency and phase. Every signal in this material decomposes into a sum of sinusoids, which is what makes it the atomic building block; the sampling rate does not change the wave, only how finely it is drawn.',
          formula: 'y(t) = A\\sin(2\\pi f t + \\varphi)',
          symbols: 'A is the amplitude, f the frequency in hertz, T = 1/f the period, φ the phase in radians and ω = 2πf the angular frequency in radians per second. In NumPy: y = A*np.sin(2*np.pi*f*t + phi), with t = np.arange(0, 1, 1/fs).',
          crossRef: []
        },
        {
          id: 'l2-arv',
          type: 'formula',
          term: 'Average rectified value (ARV)',
          body: 'The ARV is the mean of the rectified signal, and the second of the three standard answers to “how large is this signal”, alongside peak = max|x(t)| and RMS. The three are not interchangeable: ARV is a usable activity measure but carries neither the physical nor the statistical interpretation that RMS does.',
          formula: '\\mathrm{ARV} = \\overline{|x(t)|} = \\frac{1}{N}\\sum_{i=1}^{N}|x_i|',
          symbols: 'x is the signal and N the number of samples averaged. In NumPy: arv = np.mean(np.abs(x)).',
          crossRef: []
        },
        {
          id: 'l2-rms',
          type: 'formula',
          term: 'Root mean square (RMS)',
          body: 'The RMS is the square root of the mean of the squared signal. It is simultaneously the amplitude that carries power and, for a zero-mean signal, the standard deviation — which is why it, rather than the peak, underlies every activity index built on sEMG.',
          formula: '\\mathrm{RMS} = \\sqrt{\\overline{x(t)^2}} = \\sqrt{\\frac{1}{N}\\sum_{i=1}^{N} x_i^{2}}',
          symbols: 'x is the signal and N the number of samples in the averaging interval; on a sliding window N is the window length and sets the smoothing. In NumPy: rms = np.sqrt(np.mean(x**2)).',
          crossRef: []
        },
        {
          id: 'l2-sinusoid-amplitude-constants',
          type: 'fact',
          term: 'Peak, ARV and RMS of a sinusoid',
          body: 'For a pure sinusoid of amplitude A the three amplitude measures are related by fixed constants, and the two conversion factors are worth memorising as cheap marks. They hold for a sinusoid only: for a random signal no such relation exists, which is why the peak of an sEMG trace says almost nothing.',
          formula: '\\mathrm{peak} = A, \\qquad \\mathrm{ARV} = \\frac{2A}{\\pi} \\approx 0.637\\,A, \\qquad \\mathrm{RMS} = \\frac{A}{\\sqrt{2}} \\approx 0.707\\,A',
          symbols: 'A is the peak amplitude of the sinusoid. Read backwards: A = RMS·√2 ≈ 1.414·RMS, and ARV = 2A/π ≈ 0.637A. Valid for a pure sinusoid, not for a random signal.',
          crossRef: []
        },
        {
          id: 'l2-why-rms',
          type: 'fact',
          term: 'Why RMS rather than peak',
          body: 'Two independent reasons converge on RMS. The physical reason is that RMS is the amplitude that carries power: the power dissipated by a voltage in a 1 Ω resistor is V²_RMS, which is why European mains is quoted as 220 V although its actual peak is 220·√2 ≈ 311 V, the value the insulation has to survive. The statistical reason is that for a zero-mean random signal the RMS is the standard deviation σ, so for AC-coupled sEMG it directly estimates the spread of the amplitude distribution, which grows with the number and firing rate of active motor units — whereas the peak is a single unlucky sample.',
          formula: 'P_{1\\Omega} = V_{RMS}^{2}, \\qquad \\mathrm{RMS} = \\sigma \\;\\;(\\text{zero-mean})',
          symbols: 'V_RMS is the RMS voltage, P the power dissipated in a 1 Ω resistor and σ the standard deviation. The RMS = σ identity needs the signal to be zero-mean, which sEMG is by construction because the amplifier is AC-coupled.',
          crossRef: []
        },
        {
          id: 'l2-envelope',
          type: 'definition',
          term: 'The sEMG envelope',
          body: 'Raw sEMG is a rapidly fluctuating zero-mean signal, so averaging it directly gives zero, which is useless. The envelope is produced by a two-step pipeline — rectify to remove the sign, then smooth with a moving average — leaving a slow trace of when the muscle was active and how strongly. The smoothing step is a convolution of the rectified signal with a normalised kernel, which is why np.convolve is the tool for it.',
          formula: '\\mathrm{env}(t) = \\bigl(|x| * w\\bigr)(t)',
          symbols: '|x| is the rectified signal, w a normalised smoothing kernel (a moving average of length L, so each weight is 1/L) and * denotes convolution. The order matters: rectify first, because smoothing a zero-mean signal returns zero.',
          crossRef: ['convolution']
        },
        {
          id: 'l2-envelope-window',
          type: 'distinction',
          term: 'Short vs. long envelope window',
          body: 'The window length is the only knob on the envelope, and it is a bias–variance trade-off in disguise. A short window averages few samples: low bias, because it does not smear the true shape, but high variance, so the trace stays noisy. A long window averages many: low variance but high bias, because a genuinely abrupt onset is spread over the whole window — the clinical sweet spot for sEMG is around 25 ms, while 50–200 ms reads better for a displayed RMS trace, where the goal is readability rather than timing accuracy.',
          formula: null,
          symbols: null,
          crossRef: ['bias-variance', 'convolution']
        },
        {
          id: 'l2-lfilter-vs-filtfilt',
          type: 'distinction',
          term: 'Causal vs. non-causal processing',
          body: 'A causal filter (scipy.signal.lfilter) uses only past samples, is therefore available in real time, and introduces a lag of roughly half the window or the filter’s group delay. A non-causal filter (scipy.signal.filtfilt) uses past and future samples, so it has zero phase distortion and no lag at all, but it requires the whole record and is strictly offline. The choice is decided by the latency budget: a closed-loop sEMG control system has roughly 50 ms of total delay before the user perceives the prosthesis as sluggish, and every millisecond of smoothing window eats into it.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l2-causality',
          type: 'fact',
          term: 'What may be computed in real time',
          body: 'A summary may be computed in real time exactly when it needs only past samples: a running RMS or ARV, a causal moving-average envelope and anything applied with lfilter all qualify, each at the cost of a lag of about half its window. filtfilt, an FFT of the whole record, a Welch estimate over a complete recording and any value normalised to the maximum of the file do not qualify, because they need samples that have not arrived yet. Non-causal processing is not cheating — it is simply unavailable when the future has not happened.',
          formula: 't_{lag} \\approx L/2',
          symbols: 'L is the window length and t_lag the resulting group delay of a causal moving average; in samples L = T_win·fₛ. Applies to moving-average smoothing and, with the filter’s group delay in place of L/2, to any causal filter.',
          crossRef: []
        }
      ]
    },

    {
      heading: 'The frequency domain',
      items: [
        {
          id: 'l2-spectrum',
          type: 'definition',
          term: 'Spectrum',
          body: 'The spectrum is the distribution of a signal’s energy over frequency, obtained by decomposing the signal into sinusoids. Decomposition is a physical phenomenon before it is a mathematical one: a prism splits white light because white light is a sum of electromagnetic waves at many frequencies, an ear splits a chord the same way, and an FFT splits an sEMG signal. Amplitude and phase together contain the entire signal, so the transform can be inverted exactly; power is amplitude squared.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l2-spectrum-not-mechanism',
          type: 'pitfall',
          term: 'Reading a mechanism out of a spectrum',
          body: 'The individual sinusoids in a decomposition are mathematical abstractions: there is no neuron firing at 47 Hz. A spectral peak tells you how the energy of the signal is distributed, not what generated it, so a spectrum is never on its own evidence for a generator oscillating at that frequency.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l2-fourier-series',
          type: 'formula',
          term: 'Fourier’s theorem (Fourier series)',
          body: 'Any periodic signal of period T can be written as a sum of sinusoids at integer multiples of the fundamental. More terms mean a better approximation, and sharp edges are exactly what need the high harmonics. The same machinery underlies MP3 and JPEG: transform, keep the coefficients that matter perceptually, throw the rest away, and store far fewer numbers.',
          formula: 'x(t) = \\sum_{n=1}^{\\infty} A_n \\sin(2\\pi n f_1 t + \\varphi_n)',
          symbols: 'f₁ = 1/T is the fundamental frequency, n the harmonic number, and Aₙ and φₙ the amplitude and phase of the n-th harmonic. Requires the signal to be periodic with period T; such a signal therefore has a discrete line spectrum, lines spaced by Δf = 1/T with bin 0 carrying the DC component.',
          crossRef: []
        },
        {
          id: 'l2-fft-numpy',
          type: 'fact',
          term: 'The FFT and its bins in NumPy',
          body: 'np.fft.fft(x) returns a complex spectrum of length N and np.fft.fftfreq(N, d=1/fs) says which hertz each bin corresponds to: bin 0 is DC, the mean of the signal, and bin N/2 corresponds to fₛ/2, the Nyquist frequency. Four refinements turn a correct FFT into a professional one: use np.fft.rfft for real-valued signals, which returns only the non-redundant N/2 + 1 bins at twice the speed and half the memory; window before transforming; plot 20*np.log10(amp) when the structure spans orders of magnitude; and use np.fft.fftshift to re-centre the axes when negative frequencies should be drawn on the left.',
          formula: '\\mathrm{amp}_k = \\frac{2\\,|X_k|}{N}, \\qquad \\varphi_k = \\arg X_k',
          symbols: 'X_k is the complex FFT coefficient of bin k and N the record length in samples; the factor 2 converts the two-sided transform into a one-sided physical amplitude. Bin k sits at k·fₛ/N hertz, so the bin-to-hertz mapping cannot be written down without fₛ.',
          crossRef: []
        },
        {
          id: 'l2-spectral-leakage',
          type: 'definition',
          term: 'Spectral leakage',
          body: 'Cutting a finite record out of a longer signal is itself a multiplication by a rectangular window, and a rectangular window smears sharp spectral peaks into their neighbouring bins. That smearing is spectral leakage, and the remedy is to taper the record before transforming: x_w = x * np.hanning(N).',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l2-welch',
          type: 'definition',
          term: 'Welch’s method',
          body: 'Welch’s method estimates the spectrum of a random signal by averaging: split the record into N_seg usually overlapping segments, window and FFT each one, and average the resulting power spectra. The variance of the estimate falls roughly as 1/N_seg, which turns a jagged, unrepeatable curve into the underlying shape, and the output is a power spectral density rather than an amplitude. In SciPy: f, P = welch(x, fs=fs, nperseg=512).',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l2-welch-segment',
          type: 'distinction',
          term: 'Welch segment length: resolution vs. variance',
          body: 'Segment length fixes the frequency resolution and the number of segments at the same time, and the two pull in opposite directions. A long segment gives fine resolution but few averages, so the curve is detailed and fluctuates from run to run; a short segment gives many averages and a stable curve at coarse resolution. Changing the epoch length alone cannot escape the trade-off, because the variance per bin does not improve with a longer epoch — only averaging reduces it, which is precisely what Welch does.',
          formula: '\\Delta f = 1/T_{seg}, \\qquad \\mathrm{var} \\propto 1/N_{seg}',
          symbols: 'Δf is the frequency resolution in hertz, T_seg the segment duration in seconds (nperseg/fₛ) and N_seg the number of segments averaged. Applies to any averaged periodogram of a fixed-length record, where lengthening the segments necessarily reduces their number.',
          crossRef: ['bias-variance']
        },
        {
          id: 'l2-mean-frequency',
          type: 'formula',
          term: 'Mean (centroid) frequency',
          body: 'Once a stable power spectrum is available it can be collapsed to a single number, the mean or centroid frequency, which is the centre of mass of the spectrum. It is the workhorse of fatigue research, and the causal chain behind that is short: fatigue slows muscle-fibre conduction velocity, slower propagation stretches each MUAP in time, a waveform stretched in time is compressed in frequency, so the spectrum shifts downwards and its centroid falls monotonically during a sustained contraction.',
          formula: 'f_{mean} = \\frac{\\sum_i f_i P_i}{\\sum_i P_i}',
          symbols: 'f_i is the centre frequency of bin i and P_i its power; the sum runs over the bins of a power spectrum, ideally a Welch estimate rather than a single FFT. In NumPy: f_mean = np.sum(f*P)/np.sum(P).',
          crossRef: []
        }
      ]
    },

    {
      heading: 'Filtering',
      items: [
        {
          id: 'l2-transfer-function',
          type: 'formula',
          term: 'Filtering is multiplication in frequency',
          body: 'A filter multiplies the spectrum: every frequency component of the input is scaled by the filter’s transfer function at that frequency. Nothing new is created, so a filter can only pass or attenuate what is already present.',
          formula: 'Y(f) = H(f)\\,X(f)',
          symbols: 'X(f) is the spectrum of the input, Y(f) of the output, and H(f) the transfer function, whose magnitude |H(f)| is the magnitude response. Applies to any linear time-invariant filter.',
          crossRef: []
        },
        {
          id: 'l2-filter-bands',
          type: 'definition',
          term: 'Pass-band, transition band, stop-band and the cut-off',
          body: 'Where |H(f)| ≈ 1 the harmonics survive almost intact — the pass-band; where |H(f)| ≈ 0 they are suppressed — the stop-band. Between them the magnitude rolls off over a transition band, because no real filter has an instantaneous edge. By convention the cut-off frequency is the −3 dB point, where the magnitude has fallen to 1/√2 and the power has halved.',
          formula: '|H(f_c)| = \\frac{1}{\\sqrt{2}} \\;\\Longleftrightarrow\\; -3\\ \\mathrm{dB}',
          symbols: 'f_c is the cut-off frequency and |H| the magnitude response. −3 dB is a factor 1/√2 ≈ 0.707 in amplitude and a factor 1/2 in power; this is a naming convention, not a property of one particular filter.',
          crossRef: []
        },
        {
          id: 'l2-filter-types',
          type: 'distinction',
          term: 'Which filter for which job',
          body: 'Low-pass smooths the trace and drops high-frequency noise; high-pass removes baseline drift and DC offset; band-pass keeps only the band the signal lives in, 10–500 Hz for sEMG; band-stop or notch kills a single interfering line, typically 50 Hz mains. The shape is chosen to match the artefact you want gone, not the signal you want kept. Note that the script quotes the sEMG band as 10–500 Hz here, as 20–400 Hz in its filter figure and as [20, 450] in its SciPy example: the edges are approximate, and the examinable point is that sEMG needs a band-pass of roughly this shape rather than one specific pair of numbers.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l2-butterworth-scipy',
          type: 'fact',
          term: 'Designing and applying a filter in SciPy',
          body: 'butter(N=4, Wn=[10, 500], btype="bandpass", fs=fs) designs the filter and returns its numerator and denominator coefficients b, a; N is the filter order, and a higher order buys a steeper transition at the price of more ringing and more numerical fragility, with fourth order a sane default for bioelectric work. filtfilt(b, a, x) runs the filter forwards and then backwards, so the two equal and opposite phase distortions cancel exactly — hence zero-phase — at the cost of doubling the effective order and needing the entire record. lfilter(b, a, x) is the single forward pass, the one you use live.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l2-overlapping-bands',
          type: 'pitfall',
          term: 'What no filter order can fix',
          body: 'A filter separates by frequency and by nothing else, so if signal and noise occupy the same frequency band no filter can separate them, whatever its order. Once two contributions overlap in frequency the information that would tell them apart is gone, and the remedy is better recording technique — electrode preparation, cable strain relief, skin impedance — not a higher filter order.',
          formula: null,
          symbols: null,
          crossRef: ['information-loss']
        },
        {
          id: 'l2-motion-artefact',
          type: 'fact',
          term: 'Why high-pass filtering does not remove a motion artefact',
          body: 'A sharp motion artefact is a step, and a step contains energy at all frequencies, including throughout the sEMG band. High-pass filtering removes the artefact’s slow tail and leaves the in-band component — a sharp spike — exactly where it was.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'From analog to digital',
      items: [
        {
          id: 'l2-sampling',
          type: 'formula',
          term: 'Sampling and the sampling rate',
          body: 'Sampling means reading the signal at regularly spaced instants; the spacing is the sampling interval and its reciprocal is the sampling rate. What the computer ends up with is a vector of numbers with no time stamps inside it.',
          formula: 'f_s = 1/\\Delta t',
          symbols: 'Δt is the sampling interval in seconds and fₛ the sampling rate in hertz. The time axis is reconstructed afterwards as t = np.arange(0, duration, 1/fs), which is possible only if fₛ is known.',
          crossRef: []
        },
        {
          id: 'l2-fs-metadata',
          type: 'pitfall',
          term: 'Saving samples without the sampling rate',
          body: 'The sampling rate is not inside the array and no NumPy dtype carries it, so an array saved without fₛ can be rectified and averaged but can never be given a time axis in seconds or a frequency axis in hertz — every timing and spectral result becomes unlabelled. Store it with the data every time: np.savez("run01.npz", x=x, fs=fs).',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l2-nyquist',
          type: 'formula',
          term: 'Nyquist–Shannon sampling theorem',
          body: 'If the sampling rate is more than twice the highest frequency present in the signal, the samples determine the signal uniquely and perfect reconstruction is possible. If it is not, high frequencies masquerade as low ones and the information is lost irreversibly. In practice choose four to ten times f_max rather than the bare factor two, to leave room for a realistic filter transition band.',
          formula: 'f_s > 2 f_{max}',
          symbols: 'fₛ is the sampling rate and f_max the highest frequency present in the signal — present, not of interest, so out-of-band noise counts too. fₛ/2 is the Nyquist frequency, the highest frequency the sampled data can represent at all.',
          crossRef: ['information-loss']
        },
        {
          id: 'l2-aliasing',
          type: 'definition',
          term: 'Aliasing',
          body: 'Aliasing is the folding of content above fₛ/2 down into the base band by the act of sampling, so that a high frequency appears as a lower one. A 90 Hz sine sampled at 100 Hz produces exactly the same sample values as a 10 Hz sine, and nothing downstream can tell them apart because there is nothing left to tell apart. It is not a display artefact that a cleverer algorithm could undo: the two signals produced identical numbers.',
          formula: null,
          symbols: null,
          crossRef: ['information-loss']
        },
        {
          id: 'l2-antialiasing-analog',
          type: 'pitfall',
          term: 'The anti-aliasing filter must be analog and must precede the converter',
          body: 'The folding happens during conversion, so it has to be prevented before conversion: an analog low-pass filter must sit between the amplifier and the A/D converter. A digital filter applied afterwards operates on already-corrupted samples, in which the aliased energy occupies the same frequencies as genuine signal and is therefore inseparable by any filter of any order. For sEMG the standard choice is fₛ of 1–2 kHz with an anti-aliasing cut-off near 500 Hz.',
          formula: null,
          symbols: null,
          crossRef: ['information-loss']
        },
        {
          id: 'l2-bit-depth',
          type: 'definition',
          term: 'Bit depth',
          body: 'A bit is one binary digit, so with n bits a converter can represent 2ⁿ distinct values and encodes each measured voltage as one of 2ⁿ equally spaced levels. The depths worth knowing are 8 bits (256 levels, low-fidelity audio), 10 bits (1 024, the Arduino Uno’s on-chip ADC), 12 bits (4 096, older laboratory hardware), 16 bits (65 536, standard sEMG amplifiers) and 24 bits (16 777 216, high-end research front-ends).',
          formula: 'n\\ \\mathrm{bits} \\;\\longrightarrow\\; 2^{n}\\ \\mathrm{levels}',
          symbols: 'n is the converter’s resolution in bits and 2ⁿ the number of distinct output codes. More bits means a finer staircase and a smaller rounding error, but the number of levels alone says nothing about the voltage range they span.',
          crossRef: []
        },
        {
          id: 'l2-quantisation',
          type: 'definition',
          term: 'Quantisation',
          body: 'Sampling discretises time; quantisation is the converter discretising amplitude, rounding every sample to the nearest of its 2ⁿ available levels. The rounding is irreversible — the discarded fraction of a step is recorded nowhere — so the error per sample is bounded by half a step and can never be recovered downstream.',
          formula: '|\\varepsilon| \\le q/2',
          symbols: 'ε is the rounding error of one sample and q the quantisation step, one LSB. The bound assumes round-to-nearest and holds only for samples inside the full-scale range; outside it the converter clips instead of rounding.',
          crossRef: ['information-loss']
        },
        {
          id: 'l2-quantisation-step',
          type: 'formula',
          term: 'Quantisation step (LSB)',
          body: 'The size of one quantisation step is the full-scale range divided by the number of levels, and it is the smallest amplitude change the converter can resolve. It is also called the least significant bit, and it is the unit in which every amplitude claim about digitised data should be checked.',
          formula: 'q = V_{FS}/2^n',
          symbols: 'q is the quantisation step or LSB, V_FS the full-scale range — the whole span, so a ±5 V converter has V_FS = 10 V — and n the number of bits. Example: ±5 V at 12 bits gives q = 10 V/4 096 ≈ 2.44 mV.',
          crossRef: ['information-loss']
        },
        {
          id: 'l2-gain-and-bits',
          type: 'pitfall',
          term: 'Judging bit depth without the amplifier gain',
          body: 'A quantisation step only means something once it is referred to the electrode, which means dividing it by the gain in front of the converter. A 12-bit converter spanning ±5 V has q ≈ 2.44 mV, so surface EMG at roughly 100 µV would occupy a fraction of one code and the recording would be almost all quantisation noise; a gain of 1 000 makes the effective step 2.44 µV, and 16 bits with a gain of 500 gives about 0.30 µV, which is excellent. Bit depth and amplifier gain together determine data quality, and neither can be assessed without the other.',
          formula: 'q_{eff} = q/A',
          symbols: 'q is the step at the converter input, A the voltage gain of the amplifier preceding it and q_eff the effective step referred to the electrode. Raising A shrinks q_eff but also shrinks the input amplitude at which the converter clips, so gain is chosen against the expected signal size.',
          crossRef: ['information-loss']
        },
        {
          id: 'l2-acquisition-chain',
          type: 'fact',
          term: 'The full acquisition chain',
          body: 'The chain runs sensor (skin electrode) → amplifier (gain A) → analog anti-aliasing filter → sampler (fₛ > 2 f_max) → A/D converter (n bits) → bytes on TCP or disk → np.ndarray in your code. Writing np.load("run.npy") picks the data up at the right-hand edge, by which point every decision further left — electrode size, amplifier gain, anti-aliasing cut-off, sampling rate, bit depth — has already propagated into the array. Knowing the chain is knowing the data: if a recording looks wrong, the fault is almost never in the last block.',
          formula: null,
          symbols: null,
          crossRef: ['information-loss']
        },
        {
          id: 'l2-numpy-toolkit',
          type: 'fact',
          term: 'The chapter in five lines of code',
          body: 'Five lines cover the whole chapter: np.array holds the signal, np.sqrt(np.mean(x**2)) measures its amplitude, np.fft.fft gives its spectrum, scipy.signal.butter with filtfilt filters it, and fₛ travels alongside it as metadata. The toolboxes divide the same way the material does: time (np.abs, np.mean, np.sqrt, np.convolve), frequency (np.fft.fft, scipy.signal.welch) and discrete (np.arange, np.round, fₛ stored with the data).',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    }
  ]
});
