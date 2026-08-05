const droneToggleBtn = document.getElementById('droneToggleBtn');
const droneClearBtn = document.getElementById('droneClearBtn');
const droneVolumeSlider = document.getElementById('droneVolume');
const droneVolumeValueEl = document.getElementById('droneVolumeValue');
const droneStatusEl = document.getElementById('droneStatus');
const droneReferenceSelect = document.getElementById('tuningReference');
const droneCircleEl = document.getElementById('droneCircle');
const droneActiveNotesEl = document.getElementById('droneActiveNotes');
const droneOctaveDownBtn = document.getElementById('droneOctaveDown');
const droneOctaveUpBtn = document.getElementById('droneOctaveUp');
const droneOctaveDisplayEl = document.getElementById('droneOctaveDisplay');

const DRONE_NOTE_LABELS = ['Do', 'Do#/Reb', 'Re', 'Re#/Mib', 'Mi', 'Fa', 'Fa#/Solb', 'Sol', 'Sol#/Lab', 'La', 'La#/Sib', 'Si'];
const DRONE_NOTE_KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const DRONE_IS_SHARP = [false, true, false, true, false, false, true, false, true, false, true, false];

// activeNotes: Set of strings like "C-3", "A#-4"
const activeNotes = new Set();

let currentOctave = 3;
let droneAudioContext = null;
let droneMasterGain = null;
let droneLayer = null;
let droneActive = false;
let droneTuningA4 = Number(droneReferenceSelect?.value) || 440;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function midiToFrequency(midi) {
    return droneTuningA4 * Math.pow(2, (midi - 69) / 12);
}

function noteKeyToMidi(noteKey, octave) {
    const semitone = DRONE_NOTE_KEYS.indexOf(noteKey);
    return ((octave + 1) * 12) + semitone;
}

function noteIdToMidi(noteId) {
    const dashIdx = noteId.indexOf('-');
    const key = noteId.slice(0, dashIdx);
    const oct = Number(noteId.slice(dashIdx + 1));
    return noteKeyToMidi(key, oct);
}

function noteIdToLabel(noteId) {
    const dashIdx = noteId.indexOf('-');
    const key = noteId.slice(0, dashIdx);
    const oct = Number(noteId.slice(dashIdx + 1));
    const label = DRONE_NOTE_LABELS[DRONE_NOTE_KEYS.indexOf(key)];
    return `${label}${oct}`;
}

function getFrequencyCompensation(frequency) {
    if (frequency <= 220) {
        return clamp(1.15 + Math.pow(220 / frequency, 0.42) * 0.75, 1.15, 2.35);
    }
    return clamp(Math.pow(220 / frequency, 0.18), 0.88, 1.08);
}

function getDroneMasterVolume() {
    const normalized = Number(droneVolumeSlider.value) / 100;
    const shaped = Math.pow(clamp(normalized, 0, 1), 1.8);
    return Math.max(0.0001, shaped * 0.62);
}

async function ensureDroneAudio() {
    if (!droneAudioContext) {
        droneAudioContext = new AudioContext({ latencyHint: 'interactive' });
        droneMasterGain = droneAudioContext.createGain();
        droneMasterGain.gain.value = 0.0001;
        droneMasterGain.connect(droneAudioContext.destination);
    }
    await droneAudioContext.resume();
}

function stopDroneLayer(layer, fadeMs = 90) {
    if (!layer || !droneAudioContext) return;

    const now = droneAudioContext.currentTime;
    const stopAt = now + (fadeMs / 1000);
    const currentGain = Math.max(layer.output.gain.value, 0.0001);

    layer.output.gain.cancelScheduledValues(now);
    layer.output.gain.setValueAtTime(currentGain, now);
    layer.output.gain.exponentialRampToValueAtTime(0.0001, stopAt);

    layer.oscillators.forEach((oscillator) => {
        oscillator.stop(stopAt + 0.02);
        oscillator.addEventListener('ended', () => {
            try { oscillator.disconnect(); } catch (e) { /* ignore */ }
        }, { once: true });
    });

    setTimeout(() => {
        try { layer.output.disconnect(); } catch (e) { /* ignore */ }
    }, fadeMs + 80);
}

function buildDroneLayer() {
    const now = droneAudioContext.currentTime;
    const entries = [...activeNotes].map((noteId) => {
        const midi = noteIdToMidi(noteId);
        return { noteId, midi, frequency: midiToFrequency(midi) };
    });

    if (!entries.length) return null;

    const output = droneAudioContext.createGain();
    const oscillators = [];
    const rawWeights = entries.map((e) => getFrequencyCompensation(e.frequency));
    const totalWeight = rawWeights.reduce((sum, v) => sum + v, 0) || 1;

    output.gain.setValueAtTime(0.0001, now);
    output.connect(droneMasterGain);

    entries.forEach((entry, index) => {
        const oscillator = droneAudioContext.createOscillator();
        const voiceGain = droneAudioContext.createGain();
        const normalizedGain = (rawWeights[index] / totalWeight) * 0.92;

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(entry.frequency, now);
        voiceGain.gain.setValueAtTime(normalizedGain, now);
        oscillator.connect(voiceGain);
        voiceGain.connect(output);
        oscillator.start(now);
        oscillators.push(oscillator);
    });

    output.gain.exponentialRampToValueAtTime(1, now + 0.08);
    return { output, oscillators };
}

function applyDroneVolume() {
    droneVolumeValueEl.textContent = `${droneVolumeSlider.value}%`;

    if (!droneMasterGain || !droneAudioContext) return;

    const now = droneAudioContext.currentTime;
    const target = getDroneMasterVolume();
    const currentGain = Math.max(droneMasterGain.gain.value, 0.0001);

    droneMasterGain.gain.cancelScheduledValues(now);
    droneMasterGain.gain.setValueAtTime(currentGain, now);
    droneMasterGain.gain.exponentialRampToValueAtTime(target, now + 0.05);
}

