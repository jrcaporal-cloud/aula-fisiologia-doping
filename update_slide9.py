import json

file_path = "src/data/parsedPresentation.json"

with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

for slide in data:
    if slide.get("id") == 9:
        slide["layout"] = "prose"
        slide["cards"] = []
        slide["content"] = """<style>
.uc-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 850px;
    margin: 2rem auto 0 auto;
    position: relative;
    font-family: var(--font-body);
}

.uc-node {
    background: rgba(20, 25, 35, 0.8);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 1.5rem;
    width: 380px;
    text-align: center;
    position: relative;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    backdrop-filter: blur(10px);
    z-index: 5;
}

.uc-node:hover {
    transform: scale(1.05) translateY(-5px);
    border-color: var(--accent-main);
    box-shadow: 0 15px 35px rgba(220, 38, 38, 0.2), inset 0 0 0 1px rgba(255,255,255,0.1);
    z-index: 10;
}

.uc-icon {
    font-size: 2.2rem;
    margin-bottom: 0.5rem;
    display: inline-block;
}

.uc-title {
    color: white;
    font-family: var(--font-display);
    font-size: 1.2rem;
    margin-bottom: 0.3rem;
}

.uc-subtitle {
    color: #9CA3AF;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.uc-hidden {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transition: all 0.5s ease;
    text-align: left;
    font-size: 0.85rem;
    color: #D1D5DB;
    line-height: 1.6;
}

.uc-node:hover .uc-hidden {
    max-height: 350px;
    opacity: 1;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px dashed rgba(255,255,255,0.2);
}

.uc-node:hover::after {
    content: "Pressione ou passe o mouse";
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.6rem;
    color: rgba(255,255,255,0.3);
    white-space: nowrap;
    opacity: 0;
    animation: fade-in 0.5s forwards 1s;
}

@keyframes fade-in { to { opacity: 1; } }

.uc-arrow-down {
    width: 2px;
    height: 30px;
    background: linear-gradient(to bottom, rgba(255,255,255,0.4), transparent);
    position: relative;
    margin: 0;
}
.uc-arrow-down::after {
    content: '▼';
    position: absolute;
    bottom: -15px;
    left: -5.5px;
    color: rgba(255,255,255,0.4);
    font-size: 12px;
}

.uc-split {
    display: flex;
    width: 650px;
    justify-content: space-between;
    margin-top: 0;
}

.uc-path {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 50%;
    position: relative;
}

.uc-h-line {
    position: absolute;
    top: 0;
    height: 2px;
    width: 50%;
}

.uc-h-left {
    right: 0;
    background: rgba(255,255,255,0.3);
}
.uc-h-right {
    left: 0;
    background: rgba(239, 68, 68, 0.5);
}

.uc-v-line {
    width: 2px;
    height: 30px;
    background: rgba(255,255,255,0.3);
    position: relative;
}
.uc-v-right {
    background: rgba(239, 68, 68, 0.5);
}
.uc-v-line::after {
    content: '▼';
    position: absolute;
    bottom: -15px;
    left: -5.5px;
    color: rgba(255,255,255,0.4);
    font-size: 12px;
}
.uc-v-right::after {
    color: rgba(239, 68, 68, 0.6);
}

.uc-pulse { animation: pulse-blood 2s infinite; }
@keyframes pulse-blood { 0% { transform: scale(1); } 50% { transform: scale(1.15); filter: drop-shadow(0 0 10px rgba(220,38,38,0.5)); } 100% { transform: scale(1); } }

</style>

<div class="uc-container reveal-scale delay-1">

    <!-- NODE 1 -->
    <div class="uc-node" style="border-top: 4px solid #3B82F6;">
        <div class="uc-icon uc-pulse" style="font-size: 1.8rem">🩸</div>
        <div class="uc-title" style="color: #60A5FA;">Testosterona Livre</div>
        <div class="uc-subtitle">Corrente Sanguínea</div>
        <div class="uc-hidden">
            A testosterona endógena ou exógena circula livremente ou ligada a proteínas. Para ser filtrada pelos rins e eventualmente detectada nos testes antidopping urinários, ela precisará passar pelo processo de hidrossolubilidade.
        </div>
    </div>

    <div class="uc-arrow-down"></div>

    <!-- NODE 2 -->
    <div class="uc-node" style="border-top: 4px solid #10B981;">
        <div class="uc-icon" style="font-size: 1.8rem">🔬</div>
        <div class="uc-title" style="color: #34D399;">Enzima UGT2B17</div>
        <div class="uc-subtitle">Glucuronidação Hepática (Fígado)</div>
        <div class="uc-hidden">
            A enzima UGT2B17 é responsável por anexar uma molécula de ácido glucurônico à testosterona, tornando-a <strong style="color: white;">solúvel em água</strong>: a Testosterona-Glucuronídica. <br><br>Somente neste estado os rins conseguem retirá-la do sangue eficientemente.
        </div>
    </div>

    <div class="uc-arrow-down" style="height: 15px;"></div>
    
    <!-- CENTRAL WADA BLOCK -->
    <div class="uc-node" style="border-color: #F59E0B; background: rgba(245, 158, 11, 0.1); padding: 1rem; width: 500px; z-index: 6;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
            <span style="font-size: 1.5rem">⚠️</span>
            <div style="color: #FCD34D; font-size: 0.95rem; font-family: var(--font-display); letter-spacing: 0.5px;">O TESTE CLÁSSICO WADA (Razão T/E)</div>
        </div>
        <div class="uc-hidden" style="margin-top: 0.5rem; padding-top: 0.5rem; color: #FDE68A; border-top: 1px solid rgba(245,158,11,0.2);">
            A WADA avalia doping medindo a proporção de Testo para Epitesto na urina (limite de 4:1). <br><br><strong>Atenção:</strong> O teste urina-dependente só funciona se a enzima UGT2B17 enviar a testosterona para a bexiga!
        </div>
    </div>

    <div class="uc-arrow-down" style="height: 25px;"></div>

    <!-- BIFURCATION -->
    <div class="uc-split">
        
        <!-- Left Path -->
        <div class="uc-path">
            <div class="uc-h-line uc-h-left"></div>
            <div class="uc-v-line"></div>
            <div class="uc-node" style="width: 290px; border-top: 3px solid #9CA3AF;">
                <div class="uc-icon">✅</div>
                <div class="uc-title" style="font-size: 1.1rem;">Gene Normal</div>
                <div class="uc-subtitle">Excreção Urinária</div>
                <div class="uc-hidden">
                    <span style="display: inline-block; padding: 2px 6px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-bottom: 8px; font-size: 0.75rem;">100% Africanos | 90% Caucasianos</span><br>
                    O corpo solubiliza e joga na urina. O teste T/E acusa rapidamente níveis supracomuns, desmascarando o doping (Razão explode para 15:1 ou mais).
                </div>
            </div>
        </div>

        <!-- Right Path -->
        <div class="uc-path">
            <div class="uc-h-line uc-h-right"></div>
            <div class="uc-v-line uc-v-right"></div>
            <div class="uc-node" style="width: 290px; border-top: 3px solid #EF4444; background: rgba(239, 68, 68, 0.1);">
                <div class="uc-icon" style="filter: grayscale(1);">🩸➡️💩</div>
                <div class="uc-title highlight-red" style="font-size: 1.1rem;">Deleção UGT2B17</div>
                <div class="uc-subtitle highlight-red">Falso Negativo</div>
                <div class="uc-hidden">
                    <span style="display: inline-block; padding: 2px 6px; background: rgba(239, 68, 68, 0.2); border-radius: 4px; margin-bottom: 8px; font-weight: bold; color: white; font-size: 0.75rem;">66% dos Asiáticos (del/del)</span><br>
                    Sem o gene, a enzima primária falha. A testosterona exógena <strong>não entra na urina</strong>, escapando pelas fezes.<br><br>Músculos super-saturados com Cipionato, mas a urina apresenta exame limpo (T/E de 0.5:1).
                </div>
            </div>
        </div>

    </div>

</div>"""


with open(file_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

