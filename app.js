// Initialize Lucide Icons
lucide.createIcons();

// Row Expand/Collapse Logic for Smart Grid
function toggleRow(element) {
    element.classList.toggle('expanded');
    
    // Find next siblings that are child rows
    let nextRow = element.nextElementSibling;
    while (nextRow && nextRow.classList.contains('child-row')) {
        nextRow.classList.toggle('hidden');
        nextRow = nextRow.nextElementSibling;
    }
}

// Inline Logic Calculator (Simulating Hyperblock multidimensional engine)
// Listen for changes in editable cells
document.querySelectorAll('.editable.num').forEach(cell => {
    cell.addEventListener('input', (e) => {
        // Here we would sync with CRDT/Backend.
        // For the prototype, we recalculate the Total Q1 column dynamically.
        let row = cell.closest('tr');
        
        let m1 = parseFloat(row.children[2].innerText) || 0;
        let m2 = parseFloat(row.children[3].innerText) || 0;
        let m3 = parseFloat(row.children[4].innerText) || 0;
        
        let total = m1 + m2 + m3;
        
        // Find total cell
        let totalCell = row.querySelector('.total');
        if (totalCell) {
            totalCell.innerText = total.toLocaleString('pt-BR');
            
            // Highlight change with glassmorphism glow
            totalCell.animate([
                { backgroundColor: 'rgba(0, 242, 96, 0.3)' },
                { backgroundColor: 'rgba(0, 242, 96, 0.05)' }
            ], {
                duration: 1000,
                easing: 'ease-out'
            });
        }
    });

    // Formatting on focus out
    cell.addEventListener('blur', (e) => {
        let val = parseFloat(cell.innerText);
        if(!isNaN(val)) {
             // Basic formatting cleanup for prototype (backend data should handle this ideally)
             // Keeping raw numbers for easier sum. 
        }
    });
});

// Copilot Toggle
const copilotBtn = document.getElementById('ai-copilot-btn');
const closeCopilotBtn = document.getElementById('close-copilot');
const copilotPanel = document.getElementById('copilot-panel');

copilotBtn.addEventListener('click', () => {
    copilotPanel.classList.add('open');
});

closeCopilotBtn.addEventListener('click', () => {
    copilotPanel.classList.remove('open');
});

// Fullscreen Grid Toggle
const expandGridBtn = document.getElementById('expand-grid');
const gridCard = document.getElementById('planning-grid-card');

expandGridBtn.addEventListener('click', () => {
    // A simple presentation trick - in real app, we'd use Fullscreen API or CSS classes to max out
    if(gridCard.style.position === 'fixed') {
        gridCard.style.position = 'relative';
        gridCard.style.top = 'auto';
        gridCard.style.left = 'auto';
        gridCard.style.width = 'auto';
        gridCard.style.height = 'auto';
        gridCard.style.zIndex = '1';
        expandGridBtn.innerHTML = '<i data-lucide="maximize-2"></i>';
    } else {
        gridCard.style.position = 'fixed';
        gridCard.style.top = '20px';
        gridCard.style.left = '20px';
        gridCard.style.width = 'calc(100vw - 40px)';
        gridCard.style.height = 'calc(100vh - 40px)';
        gridCard.style.zIndex = '1000';
        expandGridBtn.innerHTML = '<i data-lucide="minimize-2"></i>';
    }
    lucide.createIcons(); // re-init icons for the new button interior
});
