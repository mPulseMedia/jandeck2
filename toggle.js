// Mode toggle functionality
window.addEventListener('load', function() {
    // Page elements
    const pageSlotMachine = document.getElementById('page-slot-machine');
    const pageFunctionIndex = document.getElementById('page-function-index');
    
    // Toggle buttons
    const toggleBtnSlot = document.getElementById('toggle-btn-slot');
    const toggleBtnIndex = document.getElementById('toggle-btn-index');
    
    // Make sure all elements exist before adding event listeners
    if (pageSlotMachine && pageFunctionIndex && toggleBtnSlot && toggleBtnIndex) {
        console.log("Toggle setup: All elements found");
        
        // Switch to function index
        toggleBtnSlot.addEventListener('click', function() {
            console.log("Switching to function index");
            pageSlotMachine.classList.remove('active-page');
            pageFunctionIndex.classList.add('active-page');
        });
        
        // Switch to slot machine
        toggleBtnIndex.addEventListener('click', function() {
            console.log("Switching to slot machine");
            pageFunctionIndex.classList.remove('active-page');
            pageSlotMachine.classList.add('active-page');
        });
        
        // Add clipboard copy functionality to function items
        setupFunctionItemClipboard();
    } else {
        console.error("Toggle setup: Some elements are missing", {
            pageSlotMachine, pageFunctionIndex, toggleBtnSlot, toggleBtnIndex
        });
    }
});

// Add click-to-copy functionality for function items
function setupFunctionItemClipboard() {
    const functionItems = document.querySelectorAll('.function-item');
    
    functionItems.forEach(item => {
        item.addEventListener('click', function() {
            // Get the full function name (including any repeated parts)
            let functionName = '';
            
            // Check if there are any repeated parts (in spans)
            const repeatedParts = item.querySelectorAll('.repeat');
            if (repeatedParts.length > 0) {
                // Combine repeated parts with the rest of the text
                repeatedParts.forEach(part => {
                    functionName += part.textContent;
                });
                
                // Get the text node that follows the last repeated part
                const lastRepeatedPart = repeatedParts[repeatedParts.length - 1];
                const textAfterLastPart = lastRepeatedPart.nextSibling;
                if (textAfterLastPart) {
                    functionName += textAfterLastPart.textContent;
                }
            } else {
                // No repeated parts, just get the text content
                functionName = item.textContent;
            }
            
            // Copy to clipboard
            navigator.clipboard.writeText(functionName.trim())
                .then(() => {
                    // Visual feedback that copying worked
                    const originalBackgroundColor = item.style.backgroundColor;
                    item.style.backgroundColor = '#4a4';
                    
                    // Create a tooltip
                    const tooltip = document.createElement('div');
                    tooltip.textContent = 'Copied!';
                    tooltip.className = 'copy-tooltip';
                    item.appendChild(tooltip);
                    
                    // Remove the tooltip and restore background after a delay
                    setTimeout(() => {
                        item.style.backgroundColor = originalBackgroundColor;
                        if (tooltip.parentNode) {
                            tooltip.parentNode.removeChild(tooltip);
                        }
                    }, 1000);
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                });
        });
        
        // Add cursor pointer to indicate clickability
        item.style.cursor = 'pointer';
    });
} 