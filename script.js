const buttons = document.querySelectorAll("#chordTypes button");

buttons.forEach(button => {
  button.addEventListener("click", () => {
    buttons.forEach(btn => btn.classList.remove("active"))
    button.classList.add("active")
  });
});
