document.addEventListener('DOMContentLoaded', () => {
    // ======================================
    // DATA SETUP AND INITIALIZATION
    // ======================================
    
    // Define the card data for each slot
    const slot_data = {
        key: [
            // Major keys in circle of fifths order
            'C Major', 'G Major', 'D Major', 'A Major', 'E Major', 'B Major', 'F# Major',
            'C# Major', 'F Major', 'Bb Major', 'Eb Major', 'Ab Major', 'Db Major', 'Gb Major',
            // Minor keys in circle of fifths order
            'A Minor', 'E Minor', 'B Minor', 'F# Minor', 'C# Minor', 'G# Minor', 'D# Minor',
            'A# Minor', 'D Minor', 'G Minor', 'C Minor', 'F Minor', 'Bb Minor', 'Eb Minor'
        ],
        prog: [
            // Group by numeric value, with major before minor
            'I-IV-V',       // 145 (major)
            'i-iv-v',       // 145 (minor)
            'i-iv-VII',     // 147 (minor)
            'I-ii-iii-IV',  // 1234 (major)
            'I-iii-IV-V',   // 1345 (major)
            'I-bIII-bVII-IV', // 1374 (major)
            'i-bIII-bVII',  // 137 (minor)
            'I-IV-I-V',     // 1415 (major)
            'I-IV-vi-V',    // 1465 (major)
            'I-V-bVII-IV',  // 1574 (major)
            'I-V-vi-IV',    // 1564 (major)
            'i-bVI-bVII',   // 167 (minor)
            'I-vi-ii-V',    // 1625 (major)
            'i-VI-III-VII', // 1637 (minor)
            'I-vi-IV-V',    // 1645 (major)
            'I-bVII-bVI-V', // 1765 (major)
            'i-bVII-bVI-V', // 1765 (minor)
            'I-bVII-bVI-bVII', // 1767 (major)
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
            // Rhythmic patterns with visual representation
            '4/4 Basic',          // Standard 4/4 time
            '3/4 Waltz',          // Classic waltz feel
            '6/8 Compound',       // Compound meter
            '5/4 Odd Meter',      // Five beats per measure
            '7/8 Asymmetric',     // Asymmetric rhythm
            '12/8 Blues',         // Shuffle feel
            '2/4 March',          // March feel
            'Syncopated',         // Emphasizing off-beats
            'Swing',              // Jazz swing feel
            'Backbeat',           // Emphasizing beats 2 and 4
            'Half-time',          // Half the perceived tempo
            'Double-time',        // Double the perceived tempo
            'Dotted',             // Dotted rhythms
            'Triplets',           // Triplet-based feel
            'Polyrhythm',         // Multiple rhythmic patterns
            'Shifting Accents',   // Changing accent patterns
        ]
    };

    // Animation speed in milliseconds (lower = faster)
    const ANIMATION_SPEED      = 150; // Reduced from 250ms to 150ms
    const LEVER_DELAY          = 75;  // Reduced from 150ms to 75ms
    const MULTI_ROTATION_DELAY = 30;  // Reduced from 50ms to 30ms
    const SLOT_DELAY           = 50;  // Reduced from 100ms to 50ms

    // Current index for each slot
    const current_indices = {
        key:   0,
        prog:  0,
        vibe:  0,
        tempo: 0
    };

    // Get DOM elements
    const slots = {
        key:   document.getElementById('key-slot'),
        prog:  document.getElementById('prog-slot'),
        vibe:  document.getElementById('vibe-slot'),
        tempo: document.getElementById('tempo-slot')
    };

    const container = document.querySelector('.container');
    const slot_machine = document.querySelector('.slot-machine');
    const lever = document.getElementById('random-lever');
    let is_lever_pulling = false;

    // ======================================
    // SORTING AND DATA PROCESSING FUNCTIONS
    // ======================================

    // Helper function to convert progression notation to numeric value for sorting
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
            'bIII': 3,  'biii': 3,
            'bVI':  6,  'bvi':  6,
            'bVII': 7,  'bvii': 7
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

    // Helper function to get a unique identifier for sorting identical numeric values
    function prog_sort_key_get(prog) {
        const numeric_value = prog_num_val_get(prog);
        // Minor progressions get a ".5" added to their value to sort after major ones
        const minor_is = prog.startsWith('i-') || prog === 'i';
        
        return minor_is ? numeric_value + 0.5 : numeric_value;
    }

    // Function to check if a progression is in minor key
    function prog_minor_is(prog) {
        return prog.startsWith('i-') || prog === 'i';
    }

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

    // ======================================
    // MUSIC THEORY & CONTENT GENERATION
    // ======================================

    // Helper function to get chords for a key
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

    // Helper function to get Roman numerals for a key
    function key_roman_get(key) {
        const major_is = key.includes('Major');
        
        return major_is 
            ? ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
            : ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];
    }

    // Function to get rhythm visualization for tempo cards
    function rhythm_viz_get(rhythm) {
        const patterns = {
            '4/4 Basic':        '♩ ♩ ♩ ♩',
            '3/4 Waltz':        '♩ ♩ ♩',
            '6/8 Compound':     '♪♪♪ ♪♪♪',
            '5/4 Odd Meter':    '♩ ♩ ♩ ♩ ♩',
            '7/8 Asymmetric':   '♪♪♪♪ ♪♪♪',
            '12/8 Blues':       '♩. ♩. ♩. ♩.',
            '2/4 March':        '♩ ♩',
            'Syncopated':       '♪ ♩ ♪ ▯',
            'Swing':            '♪♫ ♪♫',
            'Backbeat':         '▯ ♩ ▯ ♩',
            'Half-time':        '▮ ▯ ▮ ▯',
            'Double-time':      '♪♪♪♪ ♪♪♪♪',
            'Dotted':           '♩. ♪ ♩. ♪',
            'Triplets':         '♪♪♪ ♪♪♪ ♪♪♪ ♪♪♪',
            'Polyrhythm':       '♩♩♩ ♪♪♪♪',
            'Shifting Accents': '▮♩♩ ♩▮♩',
        };
        
        return patterns[rhythm] || '';
    }

    // ======================================
    // CARD CONTENT GENERATORS
    // ======================================

    // Set the content of the new card for a key
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

    // Set the content of the new card for a tempo (rhythm)
    function tempo_hint_get(tempo) {
        const visualization = rhythm_viz_get(tempo);
        
        return `
            <div class="card-content">
                <p class="card-value">${tempo}</p>
                <div class="rhythm-visualization">${visualization}</div>
            </div>
        `;
    }

    // Helper function to get the color class for a slot type
    function slot_color_class_get(slot_type) {
        switch(slot_type) {
            case 'key':         return 'burgundy';
            case 'prog':        return 'yellow';
            case 'vibe':        return 'green';
            case 'tempo':       return 'blue';
            default:            return '';
        }
    }

    // ======================================
    // UI OVERLAYS AND BLOCKERS
    // ======================================

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

    // Function to show the global overlay
    function blocker_global_show() {
        blocker_global.style.display = 'block';
    }

    // Function to hide the global overlay
    function blocker_global_hide() {
        blocker_global.style.display = 'none';
    }

    // Function to show slot overlay for a specific slot
    function blocker_slot_show(slot_type) {
        const overlay = slots[slot_type].querySelector('.slot-overlay');
        if (overlay) {
            overlay.style.display = 'block';
        }
    }

    // Function to hide slot overlay for a specific slot
    function blocker_slot_hide(slot_type) {
        const overlay = slots[slot_type].querySelector('.slot-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

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

    // ======================================
    // CLICKZONE MANAGEMENT
    // ======================================

    // Function to create and add click areas
    function clickzone_create() {
        Object.keys(slots).forEach(slot_type => {
            // Remove any existing click areas first
            const existing_areas = slots[slot_type].querySelectorAll('.click-area');
            existing_areas.forEach(area => area.remove());
            
            // Create click areas for top and bottom half
            const clickzone_top = document.createElement('div');
            clickzone_top.className = 'click-area clickzone_top';
            clickzone_top.style.position  = 'absolute';
            clickzone_top.style.top       = '0';
            clickzone_top.style.left      = '0';
            clickzone_top.style.width     = '100%';
            clickzone_top.style.height    = '50%';
            clickzone_top.style.zIndex    = '20';
            clickzone_top.style.cursor    = 'pointer';
            
            const clickzone_bottom = document.createElement('div');
            clickzone_bottom.className = 'click-area clickzone_bottom';
            clickzone_bottom.style.position  = 'absolute';
            clickzone_bottom.style.bottom    = '0';
            clickzone_bottom.style.left      = '0';
            clickzone_bottom.style.width     = '100%';
            clickzone_bottom.style.height    = '50%';
            clickzone_bottom.style.zIndex    = '20';
            clickzone_bottom.style.cursor    = 'pointer';
            
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
                    if (event.type === 'touchend') {
                        event.preventDefault();
                    }
                    slot_rotate(slot_type, 1);
                });
            });
            
            // Add event listeners to the bottom click area
            ['click', 'touchend'].forEach(eventType => {
                clickzone_bottom.addEventListener(eventType, (event) => {
                    if (event.type === 'touchend') {
                        event.preventDefault();
                    }
                    slot_rotate(slot_type, -1);
                });
            });
        });
    }

    // Function to recreate click areas (to ensure they're on top)
    function clickzone_recreate() {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
            clickzone_create();
        }, 10);
    }

    // Function to disable all default click behaviors
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
    
    // Check if any slot is currently animating
    function slot_animating_is() {
        let animating = false;
        Object.keys(slots).forEach(slot_type => {
            if (slots[slot_type].dataset.animating === 'true') {
                animating = true;
            }
        });
        return animating;
    }

    // ======================================
    // DISPLAY UPDATE FUNCTIONS
    // ======================================

    // Helper function to update all card values
    function card_display_update() {
        Object.keys(slots).forEach(slot_type => {
            const slot_window = slots[slot_type].querySelector('.slot-window');
            const card = slot_window.querySelector('.current-card');
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
    }

    // ======================================
    // INITIALIZATION AND EVENT HANDLERS
    // ======================================
    
    // Initialize the slots with the first cards
    card_display_update();

    // Create initial click areas and set up click prevention
    clickzone_create();
    click_default_prevent();

    // Add click and touch events for the lever
    ['click', 'touchend'].forEach(eventType => {
        lever.addEventListener(eventType, (event) => {
            if (event.type === 'touchend') {
                event.preventDefault();
            }
            if (!is_lever_pulling) {
                lever_pull();
            }
        });
    });

    // ======================================
    // CORE SLOT ROTATION FUNCTIONS
    // ======================================

    // Function to rotate a specific slot
    function slot_rotate(slot_type, direction) {
        // Check if this slot is already animating or if lever is currently pulling
        if (slots[slot_type].dataset.animating === 'true' || is_lever_pulling) {
            return;
        }
        
        slots[slot_type].dataset.animating = 'true';
        blocker_global_show(); // Show the global overlay during animation
        blocker_slot_show(slot_type); // Show the slot-specific overlay
        
        // Get the slot window and current card
        const slot_window = slots[slot_type].querySelector('.slot-window');
        const current_card = slot_window.querySelector('.current-card');
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
        
        // Set the content of the new card
        if (slot_type === 'key') {
            // For key cards, add chord information
            new_card.innerHTML = key_hint_get(card_value);
        } else if (slot_type === 'tempo') {
            // For tempo cards, add rhythm visualization
            new_card.innerHTML = tempo_hint_get(card_value);
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
        slot_window.appendChild(new_card);
        
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
            
            // Ensure click areas are on top
            clickzone_recreate();
        }, ANIMATION_SPEED);
    }

    // ======================================
    // LEVER OPERATIONS
    // ======================================

    // Function to pull the lever and randomize all slots
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

    // Function to finish lever pull and re-enable interactions
    function lever_pull_finish() {
        is_lever_pulling = false;
        blocker_global_hide(); // Hide the global overlay after lever pull animation
        clickzone_recreate();
    }

    // Version of rotateSlot specifically for lever pull (with callback)
    function lever_rotate(slot_type, direction, callback) {
        slots[slot_type].dataset.animating = 'true';
        blocker_slot_show(slot_type); // Show the slot-specific overlay
        
        // Get the slot window and current card
        const slot_window = slots[slot_type].querySelector('.slot-window');
        const current_card = slot_window.querySelector('.current-card');
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
        
        // Set the content of the new card
        if (slot_type === 'key') {
            // For key cards, add chord information
            new_card.innerHTML = key_hint_get(card_value);
        } else if (slot_type === 'tempo') {
            // For tempo cards, add rhythm visualization
            new_card.innerHTML = tempo_hint_get(card_value);
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
        slot_window.appendChild(new_card);
        
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
            if (callback) callback();
        }, ANIMATION_SPEED);
    }

    // Function to simulate multiple rotations with a delay (with callback)
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
        const slot_window = slots[slot_type].querySelector('.slot-window');
        const current_card = slot_window.querySelector('.current-card');
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
        
        // Set the content of the new card
        if (slot_type === 'key') {
            // For key cards, add chord information
            new_card.innerHTML = key_hint_get(card_value);
        } else if (slot_type === 'tempo') {
            // For tempo cards, add rhythm visualization
            new_card.innerHTML = tempo_hint_get(card_value);
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
        slot_window.appendChild(new_card);
        
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
}); 