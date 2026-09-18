// content/l5.js
// Chapter 5 of the exam script: "The Art of Simulation" (printed pages 41-46).
// Sections follow the script's own subsection order. This is the shortest
// chapter in the script (six pages), so it sits near the bottom of the
// 25-40 item band rather than padded up to match a longer chapter.
//
// Appendix A has no cheat-sheet section for this chapter (its sections cover
// L2/L6/L7, L3, L4, L7 and L8 only). Formulas below were cross-checked
// against the chapter's own text, its worked and exam-style examples, and
// the lecture deck instead.
//
// Plain browser script: no imports, no exports. It pushes onto the LECTURES
// array declared in content.js.

LECTURES.push({
  id: 5,
  name: 'The Art of Simulation',
  shortName: 'Simulation',
  sections: [
    {
      heading: 'The hidden cost of reality',
      items: [
        {
          id: 'l5-combinatorial-cost',
          type: 'formula',
          term: 'The combinatorial cost of a full simulation',
          body: 'A simulation in which every object interacts with every other object has N(N−1)/2 pairwise interactions, so its cost grows as O(N²): doubling the number of objects quadruples the work. At any realistic scale, computing every interaction exactly is unaffordable.',
          formula: 'N_{pairs} = \\frac{N(N-1)}{2}, \\qquad \\mathrm{cost} = O(N^2)',
          symbols: 'N is the number of simulated objects and N_pairs the number of pairwise interactions to evaluate; cost grows quadratically with N. Applies to any simulation that computes every pairwise interaction exactly, before any hierarchy or approximation is introduced.',
          crossRef: []
        },
        {
          id: 'l5-illusion-of-completeness',
          type: 'fact',
          term: 'The illusion of completeness',
          body: 'Most of the world is invisible or irrelevant at any given moment, so simulating everything at equal fidelity is not merely expensive but wasteful: detail nobody observes contributes nothing. The design goal is to maintain realism where it matters and cut corners everywhere else — the illusion of completeness is enough.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l5-completeness-illusion-caution',
          type: 'pitfall',
          term: 'Where the illusion of completeness stops being enough',
          body: '"If it cannot be perceived it did not happen" is sound economics for a game engine, where a human observer is the only judge and unresolvable detail is pure waste to pay for. It is dangerous for a clinical or engineering simulation, where the judge is a physical criterion instead: a stress concentration too small to see may still be the one that determines whether a stent fails, so perceptual sufficiency is not a valid accuracy criterion there.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'Level of detail',
      items: [
        {
          id: 'l5-geometric-vs-simulation-lod',
          type: 'distinction',
          term: 'Geometric LOD vs. simulation LOD',
          body: 'Geometric level of detail reduces the triangle count of distant objects for the renderer; the object still looks correct because it occupies few pixels, but the physics engine keeps computing it at full cost regardless. Simulation LOD reduces the computational intensity itself — simplified physics, coarser integration, dumber AI, frozen dynamics for low-priority objects — and is where the real savings live, at the price of physical consistency.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l5-geometric-lod-only-fails',
          type: 'pitfall',
          term: 'Why geometric LOD alone cannot save a simulation',
          body: 'Reducing polygon count changes only what the renderer draws; it does nothing for the physics engine, which continues to compute the full object. An object that looks simple but still behaves at full simulation fidelity gains nothing, because the frame budget stays dominated by simulation rather than rendering. Both layers — how it looks and how it behaves — have to work in harmony, or the mismatch breaks immersion as badly as an object that looks like a brick.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l5-simulation-lod-tradeoff',
          type: 'distinction',
          term: 'Level of detail as a fidelity–cost trade-off',
          body: 'Full physics is exact but computationally unaffordable; a cheap proxy is affordable but only approximate. This is the same bias–variance trade-off that appears as the moving-average window length and the Welch segment length in Chapter 2 and as the smoothing-kernel length in Chapter 3 — one idea in four costumes: you can have detail or you can have stability, and the parameter you tune, here the level of detail, decides which.',
          formula: null,
          symbols: null,
          crossRef: ['bias-variance']
        },
        {
          id: 'l5-visibility-culling-circularity',
          type: 'fact',
          term: 'Visibility culling’s circularity',
          body: 'Culling everything outside the view frustum is the obvious way to stop simulating what cannot be seen, but it fails for dynamic objects: knowing where an object currently is requires simulating it, which is exactly the cost the culling was supposed to avoid in the first place.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l5-proxy-simulation',
          type: 'definition',
          term: 'Proxy simulation',
          body: 'A proxy simulation is a cheap, low-fidelity estimate of roughly where an object is, run continuously, used only to decide whether the expensive full simulation should be committed to. The proxy costs a little; the decision it enables saves a lot.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l5-roi-dynamics',
          type: 'definition',
          term: 'Region-of-interest dynamics',
          body: 'Fidelity follows attention: objects near the camera or player sit in an active zone and are simulated fully, a transition zone holds simplified objects, and a dormant zone holds distant objects that are proxied or asleep; the zones move with the observer, promoting and demoting objects between fidelity levels. The hard engineering problem is not the zoning but the transitions: promoting an object from asleep to fully simulated must not produce a visible jump in position or velocity, or the illusion is exposed — fidelity changes must stay continuous in whatever the observer can perceive.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l5-particle-clustering',
          type: 'fact',
          term: 'Particle clustering',
          body: 'Thousands of independent particles will cripple any frame budget. The remedy is clustering in three steps: group nearby particles into a single mass representation, compute the centre of mass — its position and its velocity — and integrate the cluster as one body. Per-frame cost collapses, and for a smoke plume or a dust cloud nobody can tell.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l5-geometric-lod-example',
          type: 'fact',
          term: 'A concrete geometric LOD reduction',
          body: 'The standard illustration is a single mesh reduced across LOD tiers — the Stanford bunny at roughly 69,000 triangles in full detail, then about 2,500, then 250, then under 80 at the coarsest tier — each still recognisably the same shape at a distance. The reduction is purely geometric: fewer polygons for the renderer to draw, with no claim at all about the underlying physics.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'Hierarchical methods: the N-body solution',
      items: [
        {
          id: 'l5-barnes-hut-approximation',
          type: 'definition',
          term: 'The Barnes–Hut algorithm',
          body: 'Barnes–Hut builds a spatial hierarchy — an octree in three dimensions, a quadtree in two — over the simulation volume. When computing the force on a given body, any tree node that is sufficiently far away relative to its size is treated as a single point mass at its centre of mass instead of being descended into and summed body by body.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l5-nbody-complexity',
          type: 'formula',
          term: 'N-body complexity: naive vs. Barnes–Hut',
          body: 'A naive pairwise N-body force calculation is O(N²), the same combinatorial cost every full simulation faces. Barnes–Hut lowers this to O(N log N), because each body now interacts with a logarithmic number of tree nodes rather than with every other body; more elaborate schemes, such as the fast multipole method, reach O(N).',
          formula: 'O(N^2) \\;\\longrightarrow\\; O(N\\log N) \\;\\longrightarrow\\; O(N)',
          symbols: 'N is the number of bodies. The middle complexity is achieved by Barnes–Hut and the right-hand one by the fast multipole method, both by replacing distant interactions with a compressed approximation rather than by skipping work outright.',
          crossRef: []
        },
        {
          id: 'l5-hierarchical-compression-family',
          type: 'fact',
          term: 'The family resemblance behind hierarchical methods',
          body: 'Barnes–Hut’s approximation — collapsing a distant cluster to its centre of mass — is the same manoeuvre as the low-pass filter of Chapter 2 and the smoothing kernel of Chapter 3: in all three, fine detail that cannot influence the answer is deliberately discarded so that only what matters is computed or kept.',
          formula: null,
          symbols: null,
          crossRef: ['convolution']
        }
      ]
    },

    {
      heading: 'Perception as a design guide',
      items: [
        {
          id: 'l5-design-for-the-eye',
          type: 'definition',
          term: 'Design for the eye, not for the machine',
          body: 'The unifying rule of level-of-detail engineering is to design for the eye, not for the machine: if a simplification is imperceptible, it is effectively invisible, and there is no reason to pay for the detail it would have added.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l5-perception-corollaries',
          type: 'fact',
          term: 'Three corollaries of designing for perception',
          body: 'Graceful degradation avoids visual jumps that would break immersion when fidelity changes. Suspension of disbelief holds that if the user cannot perceive something, it did not happen. Foveal fidelity allocates detail to the centre of attention, because peripheral vision has far lower acuity.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'Topology: the digital foundation',
      items: [
        {
          id: 'l5-topology-definition',
          type: 'definition',
          term: 'Topology',
          body: 'Topology describes how the components of a mesh — vertices, edges and faces — define a shape and support its manipulation. It is the difference between a model that looks right and a model that can be simulated.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l5-topology-localises-detail',
          type: 'fact',
          term: 'Good topology localises detail',
          body: 'Good topology puts high vertex density at joints and curves and sparse geometry across flat surfaces, so that vertices sit only where the geometry demands them. In game asset work the goal is maximum visual detail at minimum polygon count; a simulation mesh follows the same principle, except the demand comes from curvature and physics rather than from appearance alone.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l5-blender-modifiers',
          type: 'fact',
          term: 'Non-destructive modifiers',
          body: 'Blender’s non-destructive modifiers — remesh and subdivision — allow iterative refinement of a mesh without destroying its base geometry, which is what makes adaptive meshing practical rather than tedious.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l5-graphics-simulation-gap',
          type: 'pitfall',
          term: 'A mesh that renders correctly can still fail a solver',
          body: 'A rasteriser only needs to know what colour each pixel is, so it tolerates non-manifold edges, flipped normals and isolated spiky artefacts without complaint. A volumetric solver needs a watertight, manifold volume with a consistent inside and outside, so the very mesh that renders beautifully can be unusable as a simulation domain.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    },

    {
      heading: 'Case study: the abdominal aortic aneurysm',
      items: [
        {
          id: 'l5-aaa-geometric-challenge',
          type: 'fact',
          term: 'Why the AAA is hard to mesh',
          body: 'The abdominal aortic aneurysm is one of the most geometrically awkward structures in the human body to mesh: the aorta bifurcates into the common iliac arteries at an angle that varies substantially between patients, and aneurysmal bulging introduces highly asymmetric, irregular geometry that defeats any idealised shape assumption.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l5-aaa-pipeline',
          type: 'fact',
          term: 'The AAA meshing pipeline',
          body: 'The pipeline runs in four stages: image acquisition by CT or MRI captures patient-specific vascular geometry; segmentation extracts the vessel lumen from surrounding tissue into a raw 3D surface; mesh reconstruction builds a watertight, high-quality volumetric mesh suitable for finite element analysis; and the bifurcation, where the vessel splits, is genuinely difficult to mesh well, so poor meshing there causes solver failure or, worse, plausible-looking but wrong stress predictions.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l5-navier-stokes-discretisation',
          type: 'fact',
          term: 'Why the domain must be discretised',
          body: 'The Navier–Stokes equations governing blood flow cannot be solved analytically on a geometry as irregular as an aneurysm, so the domain is discretised into cells and solved numerically instead. Whether that numerical answer means anything depends on the quality of the mesh it was computed on.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l5-skewness',
          type: 'definition',
          term: 'Skewness',
          body: 'Skewness measures how far a mesh cell deviates from its ideal shape. Highly skewed cells degrade the accuracy of the discretised operators and can make the solver diverge.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l5-cell-volume-ratio',
          type: 'definition',
          term: 'Cell volume ratio',
          body: 'Cell volume ratio measures the size jump between neighbouring cells. A sudden jump introduces numerical instability in the pressure gradient, so mesh density must change gradually rather than abruptly across the domain.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l5-fluid-structure-interaction',
          type: 'definition',
          term: 'Fluid–structure interaction',
          body: 'The artery wall mesh and the blood fluid mesh must be coupled, because the wall deforms under pressure and that deformation changes the flow in turn. Modelling realistic wall stress — the quantity that predicts rupture — requires both meshes and their coupling to be sound.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l5-closing-rule',
          type: 'fact',
          term: 'The lecture’s closing rule',
          body: 'Efficiency is not about doing less — it is about doing the right work in the right place. Whether the model is a dragon or an artery, the quality of the result is bounded by the integrity of the mesh, and the density of that mesh should follow the physics, not convention.',
          formula: null,
          symbols: null,
          crossRef: []
        }
      ]
    }
  ]
});
