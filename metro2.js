const context = new AudioContext();

let contatore = 1;
let bpm = 60;
let battitiPerMisura = 4;
let denominatore = 4; // 4 = quarter note, 8 = eighth note
let suddivisione = 1;

let battereAttivo = true;
let coloriAttivi = true;
let metronomoAttivo = false;
let avvioCorrente = 0;
let metronomeVolume = 0.55;

// beatMuted[i] = true means beat i+1 is silenced (0-indexed)
let beatMuted = [];

let schedulerInterval = null;
let uiTimeouts = [];
let scheduledUiEvents = [];
let uiFrameId = null;

let nextNoteTime = 0;
let currentBeatNumber = 1;
let currentSubdivision = 1;

const lookahead = 20;          // ms
const scheduleAheadTime = 0.12; // sec
const uiFrameLookaheadMs = 8;
const visualAnticipoMs = 22;

const metronomeToggleBtn = document.getElementById('metronomeToggleBtn');
const metronomoBox = document.querySelector('.metronomo');
const bpmSlider = document.getElementById('bpmSlider');
const bpmInput = document.getElementById('bpmInput');
const bpmValue = document.getElementById('bpmValue');
const contatoreVisivo = document.getElementById('contatoreVisivo');
const timeSigNumerator = document.getElementById('timeSigNumerator');
const timeSigDenominator = document.getElementById('timeSigDenominator');
const accentoToggle = document.getElementById('accentoToggle');
const coloriToggle = document.getElementById('coloriToggle');
const subdivisionSelect = document.getElementById('subdivisionSelect');
const metronomeVolumeSlider = document.getElementById('metronomeVolume');
const metronomeVolumeValue = document.getElementById('metronomeVolumeValue');
const beatMuteGrid = document.getElementById('beatMuteGrid');

function aggiornaVisualeBpm(nuovoBpm) {
    bpm = Number(nuovoBpm);
    bpmSlider.value = bpm;
    bpmInput.value = bpm;
    bpmValue.textContent = bpm;
}


function getSecondsPerStep() {
    // denominator relative to quarter note (4): /2=2x, /4=1x, /8=0.5x, /16=0.25x
    const baseStep = 60 / bpm;
    const denomFactor = 4 / denominatore;
    return (baseStep * denomFactor) / suddivisione;
}

function renderBeatMuteGrid() {
    beatMuteGrid.innerHTML = '';

    for (let i = 0; i < battitiPerMisura; i++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'beat-mute-btn' + (beatMuted[i] ? ' beat-muted' : '');
        btn.textContent = i + 1;
        btn.setAttribute('aria-pressed', beatMuted[i] ? 'true' : 'false');
        btn.dataset.beat = i;

        btn.addEventListener('click', () => {
            beatMuted[i] = !beatMuted[i];
            btn.classList.toggle('beat-muted', beatMuted[i]);
            btn.setAttribute('aria-pressed', beatMuted[i] ? 'true' : 'false');
        });

        beatMuteGrid.appendChild(btn);
    }
}

function aggiornaTempo() {
    battitiPerMisura = Number(timeSigNumerator.value);
    denominatore = Number(timeSigDenominator.value);

    if (contatore > battitiPerMisura) {
        contatore = 1;
    }

    if (currentBeatNumber > battitiPerMisura) {
        currentBeatNumber = 1;
    }

    // Reset beat muted array to match new beat count (preserve existing, fill new with false)
    beatMuted = Array.from({ length: battitiPerMisura }, (_, i) => beatMuted[i] || false);
    renderBeatMuteGrid();
    aggiornaDisplayConteggio();
}

function aggiornaSuddivisione(nuovaSuddivisione) {
    suddivisione = Number(nuovaSuddivisione);
    subdivisionSelect.value = suddivisione;

    if (currentSubdivision > suddivisione) {
        currentSubdivision = 1;
    }

    aggiornaDisplayConteggio();
}

function aggiornaDisplayConteggio() {
    contatoreVisivo.textContent = contatore;
}

function aggiornaVolumeMetronomo(valore) {
    const normalized = Math.max(0, Math.min(100, Number(valore))) / 100;
    metronomeVolume = normalized;
    metronomeVolumeSlider.value = Math.round(normalized * 100);
    metronomeVolumeValue.textContent = `${Math.round(normalized * 100)}%`;
}

function getMetronomeVolumeScalar() {
    return metronomeVolume;
}

function resetUIState() {
    contatoreVisivo.classList.remove('attivo');
    metronomoBox.classList.remove('attivo-battere', 'attivo-tempo');
}

function clearAllUiTimeouts() {
    uiTimeouts.forEach(clearTimeout);
    uiTimeouts = [];
}

function clearScheduledUiEvents() {
    scheduledUiEvents = [];
}

