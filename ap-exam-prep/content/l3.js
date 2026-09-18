// content/l3.js
// Chapter 3 of the exam script: "Vectors, Matrices and Convolutions" (printed
// pages 23-32). Sections follow the script's own subsection order, so the
// Reference Bank mirrors the chapter a reader already knows.
//
// Plain browser script: no imports, no exports. It pushes onto the LECTURES
// array declared in content.js.

LECTURES.push({
  id: 3,
  name: 'Vectors, Matrices and Convolutions',
  shortName: 'Vectors & Convolution',
  sections: [
    {
      heading: 'Vectors',
      items: [
        {
          id: 'l3-vector-definition',
          type: 'definition',
          term: 'Vector',
          body: 'A vector is a list of numbers, and every one-dimensional np.ndarray is a vector regardless of what it holds: a row of a CSV file (age, height, weight, BMI), an RGB pixel of three numbers, or a sentence embedding of 1 536 numbers produced by a large language model. Different domains, same data type, same operations.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l3-vector-add-scale',
          type: 'formula',
          term: 'The two elementary vector operations',
          body: 'A vector space supports exactly two operations: adding two vectors entry by entry, and scaling one vector by a number. That really is the whole algebraic structure of a vector space — the dot product, matrix products and convolution are all built from just these two.',
          formula: '(\\vec u + \\vec v)_i = u_i + v_i, \\qquad (\\alpha \\vec u)_i = \\alpha u_i',
          symbols: 'u and v are vectors of equal length, α a scalar and i an index running over every entry. In NumPy: u + v (element-wise sum) and alpha * u (scaling).',
          crossRef: []
        },
        {
          id: 'l3-dot-product',
          type: 'formula',
          term: 'Dot product',
          body: 'The dot product multiplies matching entries and sums the result; geometrically it measures how much of one vector points along the other. It is the single most-executed floating-point operation in computing: the linear part of every artificial neuron, y = w·x + b, the similarity score in every search engine and recommender system, and the retrieval step in every retrieval-augmented LLM.',
          formula: '\\vec u \\cdot \\vec v = \\sum_i u_i v_i = \\|\\vec u\\|\\|\\vec v\\|\\cos\\vartheta',
          symbols: 'u and v are vectors of equal length and ϑ the angle between them. In NumPy: np.dot(u, v) or the equivalent u @ v — one BLAS call, microseconds even at length 10⁶.',
          crossRef: []
        },
        {
          id: 'l3-vector-norm',
          type: 'formula',
          term: 'Vector length (norm) and distance',
          body: 'The length of a vector is found by squaring every entry, summing, and taking the square root — the same recipe as Pythagoras, now in N dimensions instead of two. The distance between two vectors is the length of their difference, ‖a − b‖, and it is the quantity k-nearest-neighbours, clustering and anomaly detection all rank by.',
          formula: '\\|\\vec v\\| = \\sqrt{v_0^2+v_1^2+\\cdots+v_{N-1}^2}',
          symbols: 'v₀…v_(N−1) are the N entries of the vector. In NumPy: np.linalg.norm(v) for one vector, np.linalg.norm(a - b) for the distance between two, and np.linalg.norm(X, axis=1) for the length of every row of a matrix at once.',
          crossRef: []
        },
        {
          id: 'l3-distance-and-ranking',
          type: 'definition',
          term: 'Distance-based ranking',
          body: 'k-nearest-neighbours, clustering and anomaly detection all rank data points by exactly one quantity: the distance between vectors, computed with the norm. Any algorithm described as "find the closest" or "find the outlier" is a distance computation underneath, and this is literally all a vector database does.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l3-nearest-neighbor-numpy',
          type: 'fact',
          term: 'A vector database in six lines',
          body: 'Broadcasting a query embedding against every row of a stored matrix, taking the row-wise norm of the difference, and finding the argmin is, functionally, an entire vector database: diffs = X - q, dists = np.linalg.norm(diffs, axis=1), nearest = np.argmin(dists). NumPy broadcasts q across every row automatically and the arithmetic runs in compiled code, so there is no Python loop — writing one by hand would be perhaps a hundred times slower and no clearer.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l3-broadcasting-rule',
          type: 'pitfall',
          term: 'Broadcasting aligns shapes from the trailing axis',
          body: 'NumPy combines arrays of different shapes by aligning them from the trailing axis and stretching any axis of length 1: (1000, 1536) − (1536,) broadcasts correctly, but (1000, 1536) − (1000,) does not, because the trailing axes 1536 and 1000 disagree and neither is length 1 — the fix is q[:, None] to insert the missing axis. Shape errors of this kind are the most common runtime failure in the exercises, and reading the shapes out loud usually finds them.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'Matrices',
      items: [
        {
          id: 'l3-matrix-definition',
          type: 'definition',
          term: 'Matrix',
          body: 'A matrix is a two-dimensional array of shape (rows, columns). Three readings cover almost every use: a dataset, where X.shape == (n_samples, n_features) and each row is one sample; an image, where img.shape == (height, width) for greyscale with a third axis added for colour; and the weights of a network layer, where W.shape == (n_out, n_in) and every row is the weight vector of one neuron.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l3-matrix-basics-numpy',
          type: 'fact',
          term: 'Matrix basics in NumPy',
          body: 'A.shape gives (rows, cols); A[0] is the first row and A[:, 0] the first column; A.T is the transpose, turning rows into columns so A[i, j] == A.T[j, i]; and np.eye(3) is the identity matrix, the "do-nothing" multiplier.',
          formula: '\\mathbf{I}\\vec x = \\vec x',
          symbols: 'I is the identity matrix, with 1s on the diagonal and 0s elsewhere. Row i of I picks out xᵢ and zeroes every other entry, which is why it leaves any vector it multiplies unchanged.',
          crossRef: []
        },
        {
          id: 'l3-matrix-vector-product',
          type: 'formula',
          term: 'Matrix times vector',
          body: 'Each output entry is one row of A dotted with x, so a matrix–vector product is m dot products computed at once — exactly what a fully connected neural-network layer computes for its m output neurons in a single step.',
          formula: 'y_i = \\sum_j A_{ij}x_j, \\qquad (m,) = (m,n)\\,(n,)',
          symbols: 'A is an (m, n) matrix and x an n-vector; the product is an m-vector y. In NumPy: y = A @ x.',
          crossRef: []
        },
        {
          id: 'l3-matrix-matrix-product',
          type: 'formula',
          term: 'Matrix times matrix',
          body: 'Each entry of C is a dot product of one row of A with one column of B, and there are m × p such pairs. The inner dimensions must match; if they do not, the multiplication is undefined rather than merely wrong.',
          formula: 'C_{ik} = \\sum_j A_{ij}B_{jk}, \\qquad (m,p) = (m,n)\\,(n,p)',
          symbols: 'A is (m, n) and B is (n, p); n is the shared inner dimension. In NumPy: C = A @ B.',
          crossRef: []
        },
        {
          id: 'l3-matmul-shape-compatibility',
          type: 'pitfall',
          term: 'Checking whether a matrix product is even defined',
          body: 'For A of shape (4, 3) and B of shape (3, 5): AB is defined and has shape (4, 5), since the inner dimension 3 matches. BA is undefined because 5 ≠ 4. AᵗB is undefined because Aᵗ is (3, 4) and 4 ≠ 3. ABᵗ is undefined because Bᵗ is (5, 3) and 3 ≠ 5. Checking the inner dimensions before multiplying catches most shape errors before they happen.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l3-matmul-commutative-associative',
          type: 'distinction',
          term: 'Not commutative, but associative',
          body: 'Matrix multiplication is not commutative — AB ≠ BA in general, and swapping the order is usually a shape error rather than a merely wrong answer, which is a mercy. It is associative, (AB)x = A(Bx), so composing two linear layers gives one linear layer; this is precisely why neural networks need a non-linearity between layers, since without one, depth buys nothing.',
          formula: 'AB\\neq BA, \\qquad (AB)\\vec x = A(B\\vec x)',
          symbols: 'A and B are matrices with shapes compatible for the products shown. The associativity holds for any chain of matrix–vector products, regardless of how many layers are composed.',
          crossRef: []
        },
        {
          id: 'l3-matmul-worked-example',
          type: 'fact',
          term: 'Worked example: 2×2 matrix product',
          body: 'For A = [[1, 2], [3, 4]] and B = [[5, 6], [7, 8]], C = A @ B = [[19, 22], [43, 50]], verifiable by hand in twenty seconds: C₀₀ = 1·5 + 2·7 = 19, and so on for every entry.',
          formula: 'C = AB = \\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}\\begin{pmatrix}5&6\\\\7&8\\end{pmatrix} = \\begin{pmatrix}19&22\\\\43&50\\end{pmatrix}',
          symbols: 'Each entry Cᵢₖ is row i of A dotted with column k of B.',
          crossRef: []
        },
        {
          id: 'l3-linear-regression-normal-equations',
          type: 'formula',
          term: 'Linear regression in three lines',
          body: 'One @ for prediction and one solve for training is the entire linear-regression pipeline; sklearn.linear_model.LinearRegression is a wrapper around exactly these two lines with error checking and conveniences bolted on.',
          formula: '\\vec w = \\mathrm{solve}(X^{T}X,\\, X^{T}\\vec y), \\qquad \\hat{\\vec y} = X_{new}\\vec w',
          symbols: 'X is the (n, d) design matrix, y the n-vector of targets and w the d-vector of weights being solved for. In NumPy: w = np.linalg.solve(X.T @ X, X.T @ y) to train, y_pred = X_new @ w to predict, and mse = np.mean((y_pred - y_true) ** 2) to score.',
          crossRef: []
        },
        {
          id: 'l3-solve-vs-inverse',
          type: 'pitfall',
          term: 'Use solve, not an explicit inverse',
          body: 'np.linalg.solve(A, b) is both faster and numerically better conditioned than np.linalg.inv(A) @ b. Computing an explicit inverse is almost never the right move — it is the linear-algebra equivalent of comparing floats with ==.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'Convolution',
      items: [
        {
          id: 'l3-convolution-definition',
          type: 'formula',
          term: 'Convolution',
          body: 'A convolution is one small kernel slid across an input, computing one dot product at every position — that is the entire definition, and everything else about it is a consequence. The moving-average envelope of the previous chapter was already a 1D convolution with a uniform kernel, without being named as one.',
          formula: 'y[n] = \\sum_k h[k]\\,x[n-k]',
          symbols: 'x is the input signal, h the kernel (also called a filter or a window) of length K, and y the output. In NumPy: y = np.convolve(x, h, mode=...).',
          crossRef: ['convolution']
        },
        {
          id: 'l3-convolution-locality-sharing',
          type: 'distinction',
          term: 'Why convolution is efficient: locality and parameter sharing',
          body: 'Two properties make convolution powerful. Locality: structure in a signal or image tends to look similar wherever it occurs, so a detector that works at one position works everywhere. Parameter sharing: the same handful of kernel weights is reused at every position, so a convolutional layer has orders of magnitude fewer parameters than a fully connected layer over the same input, needing only K parameters per kernel regardless of input size.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l3-convolution-modes',
          type: 'formula',
          term: 'The three convolution boundary modes',
          body: 'np.convolve(x, h, mode=...) takes one of three boundary modes, and they differ only in how much of the sliding window near the edges is kept. "same" is the default choice for plotting against the original time axis, but its first and last roughly K/2 samples are biased by the implicit zero-padding.',
          formula: '\\text{valid: } N-K+1, \\qquad \\text{same: } N, \\qquad \\text{full: } N+K-1',
          symbols: 'N is the length of the input and K the length of the kernel. "valid" keeps only positions of full overlap (shortest output); "same" zero-pads and centres the kernel, returning an output the same length as the input; "full" keeps every position of any overlap (longest output).',
          crossRef: ['convolution']
        },
        {
          id: 'l3-convolution-worked-example',
          type: 'fact',
          term: 'Worked example: a three-tap moving average',
          body: 'For x = [1, 2, 3, 4, 5] and a uniform kernel h = [1/3, 1/3, 1/3], y[2] = (1+2+3)/3 = 2 and y[3] = (2+3+4)/3 = 3. A uniform kernel computes the local mean, which is exactly the moving average.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l3-envelope-is-convolution',
          type: 'fact',
          term: 'The sEMG envelope, seen as a convolution',
          body: 'Rectifying an sEMG signal and then smoothing it with a moving average, as in the previous chapter, is a convolution of the rectified signal with a normalised uniform kernel. Recognising this means every intuition about kernel length and boundary modes carries over unchanged.',
          formula: null,
          symbols: null,
          crossRef: ['convolution']
        },
        {
          id: 'l3-spike-to-firing-rate',
          type: 'formula',
          term: 'From spikes to a firing rate',
          body: 'A motor unit or cortical neuron emits spikes — a sparse train of ones in a sea of zeros — but the quantity needed for control is a continuous firing rate in spikes per second. Convolving the binary spike train with a smooth, normalised kernel produces exactly that, turning an abstraction into a usable signal.',
          formula: '\\mathrm{rate} = \\left(x * \\frac{h}{\\sum h}\\right) f_s',
          symbols: 'x is the binary spike train, h a smooth kernel such as a Hanning window and f_s the sampling rate. In NumPy: h = sg.windows.hann(101); rate = np.convolve(spikes, h / h.sum() * fs, mode="same").',
          crossRef: ['convolution']
        },
        {
          id: 'l3-kernel-normalization-pitfall',
          type: 'pitfall',
          term: 'Forgetting to normalise the kernel before convolving',
          body: 'An unnormalised Hanning window of length 101 sums to about L/2 = 50, so convolving against it without dividing by h.sum() gives an output of the right shape but roughly fifty times too large and no longer in the intended units. Dividing by h.sum() makes the kernel a weighted average rather than a weighted sum; multiplying by f_s then converts spikes-per-sample into spikes-per-second — forgetting either gives a curve of the right shape and the wrong units, a classic silent error.',
          formula: null,
          symbols: null,
          crossRef: ['convolution']
        }
      ]
    },

    {
      heading: 'Window functions',
      items: [
        {
          id: 'l3-window-definition',
          type: 'definition',
          term: 'Window function',
          body: 'A window is a kernel of length L whose values are positive and, after normalisation, sum to one; it is slid across a signal exactly like any other convolution kernel, and what distinguishes one window from another is only its shape. Signal-processing textbooks call them windows; deep-learning papers call them kernels or filters — they are the same object under two vocabularies.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l3-window-shapes-cheatsheet',
          type: 'fact',
          term: 'Choosing a window shape',
          body: 'Rectangular is the simple moving average, useful for quick exploration when leakage does not matter yet. Hanning is a smooth bell that ends exactly at zero and is the default for spectral plots and general smoothing. Hamming is like Hanning but ends slightly above zero, giving a narrower main lobe. Gaussian is the smoothest of the four, with its width set by σ, and is preferred when derivatives will also be taken. Rule of thumb when in doubt: start with a Hanning window of length ≈ f_s/4 samples.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l3-window-length-bias-variance',
          type: 'distinction',
          term: 'Window length is a bias–variance trade-off',
          body: 'A short kernel follows the data closely but lets noise through: low bias, high variance. A long kernel smooths the noise away but washes out genuine pulses, smearing them across its whole length: low variance, high bias. This is the same trade-off as the envelope window of the previous chapter and the segment length of a Welch estimate, appearing for the third time — changing the length moves you along the trade-off, while changing the shape only changes how gracefully you sit at a given point on it.',
          formula: null,
          symbols: null,
          crossRef: ['bias-variance', 'convolution']
        },
        {
          id: 'l3-window-length-vs-shape',
          type: 'fact',
          term: 'Length beats shape',
          body: 'If a smoothed trace looks wrong, adjust the window length first, not its shape: length sets where you sit on the bias–variance trade-off, while shape only determines how gracefully that trade-off is realised at a given length. Swapping windows.hann for windows.hamming or windows.gaussian in a convolution changes nothing else in the code.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l3-accelerometer-cleaning-applied',
          type: 'fact',
          term: 'Applied: cleaning an accelerometer trace',
          body: 'A smartphone accelerometer sampled at 100 Hz is cleaned with a 250 ms Hanning window: w = windows.hann(int(0.25 * fs)), normalised with w = w / w.sum(), then smooth = np.convolve(raw, w, mode="same"). The window must be normalised before convolving — an un-normalised window is a weighted sum, not a weighted average, and inflates the result.',
          formula: null,
          symbols: null,
          crossRef: ['convolution']
        }
      ]
    },

    {
      heading: 'Spike-driven control',
      items: [
        {
          id: 'l3-bci-decoder-pipeline',
          type: 'fact',
          term: 'The brain–computer-interface pipeline',
          body: 'The chain runs neurons (the motor cortex fires spikes encoding intent) → electrodes (a multi-channel array records spike times) → decoder (convolution turns spikes into a command) → effector (a robot arm, prosthetic hand or cursor). This chapter is the decoder stage, and the claim is concrete: a single np.convolve call decides whether the prosthesis jitters or moves smoothly.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l3-spikes-without-convolution',
          type: 'pitfall',
          term: 'Driving an effector directly from spikes',
          body: 'Without convolution, each spike is treated as a single impulse: the effector ticks forward, stops, and ticks again, producing a jagged staircase trajectory that keeps twitching past a target. This is unusable as a control signal even though the total integrated displacement is exactly correct — control quality is about the trajectory, not only the endpoint.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l3-spikes-with-convolution',
          type: 'fact',
          term: 'Smooth spike-driven control',
          body: 'Convolving a spike train with a smooth kernel such as a Hanning window turns the sparse impulses into a continuous velocity signal, so the effector glides along the firing-rate envelope and can park cleanly on a target instead of overshooting it. The total displacement is unchanged either way — only the decoder, and therefore the trajectory, differs. Real systems built on this include BrainGate, Neuralink’s decoders, the Utah array, and the EMG-based myocontrol systems of the next chapter.',
          formula: null,
          symbols: null,
          crossRef: ['convolution']
        },
        {
          id: 'l3-three-views-ndarray',
          type: 'fact',
          term: 'Three views of one np.ndarray',
          body: 'The same array supports three readings: as a vector it can be added, scaled, dotted and measured for length (a + b, u @ v, np.linalg.norm); as a matrix it is a table of numbers subject to matrix–vector and matrix–matrix products (A @ x, A @ B, A.T, np.eye); and under a kernel it becomes a sliding-window operation on spike rasters or signals (np.convolve, windows.hann). The dot product, the matrix product and convolution are the three operations doing all the work, in this chapter and in machine learning generally.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    }
  ]
});
