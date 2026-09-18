// content/l6.js
// Chapter 6 of the exam script: "Talking to the Analog Signal: Sensors and
// the ADC" (printed pages 47-54). Sections follow the script's own
// subsection order, so the Reference Bank mirrors the chapter a reader
// already knows.
//
// Plain browser script: no imports, no exports. It pushes onto the LECTURES
// array declared in content.js.

LECTURES.push({
  id: 6,
  name: 'Talking to the Analog Signal: Sensors and the ADC',
  shortName: 'Sensors & the ADC',
  sections: [
    {
      heading: 'Sensors and transducers',
      items: [
        {
          id: 'l6-transducer-vs-sensor',
          type: 'definition',
          term: 'Transducer vs. sensor',
          body: 'A transducer converts one form of energy into another. A sensor is a transducer whose output is specifically electrical: it senses a physical phenomenon and translates it into a voltage, a current or a change in a circuit property. In an EMG setup the electrode is the sensor — it picks up the muscle’s bioelectric activity.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l6-active-passive-sensors',
          type: 'distinction',
          term: 'Active vs. passive sensors',
          body: 'Passive sensors need an external supply, called excitation, and change a circuit property — resistance, capacitance or inductance — that a divider network turns into a voltage; a thermistor, a photoresistor, a potentiometer and a force-sensing resistor are all resistive and all read the same way. Active sensors are self-generating and produce their own voltage or charge with no excitation, as a thermocouple, a piezoelectric element or a photodiode does.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l6-voltage-divider',
          type: 'formula',
          term: 'The voltage divider',
          body: 'A passive sensor is read out by placing its resistance in a voltage divider: as the physical quantity changes R(x), it changes Vout, and the ADC sees a voltage rather than a resistance. This one circuit is how essentially every resistive sensor is read.',
          formula: 'V_{out} = V_{CC}\\,\\frac{R(x)}{R + R(x)}',
          symbols: 'Vout is the voltage the ADC reads, VCC the excitation supply, R the fixed divider resistor and R(x) the sensor’s resistance, which varies with the measured quantity.',
          crossRef: []
        },
        {
          id: 'l6-signal-conditioning-chain',
          type: 'fact',
          term: 'The signal chain between sensor and converter',
          body: 'The path from sensor to converter is not optional decoration: for EMG it comprises an instrumentation amplifier with high input impedance and high common-mode rejection to lift microvolts out of a hostile environment, a high-pass stage to remove electrode drift, an anti-aliasing low-pass stage, and a final gain stage that fills the converter’s input range. Each stage does one job and hands off cleanly to the next.',
          formula: null,
          symbols: null,
          crossRef: ['separation-of-concerns']
        },
        {
          id: 'l6-gain-before-converter',
          type: 'pitfall',
          term: 'Gain must happen before the converter, not after',
          body: 'Quantisation noise is added at the converter and no later processing can undo it, so if the signal only spans a few codes, that fraction is all the resolution it will ever have. Amplifying a few millivolts of raw EMG by a gain of roughly 500–1000 to fill a ±5 V range makes full use of a converter that would otherwise resolve only a few of its codes.',
          formula: 'q_{eff} = q/A',
          symbols: 'q is the quantisation step at the converter input, A the gain of the amplifier ahead of it and q_eff the effective step referred back to the sensor. Example: ±5 mV of raw EMG amplified by A = 1000 fills a ±5 V input range that a 12-bit converter over 0–10 V would otherwise resolve to only about 2.4 mV per step.',
          crossRef: ['information-loss']
        },
        {
          id: 'l6-antialiasing-precedes-converter',
          type: 'pitfall',
          term: 'Why the anti-aliasing filter sits before the sample-and-hold, not after the converter',
          body: 'Folding happens the instant the sample-and-hold freezes the input voltage, so nothing after that point — however carefully written — can separate the aliased energy from genuine signal, as established in Chapter 2. The anti-aliasing low-pass must therefore sit in the analog chain, between the amplifier and the sample-and-hold, never as a digital step applied to samples the converter has already produced.',
          formula: null,
          symbols: null,
          crossRef: ['information-loss']
        }
      ]
    },

    {
      heading: 'Inside one conversion',
      items: [
        {
          id: 'l6-amp-vs-comparator',
          type: 'distinction',
          term: 'Amplifier or comparator: one component, two roles',
          body: 'Both are operational amplifiers; only the feedback path differs. With feedback the op-amp is an amplifier producing a controlled, proportional gain; without feedback it is a comparator, whose enormous open-loop gain drives the output hard to one rail depending on which input is larger, so its output is a single binary decision. That yes/no decision is the seed of every analog-to-digital converter.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l6-conversion-definition',
          type: 'definition',
          term: 'What a conversion actually is',
          body: 'A sample-and-hold circuit freezes the input voltage, then a comparator answers one yes/no question per clock cycle and each answer becomes one bit. An ADC never measures a voltage directly — it asks a sequence of comparison questions and assembles the answers into a number.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l6-resolution-code-width',
          type: 'formula',
          term: 'Resolution and code width',
          body: 'The size of one quantisation step is the full-scale range divided by the number of levels, and it goes by several names — code width, quantisation step size, LSB size, or just resolution. Rounding a sample to the nearest step bounds the error at half a step; this is the same quantisation limit introduced in Lecture 2, now attached to the specific component, the converter, that performs the rounding.',
          formula: 'q = V_{FS}/2^n, \\qquad |\\varepsilon| \\le q/2',
          symbols: 'q is the quantisation step or LSB, V_FS the full-scale range, n the number of bits and ε the rounding error of one sample. Example: a 12-bit converter over 0–10 V has q = 10/4096 ≈ 2.4 mV, so any sample is off by at most about 1.2 mV.',
          crossRef: ['information-loss']
        },
        {
          id: 'l6-sar-converter',
          type: 'formula',
          term: 'The SAR converter',
          body: 'Successive approximation (SAR) performs a binary search on the input voltage using an internal DAC: each clock cycle the DAC tries a value, the comparator says whether the input is above or below it, and the bit is kept or discarded before the next, half-sized, step is tried. The trade is elegant — n bits cost n cycles and one comparator — which is why SAR dominates instrumentation.',
          formula: 't_{conv} = n/f_{clk}',
          symbols: 'n is the resolution in bits, f_clk the conversion clock frequency and t_conv the time for one conversion, excluding the sample-and-hold’s acquisition time. Example: a 12-bit SAR ADC clocked at 1 MHz takes 12 clocks, so t_conv = 12 µs.',
          crossRef: []
        },
        {
          id: 'l6-flash-converter',
          type: 'formula',
          term: 'The flash converter',
          body: 'A flash converter generates every reference level at once with a resistor ladder and fires one comparator per level simultaneously, making it the fastest architecture because all its decisions happen in one step. It is also the worst-scaling: n bits need one comparator per level, so 2 bits need 3 comparators but 12 bits would need 4095 — prohibitive in die area and matching accuracy, which is why flash lives in oscilloscopes and RF front-ends and nowhere near a biopotential amplifier.',
          formula: 'N_{comp} = 2^n - 1',
          symbols: 'n is the resolution in bits and N_comp the number of comparators a flash converter needs. 2 bits need 3 comparators, 12 bits need 4095.',
          crossRef: []
        },
        {
          id: 'l6-flash-thermometer-code',
          type: 'fact',
          term: 'The thermometer code and the encoder',
          body: 'In a flash converter the comparators fill up from the bottom as the input rises, producing a thermometer code — a run of 1s up to the highest level the input exceeds — and a priority encoder maps that pattern to an ordinary binary number. In a 2-bit converter the top bit is simply whichever comparator sits at half of full scale, and the bottom bit combines the comparators at one quarter and three quarters of full scale.',
          formula: 'b_1 = C_{1/2}, \\qquad b_0 = C_{3/4} + C_{1/4}\\overline{C_{1/2}}',
          symbols: 'C_1/2, C_1/4 and C_3/4 are the comparator outputs at those fractions of full scale, 1 if the input exceeds that level and 0 otherwise; the bar over C_1/2 denotes its logical complement.',
          crossRef: []
        },
        {
          id: 'l6-adc-architecture-map',
          type: 'distinction',
          term: 'A map of ADC architectures',
          body: 'Flash is fastest but scales worst, so it is used in oscilloscopes and RF front-ends. SAR is fast, costs n cycles for n bits, and dominates general instrumentation and microcontrollers. Sigma-delta is slow but reaches very high resolution, 16–24 bits, and is standard in audio and biopotential amplifiers, while dual-slope is very slow but very accurate and is found in bench multimeters.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'The conversion handshake',
      items: [
        {
          id: 'l6-adc-interface-pins',
          type: 'fact',
          term: 'The converter’s interface pins',
          body: 'An external converter presents analog and power pins that must be clean and well decoupled — AIN, VREF, VDD and GND — and a digital interface split into control lines from the MCU (CONVST to start a conversion, CS to select the chip), status lines from the ADC (BUSY and DRDY), and data lines (SDO and SCLK).',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l6-never-read-before-ready',
          type: 'pitfall',
          term: 'Never read before the device signals ready',
          body: 'The rule governing every conversion is to poll DRDY or BUSY, or take an interrupt on it, and never read before the device says the result is ready. Reading early returns the previous conversion or garbage, and the resulting bug is intermittent — far worse than one that always fails, because it will not reproduce reliably in testing.',
          formula: null,
          symbols: null,
          crossRef: ['separation-of-concerns']
        },
        {
          id: 'l6-handshake-sequence',
          type: 'fact',
          term: 'The handshake, in sequence',
          body: 'Pulse CONVST to start a conversion; BUSY goes high while the converter works and must not be read during that time; DRDY falls when the result is available; only then are the bits clocked out on SCLK and SDO. It is the status line, not a fixed delay, that tells the code when it may read.',
          formula: null,
          symbols: null,
          crossRef: ['separation-of-concerns']
        },
        {
          id: 'l6-polling-vs-interrupt',
          type: 'distinction',
          term: 'Polling vs. interrupt-driven waiting',
          body: 'Polling is simple to write but leaves the CPU spinning in a loop doing nothing while it waits, which is acceptable only for slow single-channel acquisition. Interrupt-driven waiting lets the CPU do useful work while the conversion runs: DRDY asserts, an interrupt service routine fires and reads the result, which is essential for real-time multi-channel acquisition and the pattern that scales.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l6-handshake-as-contract',
          type: 'fact',
          term: 'The handshake is the same discipline as a software contract',
          body: 'The amplifier, the anti-aliasing filter, the sample-and-hold and the converter each do one thing and hand off cleanly, and the rule that ties them together is that you never read the data line before the status line says you may. This is the same discipline the final project’s MVVM layers rely on — the View must never read data before the ViewModel emits it — because in both cases the interface is a contract, the handshake makes that contract explicit, and violating it produces bugs that appear intermittently and are almost impossible to reproduce.',
          formula: null,
          symbols: null,
          crossRef: ['separation-of-concerns']
        }
      ]
    },

    {
      heading: 'Getting the bits out: serial interfaces',
      items: [
        {
          id: 'l6-parallel-vs-serial',
          type: 'distinction',
          term: 'Parallel vs. serial data transfer',
          body: 'Once a number exists inside the converter it must travel to the microcontroller, either all at once on parallel wires or one bit at a time on a serial bus. Parallel is fastest but needs eight to sixteen or more signal wires and works only over short distances; serial needs far fewer pins, works over distance, and is the MCU standard through SPI and I2C.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l6-spi-interface',
          type: 'fact',
          term: 'SPI: four wires, full duplex',
          body: 'SPI shares a clock, SCLK, and data lines, MOSI and MISO, among every device on the bus and selects one at a time with its own chip-select line. It is full-duplex and reaches tens of megahertz, which is why it is the usual link between an MCU and a fast on-board ADC.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l6-spi-modes-pitfall',
          type: 'pitfall',
          term: 'SPI has four modes, and getting one wrong shifts every value',
          body: 'SPI’s timing is fixed by clock polarity, CPOL — whether the idle clock is high or low — and clock phase, CPHA — whether data is sampled on the leading or trailing edge; the four combinations are its four modes. Getting the mode wrong is the classic first-day SPI bug: the bus runs and produces data, but every value comes out shifted by one bit, because master and slave sampled on different edges.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l6-i2c-interface',
          type: 'fact',
          term: 'I2C: two shared wires, addressed devices',
          body: 'I2C shares just two wires, SDA and SCL, among every device on the bus, and selects a specific one by a 7-bit address rather than a dedicated select line. One transaction frames a start condition, the address plus a read/write bit, an acknowledgement, one or more acknowledged data bytes, and a stop condition; it is slower than SPI, at roughly 0.1–3.4 MHz, but adding another device costs no extra microcontroller pins.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l6-choosing-interface',
          type: 'distinction',
          term: 'Choosing parallel, SPI or I2C',
          body: 'Parallel gives the highest speed and simplest timing but needs eight to sixteen or more wires and address or chip-select logic for multiple devices, so it suits only fast on-board converters over short distances. SPI needs four wires and one chip-select line per device and is the standard choice for most MCU-to-ADC links; I2C needs only two shared wires, addressed rather than select-lined, and is the right choice when many slow sensors must be attached with the fewest pins.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'Putting it to work',
      items: [
        {
          id: 'l6-onchip-external-afe',
          type: 'fact',
          term: 'On-chip, external, and integrated front ends',
          body: 'An on-chip converter is free and simple — the Arduino Uno has a 10-bit, 6-channel ADC built into its ATmega328P. An external converter such as the MCP3008 — 8 channels, 10 bits, SAR, SPI, a few euros — gives higher resolution and lower noise than the on-chip option. A dedicated biopotential front end combines an instrumentation amplifier, filters and a 16–24-bit sigma-delta converter in one package, carrying all channels plus configuration registers over a single serial link, which is what a real multi-channel EMG amplifier contains.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l6-multiplexing',
          type: 'pitfall',
          term: 'Multiplexing one converter across many channels',
          body: 'An analog multiplexer lets one converter serve N channels, but the per-channel sampling rate falls to fs/N, which changes the Nyquist calculation for every channel accordingly. The multiplexer and sample-and-hold also need settling time after each switch before the next conversion starts; skipping it lets each channel’s reading carry a ghost of the channel sampled just before it, a crosstalk artefact rather than a clean sample.',
          formula: 'f_{ch} = f_s/N',
          symbols: 'f_s is the shared converter’s total sampling rate, N the number of multiplexed channels and f_ch the resulting rate available to each individual channel.',
          crossRef: []
        },
        {
          id: 'l6-project-connection',
          type: 'fact',
          term: 'Connecting this chapter to the final project',
          body: 'The TCP server in the final project delivers 32 channels by 18 samples per packet, and that shape is not arbitrary: it is exactly what a multiplexed or multi-channel front end naturally produces, one block holding a short slice of time for every channel at once. The client code the student writes begins exactly where this chapter’s hardware ends.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    }
  ]
});
