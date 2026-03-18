// Initialize Lucide Icons
lucide.createIcons();

// --- INTEGRATION WITH NEXUS ENGINE API ---
// 1. Setup Engine & Mock Data
const engine = new window.NexusEngineAPI.NexusEngine();

// Raw ERP Data Simulation
const rawErpData = [
    { DataLancamento: '2026-01-15', CodigoConta: '101.1', CentroDeCusto: '101', Fornecedor: 'Folha Pagamento', Valor: 100000, HistoricoBase: 'Salários Jan' },
    { DataLancamento: '2026-02-15', CodigoConta: '101.1', CentroDeCusto: '101', Fornecedor: 'Folha Pagamento', Valor: 100000, HistoricoBase: 'Salários Fev' },
    { DataLancamento: '2026-03-15', CodigoConta: '101.1', CentroDeCusto: '101', Fornecedor: 'Folha Pagamento', Valor: 100000, HistoricoBase: 'Salários Mar' },
    // Anomaly here: Huge unexpected bonus payout
    { DataLancamento: '2026-02-20', CodigoConta: '101.1', CentroDeCusto: '101', Fornecedor: 'Bonus System', Valor: 800000, HistoricoBase: 'Bônus Extraordinário' }
];

// Historical stats for XAI model
const historicalStats = {
    '101.1-101': { mean: 100000, stdDev: 5000 } // Average salaries are 100k, low variance
};

// Start AI Copilot
const copilotXAI = new window.NexusEngineAPI.CopilotAnomalyXAI(historicalStats);

// Ingest Data into Hyperblock
const mappedData = window.NexusEngineAPI.LedgerImportMapper.mapRealLedgerToStarSchema(rawErpData);
engine.ingestLedger(mappedData);


// --- DOM LOGIC ---

// Row Expand/Collapse Logic for Smart Grid w/ Drill-Down Simulation
async function toggleRow(element) {
    element.classList.toggle('expanded');
    const isExpanded = element.classList.contains('expanded');
    
    // Check if we already fetched children
    if (element.dataset.loaded === 'true') {
        let nextRow = element.nextElementSibling;
        while (nextRow && nextRow.classList.contains('child-row')) {
            if (isExpanded) {
                nextRow.classList.remove('hidden');
            } else {
                nextRow.classList.add('hidden');
            }
            nextRow = nextRow.nextElementSibling;
        }
        return;
    }

    // Dynamic Drill-Down from Engine if expanding for the first time
    if (isExpanded) {
        // Find toggle icon and show loading
        const icon = element.querySelector('.toggle-icon');
        icon.setAttribute('data-lucide', 'loader-2');
        icon.classList.add('spin');
        lucide.createIcons();

        // Simulate API call to Calculation Engine
        const drilldownData = await engine.getDrillDown({ accountId: '101.1', costCenterId: '101' });
        
        // Remove old static rows below it for this demo, or just insert new ones
        // For prototype, we will just inject the result below the parent row
        
        drilldownData.forEach(child => {
            const html = `
                <tr class="grid-row child-row fade-in">
                    <td class="hierarchy-cell pad-left" style="color: var(--accent-neon)">${child.name}</td>
                    <td>Engenharia (101)</td>
                    <td class="num editable">${child.jan.toLocaleString('pt-BR')}</td>
                    <td class="num editable">${child.feb.toLocaleString('pt-BR')}</td>
                    <td class="num editable">${child.mar.toLocaleString('pt-BR')}</td>
                    <td class="num total">${child.total.toLocaleString('pt-BR')}</td>
                    <td class="editable">-</td>
                </tr>
            `;
            element.insertAdjacentHTML('afterend', html);
        });

        // Restore Icon
        icon.setAttribute('data-lucide', 'chevron-right');
        icon.classList.remove('spin');
        lucide.createIcons();
        element.dataset.loaded = 'true';
    }
}

// Make globally available for onclick="toggleRow(this)"
window.toggleRow = toggleRow; 


// --- COPILOT AI INTERACTION ---
const copilotBtn = document.getElementById('ai-copilot-btn');
const closeCopilotBtn = document.getElementById('close-copilot');
const copilotPanel = document.getElementById('copilot-panel');
const chatBody = document.getElementById('chat-body');

copilotBtn.addEventListener('click', () => {
    copilotPanel.classList.add('open');
    
    // Trigger Analysis when panel opens (if not already done)
    if (!copilotPanel.dataset.analyzed) {
        // Show typing indicator
        chatBody.innerHTML = `
            <div class="chat-message ai-message" id="typing-indicator">
                <p><i data-lucide="loader-2" class="spin"></i> Analisando transações ingeridas do ERP...</p>
            </div>
        `;
        lucide.createIcons();

        setTimeout(() => {
            // Run Anomaly Engine
            const alerts = copilotXAI.analyze(mappedData);
            
            document.getElementById('typing-indicator').remove();

            if (alerts.length > 0) {
                alerts.forEach(alert => {
                    const msgHTML = `
                        <div class="chat-message ai-message fade-in">
                            <p>${alert.promptTitle}</p>
                            ${alert.xaiBox}
                            <div style="margin-top: 10px;">
                                <button class="btn btn-sm btn-outline">${alert.suggestedAction}</button>
                            </div>
                        </div>
                    `;
                    chatBody.insertAdjacentHTML('beforeend', msgHTML);
                });
            } else {
                chatBody.insertAdjacentHTML('beforeend', `
                    <div class="chat-message ai-message fade-in">
                        <p>Tudo parece normal com as transações recentes. Z-Score das despesas operacionais estão dentro do intervalo de confiança.</p>
                    </div>
                `);
            }
            lucide.createIcons();
            copilotPanel.dataset.analyzed = 'true';
        }, 1500);
    }
});

closeCopilotBtn.addEventListener('click', () => {
    copilotPanel.classList.remove('open');
});

// Fullscreen Grid Toggle
const expandGridBtn = document.getElementById('expand-grid');
const gridCard = document.getElementById('planning-grid-card');

expandGridBtn.addEventListener('click', () => {
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
    lucide.createIcons();
});

// Add CSS animation classes via JS for a slightly smoother UX
const style = document.createElement('style');
style.textContent = `
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }
    .fade-in { animation: fadeIn 0.4s ease-in; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
`;
document.head.appendChild(style);
