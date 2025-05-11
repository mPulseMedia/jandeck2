document.addEventListener('DOMContentLoaded', () => {
    // ======================================
    // DATA SETUP AND INITIALIZATION
    // ======================================
    
    // Define the card data for each slot
    const slot_data = {
        key: [
            // Major keys in circle of fifths order
            'C Major', 'G Major', 'D Major', 'A Major', 'E Major', 'B Major', 'F# Major',
            'C# Major', 'F Major', 'B♭ Major', 'E♭ Major', 'A♭ Major', 'D♭ Major', 'G♭ Major',
            // Minor keys in circle of fifths order
            'A Minor', 'E Minor', 'B Minor', 'F# Minor', 'C# Minor', 'G# Minor', 'D# Minor',
            'A# Minor', 'D Minor', 'G Minor', 'C Minor', 'F Minor', 'B♭ Minor', 'E♭ Minor'
        ],
        prog: [
            // Group by numeric value, with major before minor
            'I-IV-V',       // 145 (major)
            'i-iv-v',       // 145 (minor)
            'i-iv-VII',     // 147 (minor)
            'I-ii-iii-IV',  // 1234 (major)
            'I-iii-IV-V',   // 1345 (major)
            'I-♭III-♭VII-IV', // 1374 (major)
            'i-♭III-♭VII',  // 137 (minor)
            'I-IV-I-V',     // 1415 (major)
            'I-IV-vi-V',    // 1465 (major)
            'I-V-♭VII-IV',  // 1574 (major)
            'I-V-vi-IV',    // 1564 (major)
            'i-♭VI-♭VII',   // 167 (minor)
            'I-vi-ii-V',    // 1625 (major)
            'i-VI-III-VII', // 1637 (minor)
            'I-vi-IV-V',    // 1645 (major)
            'I-♭VII-♭VI-V', // 1765 (major)
            'i-♭VII-♭VI-V', // 1765 (minor)
            'I-♭VII-♭VI-♭VII', // 1767 (major)
            'ii-V-I',       // 251 (major)
            'vi-IV-I-V',    // 6415 (major)
        ],
        vibe: [
            'Melancholic', 'Euphoric', 'Dreamy', 'Aggressive', 'Nostalgic',
            'Triumphant', 'Mysterious', 'Playful', 'Ethereal', 'Haunting',
            'Intense', 'Serene', 'Chaotic', 'Uplifting', 'Somber',
            'Energetic', 'Reflective', 'Dramatic', 'Whimsical', 'Tense',
            'Hopeful', 'Gritty', 'Cosmic', 'Intimate', 'Anthemic',
            'Hypnotic', 'Quirky', 'Majestic', 'Brooding', 'Bittersweet'
        ],
        tempo: [
            'Four on Floor', // Basic 4/4 rhythm
            'Wide Quarters', // Widely spaced quarter notes
            'Quarters & Eighths', // Quarter-eighth pattern
            'Quarter-Eighth Alternating', // Alternating pattern
            'Eighth-Quarter Swing', // Swing feel
            'Double Eighth Kick', // Double eighth then quarter
            'Sixteenth Roll & Kicks', // Sixteenth notes with quarter accents
            'Steady Eighths', // Continuous eighth notes
            'Double Sixteenths', // Paired sixteenth notes
            'Sixteenth Rush', // Rapid sixteenth notes
            // Adding popular rhythms from world music and popular genres
            'Samba', // Brazilian rhythm
            'Bossa Nova', // Brazilian jazz rhythm
            'Rumba', // Cuban rhythm
            'Waltz', // 3/4 rhythm
            'Reggae', // Jamaican rhythm with offbeat accents
            'Salsa', // Latin dance rhythm
            'Funk Groove', // Syncopated funk pattern
            'Hip Hop Beat', // Boom-bap pattern
            'Shuffle', // Swing/blues feel
            'Tango', // Argentine dance rhythm
            'Cha Cha', // Cuban dance rhythm
            'Trap Beat', // Modern hip-hop style
            'Flamenco', // Spanish rhythm
            'Bulerias', // Fast flamenco rhythm
            'Bolero', // Latin slow rhythm
            'Swing Jazz' // Classic jazz swing
        ]
    };

    // Animation speed in milliseconds (lower = faster)
    const ANIMATION_SPEED      = 300; // Increased from 150ms to 300ms
    const LEVER_DELAY          = 150;  // Doubled from 75ms to 150ms
    const MULTI_ROTATION_DELAY = 30;  // Reduced from 50ms to 30ms
    const SLOT_DELAY           = 50;  // Reduced from 100ms to 50ms

    // Current index for each slot
    const current_indices = {
        key:   0,
        prog:  0,
        vibe:  0,
        tempo: 0
    };

    // Audio context and currently playing sound
    let audio_context = null;
    let current_audio = null;
    let is_playing = false;
    
    // Initialize audio context on first user interaction
    function audio_init() {
        if (!audio_context) {
            try {
                audio_context = new (window.AudioContext || window.webkitAudioContext)();
                console.log("Audio context initialized");
            } catch (e) {
                console.error("Web Audio API not supported in this browser", e);
            }
        }
    }
    
    // Function to generate and play a beat based on rhythm pattern
    function play_rhythm(rhythm) {
        // Stop any currently playing audio
        stop_audio();
        
        // Initialize audio context if not already done
        audio_init();
        
        if (!audio_context) return;
        
        // Set playing flag
        is_playing = true;
        
        // Update visual state - add visual indicator to middle section
        const click_middle = document.querySelector('#tempo-slot .click-middle');
        if (click_middle) {
            click_middle.classList.add('playing');
        }
        
        // Define beat patterns based on rhythm
        let pattern = [];
        let tempo = 70; // Default BPM - slowed down further from 90
        
        // Each pattern is an array of [time, duration] pairs where:
        // - time is the relative time (0 to 1 for one measure)
        // - duration is the note length in beats (0.25 for quarter, 0.125 for eighth, etc.)
        // - A duration of 0 represents a rest (no sound played)
        
        switch(rhythm) {
            case 'Four on Floor':
                // ♩  ♩  ♩  ♩ - Four evenly spaced quarter notes
                pattern = [
                    [0, 0.25],
                    [0.25, 0.25],
                    [0.5, 0.25],
                    [0.75, 0.25]
                ];
                tempo = 60; // Slightly faster
                break;
                
            case 'Wide Quarters':
                // ♩   ♩   ♩ - Three widely spaced quarter notes
                pattern = [
                    [0, 0.25],
                    [0.33, 0.25],
                    [0.67, 0.25]
                ];
                tempo = 55; // Slightly faster
                break;
                
            case 'Quarters & Eighths':
                // ♩ ♪♪ ♩ ♪♪ - Pattern of quarter note followed by two eighth notes
                pattern = [
                    [0, 0.25],       // Quarter
                    [0.25, 0.125],   // Eighth
                    [0.375, 0.125],  // Eighth
                    [0.5, 0.25],     // Quarter
                    [0.75, 0.125],   // Eighth
                    [0.875, 0.125]   // Eighth
                ];
                tempo = 55; // Slightly faster
                break;
                
            case 'Quarter-Eighth Alternating':
                // ♩ ♪ · ♩ ♪ · - Pattern alternating between quarter and eighth notes
                pattern = [
                    [0, 0.25],      // Quarter
                    [0.25, 0.125],  // Eighth
                    [0.375, 0],     // Implied rest
                    [0.5, 0.25],    // Quarter
                    [0.75, 0.125],  // Eighth
                    [0.875, 0]      // Implied rest
                ];
                tempo = 55; // Slightly faster
                break;
                
            case 'Eighth-Quarter Swing':
                // ♪♪ ♩ ♪♪ ♩ - Swing pattern with eighth notes followed by quarter
                pattern = [
                    [0, 0.125],     // Eighth
                    [0.125, 0.125], // Eighth
                    [0.25, 0.25],   // Quarter
                    [0.5, 0.125],   // Eighth
                    [0.625, 0.125], // Eighth
                    [0.75, 0.25]    // Quarter
                ];
                tempo = 55; // Slightly faster
                break;
                
            case 'Double Eighth Kick':
                // ♪♪ − ♩ ♩ - Two eighth notes, rest, then two quarter notes
                pattern = [
                    [0, 0.125],     // Eighth
                    [0.125, 0.125], // Eighth
                    [0.25, 0],      // Rest (represented by -)
                    [0.5, 0.25],    // Quarter
                    [0.75, 0.25]    // Quarter
                ];
                tempo = 55; // Slightly faster
                break;
            case 'Sixteenth Roll & Kicks':
                // ♬♬ ♩ ♩ ♩ - Four sixteenth notes followed by three quarter notes
                pattern = [
                    [0, 0.0625],     // Sixteenth
                    [0.0625, 0.0625], // Sixteenth
                    [0.125, 0.0625],  // Sixteenth
                    [0.1875, 0.0625], // Sixteenth
                    [0.25, 0.25],     // Quarter
                    [0.5, 0.25],      // Quarter
                    [0.75, 0.25]      // Quarter
                ];
                tempo = 55; // Slightly faster
                break;
            case 'Steady Eighths':
                // ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ - Eight evenly spaced eighth notes
                pattern = [
                    [0, 0.125],     // Eighth
                    [0.125, 0.125],  // Eighth
                    [0.25, 0.125],   // Eighth
                    [0.375, 0.125],  // Eighth
                    [0.5, 0.125],    // Eighth
                    [0.625, 0.125],  // Eighth
                    [0.75, 0.125],   // Eighth
                    [0.875, 0.125]   // Eighth
                ];
                tempo = 55; // Slightly faster
                break;
            case 'Double Sixteenths':
                // ♬  ♬  ♬  ♬ - Four pairs of sixteenth notes
                pattern = [
                    [0, 0.0625],      // Sixteenth
                    [0.0625, 0.0625], // Sixteenth
                    [0.25, 0.0625],   // Sixteenth
                    [0.3125, 0.0625], // Sixteenth
                    [0.5, 0.0625],    // Sixteenth
                    [0.5625, 0.0625], // Sixteenth
                    [0.75, 0.0625],   // Sixteenth
                    [0.8125, 0.0625]  // Sixteenth
                ];
                tempo = 55; // Slightly faster
                break;
            case 'Sixteenth Rush':
                // ♬♬♬♬♬♬♬♬ - Continuous sixteenth notes
                pattern = [
                    [0, 0.0625],      // Sixteenth
                    [0.0625, 0.0625], // Sixteenth
                    [0.125, 0.0625],  // Sixteenth
                    [0.1875, 0.0625], // Sixteenth
                    [0.25, 0.0625],   // Sixteenth
                    [0.3125, 0.0625], // Sixteenth
                    [0.375, 0.0625],  // Sixteenth
                    [0.4375, 0.0625], // Sixteenth
                    [0.5, 0.0625],    // Sixteenth
                    [0.5625, 0.0625], // Sixteenth
                    [0.625, 0.0625],  // Sixteenth
                    [0.6875, 0.0625], // Sixteenth
                    [0.75, 0.0625],   // Sixteenth
                    [0.8125, 0.0625], // Sixteenth
                    [0.875, 0.0625],  // Sixteenth
                    [0.9375, 0.0625]  // Sixteenth
                ];
                tempo = 50; // Slightly faster
                break;
            case 'Samba':
                // ♪ · ♩ ♪♪ ♩ ♪ - Brazilian samba rhythm
                pattern = [
                    [0, 0.125],        // Eighth
                    [0.125, 0],        // Very short rest
                    [0.15, 0.25],      // Quarter
                    [0.4, 0.125],      // Eighth 
                    [0.525, 0.125],    // Eighth
                    [0.65, 0.25],      // Quarter
                    [0.9, 0.1]         // Short eighth
                ];
                tempo = 55; // Slightly faster
                break;
                
            case 'Bossa Nova':
                // ♪ ♩ ♪ ♩ ♪ ♪ - Brazilian bossa nova pattern
                pattern = [
                    [0, 0.125],        // Eighth
                    [0.125, 0.25],     // Quarter
                    [0.375, 0.125],    // Eighth
                    [0.5, 0.25],       // Quarter
                    [0.75, 0.125],     // Eighth
                    [0.875, 0.125]     // Eighth
                ];
                tempo = 50; // Slightly faster
                break;
                
            case 'Rumba':
                // ♪♪♪ · ♪♪ ♩ ♪ - Cuban rumba pattern
                pattern = [
                    [0, 0.0833],       // Triplet eighth
                    [0.0833, 0.0833],  // Triplet eighth
                    [0.1667, 0.0833],  // Triplet eighth
                    [0.25, 0],         // Short rest
                    [0.3, 0.125],      // Eighth
                    [0.425, 0.125],    // Eighth
                    [0.55, 0.25],      // Quarter
                    [0.8, 0.125]       // Eighth
                ];
                tempo = 50; // Slightly faster
                break;
                
            case 'Waltz':
                // ♩ ♪ · ♪ - 3/4 waltz pattern with emphasis on first beat
                pattern = [
                    [0, 0.33],         // Emphasized first beat (slightly longer)
                    [0.33, 0.167],     // Lighter second beat
                    [0.5, 0],          // Tiny rest
                    [0.517, 0.167]     // Lighter third beat
                ];
                tempo = 50; // Slightly faster
                break;
                
            case 'Reggae':
                // ♩ · ♪ ♩ · ♪ - Reggae pattern with emphasis on offbeats
                pattern = [
                    [0, 0.25],         // Quarter on downbeat
                    [0.25, 0],         // Rest
                    [0.3, 0.125],      // Emphasized offbeat eighth
                    [0.5, 0.25],       // Quarter on downbeat
                    [0.75, 0],         // Rest
                    [0.8, 0.125]       // Emphasized offbeat eighth
                ];
                tempo = 45; // Slightly faster
                break;
                
            case 'Salsa':
                // ♪♪ ♩ ♪ · ♩ ♪ - Salsa clave-based pattern
                pattern = [
                    [0, 0.125],        // Eighth
                    [0.125, 0.125],    // Eighth
                    [0.25, 0.25],      // Quarter
                    [0.5, 0.125],      // Eighth
                    [0.625, 0],        // Short rest
                    [0.675, 0.2],      // Quarter
                    [0.875, 0.125]     // Eighth
                ];
                tempo = 55; // Slightly faster
                break;
                
            case 'Funk Groove':
                // ♪ ♩ ♪ ♩ ♪♪ - Syncopated funk pattern
                pattern = [
                    [0, 0.125],        // Eighth
                    [0.125, 0.25],     // Quarter
                    [0.375, 0.125],    // Eighth
                    [0.5, 0.25],       // Quarter
                    [0.75, 0.125],     // Eighth
                    [0.875, 0.125]     // Eighth
                ];
                tempo = 50; // Slightly faster
                break;
                
            case 'Hip Hop Beat':
                // ♩ ♪♪ ♩ ♪♪ - Classic boom-bap pattern
                pattern = [
                    [0, 0.25],         // Quarter (kick)
                    [0.25, 0.125],     // Eighth (snare)
                    [0.375, 0.125],    // Eighth (hi-hat)
                    [0.5, 0.25],       // Quarter (kick)
                    [0.75, 0.125],     // Eighth (snare)
                    [0.875, 0.125]     // Eighth (hi-hat)
                ];
                tempo = 50; // Slightly faster
                break;
                
            case 'Shuffle':
                // ♪♪♪ · ♪♪♪ · ♪♪ - Triplet-based shuffle rhythm
                pattern = [
                    [0, 0.0833],       // Triplet eighth
                    [0.0833, 0.0833],  // Triplet eighth
                    [0.1667, 0.0833],  // Triplet eighth
                    [0.25, 0],         // Short rest
                    [0.33, 0.0833],    // Triplet eighth
                    [0.4133, 0.0833],  // Triplet eighth
                    [0.4967, 0.0833],  // Triplet eighth
                    [0.58, 0],         // Short rest
                    [0.67, 0.125],     // Eighth
                    [0.795, 0.125]     // Eighth
                ];
                tempo = 50; // Slightly faster
                break;
                
            case 'Tango':
                // ♩♪ · ♩ ♩♪ - Characteristic tango rhythm
                pattern = [
                    [0, 0.25],         // Quarter
                    [0.25, 0.125],     // Eighth
                    [0.375, 0],        // Short rest
                    [0.45, 0.25],      // Quarter
                    [0.7, 0.25],       // Quarter
                    [0.95, 0.125]      // Eighth (overlaps into next measure)
                ];
                tempo = 50; // Slightly faster
                break;
                
            case 'Cha Cha':
                // ♪ · ♪ · ♩ ♪♪ - 1-2, cha-cha-cha pattern
                pattern = [
                    [0, 0.125],        // Eighth (1)
                    [0.125, 0],        // Short rest
                    [0.175, 0.125],    // Eighth (2)
                    [0.3, 0],          // Short rest
                    [0.35, 0.25],      // Quarter (cha)
                    [0.6, 0.125],      // Eighth (cha)
                    [0.725, 0.125]     // Eighth (cha)
                ];
                tempo = 50; // Slightly faster
                break;
                
            case 'Trap Beat':
                // ♩ ♩ ♬♬ ♩ - Typical trap pattern with rapid hi-hats
                pattern = [
                    [0, 0.25],         // Quarter (kick)
                    [0.25, 0.25],      // Quarter (snare)
                    [0.5, 0.0625],     // Sixteenth (hi-hat)
                    [0.5625, 0.0625],  // Sixteenth (hi-hat)
                    [0.625, 0.0625],   // Sixteenth (hi-hat)
                    [0.6875, 0.0625],  // Sixteenth (hi-hat)
                    [0.75, 0.25]       // Quarter (kick)
                ];
                tempo = 45; // Slightly faster
                break;
                
            case 'Flamenco':
                // ♪♪ ♩ ♪ · ♩ - Flamenco-inspired pattern
                pattern = [
                    [0, 0.125],        // Eighth
                    [0.125, 0.125],    // Eighth
                    [0.25, 0.25],      // Quarter
                    [0.5, 0.125],      // Eighth
                    [0.625, 0],        // Short rest
                    [0.675, 0.25]      // Quarter
                ];
                tempo = 55; // Slightly faster
                break;
                
            case 'Bulerias':
                // ♬♬ ♪♪ · ♩ - Fast flamenco bulerias rhythm
                pattern = [
                    [0, 0.0625],       // Sixteenth
                    [0.0625, 0.0625],  // Sixteenth
                    [0.125, 0.0625],   // Sixteenth
                    [0.1875, 0.0625],  // Sixteenth
                    [0.25, 0.125],     // Eighth
                    [0.375, 0.125],    // Eighth
                    [0.5, 0],          // Short rest
                    [0.55, 0.25]       // Quarter
                ];
                tempo = 50; // Slightly faster
                break;
                
            case 'Bolero':
                // ♩ · ♪♪♪ · ♩ - Romantic bolero pattern
                pattern = [
                    [0, 0.25],         // Quarter
                    [0.25, 0],         // Short rest
                    [0.3, 0.0834],     // Triplet eighth
                    [0.3834, 0.0833],  // Triplet eighth
                    [0.4667, 0.0833],  // Triplet eighth
                    [0.55, 0],         // Short rest
                    [0.6, 0.25]        // Quarter
                ];
                tempo = 40; // Slightly faster
                break;
                
            case 'Swing Jazz':
                // ♪♫ ♪ · ♪♫ ♪ · - Swing jazz rhythm with triplet feel
                pattern = [
                    [0, 0.0833],       // Triplet eighth
                    [0.0833, 0.1667],  // Triplet quarter (two triplet eighths)
                    [0.25, 0.125],     // Swung eighth
                    [0.375, 0],        // Short rest
                    [0.5, 0.0833],     // Triplet eighth
                    [0.5833, 0.1667],  // Triplet quarter (two triplet eighths)
                    [0.75, 0.125],     // Swung eighth
                    [0.875, 0]         // Short rest
                ];
                tempo = 45; // Slightly faster
                break;
                
            default:
                // Default to a simple four-on-the-floor beat
                pattern = [
                    [0, 0.25],
                    [0.25, 0.25],
                    [0.5, 0.25],
                    [0.75, 0.25]
                ];
                tempo = 55; // Slightly faster
        }
        
        // Calculate beat duration in seconds based on tempo (BPM)
        const beat_duration = 60 / tempo; // Duration of quarter note in seconds
        const measure_duration = beat_duration * 4; // 4/4 time signature
        
        // Play exactly 2 measures (no more, no less)
        const num_measures = 2;
        const total_duration = measure_duration * num_measures;
        
        // Schedule the sounds
        current_audio = {
            oscillators: [],
            gainNodes: [],
            startTime: audio_context.currentTime
        };
        
        // Schedule pattern for measures continuously without gaps
        const exact_start_time = audio_context.currentTime;
        for (let measure = 0; measure < num_measures; measure++) {
            pattern.forEach(([time, duration]) => {
                // Calculate precise timing to avoid gaps between measures
                const abs_time = measure * measure_duration + time * measure_duration;
                // Slightly extend note durations to ensure overlap instead of gaps
                const note_duration = duration * beat_duration * 1.02;
                play_note(abs_time, note_duration);
            });
        }
        
        // Stop after playing for the duration (with a small buffer to ensure all notes complete)
        setTimeout(() => {
            stop_audio();
        }, (total_duration * 1000) + 100);
    }
    
    // Function to play a single note with the specified duration
    function play_note(time, duration) {
        if (!audio_context || !is_playing) return;
        
        // Skip playing if duration is 0 (this is a rest)
        if (duration <= 0) return;
        
        // Create oscillator and gain nodes for a richer sound
        const oscillator1 = audio_context.createOscillator(); // Main tone
        const oscillator2 = audio_context.createOscillator(); // Harmonic
        const oscillator3 = audio_context.createOscillator(); // Sub-harmonic
        
        const gainNode1 = audio_context.createGain(); // Main gain
        const gainNode2 = audio_context.createGain(); // Harmonic gain
        const gainNode3 = audio_context.createGain(); // Sub-harmonic gain
        const masterGain = audio_context.createGain(); // Master gain
        
        // Create compressor for better dynamics
        const compressor = audio_context.createDynamicsCompressor();
        compressor.threshold.value = -24;
        compressor.knee.value = 30;
        compressor.ratio.value = 12;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.25;
        
        // Create a convolver for a subtle reverb effect
        const convolver = audio_context.createConvolver();
        
        // Create a short impulse response for the reverb
        const impulseLength = audio_context.sampleRate * 0.5; // 500ms reverb
        const impulse = audio_context.createBuffer(2, impulseLength, audio_context.sampleRate);
        
        // Fill the impulse buffer with decaying noise
        for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
            const impulseData = impulse.getChannelData(channel);
            for (let i = 0; i < impulseLength; i++) {
                // Exponential decay with slight randomness
                impulseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / impulseLength, 2);
            }
        }
        
        convolver.buffer = impulse;
        
        // Connect the audio graph
        oscillator1.connect(gainNode1);
        oscillator2.connect(gainNode2);
        oscillator3.connect(gainNode3);
        
        gainNode1.connect(masterGain);
        gainNode2.connect(masterGain);
        gainNode3.connect(masterGain);
        
        // Split the signal - 75% dry, 25% wet
        const dryGain = audio_context.createGain();
        const wetGain = audio_context.createGain();
        dryGain.gain.value = 0.75;
        wetGain.gain.value = 0.25;
        
        masterGain.connect(dryGain);
        masterGain.connect(wetGain);
        
        wetGain.connect(convolver);
        dryGain.connect(compressor);
        convolver.connect(compressor);
        
        compressor.connect(audio_context.destination);
        
        // Set up oscillator types for a wooden stick/marimba-like sound
        oscillator1.type = 'triangle'; // Base tone (was 'sine')
        oscillator2.type = 'sine';     // Harmonic
        oscillator3.type = 'sine';     // Sub-harmonic
        
        // Set frequencies with musical relationships
        const baseFreq = 380; // Slightly lower than A4 (440Hz) for a warmer tone
        oscillator1.frequency.value = baseFreq;         // Base frequency
        oscillator2.frequency.value = baseFreq * 2.0;   // One octave up
        oscillator3.frequency.value = baseFreq * 0.5;   // One octave down
        
        // Set gain levels for a balanced sound
        masterGain.gain.setValueAtTime(0.5, audio_context.currentTime);
        gainNode1.gain.setValueAtTime(0.6, audio_context.currentTime); // Main tone slightly louder
        gainNode2.gain.setValueAtTime(0.2, audio_context.currentTime); // Softer harmonic
        gainNode3.gain.setValueAtTime(0.3, audio_context.currentTime); // Moderate sub-harmonic
        
        // Add slight attack and release to avoid clicks
        const attack_time = 0.01;
        // Use a shorter release time to reduce gaps between notes
        const release_time = Math.min(0.03, duration / 3);
        
        const start_time = audio_context.currentTime + time;
        const stop_time = start_time + duration;
        
        // Attack
        masterGain.gain.setValueAtTime(0, start_time);
        masterGain.gain.linearRampToValueAtTime(0.5, start_time + attack_time);
        
        // Release - start release closer to the end to reduce gaps
        masterGain.gain.setValueAtTime(0.5, stop_time - release_time);
        masterGain.gain.linearRampToValueAtTime(0, stop_time);
        
        // Schedule start and stop
        oscillator1.start(start_time);
        oscillator2.start(start_time);
        oscillator3.start(start_time);
        
        oscillator1.stop(stop_time);
        oscillator2.stop(stop_time);
        oscillator3.stop(stop_time);
        
        // Store for later cleanup
        if (current_audio) {
            current_audio.oscillators.push(oscillator1, oscillator2, oscillator3);
            current_audio.gainNodes.push(gainNode1, gainNode2, gainNode3, masterGain, dryGain, wetGain);
        }
    }
    
    // Function to schedule a sound at a specific time - no longer used, replaced by play_note
    function schedule_sound(time, type) {
        // This function is kept for reference but no longer used
    }
    
    // Function to stop all playing audio
    function stop_audio() {
        if (current_audio) {
            // Stop all oscillators
            current_audio.oscillators.forEach(osc => {
                try {
                    osc.stop();
                } catch (e) {
                    // Ignore errors if oscillator already stopped
                }
            });
            
            // Clear the current audio object
            current_audio = null;
        }
        
        // Reset visual state
        const click_middle = document.querySelector('#tempo-slot .click-middle');
        if (click_middle) {
            click_middle.classList.remove('playing');
        }
        
        is_playing = false;
    }

    // Get DOM elements
    const slots = {
        key:   document.getElementById('key-slot'),
        prog:  document.getElementById('prog-slot'),
        vibe:  document.getElementById('vibe-slot'),
        tempo: document.getElementById('tempo-slot')
    };

    const app_container = document.querySelector('.app_container');
    const slot_machine = document.querySelector('.slot-machine');
    const lever = document.getElementById('random-lever');
    let is_lever_pulling = false;
    
    // Create a global overlay for the entire container
    const blocker_global = document.createElement('div');
    blocker_global.className = 'global-overlay';
    blocker_global.style.position         = 'fixed';
    blocker_global.style.top              = '0';
    blocker_global.style.left             = '0';
    blocker_global.style.width            = '100%';
    blocker_global.style.height           = '100%';
    blocker_global.style.zIndex           = '1000';
    blocker_global.style.display          = 'none';
    blocker_global.style.backgroundColor  = 'transparent';
    blocker_global.style.cursor           = 'not-allowed';
    document.body.appendChild(blocker_global);
    
    // Initialize all slots with animating=false and add overlays
    Object.keys(slots).forEach(slot_type => {
        slots[slot_type].dataset.animating = 'false';
        
        // Add a slot-specific overlay to block clicks during animations
        const blocker_slot = document.createElement('div');
        blocker_slot.className = 'slot-overlay';
        blocker_slot.style.position         = 'absolute';
        blocker_slot.style.top              = '0';
        blocker_slot.style.left             = '0';
        blocker_slot.style.width            = '100%';
        blocker_slot.style.height           = '100%';
        blocker_slot.style.zIndex           = '30'; // Higher than click areas but below faceplate
        blocker_slot.style.backgroundColor  = 'rgba(0, 0, 0, 0.2)'; // Semi-transparent background
        blocker_slot.style.borderRadius     = '10px'; // Match slot border radius
        blocker_slot.style.display          = 'none';
        blocker_slot.style.cursor           = 'not-allowed';
        slots[slot_type].appendChild(blocker_slot);
    });
    // Make sure all cards are visible initially
    Object.keys(slots).forEach(slot_type => {
        const card = slots[slot_type].querySelector('.current-card');
        if (card) {
            card.style.transform = 'translateY(0)';
            card.style.opacity = '1';
        }
    });
    // Sort the keys array alphabetically, with major keys first
    slot_data.key.sort((a, b) => {
        const a_is_major = a.includes('Major');
        const b_is_major = b.includes('Major');
        
        // Group by major/minor (all majors, then all minors)
        if (a_is_major && !b_is_major) return -1;
        if (!a_is_major && b_is_major) return 1;
        
        // Within each group, sort alphabetically
        return a.localeCompare(b);
    });
    // Sort the progression array numerically and by major/minor
    slot_data.prog.sort((a, b) => {
        const a_val = prog_sort_key_get(a);
        const b_val = prog_sort_key_get(b);
        
        // Sort by the combined numeric value and major/minor indicator
        return a_val - b_val;
    });
    //////////////////////////////////////////////////////////////
    // 1. Function to hide the global overlay
    function blocker_global_hide() {
        blocker_global.style.display = 'none';
    }
    // 2. Function to show the global overlay
    function blocker_global_show() {
        blocker_global.style.display = 'block';
    }
    // 3. Function to hide slot overlay for a specific slot
    function blocker_slot_hide(slot_type) {
        const overlay = slots[slot_type].querySelector('.slot-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
    // 4. Function to show slot overlay for a specific slot
    function blocker_slot_show(slot_type) {
        const overlay = slots[slot_type].querySelector('.slot-overlay');
        if (overlay) {
            overlay.style.display = 'block';
        }
    }
    // 5. Helper function to update all card values
    function card_display_update() {
        // Get the current key so we can use it for progression hints
        const current_key = slot_data.key[current_indices.key];
        const key_chords = key_chord_get(current_key);
        const roman_numerals = key_roman_get(current_key);
        
        Object.keys(slots).forEach(slot_type => {
            const card_slot = slots[slot_type].querySelector('.card-slot');
            const card = card_slot.querySelector('.current-card');
            const value_element = card.querySelector('.card-value');
            const card_value = slot_data[slot_type][current_indices[slot_type]];
            
            value_element.textContent = card_value;
            
            // If this is a key card, update chord information
            if (slot_type === 'key') {
                const chord_info_element = card.querySelector('.chord-info');
                
                // If there's no chord info element, create one
                if (!chord_info_element) {
                    const chords = key_chord_get(card_value);
                    const roman = key_roman_get(card_value);
                    
                    const chord_info = document.createElement('div');
                    chord_info.className = 'chord-info';
                    chord_info.innerHTML = `
                        <div class="romans">
                            <span class="roman">${roman[0]}</span>
                            <span class="roman">${roman[1]}</span>
                            <span class="roman">${roman[2]}</span>
                            <span class="roman">${roman[3]}</span>
                            <span class="roman">${roman[4]}</span>
                            <span class="roman">${roman[5]}</span>
                            <span class="roman">${roman[6]}</span>
                        </div>
                        <div class="chord-names">
                            <span class="chord-name">${chords[0]}</span>
                            <span class="chord-name">${chords[1]}</span>
                            <span class="chord-name">${chords[2]}</span>
                            <span class="chord-name">${chords[3]}</span>
                            <span class="chord-name">${chords[4]}</span>
                            <span class="chord-name">${chords[5]}</span>
                            <span class="chord-name">${chords[6]}</span>
                        </div>
                    `;
                    
                    card.querySelector('.card-content').appendChild(chord_info);
                } else {
                    // Update existing chord info
                    const chords = key_chord_get(card_value);
                    const roman = key_roman_get(card_value);
                    
                    const roman_numeral_elements = chord_info_element.querySelectorAll('.roman');
                    roman_numeral_elements.forEach((element, index) => {
                        element.textContent = roman[index];
                    });
                    
                    const chord_names = chord_info_element.querySelectorAll('.chord-name');
                    chord_names.forEach((chord_name, index) => {
                        chord_name.textContent = chords[index];
                    });
                }
                
                // When key changes, we need to update progression hints
                update_prog_hints(card_value);
                
            } else if (slot_type === 'prog') {
                // Update progression hints based on current key
                update_prog_hint(card, card_value, current_key);
                
            } else if (slot_type === 'vibe') {
                // Update vibe hint
                update_vibe_hint(card, card_value);
                
            } else if (slot_type === 'tempo') {
                // Update rhythm visualization if it's a tempo card
                const visualization_element = card.querySelector('.rhythm-visualization');
                
                // If there's no visualization element, create one
                if (!visualization_element) {
                    const visualization = rhythm_viz_get(card_value);
                    
                    const rhythm_visualization = document.createElement('div');
                    rhythm_visualization.className = 'rhythm-visualization';
                    rhythm_visualization.textContent = visualization;
                    
                    card.querySelector('.card-content').appendChild(rhythm_visualization);
                } else {
                    // Update existing visualization
                    visualization_element.textContent = rhythm_viz_get(card_value);
                }
            }
        });
        add_play_buttons();
    }
    // 6. Function to disable all default click behaviors
    function click_default_prevent() {
        // Prevent default clicks on the entire document during animations
        const handleClick = (e) => {
            if (slot_animating_is()) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };
        
        // Apply to click and touchstart events
        document.addEventListener('click', handleClick, true);
        document.addEventListener('touchstart', handleClick, true);
    }
    // 7. Function to create and add click areas
    function clickzone_create() {
        console.log("clickzone_create is being called");
        
        Object.keys(slots).forEach(slot_type => {
            // Remove any existing click areas first
            const existing_areas = slots[slot_type].querySelectorAll('.click-area');
            existing_areas.forEach(area => {
                console.log(`Removing existing click area from ${slot_type}`);
                area.remove();
            });
            
            // Create click areas for top and bottom half
            const clickzone_top = document.createElement('div');
            clickzone_top.className = 'click-area clickzone_top';
            clickzone_top.style.position  = 'absolute';
            clickzone_top.style.top       = '0';
            clickzone_top.style.left      = '0';
            clickzone_top.style.width     = '100%';
            
            // Special height for tempo slot
            if (slot_type === 'tempo') {
                clickzone_top.style.height = '33.33%'; // Top third for tempo
            } else {
                clickzone_top.style.height = '50%'; // Top half for other slots
            }
            
            clickzone_top.style.zIndex    = '20';
            clickzone_top.style.cursor    = 'pointer';
            
            const clickzone_bottom = document.createElement('div');
            clickzone_bottom.className = 'click-area clickzone_bottom';
            clickzone_bottom.style.position  = 'absolute';
            clickzone_bottom.style.bottom    = '0';
            clickzone_bottom.style.left      = '0';
            clickzone_bottom.style.width     = '100%';
            
            // Special height for tempo slot
            if (slot_type === 'tempo') {
                clickzone_bottom.style.height = '33.33%'; // Bottom third for tempo
            } else {
                clickzone_bottom.style.height = '50%'; // Bottom half for other slots
            }
            
            clickzone_bottom.style.zIndex    = '20';
            clickzone_bottom.style.cursor    = 'pointer';
            
            // For tempo slot, create a middle click area with no event listeners (for play button)
            if (slot_type === 'tempo') {
                const clickzone_middle = document.createElement('div');
                clickzone_middle.className = 'click-area clickzone_middle';
                clickzone_middle.style.position  = 'absolute';
                clickzone_middle.style.top       = '33.33%';
                clickzone_middle.style.left      = '0';
                clickzone_middle.style.width     = '100%';
                clickzone_middle.style.height    = '33.33%';
                clickzone_middle.style.zIndex    = '19';
                slots[slot_type].appendChild(clickzone_middle);
            }
            
            // Add the click areas to the slot
            slots[slot_type].style.position = 'relative';
            slots[slot_type].appendChild(clickzone_top);
            slots[slot_type].appendChild(clickzone_bottom);
            
            // Find the overlay and ensure it stays on top
            const overlay = slots[slot_type].querySelector('.slot-overlay');
            if (overlay) {
                slots[slot_type].appendChild(overlay);
            }
            
            // Add event listeners to the top click area
            ['click', 'touchend'].forEach(eventType => {
                clickzone_top.addEventListener(eventType, (event) => {
                    console.log(`Dynamic clickzone_top clicked for ${slot_type}`);
                    if (event.type === 'touchend') {
                        event.preventDefault();
                    }
                    slot_rotate(slot_type, -1);
                });
            });
            
            // Add event listeners to the bottom click area
            ['click', 'touchend'].forEach(eventType => {
                clickzone_bottom.addEventListener(eventType, (event) => {
                    console.log(`Dynamic clickzone_bottom clicked for ${slot_type}`);
                    if (event.type === 'touchend') {
                        event.preventDefault();
                    }
                    slot_rotate(slot_type, 1);
                });
            });
        });
    }
    // 8. Function to recreate click areas (to ensure they're on top)
    function clickzone_recreate() {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
            clickzone_create();
        }, 10);
    }
    // 9. Helper function to get chords for a key
    function key_chord_get(key) {
        // Extract note and mode
        const parts = key.split(' ');
        const root_note = parts[0];
        const major_is = parts[1] === 'Major';
        
        // Define notes in order, handling sharps and flats
        const all_notes = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'];
        
        // Find the index of the root note
        let root_index = -1;
        for (let i = 0; i < all_notes.length; i++) {
            const note = all_notes[i];
            if (note === root_note || note.includes(root_note)) {
                root_index = i;
                break;
            }
        }
        
        // Calculate the indices for the scale notes
        const scale_steps = major_is 
            ? [0, 2, 4, 5, 7, 9, 11] // Major scale steps (whole, whole, half, whole, whole, whole, half)
            : [0, 2, 3, 5, 7, 8, 10]; // Natural minor scale steps (whole, half, whole, whole, half, whole, whole)
        
        // Calculate the chord types
        const chord_types = major_is 
            ? ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'] 
            : ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj'];
        
        // Generate the chords
        const chords = [];
        for (let i = 0; i < 7; i++) {
            const note_index = (root_index + scale_steps[i]) % 12;
            const note = all_notes[note_index];
            chords.push(`${note} ${chord_types[i]}`);
        }
        
        return chords;
    }
    // 10. Set the content of the new card for a key
    function key_hint_get(key) {
        const chords = key_chord_get(key);
        const roman = key_roman_get(key);
        
        return `
            <div class="card-content">
                <p class="card-value">${key}</p>
                <div class="chord-info">
                    <div class="romans">
                        <span class="roman">${roman[0]}</span>
                        <span class="roman">${roman[1]}</span>
                        <span class="roman">${roman[2]}</span>
                        <span class="roman">${roman[3]}</span>
                        <span class="roman">${roman[4]}</span>
                        <span class="roman">${roman[5]}</span>
                        <span class="roman">${roman[6]}</span>
                    </div>
                    <div class="chord-names">
                        <span class="chord-name">${chords[0]}</span>
                        <span class="chord-name">${chords[1]}</span>
                        <span class="chord-name">${chords[2]}</span>
                        <span class="chord-name">${chords[3]}</span>
                        <span class="chord-name">${chords[4]}</span>
                        <span class="chord-name">${chords[5]}</span>
                        <span class="chord-name">${chords[6]}</span>
                    </div>
                </div>
            </div>
        `;
    }
    // 11. Helper function to get Roman numerals for a key
    function key_roman_get(key) {
        const major_is = key.includes('Major');
        
        return major_is 
            ? ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
            : ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];
    }
    // 12. Function to pull the lever and randomize all slots
    function lever_pull() {
        // Prevent lever pull during animation
        if (slot_animating_is()) {
            return;
        }
        
        is_lever_pulling = true;
        blocker_global_show(); // Show the global overlay during animation
        
        // Animate the lever
        const lever_handle = lever.querySelector('.lever_handle');
        lever_handle.style.transform = 'translateY(20px)';
        
        let all_slots_complete = 0;
        const total_slots = Object.keys(slots).length;
        
        setTimeout(() => {
            lever_handle.style.transform = '';
            
            // Randomize each slot with a slight delay between them
            Object.keys(slots).forEach((slot_type, index) => {
                setTimeout(() => {
                    // Get random index
                    const randomIndex = Math.floor(Math.random() * slot_data[slot_type].length);
                    const direction = randomIndex > current_indices[slot_type] ? 1 : -1;
                    
                    // Calculate the number of steps to take
                    const steps = Math.abs(randomIndex - current_indices[slot_type]);
                    
                    // If we're already at the target index, still rotate once
                    if (steps === 0) {
                        lever_rotate(slot_type, 1, () => {
                            all_slots_complete++;
                            if (all_slots_complete >= total_slots) {
                                lever_pull_finish();
                            }
                        });
                    } else {
                        // Simulate multiple rotations with a delay
                        lever_rotate_multi(slot_type, direction, Math.min(steps, 3), () => {
                            all_slots_complete++;
                            if (all_slots_complete >= total_slots) {
                                lever_pull_finish();
                            }
                        });
                    }
                    
                    current_indices[slot_type] = randomIndex;
                }, index * SLOT_DELAY);
            });
        }, LEVER_DELAY);
    }
    // 13. Function to finish lever pull and re-enable interactions
    function lever_pull_finish() {
        is_lever_pulling = false;
        blocker_global_hide(); // Hide the global overlay after lever pull animation
        
        // Update all progression hints to ensure they're visible
        const current_key = slot_data.key[current_indices.key];
        update_prog_hints(current_key);
    }
    // 14. Version of rotateSlot specifically for lever pull (with callback)
    function lever_rotate(slot_type, direction, callback) {
        slots[slot_type].dataset.animating = 'true';
        blocker_slot_show(slot_type); // Show the slot-specific overlay
        
        // Get the slot window and current card
        const card_slot = slots[slot_type].querySelector('.card-slot');
        const current_card = card_slot.querySelector('.current-card');
        if (!current_card) {
            slots[slot_type].dataset.animating = 'false';
            return;
        }
        
        // Create a new card that will slide in
        const new_card = document.createElement('div');
        new_card.className = `card ${slot_color_class_get(slot_type)}`;
        
        // Update the index for this rotation
        current_indices[slot_type] = (current_indices[slot_type] + direction + slot_data[slot_type].length) % slot_data[slot_type].length;
        
        // Get the new card value
        const card_value = slot_data[slot_type][current_indices[slot_type]];
        
        // Get current key for progression hints
        const current_key = slot_data.key[current_indices.key];
        
        // Set the content of the new card
        if (slot_type === 'key') {
            // For key cards, add chord information
            new_card.innerHTML = key_hint_get(card_value);
        } else if (slot_type === 'tempo') {
            // For tempo cards, add rhythm visualization
            new_card.innerHTML = tempo_hint_get(card_value);
        } else if (slot_type === 'prog') {
            // For progression cards, add chord hint
            new_card.innerHTML = `
            <div class="card-content">
                    <p class="card-value">${card_value}</p>
            </div>
        `;
            // Add progression hint after a small delay to ensure content is rendered
            setTimeout(() => {
                update_prog_hint(new_card, card_value, current_key);
            }, 10);
        } else if (slot_type === 'vibe') {
            // For vibe cards, add vibe hint
            new_card.innerHTML = `
                <div class="card-content">
                    <p class="card-value">${card_value}</p>
                </div>
            `;
            // Add vibe hint after a small delay to ensure content is rendered
            setTimeout(() => {
                update_vibe_hint(new_card, card_value);
            }, 10);
        } else {
            // For other cards, just show the value
            new_card.innerHTML = `
                <div class="card-content">
                    <p class="card-value">${card_value}</p>
                </div>
            `;
        }
        
        // Position the new card
        if (direction > 0) {
            // Coming from below
            new_card.style.transform = 'translateY(100%)';
        } else {
            // Coming from above
            new_card.style.transform = 'translateY(-100%)';
        }
        
        // Add the new card to the slot window
        card_slot.appendChild(new_card);
        
        // Force reflow
        new_card.offsetHeight;
        
        // Animate the current card out
        current_card.style.transform = direction > 0 ? 'translateY(-100%)' : 'translateY(100%)';
        
        // Animate the new card in
        new_card.style.transform = 'translateY(0)';
        new_card.classList.add('current-card');
        
        // Remove the old card after animation
        setTimeout(() => {
            if (current_card.parentNode) {
                current_card.remove();
            }
            slots[slot_type].dataset.animating = 'false';
            blocker_slot_hide(slot_type); // Hide the slot-specific overlay
            
            // If the key changed, update progression hints
            if (slot_type === 'key') {
                update_prog_hints(card_value);
            }
            
            // If this is a tempo card, add a play button
            if (slot_type === 'tempo') {
                add_play_buttons();
            }
            
            if (callback) callback();
        }, ANIMATION_SPEED);
    }
    // 15. Function to simulate multiple rotations with a delay (with callback)
    function lever_rotate_multi(slot_type, direction, steps, finalCallback) {
        if (steps <= 0) {
            slots[slot_type].dataset.animating = 'false';
            blocker_slot_hide(slot_type); // Hide the slot-specific overlay
            if (finalCallback) finalCallback();
            return;
        }
        
        slots[slot_type].dataset.animating = 'true';
        blocker_slot_show(slot_type); // Show the slot-specific overlay
        
        // Get the slot window and current card
        const card_slot = slots[slot_type].querySelector('.card-slot');
        const current_card = card_slot.querySelector('.current-card');
        if (!current_card) {
            slots[slot_type].dataset.animating = 'false';
            if (finalCallback) finalCallback();
            return;
        }
        
        // Create a new card that will slide in
        const new_card = document.createElement('div');
        new_card.className = `card ${slot_color_class_get(slot_type)}`;
        
        // Update the index for this rotation
        current_indices[slot_type] = (current_indices[slot_type] + direction + slot_data[slot_type].length) % slot_data[slot_type].length;
        
        // Get the new card value
        const card_value = slot_data[slot_type][current_indices[slot_type]];
        
        // Get current key for progression hints
        const current_key = slot_data.key[current_indices.key];
        
        // Set the content of the new card
        if (slot_type === 'key') {
            // For key cards, add chord information
            new_card.innerHTML = key_hint_get(card_value);
        } else if (slot_type === 'tempo') {
            // For tempo cards, add rhythm visualization
            new_card.innerHTML = tempo_hint_get(card_value);
        } else if (slot_type === 'prog') {
            // For progression cards, add chord hint
            new_card.innerHTML = `
                <div class="card-content">
                    <p class="card-value">${card_value}</p>
                </div>
            `;
            // Add progression hint after a small delay to ensure content is rendered
            setTimeout(() => {
                update_prog_hint(new_card, card_value, current_key);
            }, 10);
        } else if (slot_type === 'vibe') {
            // For vibe cards, add vibe hint
            new_card.innerHTML = `
                <div class="card-content">
                    <p class="card-value">${card_value}</p>
                </div>
            `;
            // Add vibe hint after a small delay to ensure content is rendered
            setTimeout(() => {
                update_vibe_hint(new_card, card_value);
            }, 10);
        } else {
            // For other cards, just show the value
            new_card.innerHTML = `
                <div class="card-content">
                    <p class="card-value">${card_value}</p>
                </div>
            `;
        }
        
        // Position the new card
        if (direction > 0) {
            // Coming from below
            new_card.style.transform = 'translateY(100%)';
        } else {
            // Coming from above
            new_card.style.transform = 'translateY(-100%)';
        }
        
        // Add the new card to the slot window
        card_slot.appendChild(new_card);
        
        // Force reflow
        new_card.offsetHeight;
        
        // Animate the current card out
        current_card.style.transform = direction > 0 ? 'translateY(-100%)' : 'translateY(100%)';
        
        // Animate the new card in
        new_card.style.transform = 'translateY(0)';
        new_card.classList.add('current-card');
        
        // Remove the old card after animation
        setTimeout(() => {
            if (current_card.parentNode) {
                current_card.remove();
            }
            
            // If the key changed, update progression hints
            if (slot_type === 'key') {
                update_prog_hints(card_value);
            }
            
            // If this is a tempo card, add a play button
            if (slot_type === 'tempo') {
                add_play_buttons();
            }
            
            // If we have more steps, continue rotating
            if (steps > 1) {
                setTimeout(() => {
                    lever_rotate_multi(slot_type, direction, steps - 1, finalCallback);
                }, MULTI_ROTATION_DELAY);
            } else {
                slots[slot_type].dataset.animating = 'false';
                blocker_slot_hide(slot_type); // Hide the slot-specific overlay
                if (finalCallback) finalCallback();
            }
        }, ANIMATION_SPEED);
    }
    // 16. orientation_class_apply (in index.html)
    // 17. orientation_handle (in index.html)
    // 18. Function to check if a progression is in minor key
    function prog_minor_is(prog) {
        return prog.startsWith('i-') || prog === 'i';
    }
    // 19. Helper function to convert progression notation to numeric value for sorting
    function prog_num_val_get(prog) {
        // Create a map for Roman numeral conversion
        const roman_to_num = {
            'i':    1,  'I':    1,
            'ii':   2,  'II':   2,
            'iii':  3,  'III':  3,
            'iv':   4,  'IV':   4,
            'v':    5,  'V':    5,
            'vi':   6,  'VI':   6,
            'vii':  7,  'VII':  7,
            '♭III': 3,  '♭iii': 3,  // Changed from bIII to ♭III
            '♭VI':  6,  '♭vi':  6,  // Changed from bVI to ♭VI
            '♭VII': 7,  '♭vii': 7   // Changed from bVII to ♭VII
        };
        
        // Replace Roman numerals with numbers
        let numeric = '';
        const parts = prog.split('-');
        
        parts.forEach(part => {
            if (roman_to_num[part]) {
                numeric += roman_to_num[part];
            }
        });
        
        // Parse as integer, default to a large number if parsing fails
        // to ensure invalid progressions sort to the end
        return parseInt(numeric) || 9999;
    }
    // 20. Helper function to get a unique identifier for sorting identical numeric values
    function prog_sort_key_get(prog) {
        const numeric_value = prog_num_val_get(prog);
        // Minor progressions get a ".5" added to their value to sort after major ones
        const minor_is = prog.startsWith('i-') || prog === 'i';
        
        return minor_is ? numeric_value + 0.5 : numeric_value;
    }
    // 21. Function to get rhythm visualization for tempo cards
    function rhythm_viz_get(rhythm) {
        // Create unique rhythm visualizations based on the rhythm name
        // Use more consistent notation that accurately reflects the patterns
        switch (rhythm) {
            // Original patterns
            case 'Four on Floor':
                return '♩  ♩  ♩  ♩'; // Quarter notes evenly spaced
                
            case 'Wide Quarters':
                return '♩   ♩   ♩'; // Three widely spaced quarter notes
                
            case 'Quarters & Eighths':
                return '♩ ♪♪ ♩ ♪♪'; // Quarter, two eighths, quarter, two eighths
                
            case 'Quarter-Eighth Alternating':
                return '♩ ♪ · ♩ ♪ ·'; // Quarter, eighth, rest, quarter, eighth, rest
                
            case 'Eighth-Quarter Swing':
                return '♪♪ ♩ ♪♪ ♩'; // Two eighths, quarter, two eighths, quarter
                
            case 'Double Eighth Kick':
                return '♪♪ − ♩ ♩'; // Two eighths, rest, quarter, quarter
                
            case 'Sixteenth Roll & Kicks':
                return '♬♬ ♩ ♩ ♩'; // Four sixteenths followed by three quarters
                
            case 'Steady Eighths':
                return '♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪'; // Eight evenly spaced eighth notes
                
            case 'Double Sixteenths':
                return '♬  ♬  ♬  ♬'; // Four pairs of sixteenth notes, spaced
                
            case 'Sixteenth Rush':
                return '♬♬♬♬♬♬♬♬'; // Continuous sixteenth notes
                
            // World and popular music rhythms
            case 'Samba':
                return '♪ · ♩ ♪♪ ♩ ♪'; // Eighth, rest, quarter, two eighths, quarter, eighth
                
            case 'Bossa Nova':
                return '♪ ♩ ♪ ♩ ♪♪'; // Eighth, quarter, eighth, quarter, two eighths
                
            case 'Rumba':
                return '♪♪♪ · ♪♪ ♩ ♪'; // Triplet, rest, two eighths, quarter, eighth
                
            case 'Waltz':
                return '♩ ♪ · ♪'; // Quarter, eighth, rest, eighth (3/4 time)
                
            case 'Reggae':
                return '♩ · ♪ ♩ · ♪'; // Quarter, rest, eighth, quarter, rest, eighth
                
            case 'Salsa':
                return '♪♪ ♩ ♪ · ♩ ♪'; // Two eighths, quarter, eighth, rest, quarter, eighth
                
            case 'Funk Groove':
                return '♪ ♩ ♪ ♩ ♪♪'; // Eighth, quarter, eighth, quarter, two eighths
                
            case 'Hip Hop Beat':
                return '♩ ♪♪ ♩ ♪♪'; // Quarter, two eighths, quarter, two eighths
                
            case 'Shuffle':
                return '♪♪♪ · ♪♪♪ · ♪♪'; // Triplet, rest, triplet, rest, two eighths
                
            case 'Tango':
                return '♩♪ · ♩ ♩♪'; // Quarter-eighth, rest, quarter, quarter-eighth
                
            case 'Cha Cha':
                return '♪ · ♪ · ♩ ♪♪'; // Eighth, rest, eighth, rest, quarter, two eighths
                
            case 'Trap Beat':
                return '♩ ♩ ♬♬ ♩'; // Quarter, quarter, four sixteenths, quarter
                
            case 'Flamenco':
                return '♪♪ ♩ ♪ · ♩'; // Two eighths, quarter, eighth, rest, quarter
                
            case 'Bulerias':
                return '♬♬ ♪♪ · ♩'; // Four sixteenths, two eighths, rest, quarter
                
            case 'Bolero':
                return '♩ · ♪♪♪ · ♩'; // Quarter, rest, triplet, rest, quarter
                
            case 'Swing Jazz':
                return '♪♫ ♪ · ♪♫ ♪ ·'; // Swung eighth-quarter, eighth, rest, repeat
                
            default:
                return '♩ ♩ ♩ ♩'; // Default visualization
        }
    }
    // 22. Check if any slot is currently animating
    function slot_animating_is() {
        let animating = false;
        Object.keys(slots).forEach(slot_type => {
            if (slots[slot_type].dataset.animating === 'true') {
                animating = true;
            }
        });
        return animating;
    }
    // 23. Helper function to get the color class for a slot type
    function slot_color_class_get(slot_type) {
        switch(slot_type) {
            case 'key':         return 'burgundy';
            case 'prog':        return 'yellow';
            case 'vibe':        return 'green';
            case 'tempo':       return 'blue';
            default:            return '';
        }
    }
    // 24. Function to rotate a specific slot
    function slot_rotate(slot_type, direction) {
        // Check if this slot is already animating or if lever is currently pulling
        if (slots[slot_type].dataset.animating === 'true' || is_lever_pulling) {
            return;
        }
        
        console.log(`Rotating ${slot_type} slot in direction ${direction}`);
        
        slots[slot_type].dataset.animating = 'true';
        blocker_global_show(); // Show the global overlay during animation
        blocker_slot_show(slot_type); // Show the slot-specific overlay
        
        // Get the slot window and current card
        const card_slot = slots[slot_type].querySelector('.card-slot');
        const current_card = card_slot.querySelector('.current-card');
        if (!current_card) {
            slots[slot_type].dataset.animating = 'false';
            blocker_global_hide();
            blocker_slot_hide(slot_type);
            return;
        }
        
        // Create a new card that will slide in
        const new_card = document.createElement('div');
        new_card.className = `card ${slot_color_class_get(slot_type)}`;
        
        // Update the index
        current_indices[slot_type] = (current_indices[slot_type] + direction + slot_data[slot_type].length) % slot_data[slot_type].length;
        
        // Get the new card value
        const card_value = slot_data[slot_type][current_indices[slot_type]];
        
        // Get current key for progression hints
        const current_key = slot_data.key[current_indices.key];
        
        // Set the content of the new card
        if (slot_type === 'key') {
            // For key cards, add chord information
            new_card.innerHTML = key_hint_get(card_value);
        } else if (slot_type === 'tempo') {
            // For tempo cards, add rhythm visualization
            new_card.innerHTML = tempo_hint_get(card_value);
        } else if (slot_type === 'prog') {
            // For progression cards, add chord hint
            new_card.innerHTML = `
                <div class="card-content">
                    <p class="card-value">${card_value}</p>
                </div>
            `;
            // Add progression hint
            setTimeout(() => {
                update_prog_hint(new_card, card_value, current_key);
            }, 10);
        } else if (slot_type === 'vibe') {
            // For vibe cards, add vibe hint
            new_card.innerHTML = `
                <div class="card-content">
                    <p class="card-value">${card_value}</p>
                </div>
            `;
            // Add vibe hint
            setTimeout(() => {
                update_vibe_hint(new_card, card_value);
            }, 10);
        } else {
            // For other cards, just show the value
            new_card.innerHTML = `
                <div class="card-content">
                    <p class="card-value">${card_value}</p>
                </div>
            `;
        }
        
        // Position the new card
        if (direction > 0) {
            // Coming from below
            new_card.style.transform = 'translateY(100%)';
        } else {
            // Coming from above
            new_card.style.transform = 'translateY(-100%)';
        }
        
        // Add the new card to the slot window
        card_slot.appendChild(new_card);
        
        // Force reflow
        new_card.offsetHeight;
        
        // Animate the current card out
        current_card.style.transform = direction > 0 ? 'translateY(-100%)' : 'translateY(100%)';
        
        // Animate the new card in
        new_card.style.transform = 'translateY(0)';
        new_card.classList.add('current-card');
        
        // Remove the old card after animation
        setTimeout(() => {
            if (current_card.parentNode) {
                current_card.remove();
            }
            slots[slot_type].dataset.animating = 'false';
            blocker_slot_hide(slot_type); // Hide the slot-specific overlay
            
            // Only hide global overlay if no other slots are animating
            if (!slot_animating_is()) {
                blocker_global_hide();
            }
            
            // If the key changed, update progression hints
            if (slot_type === 'key') {
                update_prog_hints(card_value);
            }
        }, ANIMATION_SPEED);
    }
    // 25. Set the content of the new card for a tempo (rhythm)
    function tempo_hint_get(tempo) {
        const visualization = rhythm_viz_get(tempo);
        
        return `
            <div class="card-content">
                <p class="card-value">${tempo}</p>
                <div class="rhythm-visualization">${visualization}</div>
            </div>
        `;
    }
    // ======================================
    // INITIALIZATION AND EVENT HANDLERS
    // ======================================
    // Initialize the slots with the first cards
    card_display_update();
    
    // Add event delegation for play buttons
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('play-button') || 
            event.target.closest('.play-button')) {
            handle_play_button_click(event);
        }
    });
    
    // Initialize play buttons on existing cards
    add_play_buttons();
    
    // Add direct event listeners to click zones instead of using inline onclick
    Object.keys(slots).forEach(slotType => {
        const slot = slots[slotType];
        const clickTop = slot.querySelector('.click-top');
        const clickBottom = slot.querySelector('.click-bottom');
        
        console.log(`Setting up click handlers for ${slotType} slot`);
        console.log(`Top element found: ${clickTop !== null}`);
        console.log(`Bottom element found: ${clickBottom !== null}`);
        
        if (clickTop) {
            clickTop.addEventListener('click', function(event) {
                console.log(`Clicked top of ${slotType}`);
                event.preventDefault();
                event.stopPropagation();
                slot_rotate(slotType, -1); // Previous
            });
        }
        
        if (clickBottom) {
            clickBottom.addEventListener('click', function(event) {
                console.log(`Clicked bottom of ${slotType}`);
                event.preventDefault();
                event.stopPropagation();
                slot_rotate(slotType, 1); // Next
            });
        }
    });
    
    // COMMENT OUT: Don't create dynamic click zones since we're using the static ones
    // clickzone_create();
    click_default_prevent();
    // Add click and touch events for the lever
    console.log("Setting up lever click handler");
    lever.addEventListener('click', function(event) {
        console.log("Lever clicked via JavaScript handler");
        if (!is_lever_pulling) {
            lever_pull();
        }
    });
    
    // Define global function for direct HTML onclick handler to toggle rhythm playback
    window.toggleRhythmPlay = function() {
        console.log("Middle section clicked - toggling rhythm play");
        // Get current tempo value
        const tempo_card = slots.tempo.querySelector('.current-card');
        const tempo_value = tempo_card.querySelector('.card-value').textContent;
        
        // Toggle play/stop
        if (is_playing) {
            stop_audio();
        } else {
            play_rhythm(tempo_value);
        }
    };
    
    // Define global functions for direct HTML onclick handlers
    window.handleSlotClick = function(slotType, direction) {
        // Convert direction string to number
        const dir = direction === 'prev' ? -1 : 1;
        
        // Call the rotation function
        slot_rotate(slotType, dir);
    };
    
    window.handleLeverClick = function() {
        if (!is_lever_pulling) {
            lever_pull();
        }
    };
    
    // ======================================
    // REVEAL MODE - Shows CSS class names on hover
    // ======================================
    window.revealMode = false; // Set to false by default
    
    // Create class display element
    const classDisplay = document.createElement('div');
    classDisplay.style.position = 'fixed';
    classDisplay.style.bottom = '0';
    classDisplay.style.left = '0';
    classDisplay.style.right = '0';
    classDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
    classDisplay.style.color = 'white';
    classDisplay.style.padding = '15px 20px';
    classDisplay.style.fontFamily = 'monospace';
    classDisplay.style.fontSize = '16px';
    classDisplay.style.zIndex = '9999';
    classDisplay.style.textAlign = 'left';
    classDisplay.style.maxHeight = '30vh';
    classDisplay.style.overflowY = 'auto';
    document.body.appendChild(classDisplay);
    
    // Create a permanent toggle button for reveal mode
    const revealToggleBtn = document.createElement('button');
    revealToggleBtn.textContent = 'Reveal Mode: ON';
    revealToggleBtn.style.position = 'fixed';
    revealToggleBtn.style.top = '10px';
    revealToggleBtn.style.right = '10px';
    revealToggleBtn.style.backgroundColor = 'rgba(0, 180, 180, 0.7)';
    revealToggleBtn.style.color = 'white';
    revealToggleBtn.style.border = '1px solid white';
    revealToggleBtn.style.borderRadius = '4px';
    revealToggleBtn.style.padding = '5px 10px';
    revealToggleBtn.style.fontFamily = 'Arial, sans-serif';
    revealToggleBtn.style.fontSize = '14px';
    revealToggleBtn.style.zIndex = '10000';
    revealToggleBtn.style.cursor = 'pointer';
    document.body.appendChild(revealToggleBtn);
    
    // Function to update reveal mode state
    function updateRevealModeState() {
        if (window.revealMode) {
            revealToggleBtn.textContent = 'Reveal Mode: ON';
            revealToggleBtn.style.backgroundColor = 'rgba(0, 180, 180, 0.7)';
            document.body.style.outline = '3px solid rgba(0, 255, 255, 0.5)';
        } else {
            revealToggleBtn.textContent = 'Reveal Mode: OFF';
            revealToggleBtn.style.backgroundColor = 'rgba(100, 100, 100, 0.7)';
            document.body.style.outline = 'none';
            classDisplay.style.display = 'none';
            
            // Remove any highlights
            const highlightedElements = document.querySelectorAll('.reveal-highlight');
            highlightedElements.forEach(el => {
                el.classList.remove('reveal-highlight');
                el.style.outline = '';
            });
        }
    }
    
    // Initialize button state
    updateRevealModeState();
    
    // Add click handler to the toggle button
    revealToggleBtn.addEventListener('click', function() {
        window.revealMode = !window.revealMode;
        updateRevealModeState();
    });
    
    // Add hover event listener to all elements
    let hoverTimeout;
    let lastHoveredElement = null;
    
    document.addEventListener('mouseover', function(event) {
        if (!window.revealMode) return;
        
        // Store the currently hovered element
        const target = event.target;
        
        // If hovering over the info display itself, keep showing the last info
        if (target === classDisplay || classDisplay.contains(target)) {
            return; // Don't update if hovering over the class display
        }
        
        // Clear any existing timeout
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
        }
        
        // Set a delay before updating the display (500ms instead of 300ms)
        hoverTimeout = setTimeout(() => {
            lastHoveredElement = target;
            updateClassDisplay(target);
        }, 1000);
    });
    
    // Function to update the class display with element info
    function updateClassDisplay(target) {
        // Extract class names and IDs
        const classes = Array.from(target.classList).join(', ');
        const id = target.id ? `#${target.id}` : '';
        const tagName = target.tagName.toLowerCase();
        
        // Build hierarchical information
        let hierarchyInfo = '';
        let currentElement = target;
        let depth = 0;
        
        // Limit to 3 levels up to avoid overwhelming information
        while (currentElement && depth < 3) {
            const elClasses = Array.from(currentElement.classList).join(', ');
            const elId = currentElement.id ? `#${currentElement.id}` : '';
            const elTag = currentElement.tagName.toLowerCase();
            
            // Add data attributes for copying
            const tagForCopy = `data-copy="${elTag}"`;
            const idForCopy = elId ? `data-copy="${elId}"` : '';
            const classesForCopy = elClasses ? `data-copy=".${elClasses.replace(/, /g, ' .')}"` : '';
            
            hierarchyInfo += `<div style="margin-left:${depth * 20}px; margin-bottom: 8px;">
                <span class="copy-item" ${tagForCopy} style="color:${depth === 0 ? '#4dff4d' : '#cccccc'}; font-weight: ${depth === 0 ? 'bold' : 'normal'}; cursor: pointer;">${elTag}</span>
                ${elId ? `<span class="copy-item" ${idForCopy} style="color:#ffa64d; margin-left: 5px; cursor: pointer;">${elId}</span>` : ''}
                ${elClasses ? `<span class="copy-item" ${classesForCopy} style="color:#4dafff; margin-left: 5px; cursor: pointer;">.${elClasses.replace(/, /g, ' .')}</span>` : ''}
            </div>`;
            
            currentElement = currentElement.parentElement;
            depth++;
        }
        
        // Show the information
        classDisplay.innerHTML = `
            <div style="font-weight:bold; margin-bottom:10px; font-size: 18px;">Element Hierarchy:</div>
            ${hierarchyInfo}
            <div style="margin-top: 12px; font-size: 12px; opacity: 0.7;">Click any element name to copy to clipboard</div>
        `;
        classDisplay.style.display = 'block';
        
        // Add click event listeners to all copy items
        const copyItems = classDisplay.querySelectorAll('.copy-item');
        copyItems.forEach(item => {
            item.addEventListener('click', function() {
                const textToCopy = this.getAttribute('data-copy');
                copyToClipboard(textToCopy);
                showCopyFeedback(this);
            });
        });
        
        // Add subtle highlight to the hovered element
        const previousHighlight = document.querySelector('.reveal-highlight');
        if (previousHighlight && previousHighlight !== target) {
            previousHighlight.classList.remove('reveal-highlight');
            previousHighlight.style.outline = '';
        }
        
        target.classList.add('reveal-highlight');
        target.style.outline = '3px dashed rgba(77, 255, 77, 0.9)';
    }
    
    // Function to copy text to clipboard
    function copyToClipboard(text) {
        // Create a temporary textarea element
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        
        // Select and copy the text
        textarea.select();
        document.execCommand('copy');
        
        // Clean up
        document.body.removeChild(textarea);
        console.log('Copied to clipboard:', text);
    }
    
    // Function to show copy feedback
    function showCopyFeedback(element) {
        // Create feedback element
        const feedback = document.createElement('div');
        feedback.textContent = 'Copied!';
        feedback.style.position = 'absolute';
        feedback.style.backgroundColor = 'rgba(0, 200, 0, 0.8)';
        feedback.style.color = 'white';
        feedback.style.padding = '3px 8px';
        feedback.style.borderRadius = '4px';
        feedback.style.fontSize = '12px';
        feedback.style.zIndex = '10001';
        feedback.style.pointerEvents = 'none';
        
        // Position the feedback near the clicked element
        const rect = element.getBoundingClientRect();
        feedback.style.top = `${rect.top - 25}px`;
        feedback.style.left = `${rect.left + rect.width / 2 - 30}px`;
        
        // Add to the body and animate
        document.body.appendChild(feedback);
        
        // Animate and remove
        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                document.body.removeChild(feedback);
            }, 500);
        }, 1000);
    }
    
    // Keep the classDisplay visible when mouse hovers over it
    classDisplay.addEventListener('mouseover', function() {
        // Keep the last highlighted element when hovering over the display
        if (lastHoveredElement) {
            lastHoveredElement.classList.add('reveal-highlight');
            lastHoveredElement.style.outline = '3px dashed rgba(77, 255, 77, 0.9)';
        }
    });
    
    // Clear highlight when mouse leaves an element
    document.addEventListener('mouseout', function(event) {
        if (!window.revealMode) return;
        
        const target = event.target;
        const relatedTarget = event.relatedTarget;
        
        // Don't clear if mousing over the class display
        if (relatedTarget === classDisplay || (classDisplay.contains(relatedTarget))) {
            return;
        }
        
        // Don't clear if it's within the same hierarchy
        if (target.contains(relatedTarget) || relatedTarget?.contains(target)) {
            return;
        }
        
        // Only clear if actually leaving an element (not entering a child)
        if (target.classList.contains('reveal-highlight')) {
            // Add a longer delay to allow moving to the info panel (300ms instead of 100ms)
            setTimeout(() => {
                const hoveredDisplay = classDisplay === document.activeElement || 
                                      classDisplay.contains(document.activeElement) ||
                                      classDisplay.matches(':hover');
                
                if (!hoveredDisplay) {
                    target.classList.remove('reveal-highlight');
                    target.style.outline = '';
                }
            }, 1000);
        }
    });
    
    // Add key event to toggle reveal mode
    document.addEventListener('keydown', function(event) {
        // Toggle reveal mode when pressing Alt+R
        if (event.altKey && event.key === 'r') {
            window.revealMode = !window.revealMode;
            updateRevealModeState();
            
            // Show notification
            if (window.revealMode) {
                // Create and show a notification
                const notification = document.createElement('div');
                notification.textContent = 'Reveal Mode Activated - Press Alt+R to toggle';
                notification.style.position = 'fixed';
                notification.style.top = '20px';
                notification.style.left = '50%';
                notification.style.transform = 'translateX(-50%)';
                notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                notification.style.color = 'cyan';
                notification.style.padding = '8px 15px';
                notification.style.borderRadius = '5px';
                notification.style.fontFamily = 'monospace';
                notification.style.fontSize = '14px';
                notification.style.zIndex = '10000';
                notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.5)';
                document.body.appendChild(notification);
                
                // Remove the notification after 3 seconds
                setTimeout(() => {
                    notification.remove();
                }, 3000);
            }
        }
    });
    
    // NEW: Function to update progression hint for a progression card
    function update_prog_hint(card, progression, current_key) {
        // Get existing hint element or create a new one
        let hint_element = card.querySelector('.prog-hint');
        
        if (!hint_element) {
            hint_element = document.createElement('div');
            hint_element.className = 'prog-hint';
            card.querySelector('.card-content').appendChild(hint_element);
        }
        
        // Get the chord progression in the current key
        const chord_hint = prog_chord_hint_get(progression, current_key);
        hint_element.textContent = chord_hint;
    }
    
    // NEW: Function to update all progression hints when key changes
    function update_prog_hints(current_key) {
        const prog_card = slots.prog.querySelector('.current-card');
        if (prog_card) {
            const prog_value = prog_card.querySelector('.card-value').textContent;
            update_prog_hint(prog_card, prog_value, current_key);
        }
    }
    
    // NEW: Function to get chord hint for a progression in a specific key
    function prog_chord_hint_get(progression, key) {
        const chords = key_chord_get(key);
        const romans = key_roman_get(key);
        
        // Create a mapping of roman numerals to chord names
        const roman_to_chord = {};
        romans.forEach((roman, index) => {
            // Handle both uppercase and lowercase romans
            roman_to_chord[roman.toUpperCase()] = chords[index];
            roman_to_chord[roman.toLowerCase()] = chords[index];
            
            // Handle flat notation
            if (roman.includes('°')) {
                roman_to_chord[roman.replace('°', '')] = chords[index];
            }
        });
        
        // Also add flattened numerals mapping
        roman_to_chord['♭III'] = chords[2]; // This is an approximation
        roman_to_chord['♭VI'] = chords[5]; // This is an approximation
        roman_to_chord['♭VII'] = chords[6]; // This is an approximation
        
        // Parse the progression and replace with actual chord names
        const prog_parts = progression.split('-');
        const chord_parts = prog_parts.map(part => {
            return roman_to_chord[part] || part;
        });
        
        return chord_parts.join(' - ');
    }
    
    // NEW: Function to get a nuanced hint for a vibe
    function vibe_hint_get(vibe) {
        const hints = {
            'Melancholic': 'but not self-indulgent',
            'Euphoric': 'without losing control',
            'Dreamy': 'yet firmly grounded',
            'Aggressive': 'with calculated restraint',
            'Nostalgic': 'avoiding sentimentality',
            'Triumphant': 'without arrogance',
            'Mysterious': 'but not obscure',
            'Playful': 'with serious undertones',
            'Ethereal': 'yet tangible enough to grasp',
            'Haunting': 'beyond mere spookiness',
            'Intense': 'without overwhelming',
            'Serene': 'with hidden complexity',
            'Chaotic': 'with underlying order',
            'Uplifting': 'without forced optimism',
            'Somber': 'yet not hopeless',
            'Energetic': 'with focused intention',
            'Reflective': 'avoiding self-absorption',
            'Dramatic': 'without melodrama',
            'Whimsical': 'with intellectual depth',
            'Tense': 'yet not anxiety-inducing',
            'Hopeful': 'tempered with realism',
            'Gritty': 'still maintaining polish',
            'Cosmic': 'while connecting to humanity',
            'Intimate': 'without being confessional',
            'Anthemic': 'avoiding clichés',
            'Hypnotic': 'while maintaining awareness',
            'Quirky': 'not just for novelty',
            'Majestic': 'without pomposity',
            'Brooding': 'with moments of clarity',
            'Bittersweet': 'leaning towards acceptance'
        };
        
        return hints[vibe] || 'with nuanced intention';
    }
    
    // NEW: Function to update vibe hint for a vibe card
    function update_vibe_hint(card, vibe) {
        // Get existing hint element or create a new one
        let hint_element = card.querySelector('.vibe-hint');
        
        if (!hint_element) {
            hint_element = document.createElement('div');
            hint_element.className = 'vibe-hint';
            card.querySelector('.card-content').appendChild(hint_element);
        }
        
        // Get the vibe hint
        const hint = vibe_hint_get(vibe);
        hint_element.textContent = hint;
    }
    
    // Add function to create play button for existing cards during initialization
    function add_play_buttons() {
        const tempo_card = slots.tempo.querySelector('.current-card');
        if (tempo_card && !tempo_card.querySelector('.play-button')) {
            const play_button = document.createElement('div');
            play_button.className = 'play-button';
            
            // Make the play button invisible but still functional
            play_button.style.opacity = '0';
            play_button.style.width = '80%';
            play_button.style.height = '33.33%';
            play_button.style.backgroundColor = 'transparent';
            play_button.style.border = 'none';
            play_button.style.zIndex = '20'; // Higher than the click zones
            
            tempo_card.querySelector('.card-content').appendChild(play_button);
            
            // Add click event listener
            play_button.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                
                // Get current tempo value
                const tempo_card = slots.tempo.querySelector('.current-card');
                const tempo_value = tempo_card.querySelector('.card-value').textContent;
                
                // Toggle play/stop
                if (is_playing) {
                    stop_audio();
                } else {
                    play_rhythm(tempo_value);
                }
            });
        }
    }
    
    // Event handler for play button click
    function handle_play_button_click(event) {
        event.preventDefault();
        event.stopPropagation();
        
        // Get current tempo value
        const tempo_card = slots.tempo.querySelector('.current-card');
        const tempo_value = tempo_card.querySelector('.card-value').textContent;
        
        // Toggle play/stop
        if (is_playing) {
            stop_audio();
        } else {
            play_rhythm(tempo_value);
        }
    }
}); 