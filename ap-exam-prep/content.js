// Declares the content globals. Chapter files in content/ push onto LECTURES.
var LECTURES = [];

// Cross-cutting threads, taken from script §9.2 "Four ideas that recur in
// every lecture". An item's crossRef entries must name keys from this list.
var CROSS_CUTTING = [
  {
    key: 'bias-variance',
    title: 'The bias–variance trade-off in four costumes',
    blurb: 'You can have detail or you can have stability; the parameter you tune decides which. It appears as the moving-average window length (L2), the Welch segment length (L2), the convolution kernel length (L3) and the level of detail in a simulation (L5). If a result looks wrong, work out which side of this trade-off you are on before changing anything else.'
  },
  {
    key: 'convolution',
    title: 'Convolution is everywhere',
    blurb: 'Filtering, smoothing, signal generation and feature extraction are one operation with different kernels. The moving-average envelope (L2), the window functions (L3), the EMG generation model of spike train convolved with MUAP shape (L4), the RC filter implemented in copper (L7) and the firing-rate decoder are all y = x * h.'
  },
  {
    key: 'information-loss',
    title: 'Information is destroyed at three identifiable places',
    blurb: 'Three points in the chain lose information irreversibly, and only three: aliasing at the sampler, prevented only by an analog filter before conversion; quantisation at the converter, mitigated only by gain in front of it or more bits; and overlap in frequency at the filter, which no filter of any order can undo. Everything else is recoverable.'
  },
  {
    key: 'separation-of-concerns',
    title: 'Separation of concerns, in hardware and software',
    blurb: 'The amplifier, anti-aliasing filter, sample-and-hold and converter each do one thing and hand off cleanly, and you never read the data line before the status line permits it (L6). The socket, buffer, state and widgets each do one thing, and the View never reads data before the ViewModel emits it (L8). Same discipline; in both cases the interface is a contract and the handshake makes it explicit.'
  }
];

if (typeof module !== 'undefined') {
  module.exports = { LECTURES: LECTURES, CROSS_CUTTING: CROSS_CUTTING };
}
