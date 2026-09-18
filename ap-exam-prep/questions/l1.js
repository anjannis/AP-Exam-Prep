// questions/l1.js
// Question bank for Chapter 1. 18 questions, 11 mc / 7 short (ratio 0.61).
// Several short answers are the script's own end-of-chapter exam questions,
// in the course's wording, with model answers a marker would accept.
//
// Answer-key hygiene, enforced by checkAnswerBalance and checkOptionLengthBias
// in tools/validate.js: correctIndex is spread across 0-3 (3,3,3,2), and the
// four options of every question are written to comparable length so that
// neither position nor length signals the answer. Explanations quote option
// text rather than option numbers, so they survive any later reordering.
//
// Plain browser script: no imports, no exports. It pushes onto the QUESTIONS
// array declared in questions.js.

QUESTIONS.push(
  {
    id: 'l1-001',
    lecture: 1,
    topic: 'vectors',
    mode: 'mc',
    question: 'The pectoralis major’s clavicular and sternal fibres pull on the humerus at clearly different angles. Why is the net mechanical effect on the bone the vector sum of the two pulls rather than the sum of their magnitudes?',
    options: [
      'Because each fibre group pulls along its own line of action, so only adding the two forces as vectors accounts for both magnitude and direction correctly',
      'Because muscle fibres always act in exactly the same direction once fully contracted, so only their magnitudes need to be combined',
      'Because the sternal fibres contribute no force at all during adduction, leaving the clavicular fibres solely responsible for the resultant',
      'Because bone is rigid, so it transmits only the larger of the two forces and the smaller one is absorbed by the joint capsule'
    ],
    correctIndex: 0,
    answer: 'A force has both a magnitude and a direction, and the two fibre groups pull along different lines of action. Their combined mechanical effect on the bone is the vector sum — found by the parallelogram rule — not the arithmetic sum of magnitudes; adding magnitudes while ignoring direction overestimates the resultant, sometimes badly.',
    contentRef: 'l1-muscle-vector-sum-pitfall'
  },

  {
    id: 'l1-002',
    lecture: 1,
    topic: 'vectors',
    mode: 'mc',
    question: 'Converting Cartesian components (Px, Py) to a polar angle, why should np.arctan2(Py, Px) be used instead of np.arctan(Py/Px)?',
    options: [
      'arctan2 returns the angle in degrees directly, while arctan always returns radians regardless of the arguments given to it',
      'arctan loses the quadrant and divides by zero on the y-axis, while arctan2 is correct in all four quadrants',
      'arctan2 is a NumPy-only function, while arctan is the only version available in the standard Arduino or C library',
      'arctan runs slower because it computes the ratio first, while arctan2 evaluates sine and cosine directly without division'
    ],
    correctIndex: 1,
    answer: 'np.arctan(Py/Px) discards the individual signs of Py and Px, collapsing four quadrants into two, and it divides by zero whenever Px=0. np.arctan2(Py, Px) is given both components separately and returns the correct angle in all four quadrants, including on the axes. The same distinction applies to atan2 in C and Arduino sketches, and neither function is defined by its speed or its unit.',
    contentRef: 'l1-atan2-trap'
  },

  {
    id: 'l1-003',
    lecture: 1,
    topic: 'vectors',
    mode: 'short',
    question: 'Why are polar coordinates preferred over Cartesian for analysing elbow flexion?',
    answer: 'Because the motion is a rotation at nearly constant radius. In polar coordinates the radius is essentially constant and the single variable θ describes the movement, so lever arms and torques become explicit functions of θ. In Cartesian coordinates both components vary simultaneously and the underlying single degree of freedom is obscured.',
    contentRef: 'l1-polar-for-rotation'
  },

  {
    id: 'l1-004',
    lecture: 1,
    topic: 'vectors',
    mode: 'short',
    question: 'An sEMG electrode grid records frames every 2 ms. A motor unit action potential moves 24 mm over three frame intervals. What is its conduction velocity, and is this a plausible value?',
    answer: 'Three intervals is 6 ms, so v = 24 mm/6 ms = 4 mm/ms = 4 m/s. This is the typical value for muscle-fibre conduction velocity, so it is plausible. It is an average velocity over that interval, not an instantaneous one.',
    contentRef: 'l1-conduction-velocity'
  },

  {
    id: 'l1-005',
    lecture: 1,
    topic: 'forces',
    mode: 'mc',
    question: 'A 1 kg object is taken from Earth’s surface to the Moon, where gravitational acceleration is about 1.62 m/s² instead of 9.81 m/s². What changes, and what stays the same?',
    options: [
      'Both its mass and its weight fall to about one sixth of their Earth values, since mass depends on the local gravitational field',
      'Its mass increases slightly to compensate for the weaker field, keeping the object’s weight constant across locations',
      'Its mass stays 1 kg everywhere, but its weight falls to about 1.62 N, since weight is mass times local gravitational acceleration',
      'Neither mass nor weight changes, because both are properties of the object alone and do not depend on gravity at all'
    ],
    correctIndex: 2,
    answer: 'Mass is a property of the object and is the same everywhere in the universe, so it stays 1 kg. Weight is a force, F=mg, and depends on the local gravitational acceleration g; on the Moon g≈1.62 m/s², so the same 1 kg object weighs about 1.62 N instead of 9.81 N. Confusing the two, or assuming either is location-independent in the way the other is, is the classic mistake.',
    contentRef: 'l1-mass-vs-weight'
  },

  {
    id: 'l1-006',
    lecture: 1,
    topic: 'forces',
    mode: 'mc',
    question: 'A person pushes against a wall bolted to bedrock, and separately pushes an empty shopping cart on frictionless wheels. Both pushes have the same magnitude. How do the two cases differ mechanically?',
    options: [
      'They do not differ: any force produces an inertial reaction m·a regardless of whether the object receiving it can move',
      'The wall case produces an inertial reaction because the wall is rigid, while the cart produces a static reaction because it is unloaded',
      'Only the cart experiences a reaction force at all, since a fixed wall has no ability to generate a reaction of its own',
      'The wall, constrained and immovable, returns an equal static reaction force; the free cart accelerates, producing an inertial reaction equal to m·a'
    ],
    correctIndex: 3,
    answer: 'A static force acts on a constrained, immovable body and is met by an identical static reaction force, as with the wall. A dynamic force acts on a body free to move; it produces an inertial reaction equal to m·a and accelerates the object, as with the cart. Rigidity of the receiving object is not what decides the case — whether the object is free to move is.',
    contentRef: 'l1-static-vs-dynamic-force'
  },

  {
    id: 'l1-007',
    lecture: 1,
    topic: 'torque',
    mode: 'mc',
    question: 'A tendon pulls on a bone at 30° to the segment instead of the 90° that would maximise torque, with the same force magnitude and the same insertion point. What happens to the torque produced?',
    options: [
      'It falls to F·l·sin30°, which is exactly half of what the same force would produce if it pulled perpendicular to the segment',
      'It is unchanged, because torque depends only on the force magnitude and the distance to the insertion point, not on the angle',
      'It falls to zero, because any angle other than exactly 90° gives the force a lever arm of zero with respect to the pivot',
      'It increases, because a shallower angle lets the tendon pull over a longer effective path before reaching the insertion point'
    ],
    correctIndex: 0,
    answer: 'Torque is T=F·l·sinφ, where l is the pivot-to-insertion distance and φ the angle between the force and the segment. Since sin30°=0.5, the torque is exactly half of the F·l value it would reach at φ=90°, where sinφ=1 is maximal. Torque does depend on the angle — that is exactly the point the definition is testing — and it is smaller, not zero or larger, for a shallow angle.',
    contentRef: 'l1-torque-general-angle'
  },

  {
    id: 'l1-008',
    lecture: 1,
    topic: 'torque',
    mode: 'short',
    question: 'Define the lever arm of a force with respect to a point, and state the condition under which T=Fl rather than T=Fl sinφ.',
    answer: 'The lever arm is the perpendicular distance from the point to the line of action of the force. T=Fl holds only when the force is perpendicular to the segment joining the point to the force’s application point, i.e. φ=90°; otherwise T=Fl sinφ<Fl.',
    contentRef: 'l1-torque-perpendicular-pitfall'
  },

  {
    id: 'l1-009',
    lecture: 1,
    topic: 'torque',
    mode: 'short',
    question: 'A muscle pulls on a bone at an angle φ to the segment rather than perpendicular to it. Explain, using a decomposition of the force, why the torque produced is F·l·sinφ and not F·l, and what happens to the rest of the force.',
    answer: 'Decompose the force into a component perpendicular to the segment and a component along it. The perpendicular component has lever arm l and produces the entire torque, F·l·sinφ. The component along the segment points straight at the pivot, so its lever arm is zero and it contributes no torque at all — instead it compresses or distracts the joint, which is not wasted effort, since joint stability depends on it, but it is not torque.',
    contentRef: 'l1-torque-two-approaches'
  },

  {
    id: 'l1-010',
    lecture: 1,
    topic: 'levers',
    mode: 'mc',
    question: 'Why must the biceps generate roughly eight times the force of a dumbbell held in the hand for the forearm to remain in static equilibrium?',
    options: [
      'Because the elbow is a class I lever, and class I levers always require the effort to exceed the load by a large margin',
      'Because the muscle’s lever arm (≈4 cm) is roughly an order of magnitude shorter than the load’s lever arm (≈32 cm)',
      'Because the biceps tendon inserts at 90° to the forearm, so its entire force is wasted compressing the joint instead of rotating it',
      'Because the forearm’s own weight is negligible, so essentially all of the required muscle force is generated to fight friction at the joint'
    ],
    correctIndex: 1,
    answer: 'Equilibrium demands F_m·l_m=F_L·l_L. With l_m≈4 cm and l_L≈32 cm, the ratio l_L/l_m is about eight, so F_m must be about eight times F_L to balance the shorter lever arm. The elbow is class III, not class I; the tendon insertion angle affects the torque through sinφ but is not the reason for the force multiplication; and the forearm’s own weight adds to, rather than being negligible compared to, the load.',
    contentRef: 'l1-elbow-class-iii-worked'
  },

  {
    id: 'l1-011',
    lecture: 1,
    topic: 'levers',
    mode: 'short',
    question: 'Most human joints are class III levers. State one mechanical disadvantage and one advantage of this arrangement.',
    answer: 'Disadvantage: the effort’s lever arm is much shorter than the load’s, so muscle forces (and hence joint reaction forces) are several times larger than the external load. Advantage: a small, slow muscle shortening produces a large, fast excursion of the distal segment — the arrangement amplifies range of motion and speed.',
    contentRef: 'l1-class-iii-tradeoff'
  },

  {
    id: 'l1-012',
    lecture: 1,
    topic: 'levers',
    mode: 'short',
    question: 'A biceps inserts 4 cm from the elbow’s centre of rotation and pulls at 70° to the forearm. The forearm plus hand weighs 20 N with its centre of mass 15 cm from the joint, and a 30 N dumbbell sits 32 cm from the joint. What muscle force is needed for static equilibrium, assuming both external forces act vertically and the forearm is horizontal?',
    answer: 'Load torques: 20×0.15 + 30×0.32 = 3.0+9.6 = 12.6 Nm. Muscle torque: F_m×0.04×sin70° = 0.0376 F_m. Setting them equal gives F_m≈335 N — about seven times the external load. Note that the vertical forces have full lever arms because the forearm is horizontal, while the muscle loses a factor sin70°.',
    contentRef: 'l1-torque-general-angle'
  },

  {
    id: 'l1-013',
    lecture: 1,
    topic: 'levers',
    mode: 'mc',
    question: 'A cable runs from a weight, around a fixed frictionless pulley, and the free end is pulled exactly along the line passing through the pulley’s own pivot. What force is needed on the free end to hold the system in equilibrium?',
    options: [
      'The same as the weight, F_P, because a fixed pulley always keeps the applied and load forces equal regardless of the cable’s direction',
      'Twice the weight, 2F_P, because pulling along the pivot line doubles the effective lever arm the free end acts through',
      'Zero, because a line of action passing through the fulcrum has a lever arm of zero, so it produces no torque to balance',
      'Half the weight, F_P/2, because the pivot line splits the tension evenly between the two sides of the pulley’s rim'
    ],
    correctIndex: 2,
    answer: 'The lever arm of a force is the perpendicular distance from the pivot to its line of action. A line of action that passes exactly through the pivot has zero perpendicular distance, hence zero torque — so a force with zero torque cannot be required to balance anything, meaning the necessary force is zero. This is the classic trick question about pulley geometry: "equal to the weight" is the answer for the ordinary tangential case, not this one.',
    contentRef: 'l1-pulley-zero-arm-pitfall'
  },

  {
    id: 'l1-014',
    lecture: 1,
    topic: 'levers',
    mode: 'mc',
    question: 'A weight is lifted using a movable pulley, supported by two strands of the same cable, one of which is anchored to the ceiling. How does the traction force needed compare to the weight?',
    options: [
      'It equals the weight exactly, because a pulley by definition only ever redirects a force without changing its magnitude',
      'It is half the weight, because the two supporting strands share the load equally between the ceiling and the traction force',
      'It depends on the pulley’s radius, since a larger radius gives the traction cable a longer lever arm and needs less force',
      'It is twice the weight, because the ceiling’s own reaction adds to the weight, and both are carried by the traction side'
    ],
    correctIndex: 3,
    answer: 'A fixed pulley only redirects a force, giving F_T=F_P, but a movable pulley supported by two strands is different: the ceiling anchor supplies its own reaction force, and that reaction adds to the hanging weight on the side carrying the traction force, giving F_T=2F_P. The pulley’s radius cancels out of the torque balance and does not appear in the final relation.',
    contentRef: 'l1-movable-pulley'
  },

  {
    id: 'l1-015',
    lecture: 1,
    topic: 'forces',
    mode: 'mc',
    question: 'In the relation F=ma, which quantity is the cause and which is the effect, and why does this matter for exam answers?',
    options: [
      'F is the cause and a is the effect: acceleration only occurs because a force is applied, never the other way around',
      'a is the cause and F is the effect: a body must already be accelerating before any force can be said to act on it',
      'Neither is a cause of the other: F=ma is simply a bookkeeping identity relating two quantities measured independently',
      'm determines which is the cause: for large masses F causes a, but for very small masses a instead causes F'
    ],
    correctIndex: 0,
    answer: 'The causal reading is F=ma with F as the cause and a=F/m as the effect: there is no acceleration without a force producing it. Reversing the direction, or treating the equation as symmetric bookkeeping with no causal content, misses exactly what exam questions on Newton’s second law are testing, and mass plays no role in which side is causal — it only scales the relationship between them.',
    contentRef: 'l1-newtons-second-law'
  },

  {
    id: 'l1-016',
    lecture: 1,
    topic: 'forces',
    mode: 'short',
    question: 'Explain, using the third law, why a vertical jump is lower on sand than on concrete.',
    answer: 'The upward acceleration comes from the ground reaction force. Concrete returns nearly the full reaction to the applied force; sand deforms, so part of the work done goes into displacing grains and the collision is inelastic. The reaction force available to accelerate the body is therefore smaller for the same muscular effort, giving a lower take-off velocity and a lower jump.',
    contentRef: 'l1-jump-sand-vs-concrete'
  },

  {
    id: 'l1-017',
    lecture: 1,
    topic: 'forces',
    mode: 'mc',
    question: 'Analysing a limb segment that is accelerating angularly, rather than held in static posture, what must be added to the torque balance that a static analysis does not need?',
    options: [
      'Nothing extra is needed: ΣT=0 still holds exactly, because torque balance is valid for both static and dynamic conditions alike',
      'An inertial torque I·α, the rotational analogue of the inertial force m·a, alongside the internal and external torques already present',
      'Only the internal muscle torque needs to be recomputed, since external gravitational torques do not change once motion begins',
      'The moment of inertia I must replace the applied force F everywhere in the equation, since mass no longer applies during rotation'
    ],
    correctIndex: 1,
    answer: 'Static posture analysis only needs ΣF=0 and ΣT=0. Once the segment is accelerating, the angular twin of Newton’s second law applies: mass becomes the moment of inertia I, angular acceleration is α, and torque is T=Iα. This inertial torque joins the internal (muscle) and external (gravity, ground) torques already in the balance; ΣT=0 by itself no longer holds, mass is not simply replaced by I in the force equation, and gravitational torques do not become irrelevant.',
    contentRef: 'l1-rotational-analogue'
  },

  {
    id: 'l1-018',
    lecture: 1,
    topic: 'forces',
    mode: 'mc',
    question: 'In single-leg stance, the hip abductors are too weak to generate the force equilibrium at the femoral head requires. What mechanically happens next, and what is this called clinically?',
    options: [
      'The articular reaction force at the joint surface increases on its own to make up the missing torque, leaving posture unchanged',
      'Body weight is clinically redistributed to the other leg automatically, and the pelvis on the weak side remains perfectly level',
      'The pelvis tilts until the abductors’ lever arm grows large enough that a smaller force again satisfies ΣT=0; this is the Trendelenburg sign',
      'The hip joint dislocates immediately, since three-force equilibrium has no solution once any one of the forces is undersized'
    ],
    correctIndex: 2,
    answer: 'Equilibrium at the femoral head needs ΣF=0 and ΣT=0 simultaneously. If the abductors cannot supply enough force at the original geometry, no passive change in the articular reaction force fixes that — instead the pelvis tilts into a new configuration in which the abductors’ lever arm is larger, so a smaller force again satisfies ΣT=0. That tilt is clinically the Trendelenburg sign; it is a real, gradual mechanical adaptation, not a dislocation or an automatic redistribution of body weight.',
    contentRef: 'l1-hip-three-force-problem'
  }
);
