// Make chord-type buttons toggle visually
const buttons = document.querySelectorAll("#chordTypes button");
buttons.forEach(button => {
  button.addEventListener("click", () => {
    buttons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
  });
});

// Helper to get the current active chord button
function getActiveChordType() {
  const active = document.querySelector("#chordTypes button.active");
  return active ? active.textContent : null;
}

// Toggle preset section visibility
function togglePresetDiv() {
  const div = document.getElementById('presetsDiv');
  const button = document.querySelector("button.save-preset-card:nth-of-type(2)");
  if (div.style.display === 'none' || div.style.display === '') {
    div.style.display = 'flex';
    button.textContent = 'Hide Presets';
    renderPresetList();
  } else {
    div.style.display = 'none';
    button.textContent = 'Load Presets';
  }
}

// Get currently highlighted piano keys
function getHighlightedNotes() {
  return Array.from(document.querySelectorAll('.highlight')).map(k => k.dataset.full);
}

// Save the current highlighted keys as a preset
function saveCurrentPreset() {
  const highlighted = getHighlightedNotes();
  if (highlighted.length === 0) {
    alert("No keys are highlighted to save!");
    return;
  }

  const presetName = prompt("Enter a name for your preset:");
  if (!presetName) return

  // Create a preset object with useful info
  const preset = {
    name: presetName,
    notes: highlighted,
    baseNote: document.getElementById('chordBaseNote').value,
    chordType: document.querySelector('.chord-button.active')?.id || "unknown",
  };

  const presets = JSON.parse(localStorage.getItem('pianoPresets')) || [];

  presets.push(preset);
  localStorage.setItem('pianoPresets', JSON.stringify(presets));
  renderPresetList(); 
}


function renderPresetList() {
  const listDiv = document.getElementById('savedPresets');
  if (!listDiv) return;

  listDiv.innerHTML = ''; // clear old buttons

  const presets = JSON.parse(localStorage.getItem('pianoPresets')) || [];

  if (presets.length === 0) {
    listDiv.innerHTML = '<p>No presets saved yet.</p>';
    return;
  }

  presets.forEach((preset, index) => {
    const btn = document.createElement('button');
    btn.textContent = preset.name;

    // Add both classes: chord-button for styling, preset-button for identification
    btn.classList.add('preset-button', 'chord-button');

    // Toggle active state and load preset
    btn.addEventListener('click', () => {
      // Remove "active" class from all preset buttons
      document.querySelectorAll('.preset-button.chord-button').forEach(b => b.classList.remove('active'));

      // Add "active" to the clicked button
      btn.classList.add('active');

      // Load the preset keys on the keyboard
      loadPreset(preset);
    });

    listDiv.appendChild(btn);
  });
}





function loadPreset(preset) {
  clearHighlights();

  preset.notes.forEach(note => {
    const key = document.querySelector(`[data-full="${note}"]`);
    if (key) key.classList.add('highlight');
  });
}

function clearHighlights() {
  document.querySelectorAll('.highlight').forEach(k => k.classList.remove('highlight'));
}

