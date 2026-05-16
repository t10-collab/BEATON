const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const rhythmBoard = document.getElementById('rhythm-board');
const currentBeatsDisplay = document.getElementById('current-beats');

let createdRhythm = []; // 선택된 리듬 저장
let totalBeats = 0;
const TEMPO = 88;
const BEAT_DURATION = 60 / TEMPO; // 1박당 시간 (초)

// 1. 소리 생성 (우드블럭 느낌)
function playClick(frequency = 440, duration = 0.1) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

// 2. 리듬 요소 선택 이벤트
document.querySelectorAll('.note-item').forEach(item => {
    item.addEventListener('click', () => {
        const type = item.dataset.type;
        const beats = parseFloat(item.dataset.beats);
        const icon = item.querySelector('.note-img').innerText;

        if (totalBeats + beats > 4.1) { // 4/4박자 초과 방지
            alert("4박자를 초과할 수 없습니다!");
            return;
        }

        totalBeats += beats;
        createdRhythm.push({ type, beats, icon });
        
        renderRhythm();
        currentBeatsDisplay.innerText = totalBeats;
    });
});

// 3. 화면 그리기
function renderRhythm() {
    rhythmBoard.innerHTML = '';
    createdRhythm.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'placed-note';
        div.id = `note-${index}`;
        div.innerText = item.icon;
        rhythmBoard.appendChild(div);
    });
}

// 4. 연주 로직
async function playRhythm() {
    if (createdRhythm.length === 0) return;
    
    const playBtn = document.getElementById('playBtn');
    playBtn.disabled = true;

    for (let i = 0; i < createdRhythm.length; i++) {
        const item = createdRhythm[i];
        const element = document.getElementById(`note-${i}`);
        
        // 시각적 강조
        element.classList.add('playing');

        // 소리 발생 (쉼표는 소리 없음)
        if (item.type === '4') {
            playClick(440, 0.1); // 4분음표
        } else if (item.type === '8-8') {
            playClick(440, 0.05);
            await new Promise(r => setTimeout(r, (BEAT_DURATION / 2) * 1000));
            playClick(440, 0.05);
            await new Promise(r => setTimeout(r, (BEAT_DURATION / 2) * 1000));
            element.classList.remove('playing');
            continue;
        } else if (item.type === '8') {
            playClick(440, 0.05);
        } else if (item.type === '16') {
            for(let j=0; j<4; j++) {
                playClick(550, 0.03);
                await new Promise(r => setTimeout(r, (BEAT_DURATION / 4) * 1000));
            }
            element.classList.remove('playing');
            continue;
        }

        // 박자만큼 대기
        await new Promise(r => setTimeout(r, item.beats * BEAT_DURATION * 1000));
        element.classList.remove('playing');
    }

    playBtn.disabled = false;
}

// 5. 초기화
document.getElementById('resetBtn').onclick = () => {
    createdRhythm = [];
    totalBeats = 0;
    rhythmBoard.innerHTML = '';
    currentBeatsDisplay.innerText = '0';
};

document.getElementById('playBtn').onclick = playRhythm;
