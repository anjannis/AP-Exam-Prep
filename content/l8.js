// content/l8.js
// Chapter 8 of the exam script: "The Final Project: A TCP Signal
// Visualisation Application" (printed pages 65-82). Unlike the other
// chapters this is not a lecture but a complete working brief for the
// graded final project, so it is authored as examinable concepts and
// contracts rather than as a how-to: what MVVM requires and forbids, the
// wire format and the two bugs that follow from getting it wrong, the three
// signal modes and why the live one differs from the offline one, and the
// pass/fail gate around all of it. There is no lecture deck for this
// chapter; the script and Appendix A's "Project constants" section are the
// only sources. Sections follow the script's own subsection order.
//
// Plain browser script: no imports, no exports. It pushes onto the LECTURES
// array declared in content.js.

LECTURES.push({
  id: 8,
  name: 'The Final Project: A TCP Signal Visualisation Application',
  shortName: 'The Final Project',
  sections: [
    {
      heading: 'MVVM, properly explained',
      items: [
        {
          id: 'l8-mvvm-problem',
          type: 'definition',
          term: 'The problem MVVM solves',
          body: 'A GUI application has three concerns that change at different rates and for different reasons: what the data is, what the user is currently doing with it, and what it looks like. Writing all three into one class means every change to any one of them risks breaking the other two — the maths cannot be tested without opening a window, the layout cannot be redesigned without touching the socket code, and two people cannot work on the class at once. MVVM (Model–View–ViewModel) separates the three and fixes a direction for the traffic between them.',
          formula: null,
          symbols: null,
          crossRef: ['separation-of-concerns']
        },
        {
          id: 'l8-model-layer',
          type: 'definition',
          term: 'The Model layer: data and domain logic, no GUI',
          body: 'The Model owns the data and the domain logic: here, the TCP socket, the byte buffer, packet reconstruction, the rolling buffer, and the filtering and RMS routines. Its contract is that it contains no GUI code — it must not import a widget, must not know that a plot exists, and must be runnable from a plain Python script with no QApplication.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l8-viewmodel-layer',
          type: 'definition',
          term: 'The ViewModel layer: state and orchestration',
          body: 'The ViewModel owns the application state and orchestrates the other two layers: which channel is selected, which signal mode is active, whether the client is connected, and what the status text should say. It receives raw data from the Model, asks the Model to process it, and publishes the result; its contract is that it knows nothing about widgets either, so it emits signals and does not care who, if anyone, is listening.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l8-view-layer',
          type: 'definition',
          term: 'The View layer: widgets and drawing, no socket',
          body: 'The View owns the widgets and the drawing: the port field, the Connect and Stop buttons, the status label, the channel and mode selectors, the VisPy canvas and the Matplotlib dialog. Its contract is that it never receives TCP data directly — it connects a button to a ViewModel slot, connects a ViewModel signal to a redraw method, and does nothing else.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l8-mvvm-two-contracts',
          type: 'fact',
          term: 'The two contracts, and the direction of travel',
          body: 'Two sentences summarise the whole architecture: the Model contains no GUI code, and the View never touches the socket. Traffic runs one way in each direction — View to ViewModel by calling a slot, ViewModel to View by emitting a signal — and the View and the Model never meet directly at all.',
          formula: null,
          symbols: null,
          crossRef: ['separation-of-concerns']
        },
        {
          id: 'l8-mvvm-violations',
          type: 'pitfall',
          term: 'The two most common MVVM violations',
          body: '"The View should not directly receive TCP data" is violated by creating the socket inside MainWindow because it was quicker to write. "The Model should not contain GUI code" is violated by calling QMessageBox.warning() from inside the TCP client when a connection fails, instead of raising or emitting an error and letting the View decide how to show it.',
          formula: null,
          symbols: null,
          crossRef: ['separation-of-concerns']
        },
        {
          id: 'l8-signal-slot-anonymity',
          type: 'definition',
          term: 'Qt signals and slots',
          body: 'A signal is an announcement that something happened; a slot is a function that can be connected to it. The object emitting a signal has no idea who, if anyone, is connected — that anonymity is exactly what makes the MVVM layering enforceable, since the ViewModel can emit curve_ready or status_updated without ever importing the widget that will eventually redraw.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l8-architecture-selftest',
          type: 'fact',
          term: 'A self-test for the architecture',
          body: 'Delete every import of PySide6’s widget module from models/ and viewmodels/. If the package still imports cleanly, the layering is right; if it does not, the violation a marker would find has just been found.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l8-project-structure',
          type: 'fact',
          term: 'Suggested project structure',
          body: 'main.py creates the QApplication, the Model objects and the ViewModel and View; models/ holds tcp_client.py, rolling_buffer.py and processing.py; viewmodels/ holds stream_viewmodel.py; views/ holds main_window.py, live_plot.py and offline_dialog.py. A different layout is acceptable as long as responsibilities stay clear, but a views/ package that imports socket is not.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l8-layer-membership-example',
          type: 'fact',
          term: 'Which layer owns what: a worked example',
          body: 'The 4608-byte packet constant belongs to the Model — it is a property of the wire format. The currently selected channel index belongs to the ViewModel — it is application state that determines what gets published and must survive a redesign of the widget. The QComboBox listing channels belongs to the View — it is one possible presentation of that state, and could equally be a spin box or a keyboard shortcut.',
          formula: null,
          symbols: null,
          crossRef: ['separation-of-concerns']
        }
      ]
    },

    {
      heading: 'The TCP client',
      items: [
        {
          id: 'l8-packet-format',
          type: 'formula',
          term: 'The packet layout',
          body: 'Each chunk carries 32 channels by 18 samples, sent as raw little-endian float64, so one packet is a fixed number of bytes: eight bytes make one float64 sample, eighteen samples make one channel row, and thirty-two rows make one packet.',
          formula: '32 \\times 18 \\times 8 = 4608',
          symbols: '32 is the number of channels, 18 the number of samples per channel in one packet, and 8 the number of bytes in a float64 sample; the product, 4608, is the packet size in bytes.',
          crossRef: []
        },
        {
          id: 'l8-packet-reconstruction',
          type: 'fact',
          term: 'Reconstructing a packet in NumPy',
          body: 'np.frombuffer(raw, dtype=np.float64) turns the raw bytes into a flat array, and .reshape(32, 18) restores the channel-by-sample shape. np.frombuffer returns a read-only view onto the bytes object, so the array must be copied with .copy() before use, which also decouples its lifetime from the byte buffer it came from.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l8-tcp-byte-stream-pitfall',
          type: 'pitfall',
          term: 'TCP is a byte stream, not a message stream',
          body: 'A call to recv() may return 1 byte, 4608 bytes, or 13000 bytes, and packet boundaries are not preserved, so code that assumes recv(4608) returns exactly one packet works on localhost during development and fails the first time it meets a real network or a busy machine. The correct pattern accumulates incoming bytes into a buffer and drains every complete packet from the front of it with a while loop, not an if — an if silently lets a backlog of unread packets build up when two packets arrive in a single recv.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l8-tcp-thread-necessity',
          type: 'fact',
          term: 'Why the socket lives in a QThread',
          body: 'Qt has exactly one thread that may touch widgets, and it is also the thread that runs the event loop, so a blocking recv() call on it freezes the whole GUI: no repaints, no button clicks, and eventually the operating system offers to kill the application. Putting the socket in a QThread and communicating results by Qt signals, which are queued and delivered safely on the receiver’s thread, is the standard remedy.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l8-tcp-client-design-details',
          type: 'fact',
          term: 'Two design details that make the TCP client robust',
          body: 'socket.create_connection is called in start_streaming, in the calling thread, so a wrong port raises OSError synchronously where the ViewModel’s try/except can report it — opening the socket inside run() instead would raise the exception somewhere the caller cannot see. settimeout(1.0) combined with except socket.timeout: continue makes the receive loop interruptible, so Stop takes effect within about a second instead of waiting on a recv() that may never return.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'The rolling buffer',
      items: [
        {
          id: 'l8-rolling-buffer-shift',
          type: 'formula',
          term: 'The shift-and-append rolling buffer',
          body: 'The live plot shows a fixed time window, so the buffer keeps a constant shape (n_channels, N) and each new packet pushes the oldest samples off the left edge: everything shifts left by one packet’s width, and the newest block is written into the freed space on the right.',
          formula: 'buf[:,\\ :-k] = buf[:,\\ k:]; \\quad buf[:,\\ -k:] = packet',
          symbols: 'k is the number of samples in the incoming packet (18 here); buf has shape (32, N) and keeps that constant shape so the plot never has to reallocate.',
          crossRef: []
        },
        {
          id: 'l8-rolling-buffer-vs-circular',
          type: 'distinction',
          term: 'Shift buffer vs. true circular buffer',
          body: 'The shift-and-append buffer costs one array copy per packet — a few hundred microseconds at 18 samples per packet and a 10000-sample window, which is irrelevant. A true circular buffer with a write index is faster but has to be unwrapped before plotting, and for this project the simpler shift version is the better engineering choice; say so in the README rather than treating deliberate simplicity as a weakness.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l8-full-record-memory',
          type: 'pitfall',
          term: 'The unbounded full_record',
          body: 'Alongside the fixed-shape rolling window, full_record concatenates every packet ever received for the offline view, and it grows without bound: at 2 kHz and 32 channels that is roughly 512 kB per second, or 1.8 GB per hour. For a demonstration this is fine, but the limitation belongs in the README — or the record should be capped and the cap documented.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'Signal processing: the three modes',
      items: [
        {
          id: 'l8-three-modes',
          type: 'definition',
          term: 'The three required signal modes',
          body: 'Three modes are required in both the live and the offline view: original (raw samples straight from the buffer), filtered (a band-pass plus notch), and RMS (a moving-window envelope taken on the filtered signal). All three must be reachable from the same channel and mode selectors.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l8-butterworth-choice',
          type: 'fact',
          term: 'The filter: a 4th-order Butterworth band-pass plus notch',
          body: 'The standard choice for a band-limited bioelectric signal is a fourth-order Butterworth band-pass, 20–450 Hz, followed by a notch at 50 Hz — Butterworth because its pass-band is maximally flat and adds no ripple to the amplitudes being measured, the band because it removes drift below and keeps little of use above, and the notch for mains interference. filtfilt is used offline for zero phase distortion; lfilter is used live because it is causal.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l8-causal-vs-noncausal-live',
          type: 'pitfall',
          term: 'The subtle bug almost every team ships',
          body: 'Applying filtfilt to the rolling buffer on every packet looks fine and is wrong twice over: filtfilt is non-causal, so it implicitly uses samples that will be different next frame and the displayed trace changes retroactively, and every redraw refilters the whole window from scratch, reintroducing the filter’s start-up transient at the left edge and wasting work. The live path must filter each incoming packet with a stateful causal filter that carries its memory from one packet to the next.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l8-lfilter-zi-state',
          type: 'fact',
          term: 'Carrying filter state across packets with zi',
          body: 'lfilter_zi(b, a) computes the initial state for a causal filter, and lfilter(b, a, packet, axis=1, zi=self._zi) both filters the packet and returns the updated state to use on the next one. Without passing zi forward, every incoming packet would be filtered as if it were the very start of the recording, reintroducing a start-up transient on every single packet.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l8-filtfilt-simplification-acceptable',
          type: 'fact',
          term: 'A defensible simplification: filtfilt everywhere',
          body: 'It is acceptable to use filtfilt on the buffer for both the live and offline views, since the requirement is that the three modes work, not that the live filter is causal. The condition is disclosure: say in the README that this was chosen and note the retroactive-change trade-off — an acknowledged simplification reads as competence, an unnoticed one reads as an accident.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'The live view with VisPy',
      items: [
        {
          id: 'l8-vispy-vs-matplotlib',
          type: 'distinction',
          term: 'VisPy vs. Matplotlib for live plotting',
          body: 'VisPy draws with OpenGL, which is why it can redraw tens of thousands of points at 60 Hz where Matplotlib would manage only a handful of frames per second. The cost is that VisPy gives far less for free — axes, tick labels and camera ranges must be built and linked by hand rather than appearing automatically.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l8-live-plot-requirements',
          type: 'fact',
          term: 'Requirements checklist for the live plot',
          body: 'The live view must show one selected channel at a time in a rolling time window, with visible x- and y-axes, time labels on the x-axis, readable y scaling, a channel selector, and a Plot All Channels button that shows all 32 channels at once with a vertical offset.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l8-plot-all-channels-offset',
          type: 'fact',
          term: 'Choosing the vertical offset in Plot All Channels',
          body: 'The vertical offset that separates the 32 traces should be derived from the data rather than hard-coded — a few standard deviations of the displayed block, for example 4σ — so the traces stay separated without wasting space when the amplitude is small and without overlapping when it is large. The y-axis should then be labelled with channel numbers at the offset positions rather than with amplitude, since the axis no longer represents one quantity.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l8-redraw-timer-pitfall',
          type: 'pitfall',
          term: 'Two performance traps in the live plot',
          body: 'Redrawing on every incoming packet stalls the display once packets arrive faster than the screen refreshes; instead, accumulate into the buffer on every packet but drive the redraw from a QTimer at 30–60 Hz. Recreating the VisPy Line objects inside the update method leaks GPU objects until the application stalls — create them once and call set_data thereafter.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'The offline view with Matplotlib',
      items: [
        {
          id: 'l8-offline-view-purpose',
          type: 'definition',
          term: 'The offline view',
          body: 'Once streaming stops, the user must be able to inspect the whole recording: choose a channel, choose among original, filtered and RMS, and see the entire record rather than a rolling window. This view does not update live, which is exactly why Matplotlib is the right tool for it — and why filtfilt is legitimate here even though it is questionable live.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l8-navigation-toolbar',
          type: 'fact',
          term: 'NavigationToolbar2QT',
          body: 'Adding Matplotlib’s NavigationToolbar2QT to the offline dialog costs one line of code and gives the user pan, zoom and save-to-PNG for free. Markers notice details like this.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l8-offline-empty-record',
          type: 'pitfall',
          term: 'Handling an empty record',
          body: 'If the offline dialog is opened before any data has been received, full_record.size == 0, and the correct response is to draw a message such as "No data received yet" in the axes rather than letting the plotting call raise on an empty array.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'Error handling',
      items: [
        {
          id: 'l8-five-failure-cases',
          type: 'fact',
          term: 'The five required failure cases',
          body: 'The application must handle, without crashing: the server not running (ConnectionRefusedError, an OSError, on create_connection); a wrong port entered (non-numeric text raises ValueError in int(), out-of-range raises OverflowError, so validate before connecting); the connection lost mid-stream (recv returns b\'\' or raises OSError — emit an error signal, close the socket, re-enable Connect); no data for offline plotting (full_record.size == 0); and an invalid channel or mode (clamp the channel index, raise ValueError for an unknown mode and catch it at the ViewModel boundary).',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l8-validate-before-connect',
          type: 'fact',
          term: 'Validating the port before calling the ViewModel',
          body: 'The View should validate the port text before it ever calls a ViewModel slot: catch ValueError from int() for non-numeric text, and check 1 <= port <= 65535 for an out-of-range value, showing a status message in each case. This keeps invalid input from ever reaching connect_to_server, rather than relying on the Model to reject it.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l8-no-bare-except',
          type: 'pitfall',
          term: 'Why a blanket except Exception: pass is wrong here',
          body: 'The requirement to not crash is often solved badly, by catching every exception everywhere and doing nothing with it. That makes the application look robust in a demo and impossible to debug afterwards; the correct approach is to catch the specific exceptions that have been thought about and let anything unexpected produce a traceback that can be read.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'Documentation, dependencies and working order',
      items: [
        {
          id: 'l8-pass-fail-gate',
          type: 'fact',
          term: 'The gate that overrides every other criterion',
          body: 'The project is assessed pass/fail, in teams of three, and one gate overrides everything else: if the application cannot be installed, launched, or runs with critical errors, none of the other criteria can even be checked. A clean install must be tested before submission.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l8-project-fusion',
          type: 'fact',
          term: 'What the project fuses',
          body: 'The project deliberately fuses the four preceding exercises: offline plotting with Matplotlib, PySide6 GUI basics and signal processing, real-time plotting with VisPy and MVVM, and TCP streaming and buffering. The server is provided; the team builds the client.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l8-readme-requirements',
          type: 'fact',
          term: 'What the README must contain',
          body: 'The README is a graded artefact, not an afterthought: it must state the team and each member’s responsibilities, how to install and run the application, how to connect and use the live and offline plots including Plot All Channels, how to switch channels and modes, the filter and RMS parameters used, and how the project is structured according to MVVM. Docstrings and comments are expected especially on the TCP receiving code, the buffering, the signal processing, and the ViewModel communication.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l8-clean-env-test',
          type: 'pitfall',
          term: 'Do not trust requirements.txt until it is tested clean',
          body: 'A requirements.txt that works only because pyside6 happens to already be installed for another reason is exactly how a missing dependency line goes unnoticed. Create a fresh virtual environment, install only from the file, and run the application — VisPy in particular needs a working backend that a development environment may already provide by accident.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l8-working-order',
          type: 'fact',
          term: 'A pragmatic order of work',
          body: 'Build in this order: a plain script that connects, receives and reassembles packets and prints their shape; the rolling buffer, unit-tested on synthetic packets; SignalProcessor, tested offline on a synthetic sinusoid plus noise; the window skeleton wired to the ViewModel; the VisPy live plot for one channel; the channel selector, mode selector and Plot All Channels; the Matplotlib offline dialog; and finally error handling, the README, and a clean-install test. Nothing else works until the first step does.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    }
  ]
});
