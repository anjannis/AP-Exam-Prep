// questions/l5.js
// Question bank for Chapter 5. 17 questions, 10 mc / 7 short (ratio 0.59).
// Six of the seven short answers are the script's own end-of-chapter exam
// questions, in the course's wording, with model answers a marker would
// accept; the seventh seeds the bias-variance cross-reference directly.
//
// Answer-key hygiene, enforced by checkAnswerBalance and checkOptionLengthBias
// in tools/validate.js: correctIndex is spread across all four positions
// (3/2/2/3), and the four options of every mc question are written to
// comparable length so that neither position nor length signals the answer.
// Explanations quote option text rather than option numbers, so they survive
// any later reordering.
//
// Plain browser script: no imports, no exports. It pushes onto the QUESTIONS
// array declared in questions.js.

QUESTIONS.push(
  {
    id: 'l5-001',
    lecture: 5,
    topic: 'lod',
    mode: 'mc',
    question: 'A distant NPC is drawn with a simplified low-polygon mesh, but its AI, physics and collision are still computed exactly as if it were nearby. What is missing?',
    options: [
      'Geometric LOD, because the reduced polygon count has not yet been synchronised with the render distance',
      'Visibility culling, because an object this far from the camera should have been removed from the scene entirely',
      'Region-of-interest zoning, because the NPC has not been assigned to a dormant or transition zone by distance',
      'Simulation LOD, because reducing triangle count does nothing to reduce the computational cost of its physics and AI'
    ],
    correctIndex: 3,
    answer: 'The NPC already has geometric LOD — its polygon count is reduced — but nothing has reduced the cost of its physics, AI and collision, which is exactly what simulation LOD does. Geometric LOD only changes what the renderer draws; it does nothing for the physics engine, which keeps computing the full object regardless. Visibility culling is the wrong diagnosis because the NPC is still rendered and visible, and ROI zoning is one way to implement simulation LOD rather than a separate missing ingredient.',
    contentRef: 'l5-geometric-vs-simulation-lod'
  },

  {
    id: 'l5-002',
    lecture: 5,
    topic: 'lod',
    mode: 'short',
    question: 'Distinguish geometric LOD from simulation LOD and explain why using only the first can fail.',
    answer: 'Geometric LOD reduces polygon count for rendering; simulation LOD reduces the computational intensity of the physics, AI and dynamics. Using only geometric LOD leaves the physics engine computing every distant object at full cost, so the frame budget is still dominated by simulation — an object that looks simple but behaves at full fidelity gains nothing.',
    contentRef: 'l5-geometric-vs-simulation-lod'
  },

  {
    id: 'l5-003',
    lecture: 5,
    topic: 'bias-variance',
    mode: 'mc',
    question: 'Full-physics simulation of every object is exact but too slow to run; a cheap proxy runs fast but only approximates reality. Which earlier trade-off does this most resemble?',
    options: [
      'The moving-average window length or Welch segment length trading detail against stability, from Chapter 2',
      'The Nyquist sampling rate versus the anti-aliasing filter’s cut-off frequency from Chapter 2',
      'The choice between a causal and a non-causal filter for real-time processing from Chapter 2',
      'The convolution of a spike train with a motor-unit action potential shape from Chapter 4'
    ],
    correctIndex: 0,
    answer: 'Level of detail is the bias–variance trade-off in a new costume: exact physics is unaffordable, a cheap proxy is only approximate, exactly as a short averaging window tracks detail but stays noisy while a long one is stable but smears it. The Nyquist/anti-aliasing pair and the causal/non-causal choice are real Chapter 2 distinctions, but neither trades detail against stability the way a tunable parameter does; the convolution in Chapter 4 is a generative model, not a fidelity knob.',
    contentRef: 'l5-simulation-lod-tradeoff'
  },

  {
    id: 'l5-004',
    lecture: 5,
    topic: 'bias-variance',
    mode: 'short',
    question: 'Explain what is meant by saying that simulation level of detail is the bias–variance trade-off wearing another costume, and name one earlier instance of the same trade-off.',
    answer: 'Full physics is exact but computationally unaffordable, exactly as a short averaging window tracks a signal closely but stays noisy; a cheap proxy is affordable but only approximate, exactly as a long averaging window is smooth but smears the true shape. The same trade-off appears as the moving-average window length and the Welch segment length in Chapter 2, and as the smoothing-kernel length in Chapter 3: you can have detail or stability, and the parameter you tune decides which.',
    contentRef: 'l5-simulation-lod-tradeoff'
  },

  {
    id: 'l5-005',
    lecture: 5,
    topic: 'n-body',
    mode: 'mc',
    question: 'Why does Barnes–Hut reduce the cost of an N-body simulation from O(N²) to O(N log N)?',
    options: [
      'It stores bodies in a hash table, so the nearest neighbours of any body are found in constant time',
      'It replaces a sufficiently distant cluster of bodies with a single point mass at its centre of mass',
      'It runs the simulation on a coarser time step, trading numerical accuracy for fewer force evaluations',
      'It precomputes every pairwise force once and reuses the cached values across subsequent frames'
    ],
    correctIndex: 1,
    answer: 'Barnes–Hut walks a spatial tree and, whenever a node is far away relative to its size, treats the whole node as one point mass at its centre of mass rather than descending into it body by body. That turns O(N) interactions per body into O(log N) node visits. Neither a hash table nor a coarser time step changes how many interactions are computed, and caching forces across frames would be wrong the instant any body moves.',
    contentRef: 'l5-barnes-hut-approximation'
  },

  {
    id: 'l5-006',
    lecture: 5,
    topic: 'n-body',
    mode: 'mc',
    question: 'What data structure does Barnes–Hut build over the simulation volume, and what is its two-dimensional analogue?',
    options: [
      'A quadtree, subdividing the volume into four regions regardless of how many spatial dimensions it has',
      'A binary search tree, ordering bodies along a single axis chosen to minimise the height of the tree',
      'An octree, subdividing 3D space into eight regions; the 2D analogue is the quadtree',
      'A k-d tree, alternating the splitting axis at each level to keep every leaf node the same size'
    ],
    correctIndex: 2,
    answer: 'In three dimensions Barnes–Hut builds an octree, recursively splitting the volume into eight sub-cubes; in two dimensions the same idea is a quadtree, splitting into four squares. A quadtree used for a 3D scene would not partition depth at all, and neither a plain binary search tree nor a k-d tree is the structure the algorithm names.',
    contentRef: 'l5-barnes-hut-approximation'
  },

  {
    id: 'l5-007',
    lecture: 5,
    topic: 'n-body',
    mode: 'short',
    question: 'State the complexity of a naive N-body simulation and of Barnes–Hut, and explain the approximation that produces the improvement.',
    answer: 'Naive is O(N²); Barnes–Hut is O(N log N). The approximation is that a group of distant bodies is replaced by a single point mass at the group’s centre of mass whenever the group is far away relative to its size, so a body interacts with a logarithmic number of tree nodes rather than with every other body.',
    contentRef: 'l5-nbody-complexity'
  },

  {
    id: 'l5-008',
    lecture: 5,
    topic: 'culling',
    mode: 'mc',
    question: 'Why can visibility culling not simply check whether each dynamic object’s position lies inside the view frustum?',
    options: [
      'Frustum tests are only defined for static geometry, since a moving object’s bounding box changes every frame',
      'The frustum itself must be recomputed every frame the camera moves, which costs more than simulating the object',
      'Objects outside the frustum can still cast shadows into it, so their position is needed for lighting anyway',
      'Knowing a dynamic object’s position already requires simulating it, which is the cost culling meant to avoid'
    ],
    correctIndex: 3,
    answer: 'For a dynamic object, finding its current position is itself the output of simulating it — and simulating it is exactly the cost that visibility culling was supposed to let you skip. This is a circularity, not a cost problem with the frustum test or with shadows, and it is why culling needs a cheap proxy simulation to break the loop.',
    contentRef: 'l5-visibility-culling-circularity'
  },

  {
    id: 'l5-009',
    lecture: 5,
    topic: 'culling',
    mode: 'mc',
    question: 'What role does a proxy simulation play in visibility culling?',
    options: [
      'It cheaply estimates where a dynamic object roughly is, so the culling decision can be made without full cost',
      'It renders a low-polygon stand-in mesh so the GPU has something to draw while the real object loads',
      'It records the object’s last known position from the previous frame and freezes it until it is visible again',
      'It runs the full physics simulation but skips the rendering pass, halving the cost of an invisible object'
    ],
    correctIndex: 0,
    answer: 'A proxy simulation is a cheap, low-fidelity estimate of roughly where an object is, run continuously so the culling decision can be made without paying for the full simulation. It is not a rendering stand-in, and it is not merely a frozen last-known position — a moving object needs its proxy updated, just cheaply; and it does not run the full physics at reduced rendering cost, which would defeat the point.',
    contentRef: 'l5-proxy-simulation'
  },

  {
    id: 'l5-010',
    lecture: 5,
    topic: 'culling',
    mode: 'short',
    question: 'Why can visibility culling not simply test the position of every dynamic object, and what is the standard solution?',
    answer: 'Because knowing where a dynamic object is requires simulating it, which is the cost the culling was supposed to avoid. The solution is a cheap proxy simulation that estimates position well enough to make the culling decision, so the expensive simulation is committed to only when needed.',
    contentRef: 'l5-proxy-simulation'
  },

  {
    id: 'l5-011',
    lecture: 5,
    topic: 'topology',
    mode: 'mc',
    question: 'A mesh imported from a rendering pipeline looks correct on screen but crashes a finite-element solver. Which pair of defects is most likely responsible?',
    options: [
      'Excess vertex count on flat surfaces and insufficient density at curved joints',
      'Non-manifold edges and flipped normals, so the surface has no consistent inside and outside',
      'A texture resolution too low for the solver and a vertex-colour channel it cannot parse',
      'A polygon count too high for real-time rendering, forcing the solver to time out mid-computation'
    ],
    correctIndex: 1,
    answer: 'A rasteriser only needs to know what colour each pixel is, so it tolerates non-manifold edges, flipped normals and isolated spiky artefacts without complaint. A volumetric solver needs a watertight, manifold volume with a consistent inside and outside, so exactly those defects are what crash it — not textures, vertex colours, or raw polygon count, none of which the solver cares about.',
    contentRef: 'l5-graphics-simulation-gap'
  },

  {
    id: 'l5-012',
    lecture: 5,
    topic: 'topology',
    mode: 'mc',
    question: 'What does it mean for mesh topology to “localise detail”?',
    options: [
      'Every part of the mesh receives the same vertex density, so no region is favoured over another',
      'Detail is concentrated at the object’s centre of mass regardless of where the surface actually curves',
      'Vertex density is high at joints and curves and sparse across flat surfaces, following the geometry',
      'The mesh is subdivided uniformly and then decimated afterwards wherever curvature turns out to be low'
    ],
    correctIndex: 2,
    answer: 'Localising detail means putting vertices where the geometry demands them: dense at joints and curves, sparse across flat surfaces, so visual and simulation detail is spent only where it changes the result. Uniform density everywhere is the opposite of localising it, concentrating detail at the centre of mass ignores where curvature actually is, and subdivide-then-decimate describes a workflow, not what localised detail itself means.',
    contentRef: 'l5-topology-localises-detail'
  },

  {
    id: 'l5-013',
    lecture: 5,
    topic: 'topology',
    mode: 'short',
    question: 'A mesh renders correctly in Blender but the finite element solver fails immediately. Give two likely geometric causes.',
    answer: 'Non-manifold edges (an edge shared by more than two faces, so there is no consistent inside and outside) and flipped normals or holes, meaning the surface is not watertight and does not enclose a volume. Rendering tolerates both; volumetric solvers do not.',
    contentRef: 'l5-graphics-simulation-gap'
  },

  {
    id: 'l5-014',
    lecture: 5,
    topic: 'meshing',
    mode: 'mc',
    question: 'In the abdominal aortic aneurysm pipeline, why does the bifurcation stage matter so much?',
    options: [
      'It is the stage where CT and MRI data disagree most, so segmentation accuracy there sets the whole pipeline’s error',
      'It is the only stage that requires manual editing, since the other three run fully automatically on any patient',
      'It determines the sampling rate at which the CT scanner must acquire slices through the aneurysm',
      'Poor meshing at the vessel split causes solver failure or plausible-looking but wrong stress predictions'
    ],
    correctIndex: 3,
    answer: 'Where the aorta splits into the iliac arteries, the topology is genuinely difficult, and a poorly meshed bifurcation either crashes the solver outright or, worse, produces a stress field that looks plausible but is wrong. The other options describe plausible-sounding difficulties elsewhere in medical imaging, but none is the reason the chapter gives for the bifurcation specifically.',
    contentRef: 'l5-aaa-pipeline'
  },

  {
    id: 'l5-015',
    lecture: 5,
    topic: 'meshing',
    mode: 'mc',
    question: 'A CFD mesh of an aneurysm has cells whose volumes jump abruptly between neighbours. What does this threaten?',
    options: [
      'Numerical instability in the pressure gradient, because the discretisation assumes gradually varying cell size',
      'A loss of watertightness, because abrupt size changes are what create non-manifold edges in a volume mesh',
      'An increase in skewness alone, with no separate effect on the stability of the pressure solution itself',
      'A shift in the mesh’s total volume, which biases the computed wall stress high regardless of flow conditions'
    ],
    correctIndex: 0,
    answer: 'Cell volume ratio measures exactly this size jump between neighbours, and a sudden jump introduces numerical instability in the pressure gradient. Watertightness is a topological property unrelated to cell-size grading, skewness is a separate metric about cell shape rather than size, and cell-size variation does not by itself bias total volume or wall stress in a fixed direction.',
    contentRef: 'l5-cell-volume-ratio'
  },

  {
    id: 'l5-016',
    lecture: 5,
    topic: 'meshing',
    mode: 'short',
    question: 'Define skewness and cell volume ratio and say why each matters.',
    answer: 'Skewness measures how far a cell’s shape deviates from ideal; highly skewed cells reduce the accuracy of the discretised operators and can cause divergence. Cell volume ratio measures the size jump between neighbouring cells; abrupt jumps create numerical instability in the pressure gradient. Both are mesh-quality gates that must be checked before trusting a result.',
    contentRef: 'l5-skewness'
  },

  {
    id: 'l5-017',
    lecture: 5,
    topic: 'lod',
    mode: 'short',
    question: 'Give one argument for and one argument against the principle “if the user cannot perceive it, it did not happen”.',
    answer: 'For: simulation resources are finite, and detail that no observer can resolve produces no benefit, so spending on it is pure waste. Against: in engineering and clinical simulation the judge is not a human observer but a physical criterion — a stress concentration too small to see may still be the one that predicts rupture — so perceptual sufficiency is not a valid accuracy criterion there.',
    contentRef: 'l5-completeness-illusion-caution'
  },

  {
    id: 'l5-018',
    lecture: 5,
    topic: 'lod',
    mode: 'mc',
    question: 'A distant NPC switches to a low-polygon mesh for level of detail, but its physics engine keeps simulating it at full fidelity every frame. What happens to the frame budget?',
    options: [
      'It falls in proportion to the polygon reduction, since rendering and simulation share the same per-vertex cost model in most engines',
      'It rises, since the physics engine must now reconcile two different meshes — the render mesh and the collision mesh — every frame',
      'It stays dominated by simulation cost: geometric LOD only changes what the renderer draws, not what physics computes',
      'It falls to zero for that object, since a simplified render mesh is automatically simulated at reduced fidelity too'
    ],
    correctIndex: 2,
    answer: 'Reducing polygon count only changes what the renderer draws; it does nothing for the physics engine, which keeps computing the full object exactly as before. An object that looks simple but still behaves at full simulation fidelity gains nothing, because the frame budget stays dominated by simulation rather than rendering — both layers have to be reduced together, or the mismatch breaks immersion as badly as an object that looks like a brick.',
    contentRef: 'l5-geometric-lod-only-fails'
  }
);
