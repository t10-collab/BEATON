const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let selectedNote = '4n'; // 기본 선택: 4분음표
let selectedInstrument = 'kick';
const totalSlots = 8;
let sequence = new Array(totalSlots).fill(null);

// 가상 악기 소리
function playSound(type) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);

    if (type === 'kick') {
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    } else if (type === 'snare') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(250, audioCtx.currentTime);
    } else if (type === 'hihat') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(8000, audioCtx.currentTime);
    }
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}

// 초기 슬롯 생성
const container = document.getElementById('slotsContainer');
function createSlots() {
    container.innerHTML = '';
    for (let i = 0; i < totalSlots; i++) {
        const div = document.createElement('div');
        div.className = 'slot';
        div.innerText = i + 1;
        div.onclick = () => addNoteToSequence(i);
        container.appendChild(div);
    }
}

// 음표 선택 이벤트
document.querySelectorAll('.note-btn').forEach(btn => {
    btn.onclick = (e) => {
        document.querySelectorAll('.note-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        selectedNote = e.target.dataset.type;
    };
});

// 악기 패드 클릭 시 악기 변경 및 소리 확인
document.getElementById('kickPad').onclick = () => { selectedInstrument = 'kick'; playSound('kick'); };
document.getElementById('snarePad').onclick = () => { selectedInstrument = 'snare'; playSound('snare'); };
document.getElementById('hihatPad').onclick = () => { selectedInstrument = 'hihat'; playSound('hihat'); };

// 리듬 배치 로직
function addNoteToSequence(index) {
    let duration = 1;
    if (selectedNote === '4n') duration = 2;
    else if (selectedNote === '4n.') duration = 3;

    if (index + duration > totalSlots) {
        alert("박자가 넘어갑니다!"); return;
    }

    // 기존 데이터 초기화 및 새 데이터 삽입
    for (let i = index; i < index + duration; i++) sequence[i] = 'skip';
    sequence[index] = { inst: selectedInstrument, dur: duration };
    updateUI();
}

function updateUI() {
    const slots = document.querySelectorAll('.slot');
    slots.forEach(s => { s.className = 'slot'; s.innerText = ''; });

    sequence.forEach((data, i) => {
        if (data && data !== 'skip') {
            for (let j = 0; j < data.dur; j++) {
                slots[i + j].classList.add('occupied', data.inst.charAt(0));
                if (j === 0) slots[i + j].innerText = data.inst === 'kick' ? '쿵' : data.inst === 'snare' ? '팍' : '칫';
            }
        }
    });
}

async function playSequence() {
    const slots = document.querySelectorAll('.slot');
    for (let i = 0; i < totalSlots; i++) {
        slots[i].style.filter = "brightness(1.5)";
        if (sequence[i] && sequence[i] !== 'skip') {
            playSound(sequence[i].inst);
        }
        await new Promise(res => setTimeout(res, 250)); // 8분음표 간격 (약 120BPM)
        slots[i].style.filter = "none";
    }
}

document.getElementById('playBtn').onclick = playSequence;
document.getElementById('resetBtn').onclick = () => { sequence.fill(null); updateUI(); };

createSlots();
