const context = new AudioContext();

let contatore = 1;
let bpm = 60;
let battitiPerMisura = 4;
let suddivisione = 1;
let indiceSuddivisione = 1;

let battereAttivo = true;
let coloriAttivi = true;
let metronomoAttivo = false;
let avvioCorrente = 0;

let schedulerInterval = null;
let timeoutAnimazione;
let timeoutIlluminazione;

let nextNoteTime = 0;
let currentBeatNumber = 1;
let currentSubdivision = 1;

const lookahead = 25; // ms: ogni quanto gira lo scheduler
const scheduleAheadTime = 0.1; // sec: quanto avanti schedulare

const metronomeToggleBtn = document.getElementById('metronomeToggleBtn');
const metronomoBox = document.querySelector('.metronomo');
const bpmSlider = document.getElementById('bpmSlider');
const bpmInput = document.getElementById('bpmInput');
const bpmValue = document.getElementById('bpmValue');
const contatoreVisivo = document.getElementById('contatoreVisivo');
const sottoContatoreVisivo = document.getElementById('sottoContatoreVisivo');
const timeSignature = document.getElementById('timeSignature');
const accentoToggle = document.getElementById('accentoToggle');
const coloriToggle = document.getElementById('coloriToggle');
const subdivisionSelect = document.getElementById('subdivisionSelect');

function aggiornaVisualeBpm(nuovoBpm) {
    bpm = Number(nuovoBpm);
    bpmSlider.value = bpm;
    bpmInput.value = bpm;
    bpmValue.textContent = bpm;
}

function aggiornaTempo(nuovoTempo) {
    battitiPerMisura = Number(nuovoTempo);
    timeSignature.value = battitiPerMisura;

    if (contatore > battitiPerMisura) {
        contatore = 1;
    }

    aggiornaDisplayConteggio();
}

function aggiornaSuddivisione(nuovaSuddivisione) {
    suddivisione = Number(nuovaSuddivisione);
    subdivisionSelect.value = suddivisione;

    if (indiceSuddivisione > suddivisione) {
        indiceSuddivisione = 1;
    }

    aggiornaDisplayConteggio();
}

function aggiornaDisplayConteggio() {
    contatoreVisivo.textContent = contatore;
    sottoContatoreVisivo.textContent = '';
}

function aggiornaContatoreVisivo(inizioBattito) {
    aggiornaDisplayConteggio();

    if (!inizioBattito) return;

    contatoreVisivo.classList.remove('attivo');
    void contatoreVisivo.offsetWidth;
    contatoreVisivo.classList.add('attivo');

    clearTimeout(timeoutAnimazione);
    timeoutAnimazione = setTimeout(() => {
        contatoreVisivo.classList.remove('attivo');
    }, 120);
}

function illuminaRiquadro(inizioBattito) {
    if (!coloriAttivi) {
        metronomoBox.classList.remove('attivo-battere', 'attivo-tempo');
        return;
    }

    let classeAttiva = '';
    let durataIlluminazione = 0;

    if (inizioBattito && contatore === 1) {
        classeAttiva = 'attivo-battere';
        durataIlluminazione = 250;
    } else if (inizioBattito) {
        classeAttiva = 'attivo-tempo';
        durataIlluminazione = 150;
    }

    metronomoBox.classList.remove('attivo-battere', 'attivo-tempo');

    if (!classeAttiva) return;

    void metronomoBox.offsetWidth;
    metronomoBox.classList.add(classeAttiva);

    clearTimeout(timeoutIlluminazione);
    timeoutIlluminazione = setTimeout(() => {
        metronomoBox.classList.remove('attivo-battere', 'attivo-tempo');
    }, durataIlluminazione);
}

function riproduciColpoSchedulato(frequenza, volumePicco, when) {
    const oscillatore = context.createOscillator();
    const gainNode = context.createGain();
    const durataStep = 60 / (bpm * suddivisione);
    const attack = 0.004;
    const durataSuono = Math.min(0.11, Math.max(0.045, durataStep * 0.55));
    const stopTime = when + durataSuono;

    oscillatore.type = 'sine';
    oscillatore.frequency.setValueAtTime(frequenza, when);

    gainNode.gain.setValueAtTime(0.0001, when);
    gainNode.gain.exponentialRampToValueAtTime(volumePicco, when + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, stopTime);

    oscillatore.connect(gainNode).connect(context.destination);
    oscillatore.start(when);
    oscillatore.stop(stopTime + 0.01);

    oscillatore.addEventListener('ended', () => {
        oscillatore.disconnect();
        gainNode.disconnect();
    }, { once: true });
}

