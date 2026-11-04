# Fisiologia do Doping no Esporte

Aula interativa (pós-graduação em medicina do esporte). React 19 + TypeScript + Vite + Tailwind v4 + framer-motion.
No ar: https://jrcaporal-cloud.github.io/aula-fisiologia-doping/ (publica sozinho a cada push na `main`).

## Como usar na sala

| Tecla | O que faz |
|---|---|
| `→` `Espaço` `PageDown` | avança um passo; ao fim dos passos, vai ao próximo slide |
| `←` `PageUp` | volta |
| `G` | visão geral de todos os slides |
| `P` | janela do apresentador (notas prontas, ritmo, cronômetro), sincronizada com a aula |
| `D` | abre/fecha o texto de apoio recolhido do slide ("detalhamento") |
| `F` | tela cheia |
| `3` | modelo 3D: receptor androgênico (slide do receptor), via de membrana do peptídeo (slides de peptídeos) e dinâmica circulatória (slide do coração) |
| `R` | slide do coração (e o modelo 3D dele): alterna "em uso" × "depois de parar". No 3D, clicar numa estrutura a fixa com close-up (Esc solta), "Sobrepor o treinado" mostra a cavidade original e "Recentrar" devolve a câmera |

O endereço acompanha o ponto da aula (`#/27/3` = slide 27, terceiro passo): recarregar a página volta ao mesmo lugar.

### Versões por tempo

A aula completa leva cerca de 3h com discussão (Ato II inclui o módulo de peptídeos: o que é um peptídeo, votação "proibido ou permitido?", o mapa das famílias com a pérola do hCG, promessa × evidência × risco × detecção, o caso Essendon e um caso de consultório; o Ato III inclui o slide cardiovascular dos esteroides, que soma hipertrofia concêntrica, pressão, viscosidade e placa até os desfechos; as fontes de cada slide abrem com D). Dois parâmetros na URL escondem os slides de aprofundamento (nada é apagado):

- `?tempo=90` — versão de cerca de 90 min
- `?tempo=60` — versão de cerca de 60 min

A janela do apresentador abre na mesma versão. As listas estão em `src/data/modes.ts`.

### Sem internet

Depois da primeira visita (com internet), a aula inteira abre e roda offline: um service worker guarda o código, os simuladores, as fontes e as fotos. Ao abrir a capa, o restante é baixado em segundo plano. Para garantir, abra a aula uma vez no computador da sala antes de começar. Se um slide falhar ao carregar, aparece "Este slide não carregou" com botão de tentar de novo, e a navegação continua.

## Para editar

- Texto dos slides: `src/data/parsedPresentation.json` (ordem do JSON = ordem da aula). O token `[[COMP:Nome]]` coloca um componente interativo no slide.
- Simuladores: `src/components/sims/Nome.tsx` (export default, sem props; usam `useSlideSteps(n)` para os passos). Entram sozinhos pelo token. Para ver um isolado: `?sim=Nome`.
- Notas do apresentador e tempo-alvo por slide: `src/data/notes.ts` (chave = `id` do slide).
- Versões por tempo: `src/data/modes.ts`.

```bash
npm install
npm run dev      # porta 5173 (ou a do launch.json)
npm run build    # tsc + vite build
npm run lint
npm test         # estrutura da aula: atos, notas, versões por tempo
```