function stopUiLoop() {
    if (uiFrameId !== null) {
        cancelAnimationFrame(uiFrameId);
        uiFrameId = null;
    }
}

function triggerContatoreAnimation() {
    contatoreVisivo.classList.remove('attivo');
    void contatoreVisivo.offsetWidth;
    contatoreVisivo.classList.add('attivo');

    const t = setTimeout(() => {
        contatoreVisivo.classList.remove('attivo');
    }, 120);

    uiTimeouts.push(t);
}

function triggerBoxLight(isFirstBeat) {
    if (!coloriAttivi) {
        metronomoBox.classList.remove('attivo-battere', 'attivo-tempo');
        return;
    }

    metronomoBox.classList.remove('attivo-battere', 'attivo-tempo');

    const className = isFirstBeat ? 'attivo-battere' : 'attivo-tempo';
    const duration = isFirstBeat ? 250 : 150;

    void metronomoBox.offsetWidth;
    metronomoBox.classList.add(className);

    const t = setTimeout(() => {
        metronomoBox.classList.remove('attivo-battere', 'attivo-tempo');
    }, duration);

    uiTimeouts.push(t);
}

function riproduciColpoSchedulato(frequenza, volumePicco, when) {
    const oscillatore = context.createOscillator();
    const gainNode = context.createGain();

    const durataStep = getSecondsPerStep();
    const attack = 0.003;
    const durataSuono = Math.min(0.09, Math.max(0.035, durataStep * 0.45));
    const stopTime = when + durataSuono;

    oscillatore.type = 'sawtooth';
    oscillatore.frequency.setValueAtTime(frequenza, when);

    gainNode.gain.setValueAtTime(0.0001, when);
    gainNode.gain.exponentialRampToValueAtTime(
        Math.max(0.0001, volumePicco * getMetronomeVolumeScalar()),
        when + attack
    );
    gainNode.gain.exponentialRampToValueAtTime(0.0001, stopTime);

    oscillatore.connect(gainNode);
    gainNode.connect(context.destination);

    oscillatore.start(when);
    oscillatore.stop(stopTime + 0.01);

    oscillatore.addEventListener('ended', () => {
        oscillatore.disconnect();
        gainNode.disconnect();
    }, { once: true });
}

function getPerformanceTimeForAudioTime(audioTime) {
    if (typeof context.getOutputTimestamp === 'function') {
        const timestamp = context.getOutputTimestamp();

        if (
            Number.isFinite(timestamp?.contextTime) &&
            Number.isFinite(timestamp?.performanceTime)
        ) {
            return timestamp.performanceTime + ((audioTime - timestamp.contextTime) * 1000);
        }
    }

    return performance.now() + ((audioTime - context.currentTime) * 1000);
}

function processScheduledUiEvent(beatNumber, subdivisionNumber) {
    const inizioBattito = subdivisionNumber === 1;
    const isFirstBeat = inizioBattito && beatNumber === 1;

    if (!metronomoAttivo) {
        return;
    }

    contatore = beatNumber;
    contatoreVisivo.textContent = beatNumber;

    if (inizioBattito) {
        triggerContatoreAnimation();
        triggerBoxLight(isFirstBeat);
    } else if (coloriAttivi) {
        metronomoBox.classList.remove('attivo-battere', 'attivo-tempo');
    }
}

function runUiLoop(now) {
    while (scheduledUiEvents.length > 0 && scheduledUiEvents[0].targetTime <= now + uiFrameLookaheadMs) {
        const evento = scheduledUiEvents.shift();

        if (!evento || evento.avvioId !== avvioCorrente) {
            continue;
        }

        processScheduledUiEvent(evento.beatNumber, evento.subdivisionNumber);
    }

    if (!metronomoAttivo && scheduledUiEvents.length === 0) {
        uiFrameId = null;
        return;
    }

    uiFrameId = requestAnimationFrame(runUiLoop);
}

function ensureUiLoop() {
    if (uiFrameId === null) {
        uiFrameId = requestAnimationFrame(runUiLoop);
    }
}

function aggiornaUiSchedulata(when, beatNumber, subdivisionNumber) {
    scheduledUiEvents.push({
        avvioId: avvioCorrente,
        beatNumber,
        subdivisionNumber,
        targetTime: getPerformanceTimeForAudioTime(when) - visualAnticipoMs
    });

    ensureUiLoop();
}

function scheduleBeat(when, beatNumber, subdivisionNumber) {
    const inizioBattito = subdivisionNumber === 1;
    const isMuted = beatMuted[beatNumber - 1];

    if (!isMuted) {
        if (inizioBattito && battereAttivo && beatNumber === 1) {
            riproduciColpoSchedulato(1760, 0.98, when);
        } else if (inizioBattito) {
            riproduciColpoSchedulato(880, 0.82, when);
        } else {
            riproduciColpoSchedulato(660, 0.54, when);
        }
    }

    aggiornaUiSchedulata(when, beatNumber, subdivisionNumber);
}

