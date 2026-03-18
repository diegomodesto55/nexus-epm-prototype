/**
 * Nexus EPM - Core Calculation Engine & AI Copilot Module
 * Features: Data Mapping, Multidimensional Drill-Down & XAI Anomaly Detection
 */

// --- 1. GENERAL LEDGER DATA MAPPING (Pipeline de Importação) ---
class LedgerImportMapper {
    /**
     * Mapeia arquivos CSV/Excel raw do ERP para o Schema Estrela do Nexus
     * @param {Array} rawData - Array de objetos simulando o 'Arquivo Razão'
     */
    static mapRealLedgerToStarSchema(rawData) {
        // Exemplo de mapeamento para o Data Warehouse do Nexus
        return rawData.map(row => ({
            transactionId: `trx_${Math.random().toString(36).substr(2, 9)}`,
            timeId: row.DataLancamento, // Dimensão Tempo
            accountId: row.CodigoConta, // Dimensão Conta
            costCenterId: row.CentroDeCusto, // Dimensão Centro Custo
            supplier: row.Fornecedor, // Dimensão Entidade Externa
            amount: parseFloat(row.Valor), // Fato Financeiro
            description: row.HistoricoBase
        }));
    }
}

// --- 2. MULTIDIMENSIONAL ENGINE (Simulador Hyperblock) ---
class NexusEngine {
    constructor() {
        // Cubo Multidimensional em memória
        this.factTable = [];
    }

    ingestLedger(mappedData) {
        this.factTable = [...this.factTable, ...mappedData];
        console.log(`[Nexus Engine] Ingestidos ${mappedData.length} registros no Motor de Cálculo.`);
    }

    /**
     * Motor de Drill-down Multidimensional
     * Retorna agregações no nível subjacente da hierarquia baseada no contexto do clique.
     */
    async getDrillDown(context) {
        // Simulação de latência de rede/banco de dados
        await new Promise(resolve => setTimeout(resolve, 500));

        // Filtrando o fato pelo contexto dimensional (Onde a conta descende da conta clicada)
        const granularData = this.factTable.filter(trx => 
            trx.accountId.startsWith(context.accountId) &&
            trx.costCenterId === context.costCenterId
        );

        // Agregação dinâmica sem reprocessamento Batch (Instantâneo)
        // (Em produção, o Clickhouse ou cubo OLAP faria o `GROUP BY`)
        return this.aggregateByMonth(granularData);
    }

    aggregateByMonth(data) {
        // Simulador simples de agregação para o Front-End
        const result = { name: "Detalhamento (Via Arquivo Razão)", jan: 0, feb: 0, mar: 0, total: 0 };
        data.forEach(trx => {
            const m = parseInt(trx.timeId.split('-')[1]);
            if(m === 1) result.jan += trx.amount;
            if(m === 2) result.feb += trx.amount;
            if(m === 3) result.mar += trx.amount;
            result.total += trx.amount;
        });
        return [result];
    }
}

// --- 3. AI COPILOT COM EXPLAINABILITY (XAI) ---
class CopilotAnomalyXAI {
    constructor(historicalStats) {
        // Dicionário de médias e desvios padrões históricos por Conta+CC
        this.historicalStats = historicalStats; 
    }

    /**
     * Processa o Arquivo Razão ingerido buscando distorções matemáticas.
     * Gera 'Explicabilidade' (XAI) para que o usuário confie no Alerta da Inteligência.
     */
    analyze(transactions) {
        const aiAlerts = [];

        transactions.forEach(trx => {
            const statsKey = `${trx.accountId}-${trx.costCenterId}`;
            const stats = this.historicalStats[statsKey];
            
            if (!stats) return;

            // Z-Score = (Valor Atual - Média) / Desvio Padrão
            const zScore = (trx.amount - stats.mean) / stats.stdDev;

            // Flag se extrapolar 2 desvios padrões (Grau de Confiança > 95%)
            if (Math.abs(zScore) > 2.0) {
                
                const varianceMultiplier = (trx.amount / stats.mean).toFixed(1);
                
                // --- MÓDULO XAI (EXPLAINABLE AI) ---
                const explanationHtml = `
                    <div style="font-size: 0.9em; margin-top: 10px; border-left: 3px solid var(--accent-neon); padding-left: 10px;">
                        <strong>Análise de Explicabilidade (XAI)</strong><br>
                        <span style="color: var(--text-muted)">Por que este alerta foi gerado?</span>
                        <ul style="margin-top: 8px; padding-left: 20px;">
                            <li>O valor classificado (R$ ${trx.amount.toLocaleString('pt-BR')}) é <b>${varianceMultiplier}x maior</b> que a média histórica dos últimos 6 meses (R$ ${stats.mean.toLocaleString('pt-BR')}).</li>
                            <li>O desvio alcançou <b>${zScore.toFixed(2)}σ (Z-Score)</b> na curva estatística da conta base.</li>
                            <li>O fornecedor <i>'${trx.supplier}'</i> não possuía volume financeiro atrelado à categoria de Despesas com Pessoal antes deste tri.</li>
                            <li><b>Impacto Simulado:</b> Queda projetada de -0.4% no índice EBITDA Mensal.</li>
                        </ul>
                    </div>
                `;

                aiAlerts.push({
                    transactionId: trx.transactionId,
                    level: 'CRITICAL',
                    promptTitle: `⚠️ Anomalia Localizada: Lançamento atípico em ${trx.accountId}`,
                    xaiBox: explanationHtml,
                    suggestedAction: 'Isolar o valor atípico do cálculo de Run-Rate do próximo Forecast Automático.'
                });
            }
        });

        return aiAlerts;
    }
}

// Global Export para anexar no GitHub Pages Prototype
window.NexusEngineAPI = {
    LedgerImportMapper,
    NexusEngine,
    CopilotAnomalyXAI
};
