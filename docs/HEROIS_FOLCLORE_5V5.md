# Defesa dos Mitos — Elenco folclórico e partida 5v5

## Direção criativa
Dez personagens inspirados em tradições do folclore brasileiro. Representações visuais e narrativas originais, com pesquisa cultural cuidadosa; as lendas possuem variantes regionais. Não tratar uma única versão como definitiva.

## Elenco inicial
| Herói | Papel | Q | W | E (planejado) | R (planejado) |
|---|---|---|---|---|---|
| Saci | Assassino | Redemoinho | Salto Travesso | Fumaça Enganadora | Tormenta do Saci |
| Curupira | Lutador | Raízes Vivas | Passos Invertidos | Proteção da Mata | Fúria da Floresta |
| Iara | Mago | Canto das Águas | Maré Restauradora | Encanto | Dilúvio |
| Boitatá | Mago | Chama Errante | Escamas Incandescentes | Rastro Ardente | Incêndio Sagrado |
| Cuca | Mago | Pesadelo | Caldeirão de Cura | Sono Profundo | Noite Sem Fim |
| Boto | Suporte | Onda Encantada | Bênção do Rio | Disfarce | Festa das Águas |
| Mula-sem-Cabeça | Lutador | Coice Flamejante | Galope | Brasa Persistente | Investida Infernal |
| Caipora | Atirador | Dardo da Mata | Sopro Vital | Companheiro Selvagem | Caçada Espiritual |
| Matinta Pereira | Suporte | Assobio Sombrio | Benção Noturna | Asas da Sombra | Agouro |
| Mapinguari | Tanque | Pancada Ancestral | Regeneração Selvagem | Pele Implacável | Rugido Primordial |

## Implementado na branch
- Dez fichas de heróis com HP, mana, ataque, armadura, alcance e velocidade distintos.
- Seleção de um herói pelo jogador e geração de **nove heróis IA** (4 aliados e 5 inimigos).
- Bot aliado e inimigo avançam, combatem, recuam sob HP crítico e renascem.
- Condição de vitória por destruição do núcleo permanece.
- **Atenção:** Q e W ainda são efeitos genéricos; os nomes individuais da tabela são especificação de design, não habilidades já implementadas.

## Critérios para fechar uma partida 5v5
1. Exatamente cinco heróis vivos/renascíveis por facção, sem duplicação do selecionado.
2. Todos podem atacar, morrer e renascer; partida termina por núcleo.
3. IA deve priorizar ameaças próximas e defender o núcleo.
4. Habilidades Q/W/E/R únicas por personagem com efeitos, custos, cooldowns e telemetria.
5. Loja e progressão por herói (não apenas jogador), com limites de itens.
6. Três rotas e tropas com rotas estáveis; colisões e pathfinding.
7. Testes automatizados para composição, respawn, vitória, economia e integridade dos dados.
8. Simulação em lote com seeds para comparar matchups; sem prometer balanceamento antes de medir.

## Fases seguintes
**Fase A:** QA, validação do build, testes de 5v5 e correções de combate.
**Fase B:** 40 habilidades originais, UI de cooldown, efeitos visuais e controle de alvo.
**Fase C:** mapa três rotas, selva, economia por unidade e partidas completas.
**Fase D:** servidores autoritativos e jogadores humanos 5v5 online.

## Uso do REA
REA (morluto/rea) é ferramenta MCP opcional de pesquisa e engenharia reversa autorizada; não compõe o loop da partida nem fornece licença para copiar assets.
