const colors = ["green", "red", "yellow", "blue"],
  pads = [...document.querySelectorAll(".pad")],
  status = document.querySelector("#status"),
  levelDisplay = document.querySelector("#level"),
  bestDisplay = document.querySelector("#best"),
  startButton = document.querySelector("#startButton"),
  helper = document.querySelector("#helper"),
  statusLight = document.querySelector("#statusLight");
let gameSequence = [],
  playerSequence = [],
  level = 0,
  started = false,
  acceptingInput = false,
  best = Number(localStorage.getItem("simonBest")) || 0;
bestDisplay.textContent = String(best).padStart(2, "0");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  padFor = (color) => document.querySelector(`[data-color="${color}"]`);
function updateStatus(text, active = false) {
  status.textContent = text;
  statusLight.classList.toggle("active", active);
}
function lightPad(color, duration = 360) {
  return new Promise((resolve) => {
    const pad = padFor(color);
    pad.classList.add("lit");
    setTimeout(() => {
      pad.classList.remove("lit");
      resolve();
    }, duration);
  });
}
async function playSequence() {
  acceptingInput = false;
  updateStatus("WATCH CLOSELY", true);
  await sleep(500);
  for (const color of gameSequence) {
    await lightPad(color);
    await sleep(150);
  }
  acceptingInput = true;
  updateStatus("YOUR TURN", true);
}
async function nextLevel() {
  playerSequence = [];
  level += 1;
  levelDisplay.textContent = String(level).padStart(2, "0");
  gameSequence.push(colors[Math.floor(Math.random() * colors.length)]);
  await playSequence();
}
async function startGame() {
  if (started) return;
  started = true;
  gameSequence = [];
  playerSequence = [];
  level = 0;
  startButton.disabled = true;
  startButton.innerHTML = '<span class="play-icon">&#9679;</span> IN PROGRESS';
  helper.textContent = "Repeat the pattern to level up";
  await nextLevel();
}
function endGame() {
  acceptingInput = false;
  document.body.classList.add("game-over");
  pads.forEach((pad) => pad.classList.add("wrong"));
  if (level > best) {
    best = level;
    localStorage.setItem("simonBest", best);
    bestDisplay.textContent = String(best).padStart(2, "0");
  }
  updateStatus("GAME OVER");
  helper.textContent = `You reached level ${level}. Ready for another round?`;
  startButton.disabled = false;
  startButton.innerHTML = '<span class="play-icon">&#8635;</span> PLAY AGAIN';
  setTimeout(() => {
    pads.forEach((pad) => pad.classList.remove("wrong"));
    document.body.classList.remove("game-over");
  }, 500);
  started = false;
}
async function handlePadPress(event) {
  if (!started || !acceptingInput) return;
  const color = event.currentTarget.dataset.color;
  await lightPad(color, 180);
  playerSequence.push(color);
  const index = playerSequence.length - 1;
  if (playerSequence[index] !== gameSequence[index]) {
    endGame();
    return;
  }
  if (playerSequence.length === gameSequence.length) {
    acceptingInput = false;
    updateStatus("NICE!", true);
    await sleep(700);
    nextLevel();
  }
}
pads.forEach((pad) => pad.addEventListener("click", handlePadPress));
startButton.addEventListener("click", startGame);
document.addEventListener("keydown", (event) => {
  if (!started && !event.metaKey && !event.ctrlKey && !event.altKey)
    startGame();
});
