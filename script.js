// script.js

const measure = document.getElementById("measure");

const beatDisplay =
  document.getElementById("beatDisplay");

const bpmSlider =
  document.getElementById("tempo");

const bpmValue =
  document.getElementById("bpmValue");

const playBtn =
  document.getElementById("playBtn");

const undoBtn =
  document.getElementById("undoBtn");

const clearBtn =
  document.getElementById("clearBtn");

const noteButtons =
  document.querySelectorAll(".note-btn");

let rhythm = [];

let totalBeats = 0;

// 음표 정보
const noteData = {

  quarter:{
    beats:1,
    symbol:"♩",
    name:"4분음표"
  },

  quarterRest:{
    beats:1,
    symbol:"𝄽",
    name:"4분쉼표"
  },

  eighthRest:{
    beats:0.5,
    symbol:"𝄾",
    name:"8분쉼표"
  },

  eighthSingle:{
    beats:0.5,
    symbol:"♪",
    name:"8분음표 1개"
  },

  eighthPair:{
    beats:1,
    symbol:"♪♪",
    name:"8분음표 2개"
  },

  sixteenthPair:{
    beats:0.5,
    symbol:"♬",
    name:"16분음표 2개"
  }

};

// 드럼 사운드
const drum = new Tone.MembraneSynth({

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

// 메트로놈 사운드
const metro = new Tone.MetalSynth({

  frequency:200,

  envelope:{
    attack:0.001,
    decay:0.1,
    release:0.01
  },

  harmonicity:5.1,
  modulationIndex:32,
  resonance:4000,
  octaves:1.5

}).toDestination();

// BPM 표시
bpmSlider.addEventListener("input",()=>{

  bpmValue.textContent =
    bpmSlider.value;

});

// 박자 표시 업데이트
function updateBeatDisplay(){

  beatDisplay.textContent =
    `${totalBeats} / 4`;

}

// 음표 생성
function createNoteBlock(data){

  const div =
    document.createElement("div");

  div.className = "note-block";

  div.innerHTML = `
    <div class="note-symbol">
      ${data.symbol}
    </div>

    <div class="note-name">
      ${data.name}
    </div>
  `;

  measure.appendChild(div);
}

// 메트로놈 불빛
function highlightBeat(beat){

  document
    .querySelectorAll(".beat-box")
    .forEach(box => {

      box.classList.remove("active");

    });

  document
    .getElementById(`beat${beat}`)
    .classList.add("active");
}

// 음표 추가
noteButtons.forEach(btn=>{

  btn.addEventListener("click",()=>{

    const type =
      btn.dataset.type;

    const data =
      noteData[type];

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

// Undo
undoBtn.addEventListener("click",()=>{

  if(rhythm.length === 0)
    return;

  const removed =
    rhythm.pop();

  totalBeats -=
    noteData[removed].beats;

  measure.removeChild(
    measure.lastChild
  );

  updateBeatDisplay();

});

// 전체 삭제
clearBtn.addEventListener("click",()=>{

  rhythm = [];

  totalBeats = 0;

  measure.innerHTML = "";

  updateBeatDisplay();

});

// 재생
playBtn.addEventListener(
  "click",
  async ()=>{

  if(rhythm.length === 0){

    alert(
      "리듬을 먼저 만들어주세요!"
    );

    return;
  }

  await Tone.start();

  const bpm =
    Number(bpmSlider.value);

  const quarterTime =
    60 / bpm;

  let currentTime = 0;

  // 메트로놈 4박
  for(let i=1; i<=4; i++){

    setTimeout(()=>{

      highlightBeat(i);

      // 첫박 강세
      if(i === 1){

        metro.triggerAttackRelease(
          "C6",
          "16n"
        );

      }else{

        metro.triggerAttackRelease(
          "A4",
          "32n"
        );

      }

    }, currentTime * 1000);

    currentTime += quarterTime;
  }

  // 리듬 재생
  rhythm.forEach(type=>{

    switch(type){

      case "quarter":

        drum.triggerAttackRelease(
          "C2",
          "8n",
          Tone.now() + currentTime
        );

        currentTime += quarterTime;

        break;

      case "quarterRest":

        currentTime += quarterTime;

        break;

      case "eighthRest":

        currentTime +=
          quarterTime / 2;

        break;

      case "eighthSingle":

        drum.triggerAttackRelease(
          "C2",
          "16n",
          Tone.now() + currentTime
        );

        currentTime +=
          quarterTime / 2;

        break;

      case "eighthPair":

        drum.triggerAttackRelease(
          "C2",
          "16n",
          Tone.now() + currentTime
        );

        drum.triggerAttackRelease(
          "C2",
          "16n",
          Tone.now() +
          currentTime +
          quarterTime / 2
        );

        currentTime += quarterTime;

        break;

      case "sixteenthPair":

        drum.triggerAttackRelease(
          "C2",
          "32n",
          Tone.now() + currentTime
        );

        drum.triggerAttackRelease(
          "C2",
          "32n",
          Tone.now() +
          currentTime +
          quarterTime / 4
        );

        currentTime +=
          quarterTime / 2;

        break;

    }

  });

});

updateBeatDisplay();