function refreshDroneLayer() {
    if (!droneActive || !droneAudioContext) return;

    const previousLayer = droneLayer;

    if (activeNotes.size > 0) {
        droneLayer = buildDroneLayer();
        applyDroneVolume();
    } else {
        droneLayer = null;
    }

    stopDroneLayer(previousLayer);
    updateDroneStatus();
}

function updateDroneStatus() {
    if (!droneActive) {
        droneStatusEl.textContent = 'Drone spento.';
        return;
    }

    if (activeNotes.size === 0) {
        droneStatusEl.textContent = 'Drone attivo — seleziona una nota.';
        return;
    }

    const labels = [...activeNotes].map(noteIdToLabel).join(', ');
    droneStatusEl.textContent = `Drone: ${labels}`;
}

function updateDroneButton() {
    droneToggleBtn.textContent = droneActive ? 'Spegni drone' : 'Accendi drone';
}

function updateOctaveDisplay() {
    droneOctaveDisplayEl.textContent = currentOctave;
    droneOctaveDownBtn.disabled = currentOctave <= 1;
    droneOctaveUpBtn.disabled = currentOctave >= 7;
}

function updateActiveNotesDisplay() {
    droneActiveNotesEl.innerHTML = '';

    if (activeNotes.size === 0) {
        droneActiveNotesEl.textContent = '';
        return;
    }

    const sorted = [...activeNotes].sort((a, b) => noteIdToMidi(a) - noteIdToMidi(b));

    sorted.forEach((noteId) => {
        const chip = document.createElement('span');
        chip.className = 'drone-active-chip';
        chip.textContent = noteIdToLabel(noteId);
        chip.addEventListener('click', () => {
            activeNotes.delete(noteId);
            renderCircleButtons();
            updateActiveNotesDisplay();
            refreshDroneLayer();
        });
        droneActiveNotesEl.appendChild(chip);
    });
}

function renderCircleButtons() {
    droneCircleEl.innerHTML = '';
    const total = 12;
    const radius = 42; // % of container

    DRONE_NOTE_KEYS.forEach((key, index) => {
        const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);
        const noteId = `${key}-${currentOctave}`;
        const isActive = activeNotes.has(noteId);
        const isSharp = DRONE_IS_SHARP[index];
        const label = DRONE_NOTE_LABELS[index];

        const labelParts = label.split('/');
        const labelMain = labelParts[0];
        const labelAlt = labelParts[1] || null;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'drone-circle-btn' +
            (isActive ? ' drone-circle-btn--active' : '');
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        btn.setAttribute('aria-label', `${label} ottava ${currentOctave}`);
        btn.innerHTML = labelAlt
            ? `<span class="dcb-name">${labelMain}<br><span class="dcb-alt">${labelAlt}</span></span>`
            : `<span class="dcb-name">${labelMain}</span>`;
        btn.style.left = `${x}%`;
        btn.style.top = `${y}%`;

        btn.addEventListener('click', () => {
            if (activeNotes.has(noteId)) {
                activeNotes.delete(noteId);
            } else {
                activeNotes.add(noteId);
            }
            renderCircleButtons();
            updateActiveNotesDisplay();
            refreshDroneLayer();
        });

        droneCircleEl.appendChild(btn);
    });
}

async function startDrone() {
    if (droneActive) return;

    try {
        await ensureDroneAudio();
        droneActive = true;

        if (activeNotes.size > 0) {
            droneLayer = buildDroneLayer();
            applyDroneVolume();
        }

        updateDroneButton();
        updateDroneStatus();
    } catch (error) {
        console.error(error);
        droneActive = false;
        updateDroneButton();
        droneStatusEl.textContent = 'Errore nell\'avvio del drone.';
    }
}

function stopDrone() {
    if (!droneActive) return;

    droneActive = false;
    updateDroneButton();
    updateDroneStatus();

    stopDroneLayer(droneLayer, 120);
    droneLayer = null;

    if (droneMasterGain && droneAudioContext) {
        const now = droneAudioContext.currentTime;
        const currentGain = Math.max(droneMasterGain.gain.value, 0.0001);
        droneMasterGain.gain.cancelScheduledValues(now);
        droneMasterGain.gain.setValueAtTime(currentGain, now);
        droneMasterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    }
}

droneToggleBtn.addEventListener('click', () => {
    if (droneActive) {
        stopDrone();
    } else {
        startDrone();
    }
});

droneClearBtn.addEventListener('click', () => {
    activeNotes.clear();
    renderCircleButtons();
    updateActiveNotesDisplay();
    refreshDroneLayer();
});

droneOctaveDownBtn.addEventListener('click', () => {
    if (currentOctave > 1) {
        currentOctave--;
        updateOctaveDisplay();
        renderCircleButtons();
    }
});

droneOctaveUpBtn.addEventListener('click', () => {
    if (currentOctave < 7) {
        currentOctave++;
        updateOctaveDisplay();
        renderCircleButtons();
    }
});

droneVolumeSlider.addEventListener('input', applyDroneVolume);

if (droneReferenceSelect) {
    droneReferenceSelect.addEventListener('change', () => {
        droneTuningA4 = Number(droneReferenceSelect.value) || 440;
        refreshDroneLayer();
    });
}

updateOctaveDisplay();
renderCircleButtons();
updateActiveNotesDisplay();
updateDroneButton();
droneStatusEl.textContent = 'Pronto.';

