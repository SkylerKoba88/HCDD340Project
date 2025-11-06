const buttons = document.querySelectorAll("#chordTypes button");

buttons.forEach(button => {
  button.addEventListener("click", () => {
    buttons.forEach(btn => btn.classList.remove("active"))
    button.classList.add("active")
  });
});

//for presets
function togglePresetDiv() {
  const div = document.getElementById('presetsDiv');
  const button = document.querySelector("button.save-preset-card:nth-of-type(2)"); // second button
  if (div.style.display === 'none' || div.style.display === '') {
    div.style.display = 'flex';
    button.textContent = 'Hide Presets';
    renderPresetList('savedPresets');
  } else {
    div.style.display = 'none';
    button.textContent = 'Load Presets';
  }
}

function getHighlightedNotes() {
  return Array.from(document.querySelectorAll('.highlight')).map(k => k.dataset.full);
}

function saveCurrentPreset() {
  const highlighted = getHighlightedNotes();
  if (highlighted.length === 0) {
    alert("No keys are highlighted to save!");
    return;
  }

  const presetName = prompt("Enter a name for your preset:");
  if (!presetName) return

  const presets = JSON.parse(localStorage.getItem('pianoPresets')) || [];
  
  const duplicate = presets.find(preset => preset.name.toLowerCase() === presetName.toLowerCase);
  if (duplicate) {
    alert(`A preset named "${presetName}" already exists!`);
    console.log(`Preset "${presetName}" already exists.`);
    return;
  }

  presets.push({
    name: presetName,
    notes: highlighted,
    baseNote: document.getElementById('chordBaseNote').value,
    chordType: getActiveChordType(),
  });

  
  localStorage.setItem('pianoPresets', JSON.stringify(presets));
  alert(`Preset "${presetName}" saved!`);
  renderPresetList();
}


