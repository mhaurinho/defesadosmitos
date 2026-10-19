# Combate emergente — sinergias livres

## Filosofia
**Não existem combos exclusivos de duplas.** Toda habilidade pode produzir uma ou mais propriedades do mundo. Outros efeitos podem reagir a elas, independentemente de quem lançou, da composição e da ordem original imaginada pelo designer. O sistema não contém IDs de pares de heróis.

## Camadas
1. **Elemento** da habilidade: fogo, água, natureza, vento, sombra, sonho, fera, espírito.
2. **Condição** aplicada no alvo: molhado, enraizado, queimando, exposto, sonolento, deslocado ou protegido.
3. **Reação** desencadeada pela próxima habilidade: depende do estado atual, não de um herói específico.
4. **Cadeia**: uma reação pode deixar uma nova condição para um terceiro, quarto ou quinto participante.

## Reações implementadas no protótipo
- Água + fogo → vapor e exposição.
- Natureza + fogo → combustão das raízes.
- Água + espírito → condução espiritual.
- Fogo + vento → chamas espalhadas.
- Sonolência + sombra → pesadelo e exposição.
- Água + natureza → vegetação que enraíza.
- Exposição + fera → caça oportunista.
- Raízes + vento → deslocamento.

As reações atuais adicionam dano e registram condições por duração. **Enraizamento, deslocamento, queimadura e sono ainda não alteram movimento, IA ou dano ao longo do tempo.** Isso depende de um sistema posterior de status ativos. No momento, habilidades de dano/controle do jogador disparam essas reações; ataques básicos, bots e habilidades de suporte ainda não participam integralmente.

## Exemplo de cadeia aberta
Iara molha o alvo → Curupira enraíza → Boitatá inflama → Saci espalha → Caipora aproveita a exposição. É uma possibilidade, não uma receita obrigatória. Outras composições podem criar as mesmas condições.

## Regras de equilíbrio
- Não restringir combinações a pares específicos.
- Respeitar duração, consumo de condições e resistência.
- Adicionar contrajogo: limpeza, bloqueio, dispersão, distância e custo de mana.
- Evitar explosões de dano ilimitadas com limites por janela temporal.
- Validar reações em testes determinísticos e simulações 5v5.
- Evoluir a atribuição de crédito para vários participantes e assistências.

## Próximas frentes
Integrar todos os lançadores, condições ativas, áreas no mapa, ambiente destrutível, reação com terreno, sinergia de itens, talentos que mudam propriedades e interface visual dos estados.
