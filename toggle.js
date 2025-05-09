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
    } else {
        console.error("Toggle setup: Some elements are missing", {
            pageSlotMachine, pageFunctionIndex, toggleBtnSlot, toggleBtnIndex
        });
    }
}); 