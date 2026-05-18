// script.js

const measure = document.getElementById("measure");
const beatDisplay = document.getElementById("beatDisplay");

const bpmSlider = document.getElementById("tempo");
const bpmValue = document.getElementById("bpmValue");

const playBtn = document.getElementById("playBtn");
const undoBtn = document.getElementById("undoBtn");
const clearBtn = document.getElementById("clearBtn");

const noteButtons = document.querySelectorAll(".note-btn");

let rhythm = [];
let totalBeats = 0;

const noteData = {
  quarter: {
    beats: 1,
    symbol: "♩",
    name: "4분음표",
    hits: ["4n"]
  },

  quarterRest: {
    beats: 1,
    symbol: "𝄽",
    name: "4분쉼표",
    hits: []
  },

  eighthRest: {
    beats: 0.5,
    symbol: "𝄾",
    name: "8분쉼표",
    hits: []
  },

  eighthPair: {
    beats: 1,
    symbol: "♪♪",
    name: "8분음표 2개",
    hits: ["8n","8n"]
  },

  sixteenthPair: {
    beats: 0.5,
    symbol: "♬",
    name: "16분음표 2개",
    hits: ["16n","16n"]
  }
};

// 드럼 사운드
const synth = new Tone.MembraneSynth({
  pitchDecay:0.02,
  octaves:6,
  oscillator:{
    type:"sine"
  },
  envelope:{
    attack:0.001,
    decay:0.4,
    sustain:0
  }
}).toDestination();

function updateBeatDisplay(){
  beatDisplay.textContent = `${totalBeats} / 4`;
}

function createNoteBlock(data){

  const div = document.createElement("div");
  div.className = "note-block";

  div.innerHTML = `
    <div class="note-symbol">${data.symbol}</div>
    <div class="note-name">${data.name}</div>
  `;

  measure.appendChild(div);
}

noteButtons.forEach(btn => {

  btn.addEventListener("click", () => {

    const type = btn.dataset.type;
    const data = noteData[type];

    if(totalBeats + data.beats > 4){
      alert("4/4박자를 초과했어요!");
      return;
    }

    rhythm.push(type);

    totalBeats += data.beats;

    createNoteBlock(data);

    updateBeatDisplay();

  });

});

undoBtn.addEventListener("click", () => {

  if(rhythm.length === 0) return;

  const removed = rhythm.pop();

  totalBeats -= noteData[removed].beats;

  measure.removeChild(measure.lastChild);

  updateBeatDisplay();

});

clearBtn.addEventListener("click", () => {

  rhythm = [];
  totalBeats = 0;

  measure.innerHTML = "";

  updateBeatDisplay();

});

bpmSlider.addEventListener("input", () => {
  bpmValue.textContent = bpmSlider.value;
});

playBtn.addEventListener("click", async () => {

  if(rhythm.length === 0){
    alert("리듬을 먼저 만들어주세요!");
    return;
  }

  await Tone.start();

  const bpm = Number(bpmSlider.value);

  let currentTime = 0;

  const quarterTime = 60 / bpm;

  rhythm.forEach(type => {

    const item = noteData[type];

    switch(type){

      case "quarter":
        synth.triggerAttackRelease("C2", "8n", Tone.now() + currentTime);
        currentTime += quarterTime;
        break;

      case "quarterRest":
        currentTime += quarterTime;
        break;

      case "eighthRest":
        currentTime += quarterTime / 2;
        break;

      case "eighthPair":

        synth.triggerAttackRelease(
          "C2",
          "16n",
          Tone.now() + currentTime
        );

        synth.triggerAttackRelease(
          "C2",
          "16n",
          Tone.now() + currentTime + quarterTime/2
        );

        currentTime += quarterTime;
        break;

      case "sixteenthPair":

        synth.triggerAttackRelease(
          "C2",
          "32n",
          Tone.now() + currentTime
        );

        synth.triggerAttackRelease(
          "C2",
          "32n",
          Tone.now() + currentTime + quarterTime/4
        );

        currentTime += quarterTime / 2;
        break;

    }

  });

});

updateBeatDisplay();
