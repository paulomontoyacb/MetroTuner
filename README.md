Pulsar

Italiano

Pulsar e un'app web musicale pensata per studiare tempo, intonazione e riferimento armonico in un'unica pagina.  
Unisce metronomo, accordatore e drone in una sola interfaccia, cosi da poter lavorare su esercizi tecnici, scale, arpeggi e studio di brani senza dover usare strumenti separati.

Obiettivo

L'obiettivo del progetto e offrire uno strumento pratico e immediato per musicisti che vogliono:

- studiare con un metronomo preciso
- controllare l'intonazione in tempo reale
- usare un drone continuo come riferimento
- avere tutto disponibile contemporaneamente nella stessa schermata

Funzioni principali

Metronomo

Il metronomo include:

- selezione BPM con slider e input numerico
- firme ritmiche: numeratore da 1 a 24, denominatore 2, 4, 8, 16
- suddivisioni:
  - quarti
  - ottavi
  - terzina
  - sedicesimi
  - quintine
  - sestine
  - settimine
- accento del primo battere attivabile/disattivabile
- colori visivi attivabili/disattivabili
- slider volume dedicato
- sincronizzazione visiva migliorata rispetto al suono


Accordatore  

L'accordatore funziona tramite microfono e offre:

- rilevamento della nota suonata
- frequenza rilevata
- scostamento in cent
- indicatore visuale a lancetta
- modalita:
  - "Standard"
  - "Bassi"
- riferimento di accordatura:
  - "La = 440 Hz"
  - "La = 442 Hz"

Il valore di default e 442 Hz.

Perche ci sono 2 modalita nell'accordatore 

L'accordatore include due modalita perche gli strumenti e le diverse altezze sonore non si comportano allo stesso modo.

- la modalita "Standard" e pensata per registri medi e acuti, dove il rilevamento del pitch e in genere piu rapido e stabile
- la modalita "Bassi" e ottimizzata per frequenze piu gravi, dove il rilevamento del pitch e naturalmente piu difficile e richiede piu tolleranza, piu stabilizzazione e un comportamento leggermente diverso nel tracciamento

Questo rende l'accordatore piu affidabile sia per strumenti standard sia per strumenti o note piu gravi.


Drone

Il drone e uno strumento pensato per suonare note continue come riferimento armonico e di intonazione.

Come funziona:

