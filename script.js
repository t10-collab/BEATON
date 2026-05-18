const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let sequence = [];
let totalBeats = 0;
let BPM = 88;

const bpmSlider = document.getElementById('bpm-slider');
const bpmValue = document.getElementById('bpm-value');
const progressBar = document.getElementById('progress-bar');

bpmSlider.addEventListener('input', (e) => {
    BPM = parseInt(e.target.value);
    bpmValue.innerText = BPM;
});

// 프로 수준의 드럼 모델링 사운드 엔진 (쿵, 팍, 칫 분리 레이어링)
function playDrumSample(type, startTime) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'kick') { // 4분음표 계열 (중후한 대북/베이스 드럼 소리)
        osc.frequency.setValueAtTime(120, startTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        gain.gain.setValueAtTime(0.8, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
    } 
    else if (type === 'snare') { // 8분음표 계열 (밝고 타격감 강한 스네어 소리)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, startTime);
        gain.gain.setValueAtTime(0.6, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
    } 
    else if (type === 'hihat') { // 16분음표 계열 (날카롭고 얇은 하이햇 금속성 소리)
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(9000, startTime);
        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05);
    }

    osc.start(startTime);
    osc.stop(startTime + 0.4);
}

// 음표 카드 선택 로직
document.querySelectorAll('.note-card').forEach(card => {
    card.onclick = () => {
        const len = parseFloat(card.dataset.len);
        
        // 4박자 박스 칼같이 제한 연산
        if (totalBeats + len > 4.001) {
            alert("⚠️ 4/4박자의 한 마디(4.0박)를 초과할 수 없습니다!");
            return;
        }

        const type = card.dataset.type;
        const icon = card.querySelector('.note-symbol').innerText;
        
        sequence.push({ type, len, icon });
        totalBeats += len;
        render();
    };
});

// 마스터 트랙 렌더링 함수
function render() {
    const container = document.getElementById('rhythm-sequence');
    container.innerHTML = '';
    
    sequence.forEach((note, i) => {
        const div = document.createElement('div');
        div.className = 'placed-card';
        div.id = `note-${i}`;
        div.innerText = note.icon;
        container.appendChild(div);
    });

    const currentRemaining = (4 - totalBeats).toFixed(1);
    document.getElementById('remaining-beats').innerText = currentRemaining;
    
    // 박자 충전 게이지 연동
    const fillPercent = (totalBeats / 4) * 100;
    progressBar.style.width = `${fillPercent}%`;
}

// 핵심 리듬 시퀀싱 연주 연동 로직
async function playRhythm() {
    if (sequence.length === 0) return;
    
    const playBtn = document.getElementById('playBtn');
    const undoBtn = document.getElementById('undoBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    // 연주 도중 조작 잠금 처리
    playBtn.disabled = true;
    undoBtn.disabled = true;
    resetBtn.disabled = true;

    const beatTime = 60 / BPM; 
    let now = audioCtx.currentTime;

    for (let i = 0; i < sequence.length; i++) {
        const note = sequence[i];
        const el = document.getElementById(`note-${i}`);
        
        // 시각적 강조 피드백 스케줄링
        setTimeout(() => el.classList.add('beat-active'), (now - audioCtx.currentTime) * 1000);

        // 음표 타입에 따른 개별 타격 사운드 레이어 매핑
        if (note.type === '4') {
            playDrumSample('kick', now);
        } else if (note.type === '8-8') {
            playDrumSample('snare', now);
            playDrumSample('snare', now + (beatTime / 2));
        } else if (note.type === '16-16') {
            playDrumSample('hihat', now);
            playDrumSample('hihat', now + (beatTime / 4));
        }

        now += note.len * beatTime;
        setTimeout(() => el.classList.remove('beat-active'), (now - audioCtx.currentTime) * 1000);
        
        await new Promise(r => setTimeout(r, note.len * beatTime * 1000));
    }
    
    // 연주 종료 후 제어 해제
    playBtn.disabled = false;
    undoBtn.disabled = false;
    resetBtn.disabled = false;
}

// ↩️ UNDO(되돌리기) 로직 구현
document.getElementById('undoBtn').onclick = () => {
    if (sequence.length === 0) return;
    
    const lastNote = sequence.pop(); // 마지막 요소 추출 및 제거
    totalBeats -= lastNote.len;     // 마지막 박자 수 빼기
    render();
};

document.getElementById('playBtn').onclick = playRhythm;
document.getElementById('resetBtn').onclick = () => {
    sequence = []; 
    totalBeats = 0; 
    render();
};