function advanceNote() {
    const secondsPerStep = getSecondsPerStep();
    nextNoteTime += secondsPerStep;

    if (currentSubdivision === suddivisione) {
        currentSubdivision = 1;
        currentBeatNumber = (currentBeatNumber % battitiPerMisura) + 1;
    } else {
        currentSubdivision++;
    }
}

function scheduler() {
    while (nextNoteTime < context.currentTime + scheduleAheadTime) {
        scheduleBeat(nextNoteTime, currentBeatNumber, currentSubdivision);
        advanceNote();
    }
}

function fermaScheduler() {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
}

function aggiornaBottoneMetronomo() {
    metronomeToggleBtn.value = metronomoAttivo ? 'Spegni metronomo' : 'Accendi metronomo';
}

function riallineaClock() {
    nextNoteTime = context.currentTime + 0.06;
}

async function avviaMetronomo() {
    const idAvvio = ++avvioCorrente;

    metronomoAttivo = true;
    aggiornaBottoneMetronomo();
    fermaScheduler();
    clearAllUiTimeouts();
    clearScheduledUiEvents();
    stopUiLoop();
    resetUIState();

    await context.resume();

    if (!metronomoAttivo || idAvvio !== avvioCorrente) return;

    currentBeatNumber = contatore;
    currentSubdivision = 1;
    riallineaClock();

    scheduler();
    schedulerInterval = setInterval(scheduler, lookahead);
}

function fermaMetronomo() {
    metronomoAttivo = false;
    avvioCorrente++;

    fermaScheduler();
    clearAllUiTimeouts();
    clearScheduledUiEvents();
    stopUiLoop();

    contatore = 1;
    currentBeatNumber = 1;
    currentSubdivision = 1;

    aggiornaDisplayConteggio();
    resetUIState();
    aggiornaBottoneMetronomo();
}

function clampBpm(valore) {
    let nuovoBpm = Math.round(Number(valore));

    if (Number.isNaN(nuovoBpm)) return bpm;
    if (nuovoBpm < 30) nuovoBpm = 30;
    if (nuovoBpm > 250) nuovoBpm = 250;

    return nuovoBpm;
}

function applicaBpmDaInput() {
    const valoreInserito = bpmInput.value.trim();

    if (valoreInserito === '') {
        bpmInput.value = bpm;
        bpmValue.textContent = bpm;
        return;
    }

    const nuovoBpm = clampBpm(valoreInserito);
    aggiornaVisualeBpm(nuovoBpm);

    if (metronomoAttivo) {
        riallineaClock();
    }
}

bpmSlider.addEventListener('input', () => {
    aggiornaVisualeBpm(clampBpm(bpmSlider.value));

    if (metronomoAttivo) {
        riallineaClock();
    }
});

bpmInput.addEventListener('input', () => {
    const soloCifre = bpmInput.value.replace(/\D/g, '');

    if (bpmInput.value !== soloCifre) {
        bpmInput.value = soloCifre;
    }

    if (soloCifre === '') return;

    bpmValue.textContent = clampBpm(soloCifre);
});

bpmInput.addEventListener('focus', () => {
    bpmInput.select();
});

bpmInput.addEventListener('change', applicaBpmDaInput);
bpmInput.addEventListener('blur', applicaBpmDaInput);

bpmInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        applicaBpmDaInput();
        bpmInput.blur();
    }
});

function onTimeSigChange() {
    aggiornaTempo();

    if (metronomoAttivo) {
        riallineaClock();
    }
}

timeSigNumerator.addEventListener('change', onTimeSigChange);
timeSigDenominator.addEventListener('change', onTimeSigChange);

accentoToggle.addEventListener('change', () => {
    battereAttivo = accentoToggle.checked;
});

coloriToggle.addEventListener('change', () => {
    coloriAttivi = coloriToggle.checked;
    resetUIState();
});

subdivisionSelect.addEventListener('change', () => {
    aggiornaSuddivisione(subdivisionSelect.value);

    if (metronomoAttivo) {
        currentSubdivision = 1;
        riallineaClock();
    }
});

metronomeVolumeSlider.addEventListener('input', () => {
    aggiornaVolumeMetronomo(metronomeVolumeSlider.value);
});

metronomeToggleBtn.addEventListener('click', () => {
    if (metronomoAttivo) {
        fermaMetronomo();
    } else {
        avviaMetronomo();
    }
});

aggiornaVisualeBpm(bpm);
aggiornaTempo();
aggiornaSuddivisione(suddivisione);
aggiornaVolumeMetronomo(metronomeVolumeSlider.value);
aggiornaBottoneMetronomo();
