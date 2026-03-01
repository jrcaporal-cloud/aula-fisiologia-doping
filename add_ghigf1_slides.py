#!/usr/bin/env python3
"""Add 2 dense GH-IGF-1 sections after slide 10 and redesign slide 17 Transfusão Autóloga."""
import json

with open('./src/data/parsedPresentation.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# ── 1. TWO NEW GH-IGF-1 SLIDES ─────────────────────────────────────────────
gh_slides = [
    {
        "id": 10.1,  # will become 35 in true auto-id
        "layout": "bento",
        "title": "A Farmacocinética do GH Exógeno",
        "subtitle": "Por que o hGH é quase impossível de detectar",
        "content": "",
        "cards": [
            {
                "type": "info",
                "title": "Meia-Vida Crítica: 20 Minutos",
                "attributes": [],
                "rawHtml": "<p style='font-size:0.9rem;color:#d1d5db;line-height:1.6;'>O GH recombinante (191 aminoácidos, 22 kDa) tem meia-vida plasmática de <strong style='color:white;'>~15–20 min</strong> via IV e ~3–4h SC. Isso significa que uma injeção às <strong style='color:#34d399;'>23h</strong> antes de dormir é completamente eliminada do plasma antes do controle matinal às 6h — a janela de detecção urinária/sanguínea fecha em menos de 24h.</p>"
            },
            {
                "type": "info",
                "title": "Pulsatilidade Fisiológica: O Disfarce Natural",
                "attributes": [],
                "rawHtml": "<p style='font-size:0.9rem;color:#d1d5db;line-height:1.6;'>GH endógeno é secretado em <strong style='color:white;'>pulsos</strong> de alta amplitude durante sono profundo (fase N3). O exógeno, injetado no mesmo período, mimetiza perfeitamente o padrão natural. O teste diferencial atual (GH2000/GH-2004) compara isoformas de 20 kDa vs 22 kDa — mas requer amostra &lt;12h após uso, tornando detecção aleatória.</p>"
            },
            {
                "type": "info",
                "title": "O Eixo Hepático: IGF-1 Como Proxy",
                "attributes": [],
                "rawHtml": "<p style='font-size:0.9rem;color:#d1d5db;line-height:1.6;'>O GH se liga ao receptor GHR nos hepatócitos → ativação de JAK2/STAT5 → síntese e secreção de <strong style='color:#60a5fa;'>IGF-1 (Fator de Crescimento Insulino-Símile 1)</strong>. IGF-1 tem meia-vida de <strong style='color:white;'>~15 horas</strong> (ligado à IGFBP-3), tornando-o um marcador mais estável. Atletas com IGF-1 crônico &gt;3 DP da referência são sinalizados no ABP.</p>"
            },
            {
                "type": "warning",
                "title": "Acromegalia Subclínica: O Custo Real",
                "attributes": [],
                "rawHtml": "<p style='font-size:0.9rem;color:#d1d5db;line-height:1.6;'>Uso crônico de hGH em doses suprafisiológicas causa expansão progressiva do tecido conjuntivo e ósseo: <strong style='color:#fbbf24;'>mandíbula projetada, arcadas supraorbitais, mãos e pés alargados</strong> — Palumboísmo. Órgãos internos (coração, fígado, intestino) também sofrem hiperplasia. Cardiomegalia causa morte prematura documentada em ex-fisiculturistas profissionais.</p>"
            }
        ]
    },
    {
        "id": 10.2,
        "layout": "bento",
        "title": "IGF-1 Local vs Sistêmico",
        "subtitle": "A vantagem dupla do eixo GH-IGF-1 no esporte de elite",
        "content": "",
        "cards": [
            {
                "type": "info",
                "title": "IGF-1 Hepático (Sistêmico)",
                "attributes": [],
                "rawHtml": "<p style='font-size:0.9rem;color:#d1d5db;line-height:1.6;'>O fígado produz <strong style='color:white;'>~70% do IGF-1 circulante</strong>. Esse IGF-1 sistêmico liga-se ao receptor IGF-1R → ativa cascata PI3K→Akt→mTORC1, maximizando síntese proteica em todas as células-alvo simultaneamente. O resultado é hiporidade síntese proteica muscular, lipólise acelerada e mobilização de AGL em todo o organismo.</p>"
            },
            {
                "type": "info",
                "title": "Mechano Growth Factor (MGF — IGF-1Ec)",
                "attributes": [],
                "rawHtml": "<p style='font-size:0.9rem;color:#d1d5db;line-height:1.6;'>O músculo sob tensão mecânica produz o splice variant <strong style='color:#34d399;'>MGF (Mechano Growth Factor)</strong> — derivado local do gene IGF-1. O MGF ativa e prolifera células satélite específicas da fibra estimulada, produzindo novos mionúcleos <em>exatamente onde houve dano mecânico</em>. Combinado com GH exógeno, a hiperplasia localizada é acelerada em 3–5×.</p>"
            },
            {
                "type": "info",
                "title": "Sinergia Total com EAA + Insulina",
                "attributes": [],
                "rawHtml": "<ul style='list-style:none;padding:0;margin:0;font-size:0.85rem;color:#d1d5db;display:flex;flex-direction:column;gap:8px;'><li>🔄 <strong style='color:white;'>EAA</strong> fornece o arcabouço androgênico (RA) para transcrição gênica pró-anabólica</li><li>⚡ <strong style='color:white;'>GH/IGF-1</strong> multiplica a sinalização via mTOR e produz hiperplasia celular</li><li>💉 <strong style='color:white;'>Insulina</strong> blinda o catabolismo (inibe Ubiquitina-Proteassoma) e satura GLUT4</li><li>🩸 <strong style='color:white;'>EPO</strong> amplia o transporte de O₂ para suportar volumes de treino absurdos</li></ul>"
            },
            {
                "type": "info",
                "title": "Resistência Insulínica como Colateral",
                "attributes": [],
                "rawHtml": "<p style='font-size:0.9rem;color:#d1d5db;line-height:1.6;'>O GH, paradoxalmente, é <strong style='color:#f87171;'>diabetogênico</strong>: estimula neoglicogênese hepática e atenua sinalização de insulina em adipócitos. Atletas using GH + Insulina exógena em stack navegam um equilíbrio metabólico de altíssimo risco — hipoglicemia noturna severa e resistência insulínica crônica são complicações documentadas em fisiculturistas profissionais da era 1990–2010.</p>"
            }
        ]
    }
]

# Fix IDs to be proper integers
gh_slides[0]["id"] = 35
gh_slides[1]["id"] = 36

# Find index of slide 10 and insert after it
idx10 = next(i for i, s in enumerate(data) if s.get("id") == 10)
data.insert(idx10 + 1, gh_slides[1])
data.insert(idx10 + 1, gh_slides[0])

# ── 2. REDESIGN slide 17 Transfusão Autóloga ──────────────────────────────
s17 = next(s for s in data if s.get("id") == 17)
s17["content"] = "[[COMP:BloodDopingAnimation]]"
# Clear old HTML content
print(f"Slide 17 title: {s17['title']}, layout: {s17['layout']}")

with open('./src/data/parsedPresentation.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Done! Total slides: {len(data)}")
print(f"Slides inserted at index {idx10+1} and {idx10+2}")
