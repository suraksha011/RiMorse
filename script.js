/* ---------- Morse map ---------- */
const MORSE = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.',
  G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..',
  M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
  S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..',
  0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-',
  5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.'
};
const REVERSE_MORSE = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));

const WORD_BANK = [
  'HELLO', 'WORLD', 'MORSE', 'SIGNAL', 'RADIO', 'OCEAN', 'FOREST', 'ROCKET',
  'GUITAR', 'PLANET', 'WINTER', 'BRIDGE', 'GARDEN', 'PENCIL', 'CIRCLE',
  'YELLOW', 'ORANGE', 'PURPLE', 'CANDLE', 'WHALE', 'ISLAND', 'SPARK',
  'ECHO', 'LIGHT', 'CLOUD', 'RIVER', 'STORM', 'TRAIN', 'ANCHOR', 'COMPASS'
];

function textToMorse(text){
  return text.toUpperCase().trim().split(' ').map(word =>
    word.split('').filter(ch => MORSE[ch]).map(ch => MORSE[ch]).join(' ')
  ).join(' / ');
}

/* ---------- Audio engine ---------- */
const UNIT_MS = 70; // dot length
let audioCtx = null;
function getCtx(){
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function beep(durationMs, onLampChange){
  return new Promise(resolve => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 620;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.005);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    if (onLampChange) onLampChange(true);
    setTimeout(() => {
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02);
      osc.stop(ctx.currentTime + 0.03);
      if (onLampChange) onLampChange(false);
      resolve();
    }, durationMs);
  });
}

function wait(ms){ return new Promise(r => setTimeout(r, ms)); }

let playbackToken = 0;
async function playMorseAudio(morseString, onLampChange){
  const myToken = ++playbackToken;
  const symbols = morseString.split('');
  for (const symbol of symbols){
    if (myToken !== playbackToken) return; // cancelled by a newer playback
    if (symbol === '.') { await beep(UNIT_MS, onLampChange); await wait(UNIT_MS); }
    else if (symbol === '-') { await beep(UNIT_MS * 3, onLampChange); await wait(UNIT_MS); }
    else if (symbol === ' ') { await wait(UNIT_MS * 3); }
    else if (symbol === '/') { await wait(UNIT_MS * 7); }
  }
}

/* ---------- Navigation ---------- */
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  playbackToken++; // cancel any in-flight audio
}

document.querySelectorAll('[data-nav]').forEach(btn => {
  btn.addEventListener('click', () => showScreen(btn.dataset.nav));
});

/* ---------- Learn page ---------- */
const tileGrid = document.getElementById('tileGrid');
Object.keys(MORSE).forEach(ch => {
  const tile = document.createElement('div');
  tile.className = 'tile';
  tile.innerHTML = `
    <div class="tile-inner">
      <div class="tile-face front">${ch}</div>
      <div class="tile-face back">
        <span class="code">${MORSE[ch]}</span>
        <span class="letter-small">${ch}</span>
      </div>
    </div>`;
  tile.addEventListener('click', () => {
    tile.classList.add('flipped');
    playMorseAudio(MORSE[ch]);
    setTimeout(() => tile.classList.remove('flipped'), 2200);
  });
  tileGrid.appendChild(tile);
});

/* ---------- Play page ---------- */
let playMode = 'audio';
const playModeButtons = document.querySelectorAll('#playModeToggle .mode-btn');
const playAudioPanel = document.getElementById('playAudioPanel');
const playVisualPanel = document.getElementById('playVisualPanel');
const playInputAudio = document.getElementById('playInputAudio');
const playInputVisual = document.getElementById('playInputVisual');
const playLamp = document.getElementById('playLamp');
const playVisualOutput = document.getElementById('playVisualOutput');
const playAudioBtn = document.getElementById('playAudioBtn');
const playVisualBtn = document.getElementById('playVisualBtn');
const switchToVisualBtn = document.getElementById('switchToVisualBtn');
const switchToAudioBtn = document.getElementById('switchToAudioBtn');

function setPlayMode(mode){
  playMode = mode;
  playModeButtons.forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
  playAudioPanel.style.display = mode === 'audio' ? 'flex' : 'none';
  playVisualPanel.style.display = mode === 'visual' ? 'flex' : 'none';
}
playModeButtons.forEach(b => b.addEventListener('click', () => setPlayMode(b.dataset.mode)));