function scheduleBeat(when, beatNumber, subdivisionNumber) {
    const inizioBattito = subdivisionNumber === 1;

    if (inizioBattito && battereAttivo && beatNumber === 1) {
        riproduciColpoSchedulato(880, 0.22, when);
    } else if (inizioBattito) {
        riproduciColpoSchedulato(440, 0.18, when);
    } else {
        riproduciColpoSchedulato(330, 0.12, when);
    }

    const delayMs = Math.max(0, (when - context.currentTime) * 1000);

    setTimeout(() => {
        if (!metronomoAttivo) return;

        contatore = beatNumber;
        indiceSuddivisione = subdivisionNumber;

        aggiornaContatoreVisivo(inizioBattito);
        illuminaRiquadro(inizioBattito);
    }, delayMs);
}

function advanceNote() {
    const secondsPerStep = 60 / (bpm * suddivisione);
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

async function avviaMetronomo() {
    const idAvvio = ++avvioCorrente;

    metronomoAttivo = true;
    aggiornaBottoneMetronomo();
    fermaScheduler();

    await context.resume();

    if (!metronomoAttivo || idAvvio !== avvioCorrente) return;

    nextNoteTime = context.currentTime + 0.05;
    currentBeatNumber = contatore;
    currentSubdivision = indiceSuddivisione;

    scheduler();
    schedulerInterval = setInterval(scheduler, lookahead);
}

function fermaMetronomo() {
    metronomoAttivo = false;
    avvioCorrente++;
    fermaScheduler();

    clearTimeout(timeoutAnimazione);
    clearTimeout(timeoutIlluminazione);

    contatore = 1;
    indiceSuddivisione = 1;
    currentBeatNumber = 1;
    currentSubdivision = 1;

    aggiornaDisplayConteggio();
    contatoreVisivo.classList.remove('attivo');
    metronomoBox.classList.remove('attivo-battere', 'attivo-tempo');
    aggiornaBottoneMetronomo();
}

function applicaBpmDaInput() {
    const valoreInserito = bpmInput.value.trim();

    if (valoreInserito === '') {
        bpmInput.value = bpm;
        bpmValue.textContent = bpm;
        return;
    }

    let nuovoBpm = Number(valoreInserito);

    if (Number.isNaN(nuovoBpm)) {
        bpmInput.value = bpm;
        bpmValue.textContent = bpm;
        return;
    }

    nuovoBpm = Math.round(nuovoBpm);

    if (nuovoBpm < 30) nuovoBpm = 30;
    if (nuovoBpm > 250) nuovoBpm = 250;

    aggiornaVisualeBpm(nuovoBpm);

    if (metronomoAttivo) {
        nextNoteTime = context.currentTime + 0.05;
    }
}

bpmSlider.addEventListener('input', () => {
    aggiornaVisualeBpm(bpmSlider.value);

    if (metronomoAttivo) {
        nextNoteTime = context.currentTime + 0.05;
    }
});

bpmInput.addEventListener('input', () => {
    const soloCifre = bpmInput.value.replace(/\D/g, '');

    if (bpmInput.value !== soloCifre) {
        bpmInput.value = soloCifre;
    }

    if (soloCifre === '') return;

    const nuovoBpm = Number(soloCifre);

    if (!Number.isNaN(nuovoBpm)) {
        bpmValue.textContent = Math.round(nuovoBpm);
    }
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

timeSignature.addEventListener('change', () => {
    aggiornaTempo(timeSignature.value);

    if (metronomoAttivo) {
        currentBeatNumber = Math.min(currentBeatNumber, battitiPerMisura);
    }
});

accentoToggle.addEventListener('change', () => {
    battereAttivo = accentoToggle.checked;
});

coloriToggle.addEventListener('change', () => {
    coloriAttivi = coloriToggle.checked;
    clearTimeout(timeoutIlluminazione);
    metronomoBox.classList.remove('attivo-battere', 'attivo-tempo');
});

subdivisionSelect.addEventListener('change', () => {
    aggiornaSuddivisione(subdivisionSelect.value);

    if (metronomoAttivo) {
        currentSubdivision = 1;
        nextNoteTime = context.currentTime + 0.05;
    }
});

metronomeToggleBtn.addEventListener('click', () => {
    if (metronomoAttivo) {
        fermaMetronomo();
        return;
    }

    avviaMetronomo();
});

aggiornaVisualeBpm(bpm);
aggiornaTempo(battitiPerMisura);
aggiornaSuddivisione(suddivisione);
aggiornaBottoneMetronomo();