const majorButton = document.querySelector('#majorModes')
const minorButton = document.querySelector('#minorModes')
const specialButton = document.querySelector('#specialScales')
const majorDiv = document.querySelector('#majorModeScalesDiv')
const minorDiv = document.querySelector('#minorModeScalesDiv')
const baseNoteDiv = document.querySelector('#baseNoteScales')

  function selectMode(mode) {
    if (mode === 'major') {
      // Highlight the major button
      majorButton.classList.add('selected')
      minorButton.classList.remove('selected')
      specialButton.classList.remove('selected')

      // Show major div and hide minor and special
      majorDiv.style.display = 'block'
      minorDiv.style.display = 'none'
      baseNoteDiv.style.display = 'block'
    }
    
    if (mode === 'minor') {
      // Highlight the minor button
      minorButton.classList.add('selected')
      majorButton.classList.remove('selected')
      specialButton.classList.remove('selected')

      // Show minor div and hide major and special
      minorDiv.style.display = 'block'
      majorDiv.style.display = 'none'
      baseNoteDiv.style.display = 'block'
    }

    if (mode==='special'){
        // Highlight the special button
      majorButton.classList.remove('selected')
      minorButton.classList.remove('selected')
      specialButton.classList.add('selected')

      // Show special div and hide minor and major
      baseNoteDiv.style.display = 'block'
      majorDiv.style.display = 'none'
      minorDiv.style.display = 'none'
    }
  }