Il drone presenta un cerchio con i 12 tasti cromatici (Do, Do#/Reb, Re, Re#/Mib, Mi, Fa, Fa#/Solb, Sol, Sol#/Lab, La, La#/Sib, Si).
Ogni tasto si attiva o disattiva con un clic. Si possono tenere attive piu note contemporaneamente, ottenendo accordi o intervalli continui.

Le note attive vengono mostrate sotto il cerchio come etichette cliccabili: cliccare su un'etichetta rimuove quella nota.

Caratteristiche:

- interfaccia a cerchio cromatico con i 12 semitoni
- selezione libera di una o piu note contemporaneamente
- ottava selezionabile da 1 a 7 con i pulsanti "−" e "+"
- suono continuo basato su **sawtooth wave** con compensazione di volume per frequenza
- volume dedicato con slider
- accordatura condivisa con l'accordatore (La = 440 Hz o 442 Hz)
- pulsante "Cancella tutto" per rimuovere tutte le note attive in un colpo solo

Default del drone:

- ottava: 3

Come usarlo:

1. Seleziona l'ottava con i pulsanti "−" e "+".
2. Clicca una o piu note sul cerchio per attivarle.
3. Premi "Accendi drone" per avviare il suono.
4. Suona o canta sopra il drone per controllare l'intonazione o esercitarti sulle scale.
5. Clicca di nuovo una nota per disattivarla, oppure usa "Cancella tutto" per azzerare tutto.

Interfaccia

L'interfaccia e organizzata in tre pannelli affiancati:

- Metronomo
- Accordatore
- Drone

I tre pannelli hanno la stessa larghezza nel layout desktop, per una disposizione piu uniforme e pulita.  
Sono stati anche ridotti gli spazi inutili per rendere la pagina piu compatta e leggibile.

Tecnologie usate

- "HTML"
- "CSS"
- "JavaScript vanilla"
- "Web Audio API"
- "AudioContext"
- "AudioWorklet"

File principali:

- "index.html" -> struttura dell'interfaccia
- "style.css" -> stile e layout
- "metro2.js" -> logica del metronomo
- "accordatore.js" -> logica dell'accordatore
- "pitch-worklet.js" -> analisi del pitch
- "drone.js" -> logica del drone

---

Autore

Creato da Paulo Montoya


---
---

Pulsar

English

Pulsar is a music web app designed to practice rhythm, intonation, and harmonic reference on a single page.  
It combines metronome, tuner, and drone into one interface, allowing musicians to work on technical exercises, scales, arpeggios, and repertoire study without needing separate tools.

Goal

The goal of the project is to provide a practical and immediate tool for musicians who want to:

- practice with a precise metronome
- monitor intonation in real time
- use a continuous drone as a reference
- keep everything available at the same time on the same screen

Main features

Metronome

The metronome includes:

- BPM selection with slider and numeric input
- time signatures: numerator from 1 to 24, denominator 2, 4, 8, 16
- subdivisions:
  - quarter notes
  - eighth notes
  - triplets
  - sixteenth notes
  - quintuplets
  - sextuplets
  - septuplets
- optional first-beat accent
- optional visual color feedback
- dedicated volume slider
- improved visual synchronization compared to the sound

Tuner

The tuner works through the microphone and provides:

- played note detection
- detected frequency
- cents deviation
- needle-style visual indicator
- modes:
  - "Standard"
  - "Bass"
- tuning reference:
  - "A = 440 Hz"
  - "A = 442 Hz"

The default value is 442 Hz.

Why there are 2 tuner modes
The tuner includes two modes because instruments and sound ranges do not behave the same way.

- "Standard" mode is designed for normal mid and high ranges, where pitch detection is usually faster and more stable
- "Bass" mode is optimized for lower frequencies, where pitch detection is naturally harder and needs more tolerance, more stabilization, and slightly different tracking behavior

This makes the tuner more reliable both for standard instruments and for lower-pitched instruments or notes.

Drone

The drone is a tool designed to play continuous notes as a harmonic and intonation reference.

How it works:

The drone shows a circle with the 12 chromatic keys (C, C#/Db, D, D#/Eb, E, F, F#/Gb, G, G#/Ab, A, A#/Bb, B).
Each key can be toggled on or off with a click. Multiple notes can be active at the same time, creating continuous chords or intervals.

Active notes are displayed below the circle as clickable labels: clicking a label removes that note.

Features:

- chromatic circle interface with all 12 semitones
- free selection of one or more notes simultaneously
- selectable octave from 1 to 7 using the "−" and "+" buttons
- continuous sound based on **sawtooth wave** with per-frequency volume compensation
- dedicated volume slider
- tuning reference shared with the tuner (A = 440 Hz or 442 Hz)
- "Clear all" button to remove all active notes at once

Drone defaults:

- octave: 3

How to use it:

1. Select the octave using the "−" and "+" buttons.
2. Click one or more notes on the circle to activate them.
3. Press "Accendi drone" to start the sound.
4. Play or sing over the drone to check intonation or practice scales.
5. Click a note again to deactivate it, or use "Clear all" to reset everything.

Interface

The interface is organized into three side-by-side panels:

- Metronome
- Tuner
- Drone

The three panels have the same width in the desktop layout, for a cleaner and more balanced arrangement.  
Unnecessary spacing was also reduced to make the page more compact and readable.

Technologies used

- "HTML"
- "CSS"
- "Vanilla JavaScript"
- "Web Audio API"
- "AudioContext"
- "AudioWorklet"

Main files:

- "index.html" -> interface structure
- "style.css" -> style and layout
- "metro2.js" -> metronome logic
- "accordatore.js" -> tuner logic
- "pitch-worklet.js" -> pitch analysis
- "drone.js" -> drone logic

---

Author

Created by Paulo Montoya.
