// content/l1.js
// Chapter 1 of the exam script: "Foundations in Mechanics and Biomechanics"
// (printed pages 3-10). Sections follow the script's own subsection order,
// so the Reference Bank mirrors the chapter a reader already knows.
//
// This chapter sits upstream of the module's four cross-cutting threads
// (bias-variance, convolution, information-loss, separation-of-concerns):
// none of them are genuinely at home in elementary mechanics, so every item
// below carries crossRef: [].
//
// Plain browser script: no imports, no exports. It pushes onto the LECTURES
// array declared in content.js.

LECTURES.push({
  id: 1,
  name: 'Foundations in Mechanics and Biomechanics',
  shortName: 'Mechanics & Biomechanics',
  sections: [
    {
      heading: 'Scalars, vectors and fields',
      items: [
        {
          id: 'l1-scalar-vs-vector',
          type: 'definition',
          term: 'Scalar vs. vector',
          body: 'A scalar is a quantity a single number describes completely — mass, length, time and temperature are scalars, since "72 kilograms" leaves nothing out. A vector needs a number and a direction: velocity, acceleration and force are vectors, and "5 newtons" is incomplete until you say which way it pushes.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l1-vector-magnitude',
          type: 'formula',
          term: 'Vector magnitude',
          body: 'A vector in the plane is written by its components, v=(v_x,v_y), and its magnitude follows from Pythagoras; in space a third component is added under the root. A vector running from a point A to a point B rather than from the origin is found the same way after subtracting coordinates first.',
          formula: '\\|\\vec v\\| = \\sqrt{v_x^2+v_y^2}, \\qquad \\|\\vec v\\| = \\sqrt{v_x^2+v_y^2+v_z^2}',
          symbols: 'v_x, v_y (and v_z in space) are the components of vector v. For a vector AB from A=(x_a,y_a) to B=(x_b,y_b): AB=(x_b−x_a, y_b−y_a), and its magnitude uses the same formula with v_x=x_b−x_a, v_y=y_b−y_a.',
          crossRef: []
        },
        {
          id: 'l1-vector-addition',
          type: 'formula',
          term: 'Adding vectors',
          body: 'Two vectors add component by component. Geometrically this is the parallelogram rule: draw both vectors from a common origin, complete the parallelogram, and the diagonal is the sum.',
          formula: '\\vec s = \\vec v + \\vec w = (v_x+w_x,\\ v_y+w_y)',
          symbols: 'v and w are the two vectors being summed and s their resultant; the rule generalises to any number of vectors by adding all components separately.',
          crossRef: []
        },
        {
          id: 'l1-muscle-vector-sum-pitfall',
          type: 'pitfall',
          term: 'Forgetting direction when summing muscle pulls',
          body: 'A muscle is almost never a single line of pull — the pectoralis major’s clavicular and sternal fibres pull at clearly different angles, and the net mechanical effect on the bone is the vector sum of the two pulls, not the arithmetic sum of their magnitudes. Adding magnitudes and forgetting directions overestimates the resultant, sometimes badly.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l1-cartesian-polar',
          type: 'formula',
          term: 'Cartesian and polar coordinates',
          body: 'A coordinate system is a language for describing position without changing the point it describes. In Cartesian coordinates a point is given as P=(P_x,P_y); in polar coordinates it is given by a radius ρ, always positive, and an angle θ measured counter-clockwise from the x-axis.',
          formula: 'P_x = \\rho\\cos\\theta, \\qquad P_y = \\rho\\sin\\theta',
          symbols: 'ρ is the radius and θ the angle in radians. Conversely ρ = hypot(P_x,P_y) = √(P_x²+P_y²) and θ = atan2(P_y,P_x). In NumPy: np.hypot(Px, Py) and np.arctan2(Py, Px).',
          crossRef: []
        },
        {
          id: 'l1-polar-for-rotation',
          type: 'distinction',
          term: 'Why polar coordinates suit rotation',
          body: 'Choosing the right coordinate language is an engineering decision, not a stylistic one. When the forearm rotates about the elbow at an essentially constant radius, Cartesian coordinates hide the structure because both P_x and P_y change together, while polar coordinates keep ρ constant and let the single angle θ carry the whole story — so whenever something rotates, prefer polar.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l1-degrees-radians',
          type: 'fact',
          term: 'Degrees and radians',
          body: 'A degree is 1/360 of a full turn; a radian is the angle subtended by an arc as long as the radius, so a full turn is 2π radians and 1 rad ≈ 57.3°. Every trigonometric function in NumPy expects radians, which is a genuinely common source of silent bugs.',
          formula: '2\\pi\\ \\mathrm{rad} = 360°',
          symbols: 'Convert with np.radians() and np.degrees(); the degree symbol is only for printing to humans, never for computation.',
          crossRef: []
        },
        {
          id: 'l1-atan2-trap',
          type: 'pitfall',
          term: 'arctan vs. arctan2',
          body: 'np.arctan(P_y/P_x) is not the same as np.arctan2(P_y, P_x): the first loses the quadrant information and divides by zero on the y-axis, while the second is correct in all four quadrants and is what you almost always want. The same distinction applies to atan2 in C and in Arduino sketches.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l1-scalar-field',
          type: 'definition',
          term: 'Scalar field',
          body: 'A field is a function that assigns a value to every point of a region. A scalar field assigns a single number, such as a temperature map or the surface electromyographic amplitude recorded over the erector spinae during quiet standing, drawn as a colour scale.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l1-vector-field',
          type: 'definition',
          term: 'Vector field',
          body: 'A vector field assigns a vector, carrying both magnitude and direction, to every point of a region — a wind map is the standard example. A single frame of a high-density sEMG recording is a scalar field over the electrode grid, but watching the same map evolve over successive frames yields a vector field describing how the electrical disturbance travels across the skin.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l1-conduction-velocity',
          type: 'formula',
          term: 'Conduction velocity from an sEMG map',
          body: 'Average velocity over an interval is the distance travelled divided by the time elapsed; the instantaneous velocity ds/dt can only be approximated by taking frames as close together as the sampling allows. In a worked sEMG example, a potential pattern travelling about 40 mm over five 2 ms frame intervals (10 ms total) gives v=4 mm/ms=4 m/s, the textbook value for muscle-fibre conduction velocity.',
          formula: 'v = \\frac{\\Delta s}{\\Delta t}',
          symbols: 'Δs is the distance the potential pattern travels between frames and Δt the time interval; the average velocity uses the first and last frame in which the signal is visible, while the instantaneous velocity is the derivative ds/dt.',
          crossRef: []
        }
      ]
    },

    {
      heading: 'Force',
      items: [
        {
          id: 'l1-force-definition',
          type: 'definition',
          term: 'Force',
          body: 'A force is an influence that changes the motion of a body, or produces motion or stress in a stationary one. It is a vector drawn as an arrow — the orientation is the line of action, parallel to a muscle’s fibres, and the length is the magnitude in newtons, where one newton accelerates one kilogram at one metre per second squared.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l1-static-vs-dynamic-force',
          type: 'distinction',
          term: 'Static vs. dynamic force',
          body: 'A static force is applied to a constrained, immovable body and produces an identical static reaction force. A dynamic force is applied to a body free to move; it produces an inertial reaction equal to m·a and accelerates the object.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l1-mass-vs-weight',
          type: 'pitfall',
          term: 'Mass is not weight',
          body: 'An object of mass 1 kg has mass 1 kg everywhere in the universe, but it weighs 9.81 N only in Earth’s gravitational field. In biomechanics you are constantly handed masses in kilograms and required to reason about forces in newtons; the factor g=9.81 m/s² is what converts one into the other.',
          formula: 'F_{weight} = m g',
          symbols: 'm is mass in kilograms, g=9.81 m/s² the Earth-surface gravitational acceleration, and F_weight the resulting weight force in newtons.',
          crossRef: []
        }
      ]
    },

    {
      heading: 'Torque: the quantity that actually moves joints',
      items: [
        {
          id: 'l1-torque-definition',
          type: 'formula',
          term: 'Torque and the lever arm',
          body: 'Applying a force to an object can translate it, rotate it, deform it, or all three, depending on where the force is applied relative to the pivot. Torque (or moment), measured in newton-metres, is the quantity responsible for rotation, and it is defined as the force times the lever arm — the perpendicular distance from the pivot to the line of action of the force.',
          formula: 'T = F\\,b',
          symbols: 'F is the force magnitude, b the lever arm in metres and T the torque in newton-metres.',
          crossRef: []
        },
        {
          id: 'l1-torque-perpendicular-pitfall',
          type: 'pitfall',
          term: 'Dropping "perpendicular" and "line of action"',
          body: 'The words "perpendicular" and "line of action" are the whole content of the torque definition, and they are precisely what students drop under exam pressure — collapsing T=F·b into T=F·l regardless of the angle the force makes with the segment. The lever arm b is the perpendicular distance from the pivot to where the force’s line of action lies, not the distance to the point where the force is applied.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l1-torque-general-angle',
          type: 'formula',
          term: 'Torque at an arbitrary angle',
          body: 'If l is the distance from the pivot to the point where the force is applied — for a muscle, from the joint centre to the tendon insertion — and φ is the angle between the force and the bone, then the lever arm is b=l sinφ, so torque is strictly smaller than F·l whenever the force is not perpendicular to the segment.',
          formula: 'b = l\\sin\\varphi, \\qquad T = F\\,l\\sin\\varphi',
          symbols: 'l is the pivot-to-insertion distance, φ the angle between the force and the segment; T=Fl only when φ=90°, otherwise T=Fl sinφ<Fl.',
          crossRef: []
        },
        {
          id: 'l1-torque-two-approaches',
          type: 'distinction',
          term: 'Two ways to see the same torque',
          body: 'Approach 1 keeps the force whole and uses the perpendicular lever arm directly, giving T=Fb=Fl sinφ. Approach 2 decomposes the force into a component perpendicular to the segment, which alone produces the torque, and a component along the segment, whose lever arm is zero and which only compresses or distracts the joint — not wasted effort, since joint stability depends on it, but not torque either.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'Levers and equilibrium',
      items: [
        {
          id: 'l1-lever-classes',
          type: 'definition',
          term: 'The three lever classes',
          body: 'A lever is a rigid bar that rotates about a fulcrum, and the three possible arrangements are classified by what sits in the middle: class I has the fulcrum between effort and load (a seesaw), class II has the load in the middle (a wheelbarrow), and class III has the effort in the middle. Human joints are overwhelmingly class III, buying speed and range of motion at the cost of force.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l1-static-equilibrium-conditions',
          type: 'formula',
          term: 'Conditions for static equilibrium',
          body: 'Static equilibrium requires two conditions simultaneously: the vector sum of all forces acting on the body is zero, and the algebraic sum of all torques about any chosen point is zero.',
          formula: '\\sum \\vec F = 0, \\qquad \\sum T = 0',
          symbols: 'The torque sum may be taken about any point, not only the fulcrum — the choice is a matter of convenience, not physics.',
          crossRef: []
        },
        {
          id: 'l1-lever-equilibrium-law',
          type: 'formula',
          term: 'The elementary lever law',
          body: 'For a simple lever with an effort F2 at distance l2 from the fulcrum and a resistance F1 at distance l1, the torque condition for equilibrium reads l1F1=l2F2. If both forces act at the same angle θ to the bar, cosθ appears on both sides and cancels, which is why the elementary lever law looks angle-free even though torque is not.',
          formula: 'l_1 F_1 = l_2 F_2',
          symbols: 'l1 and l2 are the perpendicular distances of the resistance F1 and the effort F2 from the fulcrum.',
          crossRef: []
        },
        {
          id: 'l1-elbow-class-iii-worked',
          type: 'fact',
          term: 'The elbow as a worked class III lever',
          body: 'The elbow is the standard class III lever: the fulcrum is the joint, the effort is the biceps inserting a few centimetres from the joint centre, and the resistance is the forearm and hand weight acting tens of centimetres away. With l_m≈4 cm and l_L≈32 cm, equilibrium demands a muscle force about eight times the load, so holding a 5 kg dumbbell (≈49 N) requires roughly 400 N of biceps force.',
          formula: 'F_m l_m = F_L l_L',
          symbols: 'F_m and l_m are the muscle force and its lever arm; F_L and l_L are the external load and its lever arm.',
          crossRef: []
        },
        {
          id: 'l1-class-iii-tradeoff',
          type: 'distinction',
          term: 'The class III trade-off',
          body: 'The mechanical disadvantage of a class III lever is that the effort’s lever arm is much shorter than the load’s, so muscle and joint reaction forces are several times larger than the external load. The advantage is that a small, slow muscle shortening produces a large, fast excursion of the distal segment — evolution optimised human joints for throwing and manipulating, not for lifting efficiently.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l1-occipital-lever',
          type: 'fact',
          term: 'The occipital lever: a class I counterexample',
          body: 'The occipital lever is the class I counterexample among human joints: the head balances on the condyles with the weight of the skull anterior to the fulcrum and the extensor muscles pulling posterior to it, so effort and resistance sit on opposite sides of the fulcrum.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l1-pulley-basic',
          type: 'formula',
          term: 'The frictionless fixed pulley',
          body: 'A frictionless pulley with a fixed pivot changes the direction of a force without changing its magnitude. The cable leaves and enters the pulley tangentially, so both the applied force and the load force have a lever arm exactly equal to the pulley radius r, and setting the torque sum to zero gives F_A=F_P.',
          formula: 'F_A r = F_P r \\;\\Longrightarrow\\; F_A = F_P',
          symbols: 'F_A is the applied (traction) force, F_P the load force and r the pulley radius, which is the common lever arm of both.',
          crossRef: []
        },
        {
          id: 'l1-movable-pulley',
          type: 'fact',
          term: 'Fixed vs. movable pulley',
          body: 'In a fixed-pulley traction rig the traction force equals the hanging weight, F_T=F_P. With a movable pulley supported by two strands of the same cable the load is shared, and the traction force becomes F_T=2F_P, because the ceiling supplies a reaction that adds to the weight.',
          formula: 'F_T = 2F_P',
          symbols: 'F_T is the traction force and F_P the hanging weight; the factor 2 arises only for a movable, cable-supported pulley, not a fixed one.',
          crossRef: []
        },
        {
          id: 'l1-pulley-zero-arm-pitfall',
          type: 'pitfall',
          term: 'The zero-lever-arm trick question',
          body: 'If a force’s line of action passes exactly through the fulcrum, its lever arm is zero, so the torque it produces is zero, and the force required for equilibrium against it is zero as well. This is the classic trick question: a large-looking force can demand no counterbalancing effort at all if its geometry gives it no lever arm.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l1-anatomical-pulleys',
          type: 'fact',
          term: 'Anatomical pulleys',
          body: 'Several anatomical structures behave as pulleys. The patella redirects the quadriceps tendon and, by holding it away from the knee’s centre of rotation, substantially increases its lever arm; the lateral malleolus does the same for the peroneal tendons.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'Newton’s laws, and where inertia enters',
      items: [
        {
          id: 'l1-newtons-first-law',
          type: 'definition',
          term: 'Newton’s first law',
          body: 'A body stays at rest or in uniform straight-line motion unless a force compels it to change. This is the definition of inertia — the resistance of a body to a change in its state of motion.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l1-newtons-second-law',
          type: 'formula',
          term: 'Newton’s second law',
          body: 'Newton’s second law states that the change of momentum is proportional to the impulse applied and happens along the line of that impulse; differentiating with respect to time gives force equals mass times acceleration. The causal reading is what exam questions test: force is the cause and acceleration is the effect — there is no acceleration without a force.',
          formula: 'm\\vec v = \\vec F t, \\qquad \\vec F = m\\vec a',
          symbols: 'm is mass, v velocity, F force, t time and a=F/m the resulting acceleration.',
          crossRef: []
        },
        {
          id: 'l1-newtons-third-law',
          type: 'definition',
          term: 'Newton’s third law',
          body: 'Every action has an equal and opposite reaction. The two forces act on different bodies, which is why they never cancel each other out within the same free-body analysis.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l1-rotational-analogue',
          type: 'formula',
          term: 'The rotational analogue of Newton’s second law',
          body: 'Rotation has a full angular twin of the linear laws: mass becomes the moment of inertia I, linear acceleration becomes angular acceleration α, and force becomes torque. This is why static posture analysis only needs ΣF=0 and ΣT=0, while movement analysis must add the inertial force m·a and the inertial torque I·α to the internal and external forces and torques already in the balance.',
          formula: 'T = I\\alpha',
          symbols: 'I is the moment of inertia, the rotational analogue of mass, and α the angular acceleration, the rotational analogue of linear acceleration a.',
          crossRef: []
        },
        {
          id: 'l1-inertia-and-falling-objects',
          type: 'fact',
          term: 'Why a heavier object does not fall faster',
          body: 'Dropping a basketball and a 10 kg medicine ball from the same height under gravity alone, both hit the ground at the same time. The heavier ball needs a proportionally larger force to move it at all — its weight m·g is larger precisely because its mass, and therefore its inertia, is larger — so the acceleration a=F/m works out the same for both regardless of mass.',
          formula: 'a = \\frac{F}{m} = \\frac{mg}{m} = g',
          symbols: 'F=mg is the weight force, m the mass and g the gravitational acceleration; the mass cancels, so free-fall acceleration is independent of mass (air resistance neglected).',
          crossRef: []
        },
        {
          id: 'l1-ground-reaction-force',
          type: 'definition',
          term: 'Ground reaction force (GRF)',
          body: 'When you stand, you push on the ground and the ground pushes back with an equal and opposite ground reaction force (GRF), the third-law reaction to your own push. Force plates measure it directly, and it is the single most-used measurement in gait laboratories.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l1-jump-sand-vs-concrete',
          type: 'fact',
          term: 'Why a jump is lower on sand',
          body: 'Jumping on sand produces a lower jump than jumping on concrete for the same muscular effort, because the collision with sand is inelastic: part of the energy goes into displacing sand rather than into the reaction that accelerates the athlete upwards. A beach volleyball player must therefore generate a larger force to reach the same height as on an indoor court — a statement about where the energy went, not about muscle physiology.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l1-hip-three-force-problem',
          type: 'fact',
          term: 'The hip: a three-force equilibrium problem',
          body: 'The acetabulo-femoral joint in single-leg stance is the standard worked example of static equilibrium in three forces: body weight acts downward through the centre of mass medial to the supporting hip, the hip abductors pull on the greater trochanter to keep the pelvis level, and the articular reaction force at the joint surface supports the trunk passively. Equilibrium requires ΣF=0 and ΣT=0 about the femoral head.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l1-trendelenburg-sign',
          type: 'fact',
          term: 'The Trendelenburg sign',
          body: 'If the hip abductors cannot produce enough force — from weakness, pain or a neurological deficit — equilibrium cannot be met at the original geometry, so the pelvis tilts until it reaches a configuration in which the abductors’ lever arm is larger and a smaller force suffices. Clinically that tilt is the Trendelenburg sign; mechanically it is nothing but the system finding the configuration in which ΣT=0 is satisfiable with the force available.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    }
  ]
});
