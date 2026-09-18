// questions/l3.js
// Question bank for Chapter 3. 18 questions, 11 mc / 7 short (ratio 0.61).
// Several short answers are seeded from the script's own end-of-chapter exam
// questions, in the course's wording, with model answers a marker would
// accept.
//
// Answer-key hygiene, enforced by checkAnswerBalance and checkOptionLengthBias
// in tools/validate.js: correctIndex is spread 3/3/3/2 across 0-3, and the
// four options of every mc question are written to comparable length so that
// neither position nor length signals the answer. Explanations quote option
// text rather than option numbers, so they survive any later reordering.
//
// Plain browser script: no imports, no exports. It pushes onto the QUESTIONS
// array declared in questions.js.

QUESTIONS.push(
  {
    id: 'l3-001',
    lecture: 3,
    topic: 'vectors',
    mode: 'mc',
    question: 'A dot product u·v turns out unusually large and positive, while ‖u‖ and ‖v‖ are unchanged from before. What does this say about u and v?',
    options: [
      'They point in a similar direction, because u·v = ‖u‖‖v‖cosθ is largest when cosθ is close to 1',
      'They have become longer vectors, because a dot product can only grow when the vectors themselves grow',
      'They are orthogonal, because a large dot product is exactly the signal of having no shared direction',
      'They have swapped order in the expression, since u·v and v·u give different results for the same pair'
    ],
    correctIndex: 0,
    answer: 'The dot product measures alignment: u·v = ‖u‖‖v‖cosθ, so with the norms held fixed, a large positive value means cosθ is close to 1 and the vectors point in a similar direction. The premise rules out "longer vectors", since the norms are stated as unchanged. Orthogonal vectors give a dot product near zero, the opposite of large. The dot product is symmetric, u·v = v·u, so order cannot be the explanation.',
    contentRef: 'l3-dot-product'
  },

  {
    id: 'l3-002',
    lecture: 3,
    topic: 'vectors',
    mode: 'mc',
    question: 'You compute diffs = X - q with X.shape == (1000, 1536) and q.shape == (1536,), then dists = np.linalg.norm(diffs, axis=1). What does dists contain, and why is no Python loop involved?',
    options: [
      '1536 distances, one per embedding dimension, since broadcasting subtracts q from every column of X in turn',
      '1000 distances, one per row of X, because q is broadcast across every row and axis=1 collapses each row to a number',
      '1000 distances, but only because a hidden Python loop iterates over the rows before the norm is ever applied',
      'A single number, the norm of the whole (1000, 1536) matrix, because axis=1 sums every entry regardless of shape'
    ],
    correctIndex: 1,
    answer: 'NumPy aligns X - q from the trailing axis, stretching q (shape (1536,)) across all 1000 rows automatically, so diffs keeps shape (1000, 1536). np.linalg.norm(..., axis=1) then collapses each row to its own length, giving 1000 distances — one per embedding. The arithmetic runs in compiled code, so there is no Python loop anywhere, hidden or otherwise, and the result is not a single scalar.',
    contentRef: 'l3-nearest-neighbor-numpy'
  },

  {
    id: 'l3-003',
    lecture: 3,
    topic: 'vectors',
    mode: 'mc',
    question: 'Which of the following NumPy subtractions raises a broadcasting shape error, and why?',
    options: [
      'X - q, with X.shape == (1000, 1536) and q.shape == (1536,), because the trailing axes 1536 and 1536 fail to align',
      'X - q[:, None], with X.shape == (1000, 1536) and q.shape == (1536,), because a 1D array may never gain a new axis',
      'X - r, with X.shape == (1000, 1536) and r.shape == (1000,), because the trailing axes 1536 and 1000 disagree and neither is 1',
      'X - c, with X.shape == (1000, 1536) and c.shape == (1,), because a length-1 axis can never be stretched to match another'
    ],
    correctIndex: 2,
    answer: 'Broadcasting aligns shapes from the trailing axis and stretches any axis of length 1. (1000, 1536) − (1536,) aligns correctly, since the trailing axes both read 1536. (1000, 1536) − (1000,) fails because the trailing axes are 1536 and 1000, and neither equals 1 — this is exactly the case that needs q[:, None] to insert the missing axis, which is a legal and common fix, not a forbidden operation. A length-1 axis is stretched, not blocked, so the fourth option is also wrong.',
    contentRef: 'l3-broadcasting-rule'
  },

  {
    id: 'l3-004',
    lecture: 3,
    topic: 'matrices',
    mode: 'mc',
    question: 'A has shape (4, 3) and B has shape (3, 5). Which product is defined, and what shape does it have?',
    options: [
      'BA, with shape (3, 3), since B’s three rows can be lined up against A’s three columns',
      'AᵗB, with shape (4, 5), since transposing A first makes the two inner dimensions agree',
      'ABᵗ, with shape (4, 4), since transposing B turns its five columns into five matching rows',
      'AB, with shape (4, 5), since the inner dimension of 3 already matches on both sides'
    ],
    correctIndex: 3,
    answer: 'AB is defined because A’s inner dimension (3 columns) matches B’s inner dimension (3 rows), giving shape (4, 5). BA is undefined: B is (3, 5) and A is (4, 3), and 5 ≠ 4. AᵗB is undefined: Aᵗ is (3, 4) and B is (3, 5), and 4 ≠ 3. ABᵗ is undefined: Bᵗ is (5, 3) and A is (4, 3), and 3 ≠ 5.',
    contentRef: 'l3-matmul-shape-compatibility'
  },

  {
    id: 'l3-005',
    lecture: 3,
    topic: 'matrices',
    mode: 'mc',
    question: 'For compatible matrices A, B and a vector x, you compare (A @ B) @ x with A @ (B @ x). What do you find, and what does it explain about stacking neural-network layers?',
    options: [
      'The two are equal, since matrix multiplication is associative, which is why stacked linear layers collapse into one',
      'The two differ, since matrix multiplication is not associative even though it happens to be commutative for square matrices',
      'The two are equal only when A and B are both square, because associativity requires every matrix in the chain to share one shape',
      'The two differ by a transpose, because (AB)x and A(Bx) apply the same matrices in opposite orders along each axis'
    ],
    correctIndex: 0,
    answer: 'Matrix multiplication is associative for any chain of compatible shapes, so (AB)x = A(Bx) always, without requiring square matrices. Equal results here are exactly why composing two linear layers with nothing in between reduces to a single linear layer — depth buys nothing without a non-linearity. It is commutativity, not associativity, that generally fails for matrices (AB ≠ BA), which the second option gets backwards; the third and fourth options invent conditions and effects that are not part of the identity.',
    contentRef: 'l3-matmul-commutative-associative'
  },

  {
    id: 'l3-006',
    lecture: 3,
    topic: 'matrices',
    mode: 'mc',
    question: 'To train a linear-regression model you write w = np.linalg.inv(X.T @ X) @ (X.T @ y) instead of np.linalg.solve(X.T @ X, X.T @ y). What is the practical consequence?',
    options: [
      'None: the two expressions are mathematically identical and NumPy compiles them down to the same routine internally',
      'It runs slower and is worse conditioned numerically, since an explicit inverse is best avoided here',
      'It silently returns the wrong weights, because np.linalg.inv only produces a correct result for a matrix that is already diagonal',
      'It raises a shape error, because np.linalg.inv needs a square matrix while X.T @ X need not be square in general'
    ],
    correctIndex: 1,
    answer: 'solve is both faster and numerically better conditioned than explicitly forming the inverse and then multiplying; computing an explicit inverse is almost never the right move, the linear-algebra equivalent of comparing floats with ==. The two routines are not identical internally. inv does not silently corrupt non-diagonal matrices — it works, just worse. And X.T @ X is always square (shape d × d for a d-feature design matrix), so no shape error occurs.',
    contentRef: 'l3-solve-vs-inverse'
  },

  {
    id: 'l3-007',
    lecture: 3,
    topic: 'matrices',
    mode: 'mc',
    question: 'W has shape (n_out, n_in), the weight matrix of one fully connected layer, and y = W @ x. Why is row i of W the weight vector of output neuron i?',
    options: [
      'Because W @ x computes n_in dot products, one per input feature, and row i of W holds feature i’s contribution',
      'Because Wᵗ has shape (n_in, n_out), and it is Wᵗ rather than W whose rows correspond to individual neurons',
      'Because y = W @ x computes n_out dot products, and row i of W dotted with x is exactly output neuron i',
      'Because np.eye(n_out) is added to W during training, forcing each row to represent exactly one neuron'
    ],
    correctIndex: 2,
    answer: 'y = W @ x produces an n_out-vector, and by the matrix–vector product rule yᵢ = Σⱼ Wᵢⱼxⱼ — one dot product per output, using row i of W. So there are n_out dot products, one per neuron, not one per input feature. The transpose Wᵗ has rows indexed by input feature, not by neuron, so that claim points the wrong way. The identity matrix plays no role in this at all.',
    contentRef: 'l3-matrix-vector-product'
  },

  {
    id: 'l3-008',
    lecture: 3,
    topic: 'convolution',
    mode: 'mc',
    question: 'Why does a convolutional layer have far fewer parameters than a fully connected layer over the same input, even though both examine every position?',
    options: [
      'Parameter sharing: the same small set of kernel weights is reused at every position, instead of one distinct weight per input–output pair',
      'Locality: the kernel is only ever applied near the centre of the input, and the edges are skipped entirely',
      'Zero-padding: the "same"-mode boundary handling discards most of the input before any weight is applied',
      'Normalisation: dividing the kernel by its own sum removes the need to store a separate weight per position'
    ],
    correctIndex: 0,
    answer: 'Parameter sharing is the mechanism: the same handful of kernel weights is reused at every position, so a kernel needs only K parameters regardless of input size. Locality explains why the same small kernel generalises across positions, not why the parameter count is low, and it is applied everywhere, not just the centre. Zero-padding is boundary handling and discards nothing from the input itself. Normalisation is about output scale and has nothing to do with parameter count.',
    contentRef: 'l3-convolution-locality-sharing'
  },

  {
    id: 'l3-009',
    lecture: 3,
    topic: 'convolution',
    mode: 'mc',
    question: 'You need a smoothed signal plotted sample-for-sample against the original time axis. Which np.convolve mode do you choose, and what is the price of that choice?',
    options: [
      '"valid", accepting an output of length N−K+1 that no longer starts at the same sample as the input',
      '"same", accepting that the first and last roughly K/2 samples are biased downward by the implicit zero-padding',
      '"full", accepting a longer output of length N+K−1 that nonetheless lines up exactly with every input sample',
      '"same", accepting that the kernel must be renormalised separately at every single position to keep the length equal to N'
    ],
    correctIndex: 1,
    answer: '"same" zero-pads and returns an output of length N, so sample n of the output aligns with sample n of the input — the cost is that the first and last roughly K/2 samples are biased by that zero-padding. "valid" is shorter and not aligned to the original axis at all. "full" is longer, not aligned either. "same" needs no per-position renormalisation; the kernel is normalised once, before convolving.',
    contentRef: 'l3-convolution-modes'
  },

  {
    id: 'l3-010',
    lecture: 3,
    topic: 'convolution',
    mode: 'mc',
    question: 'A colleague computes rate = np.convolve(spikes, windows.hann(101), mode="same") with no division and no multiplication by fs. The resulting curve has the correct shape. What is actually wrong with it?',
    options: [
      'Nothing: shape is all that matters for a decoder, since only relative changes are meant to drive the control command',
      'The curve is shifted in time by half the kernel length, because "same" mode always introduces a hidden causal lag',
      'The curve is inverted, because an unnormalised Hanning window flips the sign of every spike that it overlaps',
      'The scale is wrong by roughly the kernel’s own sum, and the result is no longer in units of spikes per second'
    ],
    correctIndex: 3,
    answer: 'An unnormalised Hanning window of length 101 sums to about L/2 = 50, so the output is roughly fifty times too large and has lost its units of spikes per second. Dividing by h.sum() restores a weighted average, and multiplying by fs converts per-sample to per-second. Shape alone is not enough for a real decoder, since downstream thresholds depend on scale; "same" mode is centred and introduces no causal lag; and nothing about the computation inverts any sign.',
    contentRef: 'l3-kernel-normalization-pitfall'
  },

  {
    id: 'l3-011',
    lecture: 3,
    topic: 'bias-variance',
    mode: 'mc',
    question: 'The same Hanning window is convolved with a noisy pulse signal at three lengths, L = 7, L = 31 and L = 101. At L = 101 the pulses are almost entirely smoothed away. What is the correct diagnosis, and what should be changed first?',
    options: [
      'High variance from averaging too few samples; the fix is to swap the shape from Hanning to Gaussian first',
      'Spectral leakage from an untapered window; the fix is to replace the Hanning window with a rectangular one first',
      'High bias from averaging too many samples; the length should be shortened first, since shape barely moves the trade-off',
      'Aliasing from a kernel wider than the Nyquist limit; the sampling rate should be raised first'
      ],
    correctIndex: 2,
    answer: 'This is the window-length bias–variance trade-off: a long kernel has low variance but high bias, smearing genuine pulses across its whole length, so the length should be shortened first — shape only changes how gracefully the trade-off is realised at a given length. It is not a variance problem, since too few samples is the L = 7 case, the opposite symptom. It is not leakage, which concerns spectral estimation rather than time-domain smoothing, and the Hanning window already tapers. Nothing here is about the sampling rate or aliasing.',
    contentRef: 'l3-window-length-bias-variance'
  },

  {
    id: 'l3-012',
    lecture: 3,
    topic: 'convolution',
    mode: 'short',
    question: 'What are the two properties of a convolution that make it efficient, and how do they show up in a convolutional neural network?',
    answer: 'Locality — the same local structure recurs throughout the input, so one small detector suffices — and parameter sharing — the same kernel weights are reused at every position. In a CNN this means a layer has only K parameters per kernel regardless of input size, instead of one weight per input–output pair.',
    contentRef: 'l3-convolution-locality-sharing'
  },

  {
    id: 'l3-013',
    lecture: 3,
    topic: 'convolution',
    mode: 'short',
    question: 'Explain the difference between mode="valid" and mode="same" in np.convolve, and say which you want when smoothing a signal you intend to plot against its original time axis.',
    answer: '"valid" keeps only positions where the kernel fully overlaps the signal, giving an output of length N−K+1. "same" zero-pads and returns length N. For plotting against the original time axis you want "same", so that sample n of the output aligns with sample n of the input — but be aware that the first and last roughly K/2 samples are biased downward by the zero-padding.',
    contentRef: 'l3-convolution-modes'
  },

  {
    id: 'l3-014',
    lecture: 3,
    topic: 'convolution',
    mode: 'short',
    question: 'You convolve a binary spike train with scipy.signal.windows.hann(101) at fs = 1000 Hz but forget to divide by h.sum(). What is wrong with the result?',
    answer: 'The shape is right but the scale is wrong. An unnormalised Hanning window of length 101 sums to about L/2 = 50, so the output is roughly fifty times too large and is no longer in spikes per second. Dividing by h.sum() makes it a weighted average; multiplying by fs converts per-sample to per-second.',
    contentRef: 'l3-kernel-normalization-pitfall'
  },

  {
    id: 'l3-015',
    lecture: 3,
    topic: 'convolution',
    mode: 'short',
    question: 'Why does a smooth decoder kernel matter for a prosthetic hand, given that the total displacement produced by the spikes is unchanged either way?',
    answer: 'Because control quality is about the trajectory, not the endpoint. Raw impulses produce a staircase with large instantaneous accelerations, so the effector overshoots and twitches around a target instead of holding it. A smooth kernel turns the sparse impulses into a continuous velocity command, so the same total movement is executed smoothly and can be held stably.',
    contentRef: 'l3-spikes-with-convolution'
  },

  {
    id: 'l3-016',
    lecture: 3,
    topic: 'bias-variance',
    mode: 'short',
    question: 'Give the rule of thumb for a first choice of smoothing window and justify it in terms of the bias–variance trade-off.',
    answer: 'Hanning, length ≈ f_s/4 samples. Hanning because it tapers to zero at both ends and so leaks least; a quarter-second because it is long enough to average away sample-level noise (low variance) but short enough that most physiological events of interest are not smeared across it (acceptable bias). Adjust the length first if the result looks wrong.',
    contentRef: 'l3-window-shapes-cheatsheet'
  },

  {
    id: 'l3-017',
    lecture: 3,
    topic: 'matrices',
    mode: 'short',
    question: 'Why is np.linalg.solve(X.T @ X, X.T @ y) preferred over np.linalg.inv(X.T @ X) @ (X.T @ y) for training a linear-regression model?',
    answer: 'solve is both faster and numerically better conditioned than explicitly forming the inverse and then multiplying. Computing an explicit inverse is almost never the right move; it is the linear-algebra equivalent of comparing floats with ==.',
    contentRef: 'l3-solve-vs-inverse'
  },

  {
    id: 'l3-019',
    lecture: 3,
    topic: 'convolution',
    mode: 'mc',
    question: 'A decoder drives a prosthetic effector directly from raw spike events, without convolving them against a smoothing kernel first. What does the resulting control signal look like?',
    options: [
      'A smooth ramp indistinguishable from a convolved decode, since integrating spikes over time already performs the same smoothing the kernel would',
      'The correct trajectory shape but shifted by a constant delay of exactly one inter-spike interval, which is trivial to compensate for afterward',
      'No signal at all, since an effector cannot be driven from discrete spike events without first passing them through some matched filter',
      'A jagged staircase that ticks forward at each spike and holds between them — unusable as a trajectory though the total displacement is correct'
    ],
    correctIndex: 3,
    answer: 'Without convolution, each spike moves the effector by one tick and then holds until the next spike, producing a jagged staircase trajectory that keeps twitching past the target. The total integrated displacement can be exactly correct even though the trajectory itself is unusable as a control signal — control quality is about the shape of the trajectory, not only its endpoint.',
    contentRef: 'l3-spikes-without-convolution'
  },

  {
    id: 'l3-018',
    lecture: 3,
    topic: 'vectors',
    mode: 'short',
    question: 'A database of 1 000 sentence embeddings, each of length 1 536, is stored as X with shape (1000, 1536). Write the NumPy computation that finds the row of X closest to a query embedding q of shape (1536,), and explain why no Python loop is needed.',
    answer: 'diffs = X - q broadcasts q across every row; dists = np.linalg.norm(diffs, axis=1) gives one distance per row; nearest = np.argmin(dists) picks the closest. No loop is needed because NumPy aligns the shapes from the trailing axis, stretches q automatically across all 1 000 rows, and runs the whole computation in compiled code.',
    contentRef: 'l3-nearest-neighbor-numpy'
  }
);
