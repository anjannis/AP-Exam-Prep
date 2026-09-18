// content/l7.js
// Chapter 7 of the exam script: "Introduction to Arduino" (printed pages
// 55-64). Sections follow the script's own subsection order, so the
// Reference Bank mirrors the chapter a reader already knows.
//
// Plain browser script: no imports, no exports. It pushes onto the LECTURES
// array declared in content.js.

LECTURES.push({
  id: 7,
  name: 'Introduction to Arduino',
  shortName: 'Arduino',
  sections: [
    {
      heading: 'Passive RC filters',
      items: [
        {
          id: 'l7-rc-cutoff-tau',
          type: 'formula',
          term: 'RC filter cut-off and time constant',
          body: 'The RC low-pass and the RC high-pass are the same two components in the opposite order, and they share one formula for the cut-off frequency and the time constant. At the cut-off the magnitude has fallen to 1/sqrt(2), the same -3 dB convention Chapter 2 defines for any filter.',
          formula: 'f_c = \\frac{1}{2\\pi RC}, \\qquad \\tau = RC',
          symbols: 'f_c is the cut-off frequency in hertz, R the resistance in ohms, C the capacitance in farads and τ the time constant in seconds. Example: R = 4.7 kΩ and C = 10 µF give f_c ≈ 3.4 Hz.',
          crossRef: []
        },
        {
          id: 'l7-rc-lowpass-vs-highpass',
          type: 'distinction',
          term: 'RC low-pass vs. RC high-pass',
          body: 'Taking the output across the capacitor gives a low-pass: at low frequencies the capacitor impedance is high and the output follows the input, at high frequencies the capacitor behaves like a short to ground and the output collapses, flat below f_c and then falling at -20 dB per decade. Taking the output across the resistor instead gives a high-pass: the capacitor blocks DC and slow drift entirely, and the response rises at +20 dB per decade up to f_c before flattening out. Same two parts, opposite roles, decided entirely by which component the output is measured across.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l7-rc-as-convolution',
          type: 'formula',
          term: 'The RC filter as a convolution, implemented in copper',
          body: 'An RC low-pass does not merely resemble a digital filter: it computes the same operation, a convolution of the input with the filter impulse response, an exponentially decaying kernel. The moving-average kernel of Chapter 3, the EMG generation model of Chapter 4 and this circuit are the identical equation y = x * h with three different kernels; here the kernel is realised in resistance and capacitance rather than in code, which is exactly what "a first-order digital filter implemented in copper" means.',
          formula: 'h(t) = \\frac{1}{\\tau} e^{-t/\\tau}, \\qquad y(t) = (x * h)(t)',
          symbols: 'h(t) is the impulse response of the filter, τ = RC the time constant, x the input voltage and y the output voltage across the capacitor; * denotes convolution exactly as in earlier chapters.',
          crossRef: ['convolution']
        },
        {
          id: 'l7-rc-same-idea-three-places',
          type: 'fact',
          term: 'One cut-off convention, three media',
          body: 'The -3 dB point of an RC network, the cut-off passed to scipy.signal.butter, and the corner of the analog anti-aliasing filter ahead of the A/D converter are the same concept expressed in three different media: a passive circuit, a digital coefficient, and a hardware requirement. Because aliasing is irreversible once sampling has happened, that anti-aliasing corner has to be realised as an actual RC network sitting between the amplifier and the converter — the RC filter of this chapter is not an analogy for the Chapter 2 requirement, it is one physical way of meeting it.',
          formula: null,
          symbols: null,
          crossRef: ['information-loss']
        }
      ]
    },

    {
      heading: 'What Arduino is',
      items: [
        {
          id: 'l7-arduino-platform',
          type: 'definition',
          term: 'What Arduino is',
          body: 'Arduino is an open-source electronics platform begun in 2005 in Ivrea, Italy, as a teaching tool, named, according to course lore, after a bar the founders used to frequent, "Bar di Re Arduino". The explicit design goal was for students to be up and running after a single class, and the hardware is as open as the software: the complete schematic has been public since the beginning, free to study, modify and manufacture.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l7-atmega328p-specs',
          type: 'fact',
          term: 'The Uno and the ATmega328P',
          body: 'The reference board is the Uno, built around the ATmega328P: 32 KB flash (0.5 KB reserved for the bootloader), 2 KB SRAM and 1 KB EEPROM, 14 digital GPIO pins of which 6 are PWM-capable, a 6-channel 10-bit ADC, UART, 2 external interrupts, 3 timers and an analog comparator, clocked at 16 MHz. 2 KB of SRAM is less than half of one single 4608-byte packet from the course project, which is worth internalising: embedded work is a genuinely different resource regime from a desktop program.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l7-shields',
          type: 'definition',
          term: 'Shields',
          body: 'A shield is a board that stacks onto the Uno headers and supplies hardware that would otherwise have to be built from scratch — displays, motor drivers, Ethernet, sensor arrays. The workflow is always the same three steps: stack the shield, include its library, and write code against the objects that library provides.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'The IDE and the first sketch',
      items: [
        {
          id: 'l7-ide-anatomy',
          type: 'fact',
          term: 'The IDE and the breadboard',
          body: 'The Arduino IDE gives a sketch name, a toolbar, a code area and a console; before anything works, Tools -> Board must name the Arduino Uno and Tools -> Port must name the serial port the board enumerated on. A breadboard has power rails along its edges and interior rows of five tie points, connected internally by metal strips, with a central groove that lets a DIP chip straddle both halves.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l7-sketch-two-functions',
          type: 'definition',
          term: 'setup() and loop()',
          body: 'Every sketch has exactly two required functions: setup(), which runs once at power-up or reset and is where configuration such as pinMode belongs, and loop(), which runs forever, back-to-back, for as long as the board has power. Blink — drive one output pin high, wait, low, wait, repeat — is the traditional first program and exercises exactly this structure.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l7-six-functions',
          type: 'fact',
          term: 'Six functions cover most projects',
          body: 'pinMode(pin, mode) configures a pin as INPUT or OUTPUT; digitalRead(pin) and digitalWrite(pin, value) read or set HIGH/LOW; analogRead(pin) returns 0..1023 from the 10-bit ADC; analogWrite(pin, value) sets a PWM duty cycle from 0..255; and Serial.println(value) prints to the host computer. These six are common to essentially all Arduino boards, and learning them already covers reading sensors, driving LEDs and debugging.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l7-habits-scaling-functions',
          type: 'fact',
          term: 'Habits worth forming early',
          body: 'Naming a pin with const int rather than a bare number means changing it in one place instead of everywhere it is used. map(value, fromLow, fromHigh, toLow, toHigh) rescales a raw reading in one line — an analogRead of 0..1023 becomes a 0..100 percentage or, chained directly into analogWrite, a PWM duty cycle. Writing small named functions such as int checkSensor() or void blink1(), and calling them from loop(), keeps loop() itself short, which the script calls the single most valuable habit in applied programming.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'Digital and analog output',
      items: [
        {
          id: 'l7-led-resistor-sizing',
          type: 'formula',
          term: 'Sizing an LED series resistor',
          body: 'An LED is driven through a series resistor to ground, never directly, because without one it draws current until something fails. Given the supply voltage, the LED forward voltage drop and a target current, the minimum-resistance formula gives the smallest safe value; for a 5 V supply, a roughly 2 V red-LED drop and 20 mA this comes to 150 Ω, so 220-330 Ω is the standard safe choice.',
          formula: 'R_{min} = \\frac{V_{supply} - V_f}{I}',
          symbols: 'V_supply is the supply voltage, V_f the LED forward voltage drop and I the target current. Example: (5 - 2)/0.02 = 150 Ω.',
          crossRef: []
        },
        {
          id: 'l7-dac-definition',
          type: 'formula',
          term: 'The DAC: the mirror image of the ADC',
          body: 'A digital-to-analog converter turns a binary word into a real output voltage, so that n bits give 2^n output levels; ADC in, DAC out together give a digital system a complete analog interface. Two classic implementations appear in the material: a binary-weighted DAC is an inverting summing amplifier whose input gains halve at each successive bit, and an R/2R ladder achieves the identical weighting with only two distinct resistor values, which is far easier to manufacture accurately.',
          formula: 'V_{out} = \\frac{value}{2^n}\\,V_{ref}',
          symbols: 'value is the binary input word, n the number of bits and V_ref the reference voltage; each bit contributes its own binary place value to the sum.',
          crossRef: []
        },
        {
          id: 'l7-pwm-vs-dac',
          type: 'distinction',
          term: 'Why PWM is not a true analog output',
          body: 'The Uno has no true DAC. A true DAC holds a steady voltage anywhere between 0 and V_ref, with resolution set by its bit depth. analogWrite instead produces PWM: the pin is always either fully on (5 V) or fully off (0 V), and it is only the duty cycle — the fraction of each period spent HIGH — that carries the value, so the instantaneous voltage never actually sits in between. PWM needs no extra hardware beyond a timer already built into six pins, but its 256 duty steps are a coarser and fundamentally different kind of resolution than a true DAC output level.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l7-pwm-mechanics',
          type: 'fact',
          term: 'PWM on the Uno',
          body: 'analogWrite(pin, value) sets a duty cycle from value 0 (off) to 255 (full) on one of the PWM-capable pins 3, 5, 6, 9, 10 and 11, marked with a tilde. The carrier frequency is fixed per pin and cannot be changed by the sketch — roughly 977 Hz on pins 5 and 6, roughly 488 Hz on pins 3, 9, 10 and 11. Hobby servos expect a much slower ~50 Hz signal instead, which is why the Servo library exists rather than driving a servo directly with analogWrite.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l7-pwm-rc-dac',
          type: 'fact',
          term: 'PWM plus an RC low-pass approximates a DAC',
          body: 'Passing a PWM signal through the RC low-pass from the start of the chapter recovers a genuine steady analog voltage, provided the cut-off sits far below the PWM carrier: with R = 4.7 kΩ and C = 10 µF, f_c ≈ 3.4 Hz against a 490 Hz carrier, analogWrite(9, 128) produces a clean ≈2.5 V. The design rule is simply f_c much less than f_PWM; read the other way, it is also why the carrier must never be allowed to leak into a signal band that matters.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l7-direct-port-manipulation',
          type: 'pitfall',
          term: 'Direct port manipulation',
          body: 'On AVR boards, DDRD sets the direction of eight pins in one write and PORTD sets all eight of their states at once, which is much faster than eight separate digitalWrite calls. It is also unportable — the registers do not exist on the 32-bit Uno R4 — and it is far less readable than named pin calls. The right occasion to use it is a genuine timing requirement that forces it, not simply because it looks clever.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'Inputs and sensors',
      items: [
        {
          id: 'l7-floating-input',
          type: 'pitfall',
          term: 'Never leave a digital input floating',
          body: 'A digital input pin wired to nothing picks up ambient noise and reads randomly HIGH and LOW. Every button needs either an external pull-down or pull-up resistor, or the internal one enabled with pinMode(pin, INPUT_PULLUP); a report that a button "works intermittently" is almost always a floating input rather than a faulty button.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l7-analogread-resolution',
          type: 'formula',
          term: 'analogRead resolution: quantisation in hardware',
          body: 'analogRead(A0) returns 0..1023 from the Uno 10-bit ADC over its 0..5 V range, so one count is about 4.9 mV — the same quantisation Chapter 2 describes in software terms, now expressed as a concrete hardware step size. A reading can never resolve a voltage change smaller than this step, whatever the sensor upstream of it is capable of.',
          formula: 'q = V_{FS}/2^n',
          symbols: 'q is the quantisation step (one LSB), V_FS the full-scale range and n the ADC resolution in bits. On the Uno, V_FS = 5 V and n = 10, so q = 5 V/1024 ≈ 4.9 mV per count.',
          crossRef: ['information-loss']
        },
        {
          id: 'l7-potentiometer-divider',
          type: 'fact',
          term: 'The potentiometer as a voltage divider',
          body: 'A potentiometer is wired with its outer pins to 5 V and GND and its wiper to an analog pin, which is precisely the voltage divider introduced with passive sensors in the previous chapter, now with the divider ratio under a thumb. Most of the sensors in a typical kit are variable resistors in the same disguise — photoresistors, flex sensors, force-sensing resistors, thermistors — while Hall-effect, infrared, ball-tilt and accelerometer modules add their own conditioning but present the same electrical interface.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l7-counts-to-units',
          type: 'fact',
          term: 'From counts to physical units',
          body: 'Turning a raw analogRead count into a physical unit is a short, repeatable pipeline: read the count, convert it to millivolts using the reference voltage and the number of levels, then convert millivolts to a physical unit using the known millivolts-per-unit sensitivity of the sensor — for example dividing by 10 mV per degree for a linear temperature sensor.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l7-integer-division-pitfall',
          type: 'pitfall',
          term: 'The float trap: integer division silently returning zero',
          body: 'Writing value / 1023 with two ints performs integer division in C, which evaluates to 0 for every reading below 1023 and cannot be recovered by any multiplication that follows; the program runs without any error and simply reports zero forever. Writing 1023.0 instead forces floating-point division. This is one of the most common bugs in the exercises precisely because it produces no error message at all.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'Libraries, displays and sound',
      items: [
        {
          id: 'l7-libraries-include',
          type: 'definition',
          term: 'Include and the library ecosystem',
          body: 'An #include statement pulls in a library that has already solved the hard part of talking to a piece of hardware; libraries for LCD, servo, stepper, SD and EEPROM ship with the IDE. LiquidCrystal lcd(12, 11, 5, 4, 3, 2); lcd.begin(16, 2); lcd.print("hello, world!"); is the entire program needed to drive a 16x2 character display once the library is included.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l7-hardware-patterns-lib',
          type: 'fact',
          term: 'Reusing the button and output patterns for real sensors',
          body: 'A PIR motion sensor is read exactly like a button, with digitalRead; tone(pin, frequency, duration) plays a square wave of a given pitch on any digital pin without extra hardware; and an ultrasonic distance sensor is timed with pulseIn, which waits for a pin to change and returns the pulse length in microseconds — the echo converts to centimetres at 29 microseconds per centimetre, halved because the pulse travels the distance twice.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l7-interrupts-restricted-pins',
          type: 'fact',
          term: 'Why attachInterrupt only works on pins 2 and 3',
          body: 'attachInterrupt works only on pins 2 and 3 on the Uno because the ATmega328P wires only two external interrupt lines to the outside world, and those two lines happen to be the ones physically connected to those pins. No amount of software configuration exposes an interrupt on a pin the silicon never routed one to; every other pin can still be polled in loop(), just not woken on a change without that hardware line.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l7-volatile-necessity',
          type: 'pitfall',
          term: 'Why an interrupt-modified variable must be volatile',
          body: 'The compiler cannot see that an interrupt service routine changes a shared variable between one line of loop() and the next, so without volatile it may cache the variable in a register and have loop() read the same stale value forever. volatile forces a fresh read from memory on every access, guaranteeing that loop() eventually observes the update made by the interrupt. This is the microcontroller-scale version of the same concurrency problem that reappears in Chapter 8, when a network thread writes a buffer that a GUI thread reads.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'Motors and actuators',
      items: [
        {
          id: 'l7-motor-types',
          type: 'distinction',
          term: 'DC, servo or stepper: which motor for which job',
          body: 'A DC motor is simplest and offers no precise control — good whenever something merely needs to spin, using a coil, a magnet and a commutator to turn current into torque. A servo is a DC motor with a gearbox and a feedback potentiometer in a closed loop: PWM sets a target position, typically over 180 degrees, and an internal amplifier drives the motor until the position error is zero. A stepper gives precise angle and speed, rotates indefinitely and holds torque strongly, at the cost of needing a driver and several control lines; four coil combinations walk a toothed rotor from step to step.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l7-dc-motor-torque-speed',
          type: 'formula',
          term: 'The DC motor torque-speed curve',
          body: 'A DC motor torque falls linearly from its stall torque at zero speed to zero at its no-load speed, and mechanical power is their product at each speed, which is therefore zero at both extremes and peaks somewhere between them. That peak occurs midway between the two extremes and equals one quarter of the product of stall torque and no-load speed.',
          formula: 'P_{max} = \\frac{1}{4}\\,\\tau_s\\,\\omega_n',
          symbols: 'τ_s is the stall torque (at zero speed), ω_n the no-load speed (at zero torque) and P_max the maximum mechanical power, reached halfway between them.',
          crossRef: []
        },
        {
          id: 'l7-servo-mechanism',
          type: 'definition',
          term: 'The servo as a closed-loop DC motor',
          body: 'Inside a servo, a DC motor drives a gearbox whose output shaft also turns a feedback potentiometer; a PWM control signal is converted to a target voltage, compared against the voltage from that potentiometer, and the resulting error signal drives the motor through an amplifier until the error reaches zero. The write(angle) call in the Servo library is simply setting that target.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l7-motor-drivers-needed',
          type: 'fact',
          term: 'Motors need a driver and often their own supply',
          body: 'An Arduino pin sources only tens of milliamps, while a motor wants hundreds or thousands, so motors are never wired to a pin directly. Unipolar steppers are buffered with a Darlington array such as the ULN2004; bipolar steppers and reversible DC motors need an H-bridge, in which two diagonal transistors conduct so that current crosses the coil in the chosen direction; and large mains loads are switched by a relay module, so that a small control current commands a large one.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'Serial communication and the learning cycle',
      items: [
        {
          id: 'l7-serial-basics',
          type: 'fact',
          term: 'Serial.begin and the serial monitor',
          body: 'Serial.begin(9600) in setup() opens the serial link, and the baud rate set in the serial monitor must match the one in the sketch or the output is mojibake rather than text. Serial.println() is the microcontroller print debugger, and on a board with no screen it is often the only window into what a running program is actually doing.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l7-serial-to-project-bridge',
          type: 'fact',
          term: 'From Serial.println to the course project',
          body: 'Serial.println() sends a stream of bytes down a wire to a host program that has to reassemble them into values, and the course TCP client does exactly the same thing at higher speed and with a defined packet structure. The problems are identical in both cases: agree on a format, agree on a byte order, and never assume that one read call returns exactly one message.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l7-learning-cycle',
          type: 'fact',
          term: 'The learning cycle',
          body: 'The chapter closes with the learning cycle it wants adopted for every exercise: experience, reflect, conceptualise, experiment, then go around again. Play, break things, ask why something failed, and redesign — the cycle itself is the point, not any single sketch.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    }
  ]
});
