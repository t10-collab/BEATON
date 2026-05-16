const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let sequence = [];
let totalBeats = 0;
const BPM = 88;
const BEAT_TIME = 60 / BPM; // 1박자 길이(초)

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

document.querySelectorAll('.note-item').forEach(item => {
    item.onclick = () => {
        const len = parseFloat(item.dataset.len);
        if (totalBeats + len > 4.001) return alert("4박자를 넘길 수 없어요!");

        const type = item.dataset.type;
        const icon = item.querySelector('.note-img').innerText;
        
        sequence.push({ type, len, icon });
        totalBeats += len;
        render();
    };
});

function render() {
    const container = document.getElementById('rhythm-sequence');
    container.innerHTML = '';
    sequence.forEach((note, i) => {
        const div = document.createElement('div');
        div.className = 'placed-note';
        div.id = `note-${i}`;
        div.innerText = note.icon;
        container.appendChild(div);
    });
    document.getElementById('remaining-beats').innerText = (4 - totalBeats).toFixed(1);
}

async function playRhythm() {
    if (sequence.length === 0) return;
    const btn = document.getElementById('playBtn');
    btn.disabled = true;

    let now = audioCtx.currentTime;

    for (let i = 0; i < sequence.length; i++) {
        const note = sequence[i];
        const el = document.getElementById(`note-${i}`);
        
        // 시각적 피드백 (setTimeout으로 처리)
        setTimeout(() => el.classList.add('active-note'), (now - audioCtx.currentTime) * 1000);

        if (note.type === '4') {
            playTick(440, now, 0.1);
        } else if (note.type === '8-8') {
            playTick(440, now, 0.05);
            playTick(440, now + (BEAT_TIME / 2), 0.05);
        } else if (note.type === '8') {
            playTick(440, now, 0.05);
        } else if (note.type === '16-16') {
            playTick(550, now, 0.03);
            playTick(550, now + (BEAT_TIME / 4), 0.03);
        }

        now += note.len * BEAT_TIME;
        setTimeout(() => el.classList.remove('active-note'), (now - audioCtx.currentTime) * 1000);
        
        await new Promise(r => setTimeout(r, note.len * BEAT_TIME * 1000));
    }
    btn.disabled = false;
}

document.getElementById('playBtn').onclick = playRhythm;
document.getElementById('resetBtn').onclick = () => {
    sequence = []; totalBeats = 0; render();
};
