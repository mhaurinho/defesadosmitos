# Defesa dos Mitos — Arquitetura v0.1

## Visão
MOBA/RTS original em navegador. Primeiro marco: arena 2D top-down, duas facções, torres, tropas, herói e núcleo destruível. Inspirado em convenções do gênero, sem reutilizar propriedade intelectual de terceiros.

## Implementação atual
- **Vite + TypeScript + Canvas 2D**, sem dependência de engine externa no primeiro protótipo.
- Loop de simulação e renderização no cliente; comportamento de tropas é uma FSM implícita simples (procurar alvo, avançar, atacar).
- Ataque automático, habilidade Q em área, W de cura, ondas de tropas, ouro, experiência e progressão.
- Limitações conhecidas: taxa de simulação atrelada a frames, IA rudimentar, sem pathfinding, sem inventário, sem rede e sem testes automatizados.
- Evolução planejada: `packages/game-core` determinístico, tick fixo, Phaser ou Pixi como camada de renderização, multiplayer autoritativo.

## REA
[REA](https://github.com/morluto/rea) significa Reverse Engineer Anything, ferramenta MCP de pesquisa técnica, **não** engine ou framework multiagente. Integração opcional no ambiente de desenvolvimento: `npx rea-agents setup`. Somente analisar alvos com permissão e registrar evidências; não incorporar assets ou código proprietário.

## Agentes
1. Orquestrador: fatia tarefas, define critérios de aceite e coordena PRs.
2. Gameplay: entidades, combate, habilidades, inventário.
3. Bots: árvores de comportamento, navegação e tomada de decisão.
4. Balanceamento: testes seeded, métricas e revisão de parâmetros.
5. Frontend: UI, HUD, input, animações e acessibilidade.
6. QA: build, testes funcionais, regressão e desempenho.

## Próximas etapas
1. Refatorar simulação para tick fixo e extrair módulos.
2. Criar quatro heróis originais e seleção de personagem.
3. Criar itens e loja com seis espaços.
4. Construir três rotas, selva e objetivos neutros.
5. Adicionar testes de regras, CI e benchmark de bots.
6. Introduzir multiplayer com validação server-side.

## Critérios de qualidade
- Build sem erros TypeScript.
- Nenhum recurso de terceiros sem licença compatível.
- Métricas de equilíbrio baseadas em amostras reproduzíveis, não em suposições.
- PRs pequenos, testes de regressão e relatório de mudanças.
