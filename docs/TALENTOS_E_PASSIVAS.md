# Sistema de passivas e talentos — v0.1

## Princípio de design
Cada um dos dez heróis tem uma **passiva nativa temática** (identidade), sem obrigatoriedade de função única. Cada herói pode escolher entre duas linhas: **Ofensiva** ou **Defesa/Suporte**.

## Implementação atual
- `src/game/talents.ts` contém dez passivas descritas e duas árvores de três talentos por herói.
- Ganha-se um ponto de talento a cada três níveis (3, 6 e 9).
- O primeiro talento define a especialização da partida; é possível subir até três graus do ramo escolhido.
- Os efeitos implementados são atributos quantitativos: ataque, vida e armadura. Nomes das passivas e efeitos narrativos **não representam mecânicas passivas já ativas**.
- Os botões do HUD permitem escolher o ramo, e o estado da escolha fica na partida.
- O inventário permanece independente da especialização.

## Exemplo
Curupira: passiva temática **Guardião da Mata**. Linha Ofensiva **Vingança Verde** concede ataque; linha Defesa/Suporte **Raízes Protetoras** concede vida e armadura.

## Próximas entregas
1. Tornar cada passiva nativa funcional (efeitos com triggers e cooldown).
2. Habilidades únicas Q/W/E/R e variantes modificadas por talentos.
3. Possibilidade de realocar talentos mediante custo ou em base, após testes de balanceamento.
4. IA que seleciona especializações com base na composição do time.
5. Simulação automatizada de confrontos e win rates por ramo.
6. Painel visual completo da árvore com tooltips e prévia de atributos.

## Critérios de aceitação
Não permitir pontos negativos, gastar mais pontos do que ganhou, misturar dois ramos sem reset, exceder o terceiro grau ou persistir talentos de partidas anteriores.
