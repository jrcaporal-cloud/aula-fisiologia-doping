#!/usr/bin/env python3
import json, sys

with open('./src/data/parsedPresentation.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

new_slides = [
    {
        "id": 32,
        "layout": "bento",
        "title": "A Vantagem Fisiológica Real",
        "subtitle": "O que a ciência endocrina diz sobre T e desempenho atlético",
        "content": "",
        "cards": [
            {
                "type": "info",
                "title": "Por que a Testosterona importa",
                "attributes": [],
                "rawHtml": "<p style='font-size:0.9rem;color:#d1d5db;line-height:1.6;'>Testosterona masculina adulta: <strong style='color:white;'>15–20× superior</strong> à feminina. Impactos estruturais documentados: +40% massa muscular magra, +25% força máxima, maior densidade óssea, hematócrito ~10% maior e VO₂máx superior. São adaptações cumulativas que levam <em>anos</em> a se desenvolver.</p>"
            },
            {
                "type": "info",
                "title": "Gap de Performance Documentado",
                "attributes": [],
                "rawHtml": "<ul style='list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px;font-size:0.85rem;color:#d1d5db;'><li>⚡ <strong style='color:white;'>Velocidade:</strong> Homens ~10-12% mais rápidos em sprints e distâncias</li><li>🏋️ <strong style='color:white;'>Força:</strong> 20-30% de superioridade em provas de potência</li><li>🚴 <strong style='color:white;'>Endurance:</strong> ~7-10% de vantagem em provas aeróbicas</li><li>🦴 <strong style='color:white;'>Ossos:</strong> Diferença anatômica irreversível: altura, envergadura, pelve</li></ul>"
            },
            {
                "type": "info",
                "title": "A \"Memória Muscular\" Androgênica",
                "attributes": [],
                "rawHtml": "<p style='font-size:0.9rem;color:#d1d5db;line-height:1.6;'>Mionúcleos adquiridos sob testosterona elevada são <strong style='color:#f87171;'>permanentes</strong>. Estudos de Staron et al. e Schwartz et al. demonstram que esses núcleos persistem anos após a supressão hormonal, permitindo uma <em>hiper-resposta ao retreinamento</em> — vantagem residual independente dos níveis séricos atuais de T.</p>"
            },
            {
                "type": "warning",
                "title": "Hiperplasia vs. Atrofia: o que a TRT pode reverter",
                "attributes": [],
                "rawHtml": "<p style='font-size:0.9rem;color:#d1d5db;line-height:1.6;'><strong style='color:#fbbf24;'>Reversível com TRT:</strong> tamanho das fibras, força relativa, VO₂max relativo. <strong style='color:#f87171;'>Irreversível:</strong> número de mionúcleos, estrutura esquelética, comprimento de segmentos ósseos — as bases das vantagens biomecânicas permanecem intactas.</p>"
            }
        ]
    },
    {
        "id": 33,
        "layout": "bento",
        "title": "O Campo de Batalha Regulatório",
        "subtitle": "Federações, litigâncias e o impossível equilíbrio entre ciência e inclusão",
        "content": "",
        "cards": [
            {
                "type": "info",
                "title": "IOC Framework 2021",
                "attributes": [],
                "rawHtml": "<p style='font-size:0.9rem;color:#d1d5db;line-height:1.6;'>O COI <strong style='color:white;'>aboliu</strong> limites universais de testosterona para elegibilidade. Delegou às federações individuais, com o princípio de que <em>\"não se deve presumir automaticamente vantagem\"</em>. Crítica: cria fragmentação regulatória e insegurança jurídica para atletas.</p>"
            },
            {
                "type": "info",
                "title": "World Athletics 2023",
                "attributes": [],
                "rawHtml": "<p style='font-size:0.9rem;color:#d1d5db;line-height:1.6;'>Exige T sérica <strong style='color:#60a5fa;'>&lt; 2,5 nmol/L</strong> por <strong style='color:white;'>24 meses contínuos</strong> em provas de 60m a 1500m. Para atletas trans femininas: <strong style='color:#f87171;'>exclusão completa</strong> das categorias femininas enquanto a evidência científica sobre vantagem residual for inconclusiva. A decisão foi acusada de violar direitos humanos.</p>"
            },
            {
                "type": "info",
                "title": "Casos Emblemáticos",
                "attributes": [],
                "rawHtml": "<ul style='list-style:none;padding:0;margin:0;font-size:0.85rem;color:#d1d5db;display:flex;flex-direction:column;gap:8px;'><li>🇿🇦 <strong style='color:white;'>Caster Semenya vs. IAAF:</strong> Mulher intersexual (hiperandrogenismo natural), obrigada a tomar anticoncepcionais para competir. TEDH negou recurso em 2023.</li><li>🏊 <strong style='color:white;'>Lia Thomas (natação):</strong> Primeira trans campeã nacional NCAA. Tempos masculinos anteriores vs. tempos femininos: diferença de ~1,5–2 segundos em 500 jardas.</li><li>🏋️ <strong style='color:white;'>Laurel Hubbard (halterofilia):</strong> Primeira trans nos Jogos Olímpicos (Tóquio 2021), eliminada sem medalhar.</li></ul>"
            },
            {
                "type": "warning",
                "title": "O Dilema Irresolvível",
                "attributes": [],
                "rawHtml": "<p style='font-size:0.9rem;color:#d1d5db;line-height:1.6;'>Qualquer política de elegibilidade viola <em>pelo menos</em> um princípio fundamental: <ul style='margin-top:8px;padding-left:1rem;'><li>Inclusão irrestrita → potencial desvantagem competitiva para mulheres cis</li><li>Exclusão → discriminação e violação de direitos</li><li>Limites de T → instrumento de vigilância corporal coercitiva</li></ul></p>"
            }
        ]
    },
    {
        "id": 34,
        "layout": "bento",
        "title": "A Fronteira da Ciência",
        "subtitle": "O que os estudos realmente dizem — e o que ainda não sabemos",
        "content": "",
        "cards": [
            {
                "type": "info",
                "title": "Hilton & Lundberg (2020) — British J Sports Med",
                "attributes": [],
                "rawHtml": "<p style='font-size:0.9rem;color:#d1d5db;line-height:1.6;'>Meta-análise mostra que após 2–3 anos de TRT, mulheres trans retêm <strong style='color:#f87171;'>10–14% de vantagem</strong> em força muscular em comparação com mulheres cis de mesmo nível de treino. Em força de preensão e potência de membros inferiores: gap ainda mais significativo.</p>"
            },
            {
                "type": "info",
                "title": "Harper et al. (2021) — Br J Sports Med",
                "attributes": [],
                "rawHtml": "<p style='font-size:0.9rem;color:#d1d5db;line-height:1.6;'>Estudo pioneiro em militares trans: após 2 anos de TRT feminizante, <strong style='color:white;'>tempos de corrida caíram ~12%</strong>, capacidade de flexão diminuiu ~17%. Crítica: amostra são militares, não atletas de elite, e 2 anos pode ser insuficiente para apagamento total das adaptações masculinas.</p>"
            },
            {
                "type": "info",
                "title": "Roberts et al. (2021) — Br J Sports Med",
                "attributes": [],
                "rawHtml": "<p style='font-size:0.9rem;color:#d1d5db;line-height:1.6;'>Análise de dados das Forças Aéreas dos EUA: atletas trans femininas superaram mulheres cis nos primeiros 2 anos pós-transição. Após 4 anos, <strong style='color:#34d399;'>nenhuma diferença estatisticamente significativa</strong> em corredoras — mas amostra com apenas 29 participantes trans.</p>"
            },
            {
                "type": "warning",
                "title": "O Vácuo Científico",
                "attributes": [],
                "rawHtml": "<ul style='list-style:none;padding:0;margin:0;font-size:0.85rem;color:#d1d5db;display:flex;flex-direction:column;gap:6px;'><li>⚠️ Estudos com atletas de elite trans: praticamente <strong style='color:#fbbf24;'>inexistentes</strong></li><li>⚠️ Amostras pequenas (N &lt; 50 em quase todos os estudos)</li><li>⚠️ Ausência de RCTs (ensaios randomizados — eticamente inviáveis)</li><li>⚠️ Período de follow-up geralmente &lt; 5 anos</li><li>⚠️ Regulamentação está <em>décadas à frente</em> da evidência científica disponível</li></ul>"
            }
        ]
    }
]

# Append to end
data.extend(new_slides)

with open('./src/data/parsedPresentation.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Done! Total slides: {len(data)}")
