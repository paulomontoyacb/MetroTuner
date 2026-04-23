const droneToggleBtn = document.getElementById('droneToggleBtn');
const droneNoteSelect = document.getElementById('droneNote');
const droneOctaveSelect = document.getElementById('droneOctave');
const droneScaleModeSelect = document.getElementById('droneScaleMode');
const droneVolumeSlider = document.getElementById('droneVolume');
const droneVolumeValueEl = document.getElementById('droneVolumeValue');
const droneCurrentNoteEl = document.getElementById('droneCurrentNote');
const droneCurrentModeEl = document.getElementById('droneCurrentMode');
const droneStatusEl = document.getElementById('droneStatus');
const droneReferenceSelect = document.getElementById('tuningReference');
const droneClearDegreesBtn = document.getElementById('droneClearDegreesBtn');

const DRONE_NOTE_LABELS = {
    C: 'Do',
    'C#': 'Do#',
    D: 'Re',
    'D#': 'Re#',
    E: 'Mi',
    F: 'Fa',
    'F#': 'Fa#',
    G: 'Sol',
    'G#': 'Sol#',
    A: 'La',
    'A#': 'La#',
    B: 'Si'
};

const DRONE_NOTE_TO_SEMITONE = {
    C: 0,
    'C#': 1,
    D: 2,
    'D#': 3,
    E: 4,
    F: 5,
    'F#': 6,
    G: 7,
    'G#': 8,
    A: 9,
    'A#': 10,
    B: 11
};

