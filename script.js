const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let currentInstrument = 'kick';
let sequence = [null, null, null, null];

// 가상 드럼 사운드 생성기
function playSound(type) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'kick') {
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        gain.gain.setValueAtTime(1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        currentInstrument = 'kick';
    } else if (type === 'snare') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(250, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.8, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        currentInstrument = 'snare';
    } else if (type === 'hihat') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(10000, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        currentInstrument = 'hihat';
    }

    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
}

// 슬롯에 악기 배치
function setSlot(index) {
    const slots = document.querySelectorAll('.slot');
    sequence[index] = currentInstrument;
    
    slots[index].className = 'slot'; // 클래스 초기화
    slots[index].classList.add(`active-${currentInstrument.charAt(0)}`);
    slots[index].innerText = currentInstrument.toUpperCase();
    
    playSound(currentInstrument);
}

// 시퀀스 재생
async function playSequence() {
    for (let i = 0; i < sequence.length; i++) {
        if (sequence[i]) {
            playSound(sequence[i]);
            const slots = document.querySelectorAll('.slot');
            slots[i].style.transform = "scale(1.2)";
            await new Promise(res => setTimeout(res, 500)); // 120 BPM 기준 약 0.5초
            slots[i].style.transform = "scale(1)";
        } else {
            await new Promise(res => setTimeout(res, 500));
        }
    }
}

function resetSequence() {
    sequence = [null, null, null, null];
    const slots = document.querySelectorAll('.slot');
    slots.forEach((slot, i) => {
        slot.className = 'slot';
        slot.innerText = i + 1;
    });
}
