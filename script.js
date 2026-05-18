// script.js

const measure =
  document.getElementById("measure");

const bpmSlider =
  document.getElementById("tempo");

const bpmValue =
  document.getElementById("bpmValue");

const beatDisplay =
  document.getElementById("beatDisplay");

const playBtn =
  document.getElementById("playBtn");

const undoBtn =
  document.getElementById("undoBtn");

const clearBtn =
  document.getElementById("clearBtn");

const playhead =
  document.getElementById("playhead");

const noteButtons =
  document.querySelectorAll(".note-btn");

let rhythm = [];

let totalBeats = 0;

/* ⭐ 반복재생용 */
let isPlaying = false;
let loopInterval = null;

/* 음표 데이터 */

const noteData = {

  quarter:{
    beats:1,
    symbol:"♩",
    name:"4분음표",
    width:"w1"
  },

  quarterRest:{
    beats:1,
    symbol:"𝄽",
    name:"4분쉼표",
    width:"w1"
  },

  eighthRest:{
    beats:0.5,
    symbol:"𝄾",
    name:"8분쉼표",
    width:"w05"
  },

  eighthSingle:{
    beats:0.5,
    symbol:"♪",
    name:"8분음표",
    width:"w05"
  },

  eighthPair:{
    beats:1,
    symbol:"♪♪",
    name:"8분음표 2개",
    width:"w1"
  },

  sixteenthPair:{
    beats:0.5,
    symbol:"♬",
    name:"16분음표 2개",
    width:"w05"
  }

};

/* 드럼 */

const drum =
  new Tone.MembraneSynth({

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

/* 메트로놈 */

const metro =
  new Tone.MetalSynth({

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

/* BPM */

bpmSlider.addEventListener(
  "input",
  ()=>{

  bpmValue.textContent =
    bpmSlider.value;

});

/* 박자 표시 */

function updateBeatDisplay(){

  beatDisplay.textContent =
    `${totalBeats} / 4`;

}

/* 음표 생성 */

function createNoteBlock(type){

  const data = noteData[type];

  const div =
    document.createElement("div");

  div.classList.add(
    "note-block",
    type,
    data.width
  );

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

/* 음표 추가 */

noteButtons.forEach(btn=>{

  btn.addEventListener(
    "click",
    ()=>{

    const type =
      btn.dataset.type;

    const data =
      noteData[type];

    if(
      totalBeats +
      data.beats > 4
    ){

      alert(
        "4/4박자를 초과했어요!"
      );

      return;
    }

    rhythm.push(type);

    totalBeats += data.beats;

    createNoteBlock(type);

    updateBeatDisplay();

  });

});

/* Undo */

undoBtn.addEventListener(
  "click",
  ()=>{

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

/* 전체삭제 */

clearBtn.addEventListener(
  "click",
  ()=>{

  stopLoop();

  rhythm = [];

  totalBeats = 0;

  measure.innerHTML = `
    <div id="playhead"></div>
  `;

  updateBeatDisplay();

});

/* =========================
   반복 재생 함수
========================= */

async function playLoop(){

  await Tone.start();

  const bpm =
    Number(bpmSlider.value);

  const quarterTime =
    60 / bpm;

  const loopDuration =
    quarterTime * 4 * 1000;

  playOneMeasure();

  loopInterval =
    setInterval(()=>{

      playOneMeasure();

    }, loopDuration);

}

/* =========================
   한 마디 재생
========================= */

function playOneMeasure(){

  const bpm =
    Number(bpmSlider.value);

  const quarterTime =
    60 / bpm;

  const blocks =
    document.querySelectorAll(".note-block");

  let currentTime = 0;

  /* 플레이헤드 */

  playhead.style.opacity = 1;

  playhead.animate(

    [
      {
        left:"0%"
      },

      {
        left:"100%"
      }

    ],

    {
      duration:
        quarterTime *
        4 *
        1000,

      easing:"linear"
    }

  );

  /* 메트로놈 */

  for(let beat=1; beat<=4; beat++){

    setTimeout(()=>{

      if(beat === 1){

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

    }, (beat - 1)
      * quarterTime
      * 1000);

  }

  /* 리듬 */

  rhythm.forEach((type,index)=>{

    const block =
      blocks[index];

    setTimeout(()=>{

      document
        .querySelectorAll(".note-block")
        .forEach(b=>{

          b.classList.remove(
            "playing"
          );

        });

      block.classList.add(
        "playing"
      );

    }, currentTime * 1000);

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

        currentTime +=
          quarterTime;

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

}

/* =========================
   정지
========================= */

function stopLoop(){

  clearInterval(loopInterval);

  isPlaying = false;

  playBtn.innerHTML =
    "▶ 재생하기";

}

/* =========================
   재생 버튼
========================= */

playBtn.addEventListener(
  "click",
  async ()=>{

  if(rhythm.length === 0){

    alert(
      "리듬을 먼저 만들어주세요!"
    );

    return;
  }

  /* 재생중이면 정지 */

  if(isPlaying){

    stopLoop();

    return;
  }

  /* 반복 재생 시작 */

  isPlaying = true;

  playBtn.innerHTML =
    "⏹ 정지하기";

  playLoop();

});

updateBeatDisplay();
