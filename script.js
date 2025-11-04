const buttons = document.querySelectorAll("#chordTypes button");

buttons.forEach(button => {
  button.addEventListener("click", () => {
    buttons.forEach(btn => btn.classList.remove("active"))
    button.classList.add("active")
  });
});

/* ====== Keyboard builder + highlighter (two octaves: C4..B5) ====== */

(function() {
  // highlight color handled by CSS; this code toggles `highlight` class.

  // note names per semitone (using # for sharps)
  const NOTE_ORDER = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

  // piano start: C4 (MIDI 60), we'll create 24 keys (C4..B5)
  const OCTAVES = [4,5];
  const startOct = 4;
  const keys = []; // will store objects {noteName, label, index}

  // Build keys array
  OCTAVES.forEach(oct => {
    for (let i = 0; i < 12; i++) {
      const note = NOTE_ORDER[i];
      const label = note.replace('#', '♯');
      keys.push({ note, octave: oct, label: `${note}${oct}`, id: `${note}${oct}` });
    }
  });
  // keys now contains 24 entries C4..B5

  // create keyboard DOM
  const keyboardContainer = document.getElementById('keyboard');
  const piano = document.createElement('div');
  piano.className = 'piano';
  keyboardContainer.appendChild(piano);

  // Helper: is this semitone index a black key?
  const isBlack = note => note.includes('#');

  // For layout, create a wrapper per white key (so black keys can be absolutely placed)
  keys.forEach(k => {
    const wrapper = document.createElement('div');
    wrapper.className = 'key-wrapper';

    const key = document.createElement('div');
    key.className = 'key';
    key.dataset.note = k.note;
    key.dataset.octave = k.octave;
    key.dataset.id = k.id;
    key.dataset.pc = k.note; // pitch class
    key.dataset.full = `${k.note}${k.octave}`;

    // label at bottom
    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = `${k.note.replace('#','♯')}${k.octave}`;
    key.appendChild(label);

    // if this is a black key, create and place black element inside wrapper
    if (isBlack(k.note)) {
      // Still create a white key base as a spacer (invisible)
      key.style.visibility = 'hidden';
      // We'll add a small empty base so spacing remains
      wrapper.appendChild(key);

      const blackKey = document.createElement('div');
      blackKey.className = 'black';
      blackKey.dataset.note = k.note;
      blackKey.dataset.octave = k.octave;
      blackKey.dataset.full = `${k.note}${k.octave}`;
      const blabel = document.createElement('div');
      blabel.className = 'label';
      blabel.textContent = `${k.note.replace('#','♯')}${k.octave}`;
      blackKey.appendChild(blabel);
      wrapper.appendChild(blackKey);
    } else {
      // white key: visible
      wrapper.appendChild(key);
    }

    piano.appendChild(wrapper);
  });

  // collect all key elements into an array for quick toggling
  const allKeys = Array.from(keyboardContainer.querySelectorAll('.key, .black'));

  function normalizeBaseString(s) {
  if (!s) return 'C';
  // normalize Unicode arrows and whitespace
  let cleaned = String(s).trim();

  // if option contains a slash like "C♯ / D♭" prefer the left side (before "/")
  if (cleaned.includes('/')) cleaned = cleaned.split('/')[0].trim();

  // replace Unicode sharp/flat with ascii
  cleaned = cleaned.replace(/♯/g, '#').replace(/♭/g, 'b');

  // remove any extra trailing text after space (e.g., "C#" stays "C#")
  cleaned = cleaned.split(' ')[0].trim();

  // map flats like "Db" to sharps "C#"
  const flatToSharp = {
    'Db': 'C#', 'D♭': 'C#',
    'Eb': 'D#', 'E♭': 'D#',
    'Gb': 'F#', 'G♭': 'F#',
    'Ab': 'G#', 'A♭': 'G#',
    'Bb': 'A#', 'B♭': 'A#'
  };

  // If cleaned is something like "C" or "C#" return it; otherwise map flats
  if (flatToSharp[cleaned]) return flatToSharp[cleaned];
  return cleaned;
}


  function clearHighlights() {
    allKeys.forEach(k => k.classList.remove('highlight'));
  }

  // highlight list of full note names like ['C4', 'E4', 'G4', 'D5']
  function highlightFullNotes(fullNames) {
    clearHighlights();
    const set = new Set(fullNames);
    allKeys.forEach(k => {
      if (set.has(k.dataset.full)) {
        k.classList.add('highlight');
      }
    });
  }

  // map pitch-class + octave to index in our keys array (0..23)
  const fullToIndex = {};
  const indexToFull = [];
  let idx = 0;
  keys.forEach(k => {
    const full = `${k.note}${k.octave}`;
    fullToIndex[full] = idx;
    indexToFull[idx] = full;
    idx++;
  });

  // Convert a base (pitch class) and intervals array (semitones) into concrete full notes
  // We'll search each octave range so that extensions (9/11/13) can appear in higher octave.
  // Approach: find the lowest index of base (first matching base in octave 4), then add intervals and map to indexes if within 0..23
  function notesFromIntervals(basePc, intervals) {
  // normalize the base pitch-class to the same format used in indexToFull (e.g., "C#" or "D")
  const baseNorm = normalizeBaseString(basePc);
  // find base indexes for C4..B5
  const baseIndices = [];
  for (let i = 0; i < indexToFull.length; i++) {
    // indexToFull entries look like "C4", "C#4", etc.
    if (indexToFull[i].startsWith(baseNorm)) baseIndices.push(i);
  }

  // DEBUG: log what baseNorm is and which indices matched
  console.log('notesFromIntervals: basePc=', basePc, 'baseNorm=', baseNorm, 'baseIndices=', baseIndices);

  if (baseIndices.length === 0) return [];

  // choose the LOWER base in our two-octave set as the root (prefer octave 4)
  const rootIndex = baseIndices[0];
  const results = [];
  intervals.forEach(interval => {
    const target = rootIndex + interval;
    if (target >= 0 && target < indexToFull.length) results.push(indexToFull[target]);
  });
  // DEBUG: log computed full note names
  console.log('notesFromIntervals -> results:', results);
  return results;
}


  /* ====== musical definitions ====== */

  // chord definitions: intervals (in semitones) relative to root at index 0
  const CHORD_MAP = {
    major: [0, 4, 7, 11],    // Major 7th
    minor: [0, 3, 7, 10],    // Minor 7th
    dominant: [0, 4, 7, 10],
};

  // scale definitions: intervals from root within one octave (we'll map into the two-octave keyboard by adding both octaves)
  const SCALES = {
    'Ionian / Major': [0,2,4,5,7,9,11],
    'Lydian': [0,2,4,6,7,9,11],
    'Mixolydian': [0,2,4,5,7,9,10],
    'Dorian': [0,2,3,5,7,9,10],
    'Aeolian / Natural Minor': [0,2,3,5,7,8,10],
    'Harmonic Minor': [0,2,3,5,7,8,11],
    'Melodic Minor': [0,2,3,5,7,9,11],
    'Phrygian': [0,1,3,5,7,8,10],
    'Locrian': [0,1,3,5,6,8,10],
    'Bebop Dominant': [0,2,4,5,7,9,10,11],
    'Bebop Major': [0,2,4,5,7,9,10,11],
    'Bebop Minor': [0,2,3,4,5,7,9,10],
    'Blues Minor': [0,3,5,6,7,10],
    'Blues Major': [0,2,3,4,7,9],
    'Blues Diminished': [0,3,4,6,7,9],
    'Major Pentatonic': [0,2,4,7,9],
    'Minor Pentatonic': [0,3,5,7,10],
    'Major': [0,2,4,5,7,9,11]
  };

  const SCALE_MAP = {
  'Ionian / Major': [0,2,4,5,7,9,11],
  'Lydian': [0,2,4,6,7,9,11],
  'Mixolydian': [0,2,4,5,7,9,10],
  'Dorian': [0,2,3,5,7,9,10],
  'Aeolian / Natural Minor': [0,2,3,5,7,8,10],
  'Harmonic Minor': [0,2,3,5,7,8,11],
  'Melodic Minor': [0,2,3,5,7,9,11],
  'Phrygian': [0,1,3,5,7,8,10],
  'Locrian': [0,1,3,5,6,8,10],
  'Bebop Dominant': [0,2,4,5,7,9,10,11],
  'Bebop Major': [0,2,4,5,7,8,9,11],
  'Bebop Minor': [0,2,3,5,7,8,9,10],
  'Blues Minor': [0,3,5,6,7,10],
  'Blues Major': [0,2,4,6,7,9],
  'Blues Diminished': [0,3,5,6,7,10],
  'Major Pentatonic': [0,2,4,7,9],
  'Minor Pentatonic': [0,3,5,7,10],
  'Major': [0,2,4,5,7,9,11]
};


  /* ====== wire up UI controls ====== */

  // helper to read which chord button is active
  function getActiveChordType() {
    const btn = document.querySelector('.chord-button.active');
    return btn ? btn.id : null;
  }

  // listen for chord button clicks and toggle active class
  function setupChordButtons() {
    const btns = document.querySelectorAll('.chord-button');
    btns.forEach(b => {
      b.addEventListener('click', () => {
        btns.forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        updateFromControls();
      });
    });
  }

  // read which chord alterations are checked (9,11,13,b3,#4,b5,b9,#9,b11,#11,b13,#13)
  function getChordAlterations() {
    const container = document.getElementById('chordAlterations');
    if (!container) return [];
    const checked = Array.from(container.querySelectorAll('input[type="checkbox"]:checked'));
    return checked.map(c => c.value);
  }

  // map alteration names to semitone additions (relative to root)
  const ALT_MAP = {
    '9': 14,      // 9th is 14 semitones above root (octave + 2)
    '11': 17,     // 11th = octave + 5
    '13': 21,     // 13th = octave + 9
    'b9': 13,
    '#9': 15,
    'b11': 16,
    '#11': 18,
    'b13': 20,
    '#13': 22,
    'b3': 3,
    '#4': 6,
    'b5': 6 // b5 is 6 semitones above root (same as #4), kept as 6
  };

  // compute chord full notes based on root Pc and chord type & alterations
  function computeChordNotes(rootPc, chordType, alterations) {
    const rootPcNorm = normalizeBaseString(rootPc);
    // map chord interval base
    const chordDef = CHORD_MAP[chordType] || CHORD_MAP['major']; // default to major if missing
    // we will produce intervals that are possibly >12 for extensions
    const intervals = [...chordDef];

    // apply alterations: for each alteration string, if it maps use that semitone distance
    alterations.forEach(a => {
      if (ALT_MAP[a] != null) intervals.push(ALT_MAP[a]);
    });

    // sort & unique intervals
    const uniq = Array.from(new Set(intervals)).sort((a,b)=>a-b);
    // Convert intervals to note names using notesFromIntervals
    return notesFromIntervals(rootPcNorm, uniq);
  }

  // compute scale notes across two octaves: duplicates for octave+12
  function computeScaleNotes(rootPc, scaleName) {
    const norm = normalizeBaseString(rootPc);
    const scaleDef = SCALES[scaleName];
    if (!scaleDef) return [];
    // build intervals across octaves: add the base intervals in octave 4, then add +12 for octave 5
    const baseIntervals = scaleDef;
    const allIntervals = [];
    baseIntervals.forEach(iv => allIntervals.push(iv));
    baseIntervals.forEach(iv => allIntervals.push(iv + 12));
    // ensure unique & sorted
    const uniq = Array.from(new Set(allIntervals)).sort((a,b)=>a-b);
    return notesFromIntervals(norm, uniq);
  }

  function highlightNotes(basePc, intervals) {
    const notes = notesFromIntervals(basePc, intervals);
    highlightFullNotes(notes);
  }

  // main update: decide whether to highlight chord (if chord button active) or scale (if scale option selected)
  function updateFromControls() {
  // Clear previous highlights
  document.querySelectorAll('.key').forEach(k => k.classList.remove('active'));

  // If chords card is active
  if (document.querySelector('#chordsDiv').style.opacity == '1') {
  const chordType = document.querySelector('.chord-button.active')?.id || 'major';
  const baseNote = document.getElementById('chordBaseNote').value;
  const alterations = getChordAlterations(); // ✅ get checked alterations
  const chordNotes = computeChordNotes(baseNote, chordType, alterations); // ✅ build full chord
  highlightFullNotes(chordNotes); // ✅ highlight those notes
}

  // If scales card is active
  if (document.querySelector('#scalesDiv').style.opacity == '1') {
    const scale = document.getElementById('scales').value;
    const base = document.getElementById('scaleBaseNote').value;
    const scaleIntervals = SCALE_MAP[scale]; // you need a SCALE_MAP like CHORD_MAP
    if (scaleIntervals) highlightNotes(base, scaleIntervals);
  }
}


  // attach listeners to controls
  function attachControlListeners() {
    const chordBase = document.getElementById('chordBaseNote');
    if (chordBase) chordBase.addEventListener('change', updateFromControls);

    const scaleBase = document.getElementById('scaleBaseNote');
    if (scaleBase) scaleBase.addEventListener('change', updateFromControls);

    const scaleSelect = document.getElementById('scales');
    if (scaleSelect) scaleSelect.addEventListener('change', updateFromControls);

    const alterations = document.getElementById('chordAlterations');
    if (alterations) alterations.addEventListener('change', updateFromControls);
  }

  // initialize
  setupChordButtons();
  attachControlListeners();

  /* ===== Dim inactive card when interacting with one ===== */
const chordCard = document.querySelector('.card:nth-of-type(1)');
const scaleCard = document.querySelector('.card:nth-of-type(2)');

function setActiveCard(active) {
  if (active === 'chord') {
    chordCard.style.opacity = '1';
    scaleCard.style.opacity = '0.3';
  } else if (active === 'scale') {
    chordCard.style.opacity = '0.3';
    scaleCard.style.opacity = '1';
  } else {
    chordCard.style.opacity = '1';
    scaleCard.style.opacity = '1';
  }
}

// whenever any chord-related input changes
['chordBaseNote', 'chordAlterations'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => setActiveCard('chord'));
});
document.querySelectorAll('.chord-button').forEach(b =>
  b.addEventListener('click', () => setActiveCard('chord'))
);

// whenever any scale-related input changes
['scaleBaseNote', 'scales'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => setActiveCard('scale'));
});

// scale card listeners
const scaleBase = document.getElementById('scaleBaseNote');
const scaleSelect = document.getElementById('scales');

if (scaleBase) scaleBase.addEventListener('change', updateFromControls);
if (scaleSelect) scaleSelect.addEventListener('change', updateFromControls);


// reset dimming if nothing is selected
document.addEventListener('click', e => {
  if (!chordCard.contains(e.target) && !scaleCard.contains(e.target)) {
    setActiveCard(null);
  }
});


  // initial draw - attempt to update based on current state
  setTimeout(updateFromControls, 50);

})();
