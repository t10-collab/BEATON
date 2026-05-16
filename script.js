const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let currentLen = 2; // 기본 4분음표(2칸)
let currentInst = 'kick';
let sequence = new Array(8).fill(null); // 8개 슬롯 데이터

// 가상 사운드 엔진
function playDrum(inst) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    
    if (inst === 'kick') {
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    } else if (inst === 'snare') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(250, audioCtx.currentTime);
    } else if (inst === 'hihat') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(10000, audioCtx.currentTime);
    }
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}

// 초기 화면 구성
const grid = document.getElementById('grid');
function initGrid() {
    grid.innerHTML = '';
    for(let i=0; i<8; i++) {
        const div = document.createElement('div');
        div.className = 'slot';
        div.id = `slot-${i}`;
        div.innerText = i + 1;
        div.onclick = () => placeNote(i);
        grid.appendChild(div);
    }
}

// 음표 및 악기 선택 이벤트
document.querySelectorAll('.note-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.note-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLen = parseInt(btn.dataset.len);
    };
});

document.querySelectorAll('.inst-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.inst-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentInst = btn.dataset.inst;
        playDrum(currentInst);
    };
});

// 리듬 배치 logic
function placeNote(index) {
    // 1. 해당 칸부터 시작 가능한지 체크
    if (sequence[index] !== null) return;
    if (index + currentLen > 8) {
        alert("박자가 넘어가요!"); return;
    }

    // 2. 데이터 저장 (첫 칸에 정보 저장, 나머지 칸은 'skip' 처리)
    sequence[index] = { inst: currentInst, len: currentLen };
    for(let i=1; i<currentLen; i++) sequence[index+i] = 'skip';

    render();
}

function render() {
    let used = 0;
    sequence.forEach((data, i) => {
        const el = document.getElementById(`slot-${i}`);
        el.className = 'slot';
        el.innerText = i + 1;
        if(data && data !== 'skip') {
            for(let j=0; j<data.len; j++) {
                const target = document.getElementById(`slot-${i+j}`);
                target.classList.add('filled', data.inst);
                target.innerText = (j === 0) ? (data.inst === 'kick' ? '쿵' : data.inst === 'snare' ? '팍' : '칫') : '';
            }
        }
        if(data) used++;
    });
    document.getElementById('remaining-beats').innerText = 8 - sequence.filter(x => x !== null).length;
}

// 재생 로직 (8분음표 단위로 순회)
async function playAll() {
    const slots = document.querySelectorAll('.slot');
    for(let i=0; i<8; i++) {
        slots.forEach(s => s.style.border = "none");
        slots[i].style.border = "2px solid black";
        
        if(sequence[i] && sequence[i] !== 'skip') {
            playDrum(sequence[i].inst);
        }
        await new Promise(r => setTimeout(r, 300)); // 0.3초 간격
        slots[i].style.border = "none";
    }
}

document.getElementById('play-btn').onclick = playAll;
document.getElementById('reset-btn').onclick = () => { sequence.fill(null); render(); };

initGrid();
