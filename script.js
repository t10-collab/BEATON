const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let selectedNote = { type: '4n', len: 4 }; // 16분음표 4개 길이
let sequence = new Array(16).fill(null); // 총 16칸 (2마디)

// 가상 드럼 소리 (하이햇/스네어 대용)
function playSound(isRest) {
    if (isRest) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}

// 그리드 생성
function initGrid() {
    const grids = [document.getElementById('grid-m1'), document.getElementById('grid-m2')];
    grids.forEach((g, mIdx) => {
        for (let i = 0; i < 8; i++) {
            const slot = document.createElement('div');
            slot.className = 'slot';
            slot.id = `slot-${mIdx * 8 + i}`;
            slot.onclick = () => addNote(mIdx * 8 + i);
            g.appendChild(slot);
        }
    });
}

// 음표 선택 이벤트
document.querySelectorAll('.note-item').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.note-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedNote = { type: btn.dataset.type, len: parseInt(btn.dataset.len) };
    };
});

function addNote(index) {
    if (index + selectedNote.len > 16) {
        alert("박자가 마디를 넘어갑니다!"); return;
    }
    // 기존 데이터 삭제 후 삽입
    for(let i=0; i < selectedNote.len; i++) sequence[index + i] = 'skip';
    sequence[index] = { ...selectedNote };
    render();
}

function render() {
    for (let i = 0; i < 16; i++) {
        const el = document.getElementById(`slot-${i}`);
        el.className = 'slot'; el.innerText = '';
        if (sequence[i] && sequence[i] !== 'skip') {
            for(let j=0; j<sequence[i].len; j++) {
                const target = document.getElementById(`slot-${i+j}`);
                target.classList.add(sequence[i].type.includes('r') ? 'rest' : 'filled');
                if(j === 0) target.innerText = sequence[i].type;
            }
        }
    }
}

async function play() {
    const bpm = document.getElementById('bpm').value;
    const stepTime = (60 / bpm) / 4 * 1000; // 16분음표 기준 시간

    for (let i = 0; i < 16; i++) {
        const el = document.getElementById(`slot-${i}`);
        el.style.border = "2px solid red";
        
        if (sequence[i] && sequence[i] !== 'skip') {
            const isRest = sequence[i].type.includes('r');
            playSound(isRest);
        }
        await new Promise(r => setTimeout(r, stepTime));
        el.style.border = "none";
    }
}

document.getElementById('bpm').oninput = (e) => document.getElementById('bpm-val').innerText = e.target.value;
document.getElementById('play-btn').onclick = play;
document.getElementById('reset-btn').onclick = () => { sequence.fill(null); render(); };

initGrid();
