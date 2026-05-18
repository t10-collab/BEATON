// Web Audio API 설정
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let sequence = [];
let totalBeats = 0;
let BPM = 88; // 기본 설정 88

// UI 요소 연결
const bpmSlider = document.getElementById('bpm-slider');
const bpmValue = document.getElementById('bpm-value');
const remainingBeatsDisplay = document.getElementById('remaining-beats');
const rhythmSequenceContainer = document.getElementById('rhythm-sequence');

// 슬라이더 조작 시 실시간으로 속도 변수 업데이트
bpmSlider.addEventListener('input', (e) => {
    BPM = parseInt(e.target.value);
    bpmValue.innerText = BPM;
});

// 주파수 가음원 발생 함수 (리듬 타격음)
function playTick(freq, startTime, duration) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    
    gain.gain.setValueAtTime(0.5, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
}

// 음표 버튼 클릭 시 창작판에 리듬 추가
document.querySelectorAll('.note-item').forEach(item => {
    item.onclick = () => {
        const len = parseFloat(item.dataset.len);
        
        // 4박자(4/4) 규칙 엄격 적용
        if (totalBeats + len > 4.001) {
            return alert("4박자를 넘길 수 없습니다! 리듬을 조절해 주세요.");
        }

        const type = item.dataset.type;
        const icon = item.querySelector('.note-img').innerText;
        
        sequence.push({ type, len, icon });
        totalBeats += len;
        render();
    };
});

// 화면에 리듬 노트들 업데이트
function render() {
    rhythmSequenceContainer.innerHTML = '';
    sequence.forEach((note, i) => {
        const div = document.createElement('div');
        div.className = 'placed-note';
        div.id = `note-${i}`;
        div.innerText = note.icon;
        rhythmSequenceContainer.appendChild(div);
    });
    // 남은 박수를 소수점 첫째자리까지 표시
    remainingBeatsDisplay.innerText = (4 - totalBeats).toFixed(1);
}

// 오디오 스케줄링 및 동기식 재생 기능
async function playRhythm() {
    if (sequence.length === 0) return;
    const btn = document.getElementById('playBtn');
    btn.disabled = true;

    // 현재 설정된 BPM 기준 1박자 시간(초) 환산
    const beatTime = 60 / BPM; 
    let now = audioCtx.currentTime;

    for (let i = 0; i < sequence.length; i++) {
        const note = sequence[i];
        const el = document.getElementById(`note-${i}`);
        
        // 사운드가 시작되는 정확한 타이밍에 노란색 시각 피드백 추가
        setTimeout(() => el.classList.add('active-note'), (now - audioCtx.currentTime) * 1000);

        if (note.type === '4') {
            playTick(440, now, 0.1); // 기본 타격음
        } else if (note.type === '8') {
            playTick(440, now, 0.05); // 8분음표 1개 짧게
        } else if (note.type === '8-8') {
            playTick(440, now, 0.05); // 첫 번째 은표
            playTick(440, now + (beatTime / 2), 0.05); // 0.5박 뒤 두 번째 은표
        } else if (note.type === '16-16') {
            playTick(550, now, 0.03); // 16분음표는 살짝 높은 음으로 구분
            playTick(550, now + (beatTime / 4), 0.03); // 0.25박 뒤 두 번째 은표
        }

        now += note.len * beatTime;
        // 음표의 길이가 끝나면 불빛 제거
        setTimeout(() => el.classList.remove('active-note'), (now - audioCtx.currentTime) * 1000);
        
        // 자바스크립트 대기 로직 적용
        await new Promise(r => setTimeout(r, note.len * beatTime * 1000));
    }
    btn.disabled = false;
}

// 컨트롤 버튼 리스너 바인딩
document.getElementById('playBtn').onclick = playRhythm;
document.getElementById('resetBtn').onclick = () => {
    sequence = [];
    totalBeats = 0;
    render();
};