const DRONE_SEMITONE_TO_NOTE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const DRONE_SCALE_MODES = {
    major: {
        label: 'Maggiore',
        slots: {
            2: { label: '2a', interval: 2 },
            3: { label: '3a', interval: 4 },
            4: { label: '4a', interval: 5 },
            5: { label: '5a', interval: 7 },
            6: { label: '6a', interval: 9 },
            7: { label: '7a', interval: 11 },
            8: { label: '8a', interval: 12 }
        }
    },
    minorNatural: {
        label: 'Minore naturale',
        slots: {
            2: { label: '2a', interval: 2 },
            3: { label: 'b3', interval: 3 },
            4: { label: '4a', interval: 5 },
            5: { label: '5a', interval: 7 },
            6: { label: 'b6', interval: 8 },
            7: { label: 'b7', interval: 10 },
            8: { label: '8a', interval: 12 }
        }
    },
    minorHarmonic: {
        label: 'Minore armonica',
        slots: {
            2: { label: '2a', interval: 2 },
            3: { label: 'b3', interval: 3 },
            4: { label: '4a', interval: 5 },
            5: { label: '5a', interval: 7 },
            6: { label: 'b6', interval: 8 },
            7: { label: '7a', interval: 11 },
            8: { label: '8a', interval: 12 }
        }
    },
    minorMelodic: {
        label: 'Minore melodica',
        slots: {
            2: { label: '2a', interval: 2 },
            3: { label: 'b3', interval: 3 },
            4: { label: '4a', interval: 5 },
            5: { label: '5a', interval: 7 },
            6: { label: '6a', interval: 9 },
            7: { label: '7a', interval: 11 },
            8: { label: '8a', interval: 12 }
        }
    },
    majorPentatonic: {
        label: 'Pentatonica maggiore',
        slots: {
            2: { label: '2a', interval: 2 },
            3: { label: '3a', interval: 4 },
            4: null,
            5: { label: '5a', interval: 7 },
            6: { label: '6a', interval: 9 },
            7: null,
            8: { label: '8a', interval: 12 }
        }
    },
    minorPentatonic: {
        label: 'Pentatonica minore',
        slots: {
            2: null,
            3: { label: 'b3', interval: 3 },
            4: { label: '4a', interval: 5 },
            5: { label: '5a', interval: 7 },
            6: null,
            7: { label: 'b7', interval: 10 },
            8: { label: '8a', interval: 12 }
        }
    },
    blues: {
        label: 'Blues',
        slots: {
            2: null,
            3: { label: 'b3', interval: 3 },
            4: { label: '4a', interval: 5 },
            5: { label: 'b5', interval: 6 },
            6: { label: '5a', interval: 7 },
            7: { label: 'b7', interval: 10 },
            8: { label: '8a', interval: 12 }
        }
    },
    ionian: {
        label: 'Ionia',
        slots: {
            2: { label: '2a', interval: 2 },
            3: { label: '3a', interval: 4 },
            4: { label: '4a', interval: 5 },
            5: { label: '5a', interval: 7 },
            6: { label: '6a', interval: 9 },
            7: { label: '7a', interval: 11 },
            8: { label: '8a', interval: 12 }
        }
    },
    dorian: {
        label: 'Dorica',
        slots: {
            2: { label: '2a', interval: 2 },
            3: { label: 'b3', interval: 3 },
            4: { label: '4a', interval: 5 },
            5: { label: '5a', interval: 7 },
            6: { label: '6a', interval: 9 },
            7: { label: 'b7', interval: 10 },
            8: { label: '8a', interval: 12 }
        }
    },
    phrygian: {
        label: 'Frigia',
        slots: {
            2: { label: 'b2', interval: 1 },
            3: { label: 'b3', interval: 3 },
            4: { label: '4a', interval: 5 },
            5: { label: '5a', interval: 7 },
            6: { label: 'b6', interval: 8 },
            7: { label: 'b7', interval: 10 },
            8: { label: '8a', interval: 12 }
        }
    },
    lydian: {
        label: 'Lidia',
        slots: {
            2: { label: '2a', interval: 2 },
            3: { label: '3a', interval: 4 },
            4: { label: '#4', interval: 6 },
            5: { label: '5a', interval: 7 },
            6: { label: '6a', interval: 9 },
            7: { label: '7a', interval: 11 },
            8: { label: '8a', interval: 12 }
        }
    },
    mixolydian: {
        label: 'Misolidia',
        slots: {
            2: { label: '2a', interval: 2 },
            3: { label: '3a', interval: 4 },
            4: { label: '4a', interval: 5 },
            5: { label: '5a', interval: 7 },
            6: { label: '6a', interval: 9 },
            7: { label: 'b7', interval: 10 },
            8: { label: '8a', interval: 12 }
        }
    },
    aeolian: {
        label: 'Eolia',
        slots: {
            2: { label: '2a', interval: 2 },
            3: { label: 'b3', interval: 3 },
            4: { label: '4a', interval: 5 },
            5: { label: '5a', interval: 7 },
            6: { label: 'b6', interval: 8 },
            7: { label: 'b7', interval: 10 },
            8: { label: '8a', interval: 12 }
        }
    },
    locrian: {
        label: 'Locria',
        slots: {
            2: { label: 'b2', interval: 1 },
            3: { label: 'b3', interval: 3 },
            4: { label: '4a', interval: 5 },
            5: { label: 'b5', interval: 6 },
            6: { label: 'b6', interval: 8 },
            7: { label: 'b7', interval: 10 },
            8: { label: '8a', interval: 12 }
        }
    }
};

const DRONE_DEGREE_CONTROLS = [2, 3, 4, 5, 6, 7, 8].map((degree) => ({
    degree,
    input: document.getElementById(`droneDegree${degree}`),
    highInput: document.getElementById(`droneDegree${degree}High`),
    doubleHighInput: document.getElementById(`droneDegree${degree}DoubleHigh`),
    nameEl: document.getElementById(`droneDegree${degree}Name`),
    labelEl: document.getElementById(`droneDegree${degree}Label`)
}));

function getDegreeOctaveOffsets(control) {
    const offsets = [0];

    if (control.highInput.checked) {
        offsets.push(12);
    }

    if (control.doubleHighInput.checked) {
        offsets.push(24);
    }

    return offsets;
}

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

