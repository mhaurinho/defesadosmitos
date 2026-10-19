# Talentos de mutação — direção criativa v0.2

## Regra principal
Talentos alteram **como uma habilidade funciona**, não apenas atributos. Cada herói tem duas trilhas de três graus: agressiva e proteção/suporte. Escolher uma trilha durante a partida bloqueia a outra por enquanto. Talentos são adquiridos nos níveis 3, 6 e 9. Habilidades QWER permanecem, com R geralmente ultimate.

## Exemplos de fantasia e combos
- **Saci + Curupira:** redemoinho reposiciona aliados; raízes podem capturar inimigos para uma emboscada.
- **Curupira + Boitatá:** raízes prendem, chamas punem o inimigo que insiste em atravessar a floresta.
- **Iara + Boto:** cura em cadeia e recuperação de mana criam uma composição de sustentação.
- **Cuca + Matinta:** pesadelo e assobio geram janela de controle.
- **Mula-sem-Cabeça + Mapinguari:** investida seguida de abalo abre caminho na linha de frente.
- **Caipora + Saci:** mobilidade e ataques de longa distância para emboscadas.

## Implementação efetiva atual
O catálogo de vinte trilhas (duas para cada um dos dez heróis) agora contém mutações específicas. A engine aplica um primeiro conjunto de mudanças de dano, alcance, recuperação, mana e proteção ao lançar habilidades. **Não** confundir fantasia planejada com efeitos já prontos: teleporte de aliados, raízes persistentes, queimadura por duração, invocações, escudos temporários e controle real ainda precisam de sistemas de status, zonas e eventos.

## Arquitetura seguinte
- Sistema de eventos: `onCast`, `onHit`, `onHeal`, `onKill`, `onEnterZone`.
- Efeitos com duração e limpeza: root, silence, burn, shield, charm, mark.
- Combos explícitos por tags: `nature`, `fire`, `water`, `dream`, `wind`, `beast`.
- Contrajogo: aviso visual, alcance, duração, custo, cooldown e dispel.
- Balanceamento: métricas por talento, sinergia entre duplas, tempo de combate, taxa de vitória e frequência de escolha.
- Bot deve escolher mutações pela composição e reconhecer efeitos do aliado.

## Princípio de equilíbrio
A mutação forte deve oferecer contrajogo e custo de oportunidade. Talentos não devem tornar uma combinação invencível nem obrigatória.