function renderVisualGroups(container, text){
  container.innerHTML = '';
  const words = text.toUpperCase().trim().split(' ').filter(Boolean);
  if (!words.length){
    container.innerHTML = '<span class="hint">Type something to see its signal.</span>';
    return;
  }
  words.forEach((word, wi) => {
    word.split('').forEach(ch => {
      if (!MORSE[ch]) return;
      const span = document.createElement('span');
      span.className = 'grp';
      span.textContent = MORSE[ch];
      container.appendChild(span);
    });
    if (wi < words.length - 1){
      const gap = document.createElement('span');
      gap.className = 'grp space';
      gap.textContent = '/';
      container.appendChild(gap);
    }
  });
}

playAudioBtn.addEventListener('click', () => {
  const val = playInputAudio.value;
  if (!val.trim()) return;
  playMorseAudio(textToMorse(val), lit => playLamp.classList.toggle('lit', lit));
});

playVisualBtn.addEventListener('click', () => {
  renderVisualGroups(playVisualOutput, playInputVisual.value);
});

switchToVisualBtn.addEventListener('click', () => {
  playInputVisual.value = playInputAudio.value;
  setPlayMode('visual');
  renderVisualGroups(playVisualOutput, playInputVisual.value);
});
switchToAudioBtn.addEventListener('click', () => {
  playInputAudio.value = playInputVisual.value;
  setPlayMode('audio');
  if (playInputAudio.value.trim()){
    playMorseAudio(textToMorse(playInputAudio.value), lit => playLamp.classList.toggle('lit', lit));
  }
});

[playInputAudio, playInputVisual].forEach(inp => {
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') (inp === playInputAudio ? playAudioBtn : playVisualBtn).click();
  });
});

/* ---------- Quiz page ---------- */
let quizMode = 'audio';
let currentWord = '';
let score = { correct: 0, total: 0 };

const quizModeButtons = document.querySelectorAll('#quizModeToggle .mode-btn');
const quizLamp = document.getElementById('quizLamp');
const quizCode = document.getElementById('quizCode');
const quizInput = document.getElementById('quizInput');
const quizSubmit = document.getElementById('quizSubmit');
const quizReplay = document.getElementById('quizReplay');
const quizNext = document.getElementById('quizNext');
const quizFeedback = document.getElementById('quizFeedback');
const quizScoreEl = document.getElementById('quizScore');

function updateScore(){
  quizScoreEl.textContent = `Score: ${score.correct} / ${score.total}`;
}

function newQuizWord(){
  currentWord = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
  quizFeedback.textContent = '';
  quizFeedback.className = 'feedback';
  quizInput.value = '';
  quizInput.disabled = false;
  quizSubmit.disabled = false;
  quizNext.style.visibility = 'hidden';
  presentQuizWord();
  quizInput.focus();
}

function presentQuizWord(){
  const morse = textToMorse(currentWord);
  if (quizMode === 'visual'){
    quizCode.textContent = morse;
  } else {
    quizCode.textContent = '';
    playMorseAudio(morse, lit => quizLamp.classList.toggle('lit', lit));
  }
}

function setQuizMode(mode){
  quizMode = mode;
  quizModeButtons.forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
  quizLamp.style.display = mode === 'audio' ? 'block' : 'none';
  quizReplay.style.display = mode === 'audio' ? 'inline-block' : 'none';
  if (currentWord) presentQuizWord();
}
quizModeButtons.forEach(b => b.addEventListener('click', () => setQuizMode(b.dataset.mode)));

quizReplay.addEventListener('click', presentQuizWord);

function submitGuess(){
  if (quizInput.disabled) return;
  const guess = quizInput.value.trim().toUpperCase();
  if (!guess) return;
  score.total++;
  quizCode.textContent = textToMorse(currentWord);
  if (guess === currentWord){
    score.correct++;
    quizFeedback.textContent = 'Correct — nice ear!';
    quizFeedback.className = 'feedback correct';
  } else {
    quizFeedback.textContent = `Not quite — it was ${currentWord}.`;
    quizFeedback.className = 'feedback incorrect';
  }
  updateScore();
  quizInput.disabled = true;
  quizSubmit.disabled = true;
  quizNext.style.visibility = 'visible';
  quizNext.focus();
}

quizSubmit.addEventListener('click', submitGuess);
quizInput.addEventListener('keydown', e => { if (e.key === 'Enter') submitGuess(); });
quizNext.addEventListener('click', newQuizWord);

/* ---------- Init on nav ---------- */
document.querySelectorAll('[data-nav="play"]').forEach(b => b.addEventListener('click', () => {
  setPlayMode('audio');
  playInputAudio.value = '';
  playInputVisual.value = '';
  renderVisualGroups(playVisualOutput, '');
}));

document.querySelectorAll('[data-nav="quiz"]').forEach(b => b.addEventListener('click', () => {
  score = { correct: 0, total: 0 };
  updateScore();
  setQuizMode('audio');
  newQuizWord();
}));