function midiToNoteInfo(midi) {
    const noteIndex = ((midi % 12) + 12) % 12;
    const noteValue = DRONE_SEMITONE_TO_NOTE[noteIndex];
    const octave = Math.floor(midi / 12) - 1;

    return {
        midi,
        noteValue,
        octave,
        label: `${DRONE_NOTE_LABELS[noteValue]}${octave}`,
        frequency: midiToFrequency(midi)
    };
}

function getScaleConfig() {
    return DRONE_SCALE_MODES[droneScaleModeSelect.value] || DRONE_SCALE_MODES.major;
}

function getDroneBaseConfig() {
    const note = droneNoteSelect.value;
    const octave = Number(droneOctaveSelect.value);
    const semitone = DRONE_NOTE_TO_SEMITONE[note];
    const midi = ((octave + 1) * 12) + semitone;

    return midiToNoteInfo(midi);
}

function updateDegreeLabels() {
    const base = getDroneBaseConfig();
    const scale = getScaleConfig();

    DRONE_DEGREE_CONTROLS.forEach((control) => {
        const slot = scale.slots[control.degree];

        if (!slot) {
            control.nameEl.textContent = '--';
            control.labelEl.textContent = '--';
            control.input.checked = false;
            control.input.disabled = true;
            control.highInput.checked = false;
            control.highInput.disabled = true;
            control.doubleHighInput.checked = false;
            control.doubleHighInput.disabled = true;
            return;
        }

        control.input.disabled = false;
        control.highInput.disabled = false;
        control.doubleHighInput.disabled = false;
        control.nameEl.textContent = slot.label;
        const noteInfo = midiToNoteInfo(base.midi + slot.interval);
        control.labelEl.textContent = DRONE_NOTE_LABELS[noteInfo.noteValue];
    });
}

function getActiveDroneEntries() {
    const base = getDroneBaseConfig();
    const scale = getScaleConfig();
    const entries = [{ degree: 1, label: base.label, midi: base.midi, frequency: base.frequency }];

    DRONE_DEGREE_CONTROLS.forEach((control) => {
        const slot = scale.slots[control.degree];

        if (!slot || !control.input.checked) {
            return;
        }

        getDegreeOctaveOffsets(control).forEach((octaveOffset) => {
            const noteInfo = midiToNoteInfo(base.midi + slot.interval + octaveOffset);

            entries.push({
                degree: control.degree,
                label: noteInfo.label,
                midi: noteInfo.midi,
                frequency: noteInfo.frequency
            });
        });
    });

    return entries;
}

function getFrequencyCompensation(frequency) {
    if (frequency <= 220) {
        return clamp(1.15 + Math.pow(220 / frequency, 0.42) * 0.75, 1.15, 2.35);
    }

    return clamp(Math.pow(220 / frequency, 0.18), 0.88, 1.08);
}

function updateDroneDisplay() {
    const base = getDroneBaseConfig();
    const scale = getScaleConfig();

    droneCurrentNoteEl.textContent = DRONE_NOTE_LABELS[base.noteValue];
    droneCurrentModeEl.textContent = `Scala ${scale.label.toLowerCase()}`;
    droneVolumeValueEl.textContent = `${droneVolumeSlider.value}%`;
}

function updateDroneButton() {
    droneToggleBtn.textContent = droneActive ? 'Spegni drone' : 'Accendi drone';
}

function getDroneMasterVolume() {
    const normalized = Number(droneVolumeSlider.value) / 100;
    return Math.max(0.0001, normalized * 0.5);
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
    if (!layer || !droneAudioContext) {
        return;
    }

    const now = droneAudioContext.currentTime;
    const stopAt = now + (fadeMs / 1000);
    const currentGain = Math.max(layer.output.gain.value, 0.0001);

    layer.output.gain.cancelScheduledValues(now);
    layer.output.gain.setValueAtTime(currentGain, now);
    layer.output.gain.exponentialRampToValueAtTime(0.0001, stopAt);

    layer.oscillators.forEach((oscillator) => {
        oscillator.stop(stopAt + 0.02);
        oscillator.addEventListener('ended', () => {
            try {
                oscillator.disconnect();
            } catch (error) {
                console.error(error);
            }
        }, { once: true });
    });

    setTimeout(() => {
        try {
            layer.output.disconnect();
        } catch (error) {
            console.error(error);
        }
    }, fadeMs + 80);
}

