document.addEventListener('DOMContentLoaded', () => {
    // Define the card data for each slot
    const slotData = {
        key: [
            // Major keys in circle of fifths order
            'C Major', 'G Major', 'D Major', 'A Major', 'E Major', 'B Major', 'F# Major',
            'C# Major', 'F Major', 'Bb Major', 'Eb Major', 'Ab Major', 'Db Major', 'Gb Major',
            // Minor keys in circle of fifths order
            'A Minor', 'E Minor', 'B Minor', 'F# Minor', 'C# Minor', 'G# Minor', 'D# Minor',
            'A# Minor', 'D Minor', 'G Minor', 'C Minor', 'F Minor', 'Bb Minor', 'Eb Minor'
        ],
        progression: [
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

    // Helper function to convert progression notation to numeric value for sorting
    function getProgressionNumericValue(progression) {
        // Create a map for Roman numeral conversion
        const romanToNum = {
            'i': 1, 'I': 1,
            'ii': 2, 'II': 2,
            'iii': 3, 'III': 3,
            'iv': 4, 'IV': 4,
            'v': 5, 'V': 5,
            'vi': 6, 'VI': 6,
            'vii': 7, 'VII': 7,
            'bIII': 3, 'biii': 3,
            'bVI': 6, 'bvi': 6,
            'bVII': 7, 'bvii': 7
        };
        
        // Replace Roman numerals with numbers
        let numeric = '';
        const parts = progression.split('-');
        
        parts.forEach(part => {
            if (romanToNum[part]) {
                numeric += romanToNum[part];
            }
        });
        
        // Parse as integer, default to a large number if parsing fails
        // to ensure invalid progressions sort to the end
        return parseInt(numeric) || 9999;
    }

    // Helper function to get a unique identifier for sorting identical numeric values
    function getProgressionSortKey(progression) {
        const numericValue = getProgressionNumericValue(progression);
        // Minor progressions get a ".5" added to their value to sort after major ones
        const isMinor = progression.startsWith('i-') || progression === 'i';
        
        return isMinor ? numericValue + 0.5 : numericValue;
    }

    // Function to check if a progression is in minor key
    function isMinorProgression(progression) {
        return progression.startsWith('i-') || progression === 'i';
    }

    // Helper function to get chords for a key
    function getChordsForKey(keyName) {
        // Extract note and mode
        const parts = keyName.split(' ');
        const rootNote = parts[0];
        const isMajor = parts[1] === 'Major';
        
        // Define notes in order, handling sharps and flats
        const allNotes = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'];
        
        // Find the index of the root note
        let rootIndex = -1;
        for (let i = 0; i < allNotes.length; i++) {
            const note = allNotes[i];
            if (note === rootNote || note.includes(rootNote)) {
                rootIndex = i;
                break;
            }
        }
        
        // Calculate the indices for the scale notes
        const scaleSteps = isMajor 
            ? [0, 2, 4, 5, 7, 9, 11] // Major scale steps (whole, whole, half, whole, whole, whole, half)
            : [0, 2, 3, 5, 7, 8, 10]; // Natural minor scale steps (whole, half, whole, whole, half, whole, whole)
        
        // Calculate the chord types
        const chordTypes = isMajor 
            ? ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'] 
            : ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj'];
        
        // Generate the chords
        const chords = [];
        for (let i = 0; i < 7; i++) {
            const noteIndex = (rootIndex + scaleSteps[i]) % 12;
            const note = allNotes[noteIndex];
            chords.push(`${note} ${chordTypes[i]}`);
        }
        
        return chords;
    }

    // Helper function to get Roman numerals for a key
    function getRomanNumeralsForKey(keyName) {
        const isMajor = keyName.includes('Major');
        
        return isMajor 
            ? ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
            : ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];
    }

    // Set the content of the new card for a key
    function getKeyCardContent(keyValue) {
        const chords = getChordsForKey(keyValue);
        const romanNumerals = getRomanNumeralsForKey(keyValue);
        
        return `
            <div class="card-content">
                <p class="card-value">${keyValue}</p>
                <div class="chord-info">
                    <div class="roman-numerals">
                        <span class="roman-numeral">${romanNumerals[0]}</span>
                        <span class="roman-numeral">${romanNumerals[1]}</span>
                        <span class="roman-numeral">${romanNumerals[2]}</span>
                        <span class="roman-numeral">${romanNumerals[3]}</span>
                        <span class="roman-numeral">${romanNumerals[4]}</span>
                        <span class="roman-numeral">${romanNumerals[5]}</span>
                        <span class="roman-numeral">${romanNumerals[6]}</span>
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

    // Function to get rhythm visualization for tempo cards
    function getRhythmVisualization(rhythmName) {
        const patterns = {
            '4/4 Basic': '♩ ♩ ♩ ♩',
            '3/4 Waltz': '♩ ♩ ♩',
            '6/8 Compound': '♪♪♪ ♪♪♪',
            '5/4 Odd Meter': '♩ ♩ ♩ ♩ ♩',
            '7/8 Asymmetric': '♪♪♪♪ ♪♪♪',
            '12/8 Blues': '♩. ♩. ♩. ♩.',
            '2/4 March': '♩ ♩',
            'Syncopated': '♪ ♩ ♪ ▯',
            'Swing': '♪♫ ♪♫',
            'Backbeat': '▯ ♩ ▯ ♩',
            'Half-time': '▮ ▯ ▮ ▯',
            'Double-time': '♪♪♪♪ ♪♪♪♪',
            'Dotted': '♩. ♪ ♩. ♪',
            'Triplets': '♪♪♪ ♪♪♪ ♪♪♪ ♪♪♪',
            'Polyrhythm': '♩♩♩ ♪♪♪♪',
            'Shifting Accents': '▮♩♩ ♩▮♩',
        };
        
        return patterns[rhythmName] || '';
    }

    // Set the content of the new card for a tempo (rhythm)
    function getTempoCardContent(tempoValue) {
        const visualization = getRhythmVisualization(tempoValue);
        
        return `
            <div class="card-content">
                <p class="card-value">${tempoValue}</p>
                <div class="rhythm-visualization">${visualization}</div>
            </div>
        `;
    }

    // Sort the keys array alphabetically, with major keys first
    slotData.key.sort((a, b) => {
        const aIsMajor = a.includes('Major');
        const bIsMajor = b.includes('Major');
        
        // Group by major/minor (all majors, then all minors)
        if (aIsMajor && !bIsMajor) return -1;
        if (!aIsMajor && bIsMajor) return 1;
        
        // Within each group, sort alphabetically
        return a.localeCompare(b);
    });

    // Sort the progression array numerically and by major/minor
    slotData.progression.sort((a, b) => {
        const aVal = getProgressionSortKey(a);
        const bVal = getProgressionSortKey(b);
        
        // Sort by the combined numeric value and major/minor indicator
        return aVal - bVal;
    });

    // Animation speed in milliseconds (lower = faster)
    const ANIMATION_SPEED = 150; // Reduced from 250ms to 150ms
    const LEVER_DELAY = 75; // Reduced from 150ms to 75ms
    const MULTI_ROTATION_DELAY = 30; // Reduced from 50ms to 30ms
    const SLOT_DELAY = 50; // Reduced from 100ms to 50ms

    // Current index for each slot
    const currentIndices = {
        key: 0,
        progression: 0,
        vibe: 0,
        tempo: 0
    };

    // Get DOM elements
    const slots = {
        key: document.getElementById('key-slot'),
        progression: document.getElementById('progression-slot'),
        vibe: document.getElementById('vibe-slot'),
        tempo: document.getElementById('tempo-slot')
    };

    const container = document.querySelector('.container');
    const slotMachine = document.querySelector('.slot-machine');
    const lever = document.getElementById('random-lever');
    let isLeverPulling = false;

    // Create a global overlay for the entire container
    const globalOverlay = document.createElement('div');
    globalOverlay.className = 'global-overlay';
    globalOverlay.style.position = 'fixed';
    globalOverlay.style.top = '0';
    globalOverlay.style.left = '0';
    globalOverlay.style.width = '100%';
    globalOverlay.style.height = '100%';
    globalOverlay.style.zIndex = '1000';
    globalOverlay.style.display = 'none';
    globalOverlay.style.backgroundColor = 'transparent';
    globalOverlay.style.cursor = 'not-allowed';
    document.body.appendChild(globalOverlay);

    // Function to show the global overlay
    function showGlobalOverlay() {
        globalOverlay.style.display = 'block';
    }

    // Function to hide the global overlay
    function hideGlobalOverlay() {
        globalOverlay.style.display = 'none';
    }

    // Initialize all slots with animating=false
    Object.keys(slots).forEach(slotType => {
        slots[slotType].dataset.animating = 'false';
        
        // Add a slot-specific overlay to block clicks during animations
        const slotOverlay = document.createElement('div');
        slotOverlay.className = 'slot-overlay';
        slotOverlay.style.position = 'absolute';
        slotOverlay.style.top = '0';
        slotOverlay.style.left = '0';
        slotOverlay.style.width = '100%';
        slotOverlay.style.height = '100%';
        slotOverlay.style.zIndex = '30'; // Higher than click areas but below faceplate
        slotOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'; // Semi-transparent background
        slotOverlay.style.borderRadius = '10px'; // Match slot border radius
        slotOverlay.style.display = 'none';
        slotOverlay.style.cursor = 'not-allowed';
        slots[slotType].appendChild(slotOverlay);
    });

    // Make sure all cards are visible initially
    Object.keys(slots).forEach(slotType => {
        const card = slots[slotType].querySelector('.current-card');
        if (card) {
            card.style.transform = 'translateY(0)';
            card.style.opacity = '1';
        }
    });

    // Initialize the slots with the first cards
    updateCardValues();

    // Function to show slot overlay for a specific slot
    function showSlotOverlay(slotType) {
        const overlay = slots[slotType].querySelector('.slot-overlay');
        if (overlay) {
            overlay.style.display = 'block';
        }
    }

    // Function to hide slot overlay for a specific slot
    function hideSlotOverlay(slotType) {
        const overlay = slots[slotType].querySelector('.slot-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    // Function to create and add click areas
    function createClickAreas() {
        Object.keys(slots).forEach(slotType => {
            // Remove any existing click areas first
            const existingAreas = slots[slotType].querySelectorAll('.click-area');
            existingAreas.forEach(area => area.remove());
            
            // Create click areas for top and bottom half
            const topClickArea = document.createElement('div');
            topClickArea.className = 'click-area top-click-area';
            topClickArea.style.position = 'absolute';
            topClickArea.style.top = '0';
            topClickArea.style.left = '0';
            topClickArea.style.width = '100%';
            topClickArea.style.height = '50%';
            topClickArea.style.zIndex = '20';
            topClickArea.style.cursor = 'pointer';
            
            const bottomClickArea = document.createElement('div');
            bottomClickArea.className = 'click-area bottom-click-area';
            bottomClickArea.style.position = 'absolute';
            bottomClickArea.style.bottom = '0';
            bottomClickArea.style.left = '0';
            bottomClickArea.style.width = '100%';
            bottomClickArea.style.height = '50%';
            bottomClickArea.style.zIndex = '20';
            bottomClickArea.style.cursor = 'pointer';
            
            // Add the click areas to the slot
            slots[slotType].style.position = 'relative';
            slots[slotType].appendChild(topClickArea);
            slots[slotType].appendChild(bottomClickArea);
            
            // Find the overlay and ensure it stays on top
            const overlay = slots[slotType].querySelector('.slot-overlay');
            if (overlay) {
                slots[slotType].appendChild(overlay);
            }
            
            // Add event listeners to the top click area
            ['click', 'touchend'].forEach(eventType => {
                topClickArea.addEventListener(eventType, (event) => {
                    if (event.type === 'touchend') {
                        event.preventDefault();
                    }
                    rotateSlot(slotType, 1);
                });
            });
            
            // Add event listeners to the bottom click area
            ['click', 'touchend'].forEach(eventType => {
                bottomClickArea.addEventListener(eventType, (event) => {
                    if (event.type === 'touchend') {
                        event.preventDefault();
                    }
                    rotateSlot(slotType, -1);
                });
            });
        });
    }

    // Function to disable all default click behaviors
    function preventDefaultClicks() {
        // Prevent default clicks on the entire document during animations
        const handleClick = (e) => {
            if (isAnimating()) {
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
    function isAnimating() {
        return Object.values(slots).some(slot => slot.dataset.animating === 'true') || isLeverPulling;
    }

    // Create initial click areas and set up click prevention
    createClickAreas();
    preventDefaultClicks();

    // Add click and touch events for the lever
    ['click', 'touchend'].forEach(eventType => {
        lever.addEventListener(eventType, (event) => {
            if (event.type === 'touchend') {
                event.preventDefault();
            }
            if (!isLeverPulling) {
                pullLever();
            }
        });
    });

    // Function to rotate a specific slot
    function rotateSlot(slotType, direction) {
        // Prevent multiple clicks during animation
        if (slots[slotType].dataset.animating === 'true' || isLeverPulling) {
            return;
        }
        
        slots[slotType].dataset.animating = 'true';
        showGlobalOverlay(); // Show the global overlay during animation
        showSlotOverlay(slotType); // Show the slot-specific overlay
        
        // Get the slot window and current card
        const slotWindow = slots[slotType].querySelector('.slot-window');
        const currentCard = slotWindow.querySelector('.current-card');
        if (!currentCard) {
            slots[slotType].dataset.animating = 'false';
            hideGlobalOverlay();
            hideSlotOverlay(slotType);
            return;
        }
        
        // Create a new card that will slide in
        const newCard = document.createElement('div');
        newCard.className = `card ${getColorClass(slotType)}`;
        
        // Update the index
        currentIndices[slotType] = (currentIndices[slotType] + direction + slotData[slotType].length) % slotData[slotType].length;
        
        // Get the new card value
        const cardValue = slotData[slotType][currentIndices[slotType]];
        
        // Set the content of the new card
        if (slotType === 'key') {
            // For key cards, add chord information
            newCard.innerHTML = getKeyCardContent(cardValue);
        } else if (slotType === 'tempo') {
            // For tempo cards, add rhythm visualization
            newCard.innerHTML = getTempoCardContent(cardValue);
        } else {
            // For other cards, just show the value
            newCard.innerHTML = `
                <div class="card-content">
                    <p class="card-value">${cardValue}</p>
                </div>
            `;
        }
        
        // Position the new card
        if (direction > 0) {
            // Coming from below
            newCard.style.transform = 'translateY(100%)';
        } else {
            // Coming from above
            newCard.style.transform = 'translateY(-100%)';
        }
        
        // Add the new card to the slot window
        slotWindow.appendChild(newCard);
        
        // Force reflow
        newCard.offsetHeight;
        
        // Animate the current card out
        currentCard.style.transform = direction > 0 ? 'translateY(-100%)' : 'translateY(100%)';
        
        // Animate the new card in
        newCard.style.transform = 'translateY(0)';
        newCard.classList.add('current-card');
        
        // Remove the old card after animation
        setTimeout(() => {
            if (currentCard.parentNode) {
                currentCard.remove();
            }
            slots[slotType].dataset.animating = 'false';
            hideSlotOverlay(slotType); // Hide the slot-specific overlay
            
            // Only hide global overlay if no other slots are animating
            if (!isAnimating()) {
                hideGlobalOverlay();
            }
            
            // Ensure click areas are on top
            recreateClickAreas();
        }, ANIMATION_SPEED);
    }

    // Function to recreate click areas (to ensure they're on top)
    function recreateClickAreas() {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
            createClickAreas();
        }, 10);
    }

    // Function to pull the lever and randomize all slots
    function pullLever() {
        // Prevent lever pull during animation
        if (isAnimating()) {
            return;
        }
        
        isLeverPulling = true;
        showGlobalOverlay(); // Show the global overlay during animation
        
        // Animate the lever
        const leverHandle = lever.querySelector('.lever-handle');
        leverHandle.style.transform = 'translateY(20px)';
        
        let allSlotsComplete = 0;
        const totalSlots = Object.keys(slots).length;
        
        setTimeout(() => {
            leverHandle.style.transform = '';
            
            // Randomize each slot with a slight delay between them
            Object.keys(slots).forEach((slotType, index) => {
                setTimeout(() => {
                    // Get random index
                    const randomIndex = Math.floor(Math.random() * slotData[slotType].length);
                    const direction = randomIndex > currentIndices[slotType] ? 1 : -1;
                    
                    // Calculate the number of steps to take
                    const steps = Math.abs(randomIndex - currentIndices[slotType]);
                    
                    // If we're already at the target index, still rotate once
                    if (steps === 0) {
                        rotateSlotForLever(slotType, 1, () => {
                            allSlotsComplete++;
                            if (allSlotsComplete >= totalSlots) {
                                finishLeverPull();
                            }
                        });
                    } else {
                        // Simulate multiple rotations with a delay
                        simulateMultipleRotations(slotType, direction, Math.min(steps, 3), () => {
                            allSlotsComplete++;
                            if (allSlotsComplete >= totalSlots) {
                                finishLeverPull();
                            }
                        });
                    }
                    
                    currentIndices[slotType] = randomIndex;
                }, index * SLOT_DELAY);
            });
        }, LEVER_DELAY);
    }

    // Function to finish lever pull and re-enable interactions
    function finishLeverPull() {
        isLeverPulling = false;
        hideGlobalOverlay(); // Hide the global overlay after lever pull animation
        recreateClickAreas();
    }

    // Version of rotateSlot specifically for lever pull (with callback)
    function rotateSlotForLever(slotType, direction, callback) {
        slots[slotType].dataset.animating = 'true';
        showSlotOverlay(slotType); // Show the slot-specific overlay
        
        // Get the slot window and current card
        const slotWindow = slots[slotType].querySelector('.slot-window');
        const currentCard = slotWindow.querySelector('.current-card');
        if (!currentCard) {
            slots[slotType].dataset.animating = 'false';
            if (callback) callback();
            return;
        }
        
        // Create a new card that will slide in
        const newCard = document.createElement('div');
        newCard.className = `card ${getColorClass(slotType)}`;
        
        // Update the index
        currentIndices[slotType] = (currentIndices[slotType] + direction + slotData[slotType].length) % slotData[slotType].length;
        
        // Get the new card value
        const cardValue = slotData[slotType][currentIndices[slotType]];
        
        // Set the content of the new card
        if (slotType === 'key') {
            // For key cards, add chord information
            newCard.innerHTML = getKeyCardContent(cardValue);
        } else if (slotType === 'tempo') {
            // For tempo cards, add rhythm visualization
            newCard.innerHTML = getTempoCardContent(cardValue);
        } else {
            // For other cards, just show the value
            newCard.innerHTML = `
                <div class="card-content">
                    <p class="card-value">${cardValue}</p>
                </div>
            `;
        }
        
        // Position the new card
        if (direction > 0) {
            // Coming from below
            newCard.style.transform = 'translateY(100%)';
        } else {
            // Coming from above
            newCard.style.transform = 'translateY(-100%)';
        }
        
        // Add the new card to the slot window
        slotWindow.appendChild(newCard);
        
        // Force reflow
        newCard.offsetHeight;
        
        // Animate the current card out
        currentCard.style.transform = direction > 0 ? 'translateY(-100%)' : 'translateY(100%)';
        
        // Animate the new card in
        newCard.style.transform = 'translateY(0)';
        newCard.classList.add('current-card');
        
        // Remove the old card after animation
        setTimeout(() => {
            if (currentCard.parentNode) {
                currentCard.remove();
            }
            slots[slotType].dataset.animating = 'false';
            hideSlotOverlay(slotType); // Hide the slot-specific overlay
            if (callback) callback();
        }, ANIMATION_SPEED);
    }

    // Function to simulate multiple rotations with a delay (with callback)
    function simulateMultipleRotations(slotType, direction, steps, finalCallback) {
        if (steps <= 0) {
            slots[slotType].dataset.animating = 'false';
            hideSlotOverlay(slotType); // Hide the slot-specific overlay
            if (finalCallback) finalCallback();
            return;
        }
        
        slots[slotType].dataset.animating = 'true';
        showSlotOverlay(slotType); // Show the slot-specific overlay
        
        // Get the slot window and current card
        const slotWindow = slots[slotType].querySelector('.slot-window');
        const currentCard = slotWindow.querySelector('.current-card');
        if (!currentCard) {
            slots[slotType].dataset.animating = 'false';
            if (finalCallback) finalCallback();
            return;
        }
        
        // Create a new card that will slide in
        const newCard = document.createElement('div');
        newCard.className = `card ${getColorClass(slotType)}`;
        
        // Update the index for this rotation
        currentIndices[slotType] = (currentIndices[slotType] + direction + slotData[slotType].length) % slotData[slotType].length;
        
        // Get the new card value
        const cardValue = slotData[slotType][currentIndices[slotType]];
        
        // Set the content of the new card
        if (slotType === 'key') {
            // For key cards, add chord information
            newCard.innerHTML = getKeyCardContent(cardValue);
        } else if (slotType === 'tempo') {
            // For tempo cards, add rhythm visualization
            newCard.innerHTML = getTempoCardContent(cardValue);
        } else {
            // For other cards, just show the value
            newCard.innerHTML = `
                <div class="card-content">
                    <p class="card-value">${cardValue}</p>
                </div>
            `;
        }
        
        // Position the new card
        if (direction > 0) {
            // Coming from below
            newCard.style.transform = 'translateY(100%)';
        } else {
            // Coming from above
            newCard.style.transform = 'translateY(-100%)';
        }
        
        // Add the new card to the slot window
        slotWindow.appendChild(newCard);
        
        // Force reflow
        newCard.offsetHeight;
        
        // Animate the current card out
        currentCard.style.transform = direction > 0 ? 'translateY(-100%)' : 'translateY(100%)';
        
        // Animate the new card in
        newCard.style.transform = 'translateY(0)';
        newCard.classList.add('current-card');
        
        // Remove the old card after animation
        setTimeout(() => {
            if (currentCard.parentNode) {
                currentCard.remove();
            }
            
            // If we have more steps, continue rotating
            if (steps > 1) {
                setTimeout(() => {
                    simulateMultipleRotations(slotType, direction, steps - 1, finalCallback);
                }, MULTI_ROTATION_DELAY);
            } else {
                slots[slotType].dataset.animating = 'false';
                hideSlotOverlay(slotType); // Hide the slot-specific overlay
                if (finalCallback) finalCallback();
            }
        }, ANIMATION_SPEED);
    }

    // Helper function to update all card values
    function updateCardValues() {
        Object.keys(slots).forEach(slotType => {
            const slotWindow = slots[slotType].querySelector('.slot-window');
            const card = slotWindow.querySelector('.current-card');
            const valueElement = card.querySelector('.card-value');
            const cardValue = slotData[slotType][currentIndices[slotType]];
            
            valueElement.textContent = cardValue;
            
            // If this is a key card, update chord information
            if (slotType === 'key') {
                const chordInfoElement = card.querySelector('.chord-info');
                
                // If there's no chord info element, create one
                if (!chordInfoElement) {
                    const chords = getChordsForKey(cardValue);
                    const romanNumerals = getRomanNumeralsForKey(cardValue);
                    
                    const chordInfo = document.createElement('div');
                    chordInfo.className = 'chord-info';
                    chordInfo.innerHTML = `
                        <div class="roman-numerals">
                            <span class="roman-numeral">${romanNumerals[0]}</span>
                            <span class="roman-numeral">${romanNumerals[1]}</span>
                            <span class="roman-numeral">${romanNumerals[2]}</span>
                            <span class="roman-numeral">${romanNumerals[3]}</span>
                            <span class="roman-numeral">${romanNumerals[4]}</span>
                            <span class="roman-numeral">${romanNumerals[5]}</span>
                            <span class="roman-numeral">${romanNumerals[6]}</span>
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
                    
                    card.querySelector('.card-content').appendChild(chordInfo);
                } else {
                    // Update existing chord info
                    const chords = getChordsForKey(cardValue);
                    const romanNumerals = getRomanNumeralsForKey(cardValue);
                    
                    const romanNumeralElements = chordInfoElement.querySelectorAll('.roman-numeral');
                    romanNumeralElements.forEach((element, index) => {
                        element.textContent = romanNumerals[index];
                    });
                    
                    const chordNames = chordInfoElement.querySelectorAll('.chord-name');
                    chordNames.forEach((chordName, index) => {
                        chordName.textContent = chords[index];
                    });
                }
            } else if (slotType === 'tempo') {
                // Update rhythm visualization if it's a tempo card
                const visualizationElement = card.querySelector('.rhythm-visualization');
                
                // If there's no visualization element, create one
                if (!visualizationElement) {
                    const visualization = getRhythmVisualization(cardValue);
                    
                    const rhythmVisualization = document.createElement('div');
                    rhythmVisualization.className = 'rhythm-visualization';
                    rhythmVisualization.textContent = visualization;
                    
                    card.querySelector('.card-content').appendChild(rhythmVisualization);
                } else {
                    // Update existing visualization
                    visualizationElement.textContent = getRhythmVisualization(cardValue);
                }
            }
        });
    }

    // Helper function to get the color class for a slot type
    function getColorClass(slotType) {
        switch(slotType) {
            case 'key': return 'burgundy';
            case 'progression': return 'yellow';
            case 'vibe': return 'green';
            case 'tempo': return 'blue';
            default: return '';
        }
    }
}); 