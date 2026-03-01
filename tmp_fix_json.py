import json
import os

file_path = "/Users/mac/.gemini/antigravity/scratch/testosterone-mechanism-3d/src/data/parsedPresentation.json"

with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

for slide in data:
    if slide.get("id") == 21:
        slide["layout"] = "prose"
        slide["cards"] = []
        slide["content"] = """<style>
.rv-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: 100%;
    margin-top: 1rem;
    font-family: var(--font-body);
}

.rv-stat-box {
    display: flex;
    align-items: center;
    border-radius: 16px;
    padding: 2rem;
    position: relative;
    overflow: hidden;
    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.rv-stat-box:hover {
    transform: scale(1.02);
}

.rv-stat-box::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    pointer-events: none;
    z-index: 1;
}

.rv-official {
    background: rgba(30, 41, 59, 0.4);
    border: 1px solid rgba(255,255,255,0.1);
    border-left: 6px solid #60A5FA;
}
.rv-official:hover {
    box-shadow: 0 10px 30px rgba(96, 165, 250, 0.15);
}

.rv-real {
    background: rgba(159, 18, 57, 0.15);
    border: 1px solid rgba(220, 38, 38, 0.2);
    border-left: 6px solid var(--accent-main);
}
.rv-real:hover {
    box-shadow: 0 10px 40px rgba(220, 38, 38, 0.25);
    border-color: rgba(220, 38, 38, 0.4);
}

.rv-number {
    font-family: var(--font-display);
    font-size: 5rem;
    font-weight: 800;
    line-height: 1;
    margin-right: 2rem;
    min-width: 180px;
    text-shadow: 0 4px 15px rgba(0,0,0,0.5);
    z-index: 2;
}

.rv-official .rv-number { color: white; }
.rv-real .rv-number { 
    color: var(--accent-main); 
    text-shadow: 0 0 20px rgba(220,38,38,0.6);
}

.rv-text {
    flex: 1;
    z-index: 2;
}

.rv-title {
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.rv-official .rv-title { color: #9CA3AF; }
.rv-real .rv-title { color: #FCA5A5; }

.rv-desc {
    color: #D1D5DB;
    font-size: 0.95rem;
    line-height: 1.6;
}

.rv-reasons {
    background: rgba(10, 15, 25, 0.8);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 12px;
    padding: 1.5rem;
    margin-top: 1rem;
}

.rv-reasons h4 {
    color: #FBBF24;
    font-family: var(--font-display);
    margin-bottom: 1rem;
    border-bottom: 1px dashed rgba(251, 191, 36, 0.2);
    padding-bottom: 0.5rem;
}

.rv-reasons ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1.5rem;
}

.rv-reasons li {
    font-size: 0.85rem;
    color: #9CA3AF;
    line-height: 1.5;
    background: rgba(255,255,255,0.02);
    padding: 1rem;
    border-radius: 8px;
    border-top: 2px solid transparent;
    transition: all 0.3s;
}

.rv-reasons li:hover {
    background: rgba(255,255,255,0.05);
    border-top-color: var(--accent-main);
    color: #D1D5DB;
    transform: translateY(-2px);
}

.rv-reasons li strong {
    display: block;
    color: white;
    margin-bottom: 0.3rem;
}
</style>

<div class="rv-container reveal-scale delay-1">

    <!-- Official Stat -->
    <div class="rv-stat-box rv-official">
        <div class="rv-number">1-3%</div>
        <div class="rv-text">
            <div class="rv-title">Testes Positivos (WADA)</div>
            <div class="rv-desc">A agulha no palheiro revelada anualmente por amostras de urina e sangue. Depende crucialmente de testar o atleta na estreita <em>Clearance Window</em>.</div>
        </div>
    </div>

    <!-- The Gap / Arrow -->
    <div style="text-align: center; color: rgba(255,255,255,0.2); font-size: 2rem; margin: -1rem 0;">▼</div>

    <!-- True Stat -->
    <div class="rv-stat-box rv-real">
        <div class="rv-number">~43%</div>
        <div class="rv-text">
            <div class="rv-title">Prevalência Real Estimada</div>
            <div class="rv-desc">Dados de enquetes epidemiológicas (modelo de resposta randomizada de garantia de anonimato) em campeonatos de atletismo de elite (2018).</div>
        </div>
    </div>

    <!-- Root Causes -->
    <div class="rv-reasons reveal delay-3">
        <h4>Como essa falha absurda (Falsos Negativos) acontece?</h4>
        <ul>
            <li>
                <strong>Microdosagem Estratégica</strong>
                Doses em frações minúsculas (e.g., EPO) mantêm os ganhos sem explodir os desvios bayesianos do Passaporte Biológico.
            </li>
            <li>
                <strong>Transfusão Autóloga</strong>
                O sangue do próprio atleta é praticamente invisível ao laboratório sem rastreio de polímeros das bolsas.
            </li>
            <li>
                <strong>Furo Genético (UGT2B17)</strong>
                Deleção homozigótica esconde usuários graves de testosterona no teste T/E por impedir a excreção urinária alvo.
            </li>
        </ul>
    </div>

</div>"""

with open(file_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