function buildDroneLayer() {
    const now = droneAudioContext.currentTime;
    const entries = getActiveDroneEntries();
    const output = droneAudioContext.createGain();
    const oscillators = [];
    const rawWeights = entries.map((entry) => getFrequencyCompensation(entry.frequency));
    const totalWeight = rawWeights.reduce((sum, value) => sum + value, 0) || 1;

    output.gain.setValueAtTime(0.0001, now);
    output.connect(droneMasterGain);

    entries.forEach((entry, index) => {
        const oscillator = droneAudioContext.createOscillator();
        const voiceGain = droneAudioContext.createGain();
        const normalizedGain = (rawWeights[index] / totalWeight) * 0.92;

        oscillator.type = 'triangle';
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
    updateDroneDisplay();

    if (!droneMasterGain || !droneAudioContext) {
        return;
    }

    const now = droneAudioContext.currentTime;
    const target = getDroneMasterVolume();
    const currentGain = Math.max(droneMasterGain.gain.value, 0.0001);

    droneMasterGain.gain.cancelScheduledValues(now);
    droneMasterGain.gain.setValueAtTime(currentGain, now);
    droneMasterGain.gain.exponentialRampToValueAtTime(target, now + 0.05);
}

function refreshDroneLayer() {
    updateDegreeLabels();
    updateDroneDisplay();

    if (!droneActive || !droneAudioContext) {
        return;
    }

    const previousLayer = droneLayer;
    droneLayer = buildDroneLayer();
    applyDroneVolume();
    stopDroneLayer(previousLayer);

    droneStatusEl.textContent = `Drone attivo su ${DRONE_NOTE_LABELS[getDroneBaseConfig().noteValue]}.`;
}

async function startDrone() {
    if (droneActive) {
        return;
    }

    try {
        await ensureDroneAudio();

        droneActive = true;
        droneLayer = buildDroneLayer();
        applyDroneVolume();
        updateDroneButton();
        droneStatusEl.textContent = `Drone attivo su ${DRONE_NOTE_LABELS[getDroneBaseConfig().noteValue]}.`;
    } catch (error) {
        console.error(error);
        droneActive = false;
        updateDroneButton();
        droneStatusEl.textContent = 'Errore nell\'avvio del drone.';
    }
}

function stopDrone() {
    if (!droneActive) {
        return;
    }

    droneActive = false;
    updateDroneButton();
    droneStatusEl.textContent = 'Drone spento.';

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

function clearDroneDegrees() {
    DRONE_DEGREE_CONTROLS.forEach((control) => {
        control.input.checked = false;
        control.highInput.checked = false;
        control.doubleHighInput.checked = false;
    });

    refreshDroneLayer();
}

droneToggleBtn.addEventListener('click', () => {
    if (droneActive) {
        stopDrone();
    } else {
        startDrone();
    }
});

droneClearDegreesBtn.addEventListener('click', clearDroneDegrees);

[droneNoteSelect, droneOctaveSelect, droneScaleModeSelect].forEach((element) => {
    element.addEventListener('change', refreshDroneLayer);
});

DRONE_DEGREE_CONTROLS.forEach((control) => {
    control.input.addEventListener('change', refreshDroneLayer);
    control.highInput.addEventListener('change', refreshDroneLayer);
    control.doubleHighInput.addEventListener('change', refreshDroneLayer);
});

droneVolumeSlider.addEventListener('input', applyDroneVolume);

if (droneReferenceSelect) {
    droneReferenceSelect.addEventListener('change', () => {
        droneTuningA4 = Number(droneReferenceSelect.value) || 440;
        refreshDroneLayer();
    });
}

updateDegreeLabels();
updateDroneDisplay();
updateDroneButton();
