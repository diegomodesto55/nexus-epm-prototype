/**
 * Nexus EPM - Engine Client (Refactored to consume Phase 2 Core APIs)
 * GARGALO 2, 6, 20 SOLVED: Removes static arrays, uses real fetch() calls to the backend Node.js Multi-tenant server.
 */

const API_BASE_URL = 'http://localhost:3000/api/v1';

// --- MULTIDIMENSIONAL ENGINE CLIENT ---
class NexusEngineAPIClient {
    /**
     * Motor de Drill-down agora bate no Servidor
     */
    async getDrillDown(context) {
        try {
            const endpoint = `${API_BASE_URL}/engine/drilldown/${context.accountId}/${context.costCenterId}`;
            const response = await fetch(endpoint, {
                headers: { 'Authorization': 'Bearer SIMULATED_TOKEN_RBAC', 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error('API Engine falhou no Drill-down');
            
            const rawFactData = await response.json();
            return this.aggregateByMonth(rawFactData);
        } catch (error) {
            console.error("Drill-down API Error:", error);
            return [];
        }
    }

    // Client-side visual aggregation map
    aggregateByMonth(data) {
        const result = { name: "Detalhamento Nível Razão (Origin DB)", jan: 0, feb: 0, mar: 0, total: 0 };
        data.forEach(trx => {
            const m = parseInt(trx.time_id.split('-')[1]);
            if(m === 1) result.jan += trx.amount;
            if(m === 2) result.feb += trx.amount;
            if(m === 3) result.mar += trx.amount;
            result.total += trx.amount;
        });
        return [result];
    }
    
    // OBZ Submission (Budget Entry)
    async submitBudgetEntry(payload) {
        const response = await fetch(`${API_BASE_URL}/planning/entry`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer SIMULATED_TOKEN', 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await response.json();
    }
}

// --- AI COPILOT CLIENT (XAI) ---
class CopilotAnomalyXAIClient {
    /**
     * Consulta o Gateway de Inteligência Artificial para varrer anomalias no Ledger hospedado no banco.
     */
    async analyze() {
        try {
            const response = await fetch(`${API_BASE_URL}/ai/anomalies/detect`, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer SIMULATED_TOKEN', 'Content-Type': 'application/json' },
                body: JSON.stringify({ scanHistorical: true })
            });
            return await response.json(); // Array of XAI Reports
        } catch (err) {
            console.error("XAI Service Unreachable", err);
            return [];
        }
    }

    async generateRollingForecast(drivers) {
        const response = await fetch(`${API_BASE_URL}/ai/forecast/rolling`, {
            method: 'POST',
            body: JSON.stringify({ drivers }),
            headers: { 'Content-Type': 'application/json' }
        });
        return await response.json();
    }
}

// Global Export para anexar no GitHub Pages Prototype
window.NexusEngineAPI = {
    NexusEngine: NexusEngineAPIClient,
    CopilotAnomalyXAI: CopilotAnomalyXAIClient
};
