// questions/l7.js
// Question bank for Chapter 7. 18 questions, 11 mc / 7 short (ratio 0.61).
// The seven short answers are seeded from the script's own end-of-chapter
// exam questions, in the course's wording, with model answers a marker
// would accept.
//
// Answer-key hygiene, enforced by checkAnswerBalance and checkOptionLengthBias
// in tools/validate.js: correctIndex is spread across 0-3 (3/2/3/3), all four
// positions are used, and options are written to comparable length so that
// neither position nor length signals the answer. Explanations quote option
// text rather than option numbers, so they survive any later reordering.
//
// Plain browser script: no imports, no exports. It pushes onto the QUESTIONS
// array declared in questions.js.

QUESTIONS.push(
  {
    id: 'l7-001',
    lecture: 7,
    topic: 'filtering',
    mode: 'short',
    question: 'An RC low-pass filter uses R = 10 kOhm and C = 100 nF. What is its cut-off frequency, and by how much is a 16 kHz component attenuated relative to DC?',
    answer: 'f_c = 1/(2*pi*1e4*1e-7) is about 159 Hz. 16 kHz is about two decades above f_c, and a first-order response falls at -20 dB per decade, so the attenuation is roughly -40 dB, a factor of about 100.',
    contentRef: 'l7-rc-cutoff-tau'
  },

  {
    id: 'l7-002',
    lecture: 7,
    topic: 'filtering',
    mode: 'mc',
    question: 'An RC low-pass filter and the moving-average smoothing of an earlier chapter are described as the same operation. In what precise sense is this true?',
    options: [
      'Both operate only on already-sampled digital data, so the RC filter is really a digital filter in disguise',
      'Both require the same sampling rate to work correctly, since the kernel length is set by f_s in either case',
      'Both remove exactly the same frequencies, so their magnitude responses are numerically identical at every frequency',
      'Both compute a convolution of the input with a fixed kernel; the kernel of the RC filter is exponential rather than uniform'
    ],
    correctIndex: 3,
    answer: 'The RC filter computes y = x * h at every instant, exactly as the moving-average envelope does; only the kernel differs. A moving average has a uniform, finite kernel, while the RC filter kernel is an exponential decay of infinite extent, realised in resistance and capacitance rather than in code. The responses do not coincide numerically, since the kernel shapes differ; the RC filter is analog, not digital, which is the whole point of calling it a digital filter implemented in copper; and an RC filter has no sampling rate at all.',
    contentRef: 'l7-rc-as-convolution'
  },

  {
    id: 'l7-003',
    lecture: 7,
    topic: 'aliasing',
    mode: 'mc',
    question: 'Why must the RC low-pass that serves as an anti-aliasing filter sit as an actual analog circuit ahead of the ADC, rather than as an equivalent digital filter applied to the samples afterward?',
    options: [
      'Aliasing folds content above f_s/2 into the sampled data at the moment of conversion, and no later filter can undo that',
      'Digital filters are always less steep than analog ones, so they cannot reach the same -3 dB cut-off point',
      'The ATmega328P clock is too slow to run a digital low-pass fast enough to keep pace with the 10-bit ADC',
      'Analog filters attenuate at -20 dB per decade while digital filters can only manage -3 dB per decade'
    ],
    correctIndex: 0,
    answer: 'Aliasing happens at the instant of sampling: content above f_s/2 folds into the base band and becomes indistinguishable from genuine low-frequency signal in the recorded numbers themselves. Once that has happened, no digital filter of any steepness can separate the two, because the information distinguishing them is gone. Digital filters can in fact be made arbitrarily steep, the ADC clock speed is not the bottleneck, and the roll-off figures in the other options are not real constraints.',
    contentRef: 'l7-rc-same-idea-three-places'
  },

  {
    id: 'l7-004',
    lecture: 7,
    topic: 'pwm',
    mode: 'short',
    question: 'Explain precisely what analogWrite(9, 64) does on an Arduino Uno.',
    answer: 'It configures pin 9 to output a square wave at roughly 488 Hz with a duty cycle of 64/255, about 25%. The pin voltage is always either 0 V or 5 V; only the average, about 1.25 V, carries the value. It is not a DAC.',
    contentRef: 'l7-pwm-mechanics'
  },

  {
    id: 'l7-005',
    lecture: 7,
    topic: 'pwm',
    mode: 'mc',
    question: 'A true 8-bit DAC and analogWrite() on an Uno both claim to produce an "analog" 2.5 V from a digital value. What actually differs between the two?',
    options: [
      'Nothing differs electrically; the only difference is that one is called analogWrite and the other is called a DAC',
      'The DAC output pin is always at a steady 2.5 V; the analogWrite pin is always at 0 V or 5 V, and only its average is 2.5 V',
      'The DAC needs a resistor network while analogWrite needs no hardware at all beyond a single capacitor',
      'analogWrite reaches a finer resolution than an 8-bit DAC, since it has 256 duty steps against the DAC 256 levels'
    ],
    correctIndex: 1,
    answer: 'A true DAC holds a genuinely steady voltage between 0 and its reference. PWM never does: the pin is always fully on or fully off, and only the fraction of time spent HIGH carries the value, so the 2.5 V exists only as a time average, not as an instantaneous level. The two are not simply two names for the same thing. A DAC does need extra hardware while PWM needs none beyond a timer already built into the pin, the reverse of one distractor, and matching duty steps to bit levels one-to-one is not the same kind of resolution, since PWM levels are averages recovered only after filtering.',
    contentRef: 'l7-pwm-vs-dac'
  },

  {
    id: 'l7-006',
    lecture: 7,
    topic: 'pwm',
    mode: 'mc',
    question: 'Why is a hobby servo driven through the Servo library instead of a plain analogWrite() call?',
    options: [
      'The fixed analogWrite carrier frequency, around 490 Hz, is much faster than the roughly 50 Hz a servo expects',
      'The Servo library uses a completely different pin than any analogWrite-capable pin on the Uno',
      'analogWrite outputs 0-255 while a servo needs an angle between 0 and 180, and only the library converts units',
      'analogWrite cannot be safely used on pin 9, which is reserved internally for the Servo library timer'
    ],
    correctIndex: 0,
    answer: 'The analogWrite carrier runs at a fixed rate set by the pin, roughly 977 Hz or 488 Hz, far faster than the roughly 50 Hz pulse rate a hobby servo is built to expect; feeding it the wrong rate does not simply rescale the range, it drives the servo incorrectly. The Servo library exists to generate that different, slower timing, not merely to convert units, and it can use several PWM-capable pins, pin 9 among them but not exclusively. Unit conversion alone is a real but secondary difference, not the reason a different library is required.',
    contentRef: 'l7-pwm-mechanics'
  },

  {
    id: 'l7-007',
    lecture: 7,
    topic: 'pwm',
    mode: 'short',
    question: 'You need a steady 1.8 V reference from an Uno using only passive components. Describe a solution and justify your choice of values.',
    answer: 'Use PWM plus an RC low-pass. analogWrite a duty of 1.8/5 times 255, about 92, and filter the pin with an RC network whose cut-off sits far below the PWM carrier, for example R = 4.7 kOhm and C = 10 uF giving f_c about 3.4 Hz against a 490 Hz carrier, so the ripple is heavily attenuated and the output settles at the average.',
    contentRef: 'l7-pwm-rc-dac'
  },

  {
    id: 'l7-008',
    lecture: 7,
    topic: 'io',
    mode: 'mc',
    question: 'What is the correct trade-off when deciding whether to replace eight digitalWrite calls with a single PORTD assignment?',
    options: [
      'PORTD is always the better choice, because it is a strict improvement in both speed and readability',
      'PORTD only works on the Uno R4 32-bit architecture, so it is not usable on the classic Uno at all',
      'PORTD and digitalWrite are equally fast, so the only reason to prefer one is personal coding style',
      'PORTD is faster but unportable and harder to read, so it is worth it only when timing genuinely requires it'
    ],
    correctIndex: 3,
    answer: 'Direct port manipulation is genuinely faster than eight separate digitalWrite calls, but that speed is bought at a real cost: the registers are AVR-specific and do not exist on the 32-bit Uno R4, and a line such as PORTD = B10101000; is much harder to read than named pin calls. The right occasion for it is a timing requirement that actually forces the speed, not a general preference. It is the classic Uno, not the R4, where these registers exist at all, the reverse of one of the distractors, and the two approaches are not equally fast.',
    contentRef: 'l7-direct-port-manipulation'
  },

  {
    id: 'l7-009',
    lecture: 7,
    topic: 'io',
    mode: 'mc',
    question: 'A student wires a pushbutton to a digital input pin with no resistor at all, and the sketch reports the button as pressed at random even when no one touches it. What is happening?',
    options: [
      'The button itself is faulty and needs to be replaced with a new one from the kit',
      'The input pin is floating: with nothing fixing its voltage, it picks up ambient noise and reads randomly',
      'The sketch is missing a delay() in loop(), so digitalRead is sampling faster than the button can settle',
      'The pin was configured as OUTPUT instead of INPUT, so digitalRead is returning whatever was last written'
    ],
    correctIndex: 1,
    answer: 'A digital input connected to nothing has no defined voltage, so it picks up stray noise and reads HIGH and LOW at random, the classic floating-input symptom, fixed with an external pull-up or pull-down resistor or with pinMode(pin, INPUT_PULLUP). A broken button would read consistently one way rather than randomly, a missing delay affects timing rather than the presence of a defined logic level, and a pin left in OUTPUT mode reading back its own last write would give a consistent value, not noise.',
    contentRef: 'l7-floating-input'
  },

  {
    id: 'l7-010',
    lecture: 7,
    topic: 'quantisation',
    mode: 'mc',
    question: 'The Uno analogRead(A0) is described as having a resolution of about 4.9 mV per count. What determines this number?',
    options: [
      'The tolerance of the resistors typically used in a voltage-divider sensor circuit on the analog pins',
      'The precision of the 16 MHz clock that drives every timed operation on the ATmega328P',
      'The 5 V full-scale range divided across the ADC 1024 levels, since it is a 10-bit converter',
      'The gain of the operational amplifier built into the analog comparator on the chip'
    ],
    correctIndex: 2,
    answer: 'This is quantisation in exactly the sense the earlier chapter on sampling introduces it: a 10-bit converter has 2^10 = 1024 levels, and spreading the 5 V range across them gives a step of 5 V/1024, about 4.9 mV, the smallest voltage change the converter can register. Sensor resistor tolerance, clock precision and comparator gain are all real properties of the board, but none of them sets the step size of the ADC itself.',
    contentRef: 'l7-analogread-resolution'
  },

  {
    id: 'l7-011',
    lecture: 7,
    topic: 'adc',
    mode: 'short',
    question: 'A student writes float mv = (analogRead(A0) / 1023) * 5000; and always gets 0. Explain.',
    answer: 'analogRead returns an int and 1023 is an int, so C performs integer division: every reading below 1023 gives 0, and the subsequent multiplication cannot recover it. Writing 1023.0 forces floating-point division.',
    contentRef: 'l7-integer-division-pitfall'
  },

  {
    id: 'l7-012',
    lecture: 7,
    topic: 'io',
    mode: 'mc',
    question: 'Why does attachInterrupt only work on pins 2 and 3 on an Arduino Uno?',
    options: [
      'Those are the only two pins the IDE has been configured to poll quickly enough for interrupt timing',
      'Pins 2 and 3 are reserved by the bootloader, so only they are guaranteed free when a sketch starts',
      'The ATmega328P physically wires only two external interrupt lines to the outside world, at those pins',
      'Using more than two interrupts at once would overflow the 2 KB of SRAM available on the chip'
    ],
    correctIndex: 2,
    answer: 'This is a hardware limitation, not a software or memory one: the ATmega328P has exactly two external interrupt lines, and they are routed on the chip to pins 2 and 3. No configuration in the IDE exposes an interrupt on a pin the silicon never connected one to; the bootloader and SRAM size are unrelated to which pins carry interrupt lines.',
    contentRef: 'l7-interrupts-restricted-pins'
  },

  {
    id: 'l7-013',
    lecture: 7,
    topic: 'io',
    mode: 'short',
    question: 'Why must an interrupt-modified variable be declared volatile?',
    answer: 'Because the compiler cannot see that the interrupt service routine modifies it, and may cache it in a register or optimise the read away entirely. volatile forces a fresh read from memory on every access, so the main loop observes the update made by the ISR.',
    contentRef: 'l7-volatile-necessity'
  },

  {
    id: 'l7-014',
    lecture: 7,
    topic: 'io',
    mode: 'mc',
    question: 'Why is the Arduino Uno 2 KB of SRAM described as evidence of a genuinely different resource regime, using the course project own packet size as the comparison?',
    options: [
      '2 KB of SRAM is roughly twice the size of one 4608-byte project packet, so buffering a few packets is comfortable',
      'SRAM on the Uno is significantly slower to access than the flash memory that holds the compiled sketch',
      '2 KB of SRAM is less than half the size of a single 4608-byte project packet, a genuinely different memory budget',
      'The Uno SRAM is shared with the bootloader, so barely any of the nominal 2 KB is actually available to a sketch'
    ],
    correctIndex: 2,
    answer: 'The comparison is deliberately stark: one project packet alone, 4608 bytes, is more than twice the entire 2 KB of SRAM on the board, so buffering even a single packet the way the desktop-side project code does is out of the question on the Uno. SRAM being slower than flash is not the relevant contrast here, the bootloader occupies flash rather than SRAM, and the packet is more than double the SRAM rather than comfortably smaller than it.',
    contentRef: 'l7-atmega328p-specs'
  },

  {
    id: 'l7-015',
    lecture: 7,
    topic: 'io',
    mode: 'short',
    question: 'An LED with a 2 V forward drop is driven from a 5 V pin. What series resistance limits the current to 15 mA?',
    answer: 'R = (5 - 2)/0.015 = 200 Ohm, so use the next standard value up, 220 Ohm.',
    contentRef: 'l7-led-resistor-sizing'
  },

  {
    id: 'l7-016',
    lecture: 7,
    topic: 'pwm',
    mode: 'mc',
    question: 'On a DC motor torque-speed curve, where does the motor deliver its maximum mechanical power?',
    options: [
      'At the stall torque, where speed is zero but the current, and hence torque, is at its highest value',
      'At the no-load speed, where the motor spins fastest and therefore converts current into motion most efficiently',
      'There is no single peak; mechanical power increases monotonically from stall torque to the no-load speed',
      'Midway between stall torque and no-load speed, where the product of the falling and rising quantities peaks'
    ],
    correctIndex: 3,
    answer: 'Torque falls linearly from its stall value to zero at the no-load speed, so mechanical power, their product, is zero at both extremes and rises in between, peaking midway along at one quarter of stall torque times no-load speed. Neither extreme delivers usable mechanical power, since one has zero speed and the other has zero torque, and the curve is not monotonic.',
    contentRef: 'l7-dc-motor-torque-speed'
  },

  {
    id: 'l7-017',
    lecture: 7,
    topic: 'pwm',
    mode: 'short',
    question: 'Compare a servo and a stepper for positioning a small camera mount, and say which you would choose.',
    answer: 'A servo is a closed-loop DC motor with an internal potentiometer: it is simple to drive with one PWM signal, cheap, but usually limited to about 180 degrees and it has no holding accuracy beyond its internal feedback. A stepper gives precise, repeatable angular steps, unlimited rotation and strong holding torque, but needs a driver, four control lines and its own supply. For a small mount with a limited range and a simple wiring budget, the servo is the better choice; for continuous or high-precision positioning, the stepper.',
    contentRef: 'l7-motor-types'
  },

  {
    id: 'l7-018',
    lecture: 7,
    topic: 'serial',
    mode: 'mc',
    question: 'What does a TCP client reassembling packets from the course project socket have in common with a host program reading Serial.println() output from an Arduino?',
    options: [
      'Both must agree on a format and byte order, and neither may assume one read returns a full message',
      'Nothing structural; TCP guarantees message boundaries while a serial byte stream does not',
      'Both rely on the same 9600 baud rate, since USB serial and TCP sockets share the same physical layer',
      'Both are solved once a checksum is added, since that is the only information a raw byte stream is missing'
    ],
    correctIndex: 0,
    answer: 'Both are ultimately a stream of bytes with no message boundaries built in: the receiver has to agree in advance on a format and a byte order, and it can never assume that a single read call happens to return exactly one message worth of data. TCP does not guarantee message framing any more than a serial line does. Baud rate is specific to serial links and has no TCP equivalent, and a checksum would only detect corruption, not solve the framing problem.',
    contentRef: 'l7-serial-to-project-bridge'
  }
);
