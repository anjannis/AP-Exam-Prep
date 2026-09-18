// questions/l8.js
// Question bank for Chapter 8. 18 questions, 11 mc / 7 short (ratio 0.61).
// Several short answers are the script's own end-of-chapter exam questions,
// in the course's wording, with model answers a marker would accept.
//
// Answer-key hygiene, enforced by checkAnswerBalance and checkOptionLengthBias
// in tools/validate.js: correctIndex is spread 3/3/3/2 across 0-3, all four
// positions used, and the four options of every question are written to
// comparable length so that neither position nor length signals the answer.
// Explanations quote option text rather than option numbers, so they survive
// any later reordering.
//
// Plain browser script: no imports, no exports. It pushes onto the QUESTIONS
// array declared in questions.js.

QUESTIONS.push(
  {
    id: 'l8-001',
    lecture: 8,
    topic: 'mvvm',
    mode: 'mc',
    question: 'Why must the View not receive TCP data directly, routing it through the ViewModel instead?',
    options: [
      'Because PySide6 widgets cannot subscribe to a raw socket object without first wrapping it in a QThread',
      'Because VisPy and Matplotlib both require their input already reshaped to (32, 18) before they can draw it',
      'Because the View would then need to know the packet format, the socket lifecycle and the threading model',
      'Because Qt forbids any object other than a QThread subclass from calling recv() on a socket it does not own'
    ],
    correctIndex: 2,
    answer: 'Routing data through the ViewModel keeps each layer independently testable and replaceable. If the View received TCP data directly it would have to know the packet format, the socket lifecycle and the threading model, so the plotting code could not be changed or tested without a live server, and two developers could not work on the two concerns in parallel.',
    contentRef: 'l8-view-layer'
  },

  {
    id: 'l8-002',
    lecture: 8,
    topic: 'tcp',
    mode: 'mc',
    question: 'A team’s client calls sock.recv(4608) once per packet and reshapes the result directly to (32, 18). Why does this work in local testing and fail after deployment?',
    options: [
      'recv(4608) blocks until exactly 4608 bytes have arrived, so the failure only appears once the server changes size',
      'recv(n) returns at most n bytes, not exactly n, so a real network or a busy machine may hand back a partial packet',
      'np.frombuffer refuses to reshape a read-only buffer once the connection has been open for more than a few seconds',
      'Localhost delivers packets out of order, so the reshape silently transposes channels and samples without raising'
    ],
    correctIndex: 1,
    answer: 'recv(n) returns at most n bytes, not exactly n. On localhost, packets usually arrive whole and the call happens to return 4608 bytes, but over a real network, or under load, it may return a partial packet or several packets’ worth, so the reshape either raises or silently produces misaligned data. The fix is to accumulate into a buffer and drain complete 4608-byte packets with a while loop.',
    contentRef: 'l8-tcp-byte-stream-pitfall'
  },

  {
    id: 'l8-003',
    lecture: 8,
    topic: 'engineering-practice',
    mode: 'short',
    question: 'Why is the socket read placed in a QThread rather than in a timer callback on the GUI thread?',
    answer: 'Because recv() blocks. Blocking the GUI thread stops the Qt event loop, so the window stops repainting and stops responding to input. A worker thread can block safely and hand results back through Qt signals, which are queued and delivered on the receiving object’s thread.',
    contentRef: 'l8-tcp-thread-necessity'
  },

  {
    id: 'l8-004',
    lecture: 8,
    topic: 'causality',
    mode: 'short',
    question: 'Justify a choice of filter parameters for this project’s signal, and explain why filtfilt is acceptable offline but questionable live.',
    answer: 'A fourth-order Butterworth band-pass from 20 to 450 Hz plus a 50 Hz notch: Butterworth for a maximally flat pass-band, 20 Hz to remove drift and movement artefact, 450 Hz because it sits below the Nyquist limit at fs = 2 kHz, and the notch for mains interference. filtfilt runs the filter forwards and backwards for zero phase distortion — ideal offline, where the whole record is available. Live, it is non-causal: it needs samples that have not arrived, so applying it to a sliding window makes already-displayed samples change retroactively and reintroduces the start-up transient on every redraw. A causal lfilter carrying its state between packets is the correct live choice.',
    contentRef: 'l8-causal-vs-noncausal-live'
  },

  {
    id: 'l8-005',
    lecture: 8,
    topic: 'visualisation',
    mode: 'mc',
    question: 'How should the vertical offset between traces in the Plot All Channels view be chosen?',
    options: [
      'Derive it from the data, for example a few standard deviations of the displayed block, so it adapts to amplitude',
      'Fix it at a constant number of pixels, since a data-dependent offset would shift every time the view is resized',
      'Set it to the converter’s full-scale range divided by 32, so every channel gets an equal share of the axis',
      'Leave it at zero and rely on VisPy’s automatic camera range to keep the 32 overlapping traces readable'
    ],
    correctIndex: 0,
    answer: 'The offset should come from the data — a few standard deviations of the displayed block, for example 4σ — so the traces stay separated without wasting space when the amplitude is small and without overlapping when it is large. A fixed pixel gap or a converter-derived constant would not track the signal’s own amplitude, and leaving channels unoffset makes 32 overlapping traces unreadable.',
    contentRef: 'l8-plot-all-channels-offset'
  },

  {
    id: 'l8-006',
    lecture: 8,
    topic: 'mvvm',
    mode: 'short',
    question: 'Name the layer each of the following belongs in, and why: the 4608-byte constant; the currently selected channel index; the QComboBox listing channels.',
    answer: 'The 4608-byte constant belongs to the Model — it is a property of the wire format. The selected channel index belongs to the ViewModel — it is application state that determines what gets published, and it must survive a redesign of the widget. The QComboBox belongs to the View — it is one possible presentation of that state, and could equally be a spin box or a keyboard shortcut.',
    contentRef: 'l8-layer-membership-example'
  },

  {
    id: 'l8-007',
    lecture: 8,
    topic: 'mvvm',
    mode: 'mc',
    question: 'A single 900-line MainWindow class handles the socket, the filtering and the plotting. What problem does MVVM specifically fix here?',
    options: [
      'It removes the need for unit tests, since the layered design is provably correct by construction',
      'It lets VisPy replace Matplotlib without changing a single line anywhere else in the application',
      'It reduces the total amount of code, since each layer is shorter than the class it replaces',
      'It separates concerns that change at different rates, so a change to one no longer risks breaking the others'
    ],
    correctIndex: 3,
    answer: 'The three concerns — what the data is, what the user is doing, and what it looks like — change at different rates and for different reasons. In one class, any change to one risks breaking the other two: the maths cannot be tested without opening a window, and the layout cannot be redesigned without touching the socket code. MVVM does not shrink the codebase or remove the need for tests; it isolates each concern so it can be changed and tested on its own.',
    contentRef: 'l8-mvvm-problem'
  },

  {
    id: 'l8-008',
    lecture: 8,
    topic: 'tcp',
    mode: 'mc',
    question: 'A single recv() call returns 9216 bytes while the buffer was previously empty. What must the receive loop do with them?',
    options: [
      'Discard the call and wait for the next one, since 9216 is not a multiple of the expected single-packet size',
      'Drain two complete 4608-byte packets from the buffer in a while loop, since 9216 is exactly two packets',
      'Reshape the 9216 bytes directly to (32, 36), doubling the sample count for this one arrival only',
      'Split the bytes in half and treat each 4608-byte half as one channel’s worth of the next packet'
    ],
    correctIndex: 1,
    answer: '9216 bytes is exactly two 4608-byte packets. The loop must drain both with a while len(buf) >= PACKET_BYTES loop, emitting one packet_received signal per complete packet, rather than reshaping the arrival as a single unit or discarding it.',
    contentRef: 'l8-packet-format'
  },

  {
    id: 'l8-010',
    lecture: 8,
    topic: 'tcp',
    mode: 'short',
    question: 'Why is full_record a memory concern for this project, and what are two acceptable ways to address it in the README?',
    answer: 'full_record concatenates every packet ever received and never shrinks, growing at roughly 512 kB per second at 2 kHz and 32 channels, or about 1.8 GB per hour. Two acceptable responses are to state the limitation explicitly in the README as a known constraint for a demo-length run, or to cap the record at a fixed length and document that cap.',
    contentRef: 'l8-full-record-memory'
  },

  {
    id: 'l8-011',
    lecture: 8,
    topic: 'mvvm',
    mode: 'mc',
    question: 'The View’s Connect button is clicked. Which sequence correctly describes what happens next under the MVVM contract?',
    options: [
      'The View calls connect_to_server on the ViewModel, which later emits status_updated for the View to display',
      'The View opens the socket directly and emits a signal to the ViewModel once the connection succeeds or fails',
      'The ViewModel polls the View’s port field on a timer and opens the socket itself once a value is entered',
      'The Model itself emits a connection_requested signal that the View intercepts and forwards to the ViewModel'
    ],
    correctIndex: 0,
    answer: 'View to ViewModel traffic is a slot call: the button’s clicked signal is connected to vm.connect_to_server(port). ViewModel to View traffic is a signal emission: the ViewModel emits status_updated (and connection_changed) once it knows the outcome, and the View’s label is connected to that signal. The View never opens the socket, and the Model never talks to the View at all.',
    contentRef: 'l8-mvvm-two-contracts'
  },

  {
    id: 'l8-012',
    lecture: 8,
    topic: 'filtering',
    mode: 'mc',
    question: 'Why is a Butterworth filter, specifically, chosen for the band-pass in this project rather than an equally steep alternative?',
    options: [
      'Because it is the only filter family SciPy’s butter function is able to design for a band-pass shape',
      'Because a Butterworth filter needs no notch stage afterwards, unlike a Chebyshev or elliptic design',
      'Because it can be run with filtfilt but not with lfilter, which matters for the project’s live path',
      'Because its pass-band is maximally flat, so it does not add ripple to the amplitudes being measured'
    ],
    correctIndex: 3,
    answer: 'A Butterworth filter is chosen because its pass-band is maximally flat — it does not introduce the ripple that a Chebyshev or elliptic design of the same order would, which matters because the amplitudes inside the pass-band are exactly what the RMS mode goes on to measure. SciPy’s butter designs several filter families, a notch is still applied separately at 50 Hz, and both filtfilt and lfilter can run any of them.',
    contentRef: 'l8-butterworth-choice'
  },

  {
    id: 'l8-013',
    lecture: 8,
    topic: 'filtering',
    mode: 'mc',
    question: 'Why must the causal live filter pass its state, zi, from one packet to the next instead of starting fresh each time?',
    options: [
      'Because SciPy’s lfilter raises an exception if it is called twice in a row without an explicit zi argument',
      'Because starting fresh treats every packet as the start of the recording, reintroducing a start-up transient each time',
      'Because the notch filter’s coefficients change slightly between packets and zi is what recalculates them',
      'Because zi is required to convert the packet’s dtype from float64 to the type the plotting widget expects'
    ],
    correctIndex: 1,
    answer: 'lfilter_zi computes an initial state, and passing the returned zi back into the next call carries the filter’s memory forward. Without that, each packet would be filtered as if the recording had just started, reintroducing the filter’s start-up transient on every single packet rather than only once at the beginning of the stream.',
    contentRef: 'l8-lfilter-zi-state'
  },

  {
    id: 'l8-014',
    lecture: 8,
    topic: 'visualisation',
    mode: 'short',
    question: 'Why is VisPy used for the live plot instead of Matplotlib, and what does that choice cost the developer?',
    answer: 'VisPy draws with OpenGL and can redraw tens of thousands of points at 60 Hz, where Matplotlib would manage only a handful of frames per second — necessary for a continuously streaming display. The cost is that VisPy gives much less for free: axes, tick labels and camera ranges have to be built and linked by hand instead of appearing automatically.',
    contentRef: 'l8-vispy-vs-matplotlib'
  },

  {
    id: 'l8-015',
    lecture: 8,
    topic: 'visualisation',
    mode: 'short',
    question: 'Name the two performance traps in the live VisPy plot, and the fix for each.',
    answer: 'First, redrawing on every incoming packet stalls the display once packets arrive faster than the screen refreshes; the fix is to accumulate into the buffer on every packet but drive the redraw from a QTimer at 30–60 Hz. Second, recreating the Line objects inside the update method leaks GPU objects until the application stalls; the fix is to create them once and call set_data on every redraw instead.',
    contentRef: 'l8-redraw-timer-pitfall'
  },

  {
    id: 'l8-016',
    lecture: 8,
    topic: 'engineering-practice',
    mode: 'mc',
    question: 'A user types "80k" into the port field and clicks Connect. Which exception does int("80k") raise, and how should the View respond?',
    options: [
      'OverflowError, because a non-numeric string overflows the integer parser’s expected numeric range',
      'ConnectionRefusedError, because the malformed port text is treated as a failed low-level connection',
      'ValueError, because the text is not numeric, and the View should catch it before calling the ViewModel',
      'TypeError, because int() accepts only strings built entirely out of ASCII digit characters'
    ],
    correctIndex: 2,
    answer: 'int() raises ValueError when its argument is not a valid base-10 integer string, which "80k" is not. The View should catch that ValueError before ever calling the ViewModel, and display a status message such as "\'80k\' is not a valid port number" rather than letting the exception propagate. OverflowError is reserved for a numeric but out-of-range port, and ConnectionRefusedError only occurs once a socket actually attempts to connect.',
    contentRef: 'l8-five-failure-cases'
  },

  {
    id: 'l8-017',
    lecture: 8,
    topic: 'engineering-practice',
    mode: 'short',
    question: 'The brief requires that the application "must not crash". Why is wrapping every call in except Exception: pass the wrong way to satisfy that requirement?',
    answer: 'A blanket except Exception: pass makes the application look robust in a demo but impossible to debug, because it silently swallows failures the developer never anticipated along with the ones that were planned for. The correct approach is to catch the specific exceptions that have been thought through — ConnectionRefusedError, ValueError, OverflowError, OSError — and let anything unexpected produce a readable traceback.',
    contentRef: 'l8-no-bare-except'
  },

  {
    id: 'l8-018',
    lecture: 8,
    topic: 'engineering-practice',
    mode: 'mc',
    question: 'A team’s application installs and runs, but two of the required signal modes are missing. What does the brief’s pass/fail gate say about grading this submission?',
    options: [
      'Because it installs, launches and runs without critical errors, the missing modes are simply marked as a deficiency',
      'The submission automatically fails outright, since any missing requirement is treated exactly like a failed install',
      'The gate does not apply to individual features, only to the choice of VisPy versus Matplotlib for plotting',
      'The team must resubmit a corrected version before any part of the application can be assessed at all'
    ],
    correctIndex: 0,
    answer: 'The one gate that overrides everything else is whether the application can be installed, launched and run without critical errors — if it can, the other criteria, including which signal modes are present, can be checked individually, and missing modes are marked as a deficiency rather than causing an automatic fail. The gate only bites when the application cannot even be started; it says nothing about resubmission or about one specific technology choice.',
    contentRef: 'l8-pass-fail-gate'
  },

  {
    id: 'l8-019',
    lecture: 8,
    topic: 'mvvm',
    mode: 'mc',
    question: 'A developer creates the TCP socket directly inside MainWindow "because it was quicker" and calls QMessageBox.warning() from inside the TCP client whenever a connection fails. Which two rules do these break?',
    options: [
      'The ViewModel must not emit signals, and the View must not call slots directly',
      'The Model must not hold application state, and the View must not display error text',
      'The View must not receive TCP data directly, and the Model must not contain GUI code',
      'The View must not construct widgets at runtime, and the Model must not import PySide6'
    ],
    correctIndex: 2,
    answer: 'Creating the socket inside MainWindow violates "the View must not receive TCP data directly"; calling QMessageBox.warning() from inside the TCP client violates "the Model must not contain GUI code" — errors should be raised or emitted for the View to display, not shown from inside the Model.',
    contentRef: 'l8-mvvm-violations'
  },

  {
    id: 'l8-020',
    lecture: 8,
    topic: 'visualisation',
    mode: 'mc',
    question: 'A user opens the offline dialog before any packets have arrived, so full_record.size == 0. What should the dialog do?',
    options: [
      'Call the plotting function as usual, since NumPy and VisPy both draw a zero-length array as empty axes without raising',
      'Disable the offline dialog’s menu entry until the first packet arrives, so it can never be opened while empty',
      'Plot the previous session’s full_record from disk instead, since an empty array signals a fresh connection',
      'Draw a message such as "No data received yet" in the axes instead of calling the plotting function on it'
    ],
    correctIndex: 3,
    answer: 'Plotting an empty array raises rather than drawing quietly, so the correct response is to check full_record.size == 0 first and draw a message such as "No data received yet" in the axes instead of calling the plotting function on it. Disabling the menu entry or falling back to an old session does not match how the rest of the application handles this case.',
    contentRef: 'l8-offline-empty-record'
  },

  {
    id: 'l8-021',
    lecture: 8,
    topic: 'engineering-practice',
    mode: 'mc',
    question: 'A requirements.txt lists every package the application imports, and it runs fine on the developer’s machine. What actually confirms the file is complete?',
    options: [
      'Create a fresh virtual environment, install only from requirements.txt, and run the application there',
      'Run pip freeze on the development machine and compare its output line by line against the file',
      'Ask a second developer to read the import statements and manually cross-check each one against the file',
      'Relaunch the application once more on the same machine and confirm it still starts without an import error'
    ],
    correctIndex: 0,
    answer: 'A requirements.txt that works only because a package such as PySide6 happens to already be installed for another reason is exactly how a missing dependency line goes unnoticed. The only test that catches this is a fresh virtual environment, installing only from the file, and running the application there — VisPy in particular needs a working backend a development environment may provide by accident. Comparing against pip freeze, a manual read-through, or relaunching on the same machine all still run inside the environment hiding the problem.',
    contentRef: 'l8-clean-env-test'
  }
);
