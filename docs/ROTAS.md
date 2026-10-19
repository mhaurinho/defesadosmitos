# Defesa dos Mitos — Três rotas

## Mapa
- Rotas **superior** (y=80), **central** (y=300) e **inferior** (y=520), definidas em `src/game/lanes.ts` como caminhos de pontos. O lado vermelho é o espelho horizontal do azul (`x → 1100 − x`).
- Uma torre por rota e por time (1100 de vida). O núcleo continua no centro de cada base.
- O rio, as florestas e a névoa de `world.ts` cruzam as rotas e mantêm seus bônus de terreno.

## Tropas
- Cada onda (a cada 260 ticks) envia 3 tropas por rota e por time, 18 no total.
- As tropas seguem os pontos da própria rota e têm aggro curto (140), para não trocarem de rota atrás de uma luta.

## Heróis IA
- Divisão 2-1-2: superior, central, inferior, superior, inferior, na ordem do time. O jogador escolhe livremente.
- **Não mergulham em torre**: torre inimiga sem tropa aliada dentro do alcance dela é ignorada como alvo, e o bot espera fora do alcance (estado `hold`).
- Torres causam 2,5× de dano em heróis. Curas afetam somente heróis, não estruturas.

## Balanceamento observado (simulação com os 10 heróis no automático, 6 partidas)
- As partidas duram de 8 a 15 min, e os dois times derrubam torres.
- O vermelho venceu 5 de 6. A única vitória azul foi quando o jogador escolheu um herói da composição vermelha, o que indica vantagem da composição vermelha (dois suportes com cura), não do mapa.
