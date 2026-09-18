// questions/l6.js
// Question bank for Chapter 6. 20 questions, 12 mc / 8 short (ratio 0.60).
// Several short answers are seeded from the script's own end-of-chapter exam
// questions, in the course's wording, with model answers a marker would
// accept.
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
    id: 'l6-001',
    lecture: 6,
    topic: 'sensors',
    mode: 'mc',
    question: 'A force-sensing resistor and a thermocouple are both wired into a data-acquisition front end. Which statement correctly distinguishes how each must be read out?',
    options: [
      'Both are active, because both respond directly to a physical stimulus without needing any added excitation circuitry, regardless of the quantity measured',
      'The force-sensing resistor generates its own voltage under load, while the thermocouple needs an excitation supply',
      'The force-sensing resistor changes its resistance and needs a divider with an excitation supply, while the thermocouple generates its own voltage',
      'Both need excitation, but only the thermocouple’s resistance change is turned into a voltage by a divider network'
    ],
    correctIndex: 2,
    answer: 'A force-sensing resistor is passive: force changes its resistance, and only a divider fed by an excitation supply turns that into a voltage the ADC can read. A thermocouple is active: it generates its own voltage from a physical effect, with no excitation needed. The second option reverses which one is self-generating, and the fourth assigns the thermocouple’s genuinely self-generating behaviour to a resistance change it does not have.',
    contentRef: 'l6-active-passive-sensors'
  },

  {
    id: 'l6-002',
    lecture: 6,
    topic: 'sensors',
    mode: 'short',
    question: 'Explain what a voltage divider does for a passive sensor, and why the sensor cannot be read by the ADC without one.',
    answer: 'A passive sensor only changes a circuit property — resistance, capacitance or inductance — it does not produce a voltage by itself. Placed in a divider with a fixed resistor and an excitation supply, Vout = VCC·R(x)/(R + R(x)), so as R(x) changes with the measured quantity, Vout changes with it, and the ADC finally has a voltage to read instead of a resistance.',
    contentRef: 'l6-voltage-divider'
  },

  {
    id: 'l6-003',
    lecture: 6,
    topic: 'quantisation',
    mode: 'mc',
    question: 'A 12-bit ADC over 0–10 V is fed a raw sEMG signal of a few millivolts with no gain stage in front of it. What happens to the recording?',
    options: [
      'The signal spans a small fraction of one 2.4 mV code, so the recording is almost entirely quantisation noise',
      'The converter clips the signal immediately, because millivolt-scale inputs fall below its detectable range',
      'Nothing changes, because the quantisation error depends only on the number of bits, not on signal amplitude',
      'The effective sampling rate drops, since the converter must always average several codes to represent one sample'
    ],
    correctIndex: 0,
    answer: 'One code is q = 10 V/4096 ≈ 2.4 mV. A signal of only a few millivolts spans well under one code, so successive samples mostly land on the same one or two output codes and the recording is barely distinguishable from the rounding error itself. The converter does not clip a small signal — clipping happens to signals too large for the range — and a fixed-size error swallowing a small signal is exactly the problem, not evidence that amplitude is irrelevant. Sampling rate is unrelated to signal amplitude.',
    contentRef: 'l6-gain-before-converter'
  },

  {
    id: 'l6-004',
    lecture: 6,
    topic: 'aliasing',
    mode: 'short',
    question: 'Why must the anti-aliasing low-pass filter sit in the analog chain, ahead of the sample-and-hold, rather than being applied in software to the digitised samples?',
    answer: 'Folding happens the instant the sample-and-hold freezes the input voltage: any content above fs/2 is aliased into the base band at that moment, and the resulting samples are then indistinguishable from genuine low-frequency signal, as established in Chapter 2. A digital filter running afterwards only ever sees those already-corrupted samples and cannot separate aliased energy from real signal, so prevention has to happen before the sample-and-hold, in analog hardware.',
    contentRef: 'l6-antialiasing-precedes-converter'
  },

  {
    id: 'l6-005',
    lecture: 6,
    topic: 'adc',
    mode: 'mc',
    question: 'Flash, SAR and sigma-delta converters use completely different strategies for choosing references, yet all of them are built around the same underlying component. Why is the comparator the essential building block of every ADC architecture?',
    options: [
      'Because a comparator draws far less current than a full amplifier stage, which matters most for battery-powered, portable acquisition',
      'Because only a comparator can be built with the small transistor geometries used in modern converter chips',
      'Because a comparator can run at the sampling rate required by Nyquist while an amplifier cannot keep up',
      'Because conversion is a sequence of binary decisions, and a comparator turns one voltage comparison into a single bit'
    ],
    correctIndex: 3,
    answer: 'An ADC never measures a voltage directly; it asks a sequence of yes/no comparison questions and assembles the answers into a number. Whichever architecture is used, that decision — is the input above this reference? — is made by a comparator, an op-amp with no feedback whose enormous open-loop gain slams the output to one rail. Power consumption, transistor geometry and clock speed are real engineering concerns, but none of them is the structural reason every architecture needs one.',
    contentRef: 'l6-amp-vs-comparator'
  },

  {
    id: 'l6-006',
    lecture: 6,
    topic: 'adc',
    mode: 'short',
    question: 'Describe what happens, in order, inside a single ADC conversion.',
    answer: 'A sample-and-hold circuit first freezes the input voltage so it does not change during the conversion. A comparator then answers one yes/no question per clock cycle — is the held voltage above this reference? — and each answer becomes one bit. The bits are assembled into the output code; the converter never measures the voltage directly, only compares it repeatedly.',
    contentRef: 'l6-conversion-definition'
  },

  {
    id: 'l6-007',
    lecture: 6,
    topic: 'quantisation',
    mode: 'mc',
    question: 'A 12-bit ADC is specified over a 0–5 V range. What is its code width, one LSB?',
    options: [
      'About 2.44 mV, the same step a 0–10 V range would give, since 12-bit resolution alone fixes the step',
      'About 1.22 mV, since the 5 V range is spread over 4096 codes',
      'About 4.88 mV, since a 12-bit converter reserves half its codes for a sign bit on a unipolar range',
      'About 0.61 mV, since 12 bits over a 5 V range gives 8192 usable codes rather than 4096'
    ],
    correctIndex: 1,
    answer: 'q = V_FS/2ⁿ = 5 V/4096 ≈ 1.22 mV. The step scales with the full-scale range, so it is not the number a 0–10 V range would give — that would double it to about 2.44 mV. A unipolar 12-bit converter has exactly 4096 codes with none reserved for a sign, and 12 bits always gives 2¹² = 4096 codes, never 8192.',
    contentRef: 'l6-resolution-code-width'
  },

  {
    id: 'l6-008',
    lecture: 6,
    topic: 'adc',
    mode: 'short',
    question: 'A 12-bit SAR ADC has a 0–3.3 V range and a 1 MHz conversion clock. What is its code width, and how long does one conversion take?',
    answer: 'q = 3.3 V/4096 ≈ 0.806 mV. A SAR conversion costs one clock per bit, so 12 bits at 1 MHz take 12 clocks = 12 µs, plus whatever acquisition time the sample-and-hold needs beforehand.',
    contentRef: 'l6-sar-converter'
  },

  {
    id: 'l6-009',
    lecture: 6,
    topic: 'adc',
    mode: 'mc',
    question: 'Why does a flash converter fail to scale to high resolution, even though it is the fastest ADC architecture?',
    options: [
      'It needs one comparator per quantisation level, so 2ⁿ − 1 comparators for n bits — 3 for 2 bits but 4095 for 12 bits',
      'Its internal DAC must settle completely within a single clock period, and that settling time grows exponentially as the bit count increases',
      'Its resistor ladder must be trimmed to sub-picofarad tolerance once the bit count exceeds about 8 bits',
      'Its comparators must run at 2ⁿ times the Nyquist rate, which exceeds practical clock speeds past about 10 bits'
    ],
    correctIndex: 0,
    answer: 'A flash converter compares the input against every reference level at once, so it needs one comparator per level: 2ⁿ − 1 for n bits. That is 3 comparators for 2 bits but 4095 for 12 bits and over a million for 20 bits, prohibitive in die area, power and matching accuracy. Flash has no internal DAC — that belongs to SAR — and the other two options invent constraints the architecture does not actually have.',
    contentRef: 'l6-flash-converter'
  },

  {
    id: 'l6-010',
    lecture: 6,
    topic: 'adc',
    mode: 'mc',
    question: 'In a 2-bit flash converter, the comparator at three-quarters of full scale reads 0, the one at half scale reads 1, and the one at one quarter reads 1. What output code does the encoder produce?',
    options: [
      'Code 11, because a majority of the three comparators, two out of three, are firing',
      'Code 01, because only the lowest comparator’s state ever reaches the encoder',
      'Code 10, because b1 equals the half-scale comparator, which is 1, while b0 combines the other two and comes out 0',
      'Code 00, because the pattern 0-1-1 is not a valid thermometer code and defaults to zero'
    ],
    correctIndex: 2,
    answer: 'b1 = C½, which is 1 here, so the top bit is 1. b0 = C¾ + C¼·(not C½); C¾ is 0 and C½ is 1, so that second term is C¼ AND (not 1) = 0, giving b0 = 0. The code is therefore 10, level 2. This 0-1-1 pattern is exactly a valid thermometer code — comparators fill from the bottom as the input rises — so nothing defaults to zero, and the encoder does not take a majority vote.',
    contentRef: 'l6-flash-thermometer-code'
  },

  {
    id: 'l6-011',
    lecture: 6,
    topic: 'adc',
    mode: 'short',
    question: 'Rank flash, SAR, sigma-delta and dual-slope converters from fastest to slowest, and name one typical application of each.',
    answer: 'Flash is fastest but scales worst — oscilloscopes and RF front-ends. SAR is fast, costing n cycles for n bits — general instrumentation and microcontrollers. Sigma-delta is slow but reaches very high resolution, 16–24 bits — audio and biopotential amplifiers. Dual-slope is slowest but most accurate — bench multimeters.',
    contentRef: 'l6-adc-architecture-map'
  },

  {
    id: 'l6-012',
    lecture: 6,
    topic: 'handshake',
    mode: 'mc',
    question: 'Which pair correctly groups an external ADC’s pins into the same family?',
    options: [
      'AIN and CONVST are both analog pins, since both directly affect the voltage being converted',
      'VREF and VDD are both analog and power pins, while CONVST and CS are both digital control lines',
      'BUSY and SDO are both control lines, since both are actively driven by the MCU to manage and supervise the conversion',
      'SCLK and DRDY are both data lines, since both toggle only while bits are being clocked out'
    ],
    correctIndex: 1,
    answer: 'AIN, VREF, VDD and GND form the analog-and-power group, which must be clean and decoupled. CONVST and CS are digital control lines from the MCU to the ADC; BUSY and DRDY are status lines the other way; SDO and SCLK are the data lines. CONVST is digital, not analog; BUSY and DRDY are status outputs from the ADC rather than MCU-driven controls; and DRDY is status, not data.',
    contentRef: 'l6-adc-interface-pins'
  },

  {
    id: 'l6-013',
    lecture: 6,
    topic: 'handshake',
    mode: 'mc',
    question: 'Your code pulses CONVST and immediately reads SDO without checking BUSY or DRDY. What is the most likely consequence?',
    options: [
      'A compile-time error, since most toolchains refuse to build code that omits a wait on BUSY',
      'A consistent, permanent offset in every reading, easily corrected once by subtracting a fixed value',
      'No effect at typical clock speeds, since the conversion always finishes well before the read instruction runs',
      'An intermittent bug: the read returns the previous conversion or an unsettled register, failing unpredictably'
    ],
    correctIndex: 3,
    answer: 'Reading before BUSY clears or DRDY asserts returns whatever is currently on the data line — the previous conversion’s result, or a register that has not finished settling — and which one occurs can depend on timing that varies run to run. That makes the bug intermittent rather than a fixed, correctable offset, and far harder to diagnose than a bug that fails every time. Nothing in the language or toolchain enforces the wait; it is a hardware protocol, not a syntax rule.',
    contentRef: 'l6-never-read-before-ready'
  },

  {
    id: 'l6-014',
    lecture: 6,
    topic: 'handshake',
    mode: 'short',
    question: 'Describe the correct sequence of operations for reading an external SPI ADC, and name the failure mode if you skip the wait.',
    answer: 'Assert CS, pulse CONVST to start the conversion, wait for BUSY to fall or DRDY to assert, then clock the bits out on SCLK/SDO. Skipping the wait reads either the previous conversion or an incompletely settled register, producing intermittent wrong values that are very hard to diagnose.',
    contentRef: 'l6-handshake-sequence'
  },

  {
    id: 'l6-015',
    lecture: 6,
    topic: 'handshake',
    mode: 'mc',
    question: 'A single slow sensor is sampled every 100 ms on an otherwise idle microcontroller. Which waiting strategy fits, and why?',
    options: [
      'Polling, because the CPU has nothing else to do while it waits, so the spin costs nothing that matters here',
      'Interrupt-driven, because polling can never be used safely for any single-channel acquisition',
      'Polling, because interrupts cannot be attached to a status pin such as DRDY on this class of device',
      'Interrupt-driven, because only interrupts can guarantee that the read completes before the very next conversion cycle begins'
    ],
    correctIndex: 0,
    answer: 'Polling is simple to write and wastes CPU cycles spinning in a loop, which matters only if the CPU has other work to do. With a single slow channel and an otherwise idle CPU that cost is irrelevant, so polling is the simpler, appropriate choice. Interrupts are essential for real-time multi-channel acquisition, not because polling is unsafe in general, and DRDY can be wired to an interrupt on many devices — that is not the reason polling is preferred here.',
    contentRef: 'l6-polling-vs-interrupt'
  },

  {
    id: 'l6-016',
    lecture: 6,
    topic: 'handshake',
    mode: 'short',
    question: 'Relate the ADC handshake of this chapter to the thread and signal design of your project.',
    answer: 'Both are protocols against reading data that is not ready. The ADC asserts BUSY and DRDY and the MCU must wait for them; the worker thread emits a signal such as packet_received and the GUI must not touch the buffer before it. In both cases the failure mode of ignoring the protocol is the same: intermittently wrong values, invisible in testing, dependent on timing.',
    contentRef: 'l6-handshake-as-contract'
  },

  {
    id: 'l6-017',
    lecture: 6,
    topic: 'serial',
    mode: 'mc',
    question: 'Give the strongest reason to choose SPI over I2C, and the strongest reason to choose I2C over SPI, for connecting an ADC to an MCU.',
    options: [
      'SPI for its lower pin count; I2C for supporting higher clock speeds than SPI ever reaches',
      'SPI because it uses fewer wires than I2C; I2C because it is full-duplex and SPI is not',
      'SPI for throughput, since it is full-duplex and reaches tens of MHz; I2C when many slow devices share few pins',
      'SPI because every device needs its own address; I2C because it needs only one shared clock and no data line'
    ],
    correctIndex: 2,
    answer: 'SPI is full-duplex and reaches tens of megahertz, so it wins on throughput; I2C uses only two shared wires and picks a device by a 7-bit address rather than a dedicated select line, so it wins when many slow devices must be attached with the fewest pins. SPI uses more wires than I2C, not fewer, and I2C is the slower of the two, not the faster; I2C is not full-duplex, and address-based selection is I2C’s feature, not SPI’s.',
    contentRef: 'l6-choosing-interface'
  },

  {
    id: 'l6-018',
    lecture: 6,
    topic: 'serial',
    mode: 'mc',
    question: 'An SPI ADC and its MCU run at the correct clock rate and the bus toggles correctly, but every value read back is shifted by one bit compared with the true result. What is the most likely cause?',
    options: [
      'The chip-select line was left permanently low, so the ADC never distinguishes one transaction from the next',
      'The MCU and the ADC are configured with different CPOL/CPHA settings, so data is sampled on the wrong clock edge',
      'The reference voltage VREF is unstable, which shifts every output code by a small, roughly constant amount',
      'The conversion clock is running faster than the ADC’s rated maximum, corrupting the internal SAR search'
    ],
    correctIndex: 1,
    answer: 'SPI’s timing is set by CPOL, the clock’s idle level, and CPHA, which edge samples data; the four combinations are its four modes. If master and slave disagree on the mode, the master samples MISO on the wrong edge, and the classic symptom is exactly this: the bus runs, data moves, but every value comes out shifted by one bit. A stuck CS would prevent addressing the device rather than shifting bits; an unstable VREF changes the LSB size, not the bit alignment; and an over-fast clock produces noisy or wrong codes, not a clean one-bit shift.',
    contentRef: 'l6-spi-modes-pitfall'
  },

  {
    id: 'l6-019',
    lecture: 6,
    topic: 'sensors',
    mode: 'mc',
    question: 'Eight EMG channels are multiplexed through one ADC converting at 16 kHz. What is the effective per-channel sampling rate, and what does that force on the anti-aliasing filter?',
    options: [
      '2 kHz per channel; the anti-aliasing cut-off may be set anywhere below 2 kHz without further restriction',
      '16 kHz per channel, since multiplexing only changes which channel is read, not how often any one is converted',
      '8 kHz per channel; Nyquist then permits signal content up to 8 kHz on each channel',
      '2 kHz per channel; Nyquist demands content below 1 kHz, so the cut-off sits well under that, near 400–500 Hz'
    ],
    correctIndex: 3,
    answer: 'Per channel the rate is the shared 16 kHz divided by the 8 channels, 2 kHz. Nyquist then requires the highest frequency present to stay below half of that, 1 kHz, and in practice the anti-aliasing cut-off is set around 400–500 Hz to leave room for the filter’s own transition band, not just anywhere under the Nyquist limit. Multiplexing does divide the rate available to each channel, and 16 kHz divided by 8 gives 2 kHz, not 8 kHz.',
    contentRef: 'l6-multiplexing'
  },

  {
    id: 'l6-020',
    lecture: 6,
    topic: 'adc',
    mode: 'short',
    question: 'Compare an on-chip ADC, an external ADC such as the MCP3008, and an integrated analog front-end chip as options for an EMG acquisition node.',
    answer: 'An on-chip ADC, such as the Arduino Uno’s 10-bit, 6-channel converter, is free and simple but limited in resolution and noise performance. An external ADC like the MCP3008 — 8 channels, 10 bits, SAR, over SPI, a few euros — gives higher resolution and lower noise than the on-chip option for little cost. An integrated analog front end goes further, combining an instrumentation amplifier, filters and a 16–24-bit sigma-delta converter in one package with a single serial link carrying all channels and configuration, which is what a real multi-channel EMG amplifier contains.',
    contentRef: 'l6-onchip-external-afe'
  }
);
