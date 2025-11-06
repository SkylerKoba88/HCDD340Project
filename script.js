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

function savePreset(new_preset) {
  var existingPresets = JSON.parse(localStorage.getItem("saved_presets") || '[]');

  if (!existingPresets.includes(new_preset)) {
    existingPresets.push(new_preset);
    localStorage.setItem("saved_presets", JSON.stringify(existingPresets));
  } else {
     console.log(new_preset + ' already exists!')
  }
}


