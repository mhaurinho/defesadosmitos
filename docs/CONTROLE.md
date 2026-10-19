# Defesa dos Mitos — Controle de grupo

Sistema de estados em `src/game/status.ts`. Cada habilidade declara seu controle no campo `cc` em `skills.ts`, ao lado de custo e recarga.

| Estado | Anda | Ataca | Lança habilidade | Cor do anel |
|---|---|---|---|---|
| Atordoado (`stun`) | não | não | não | amarelo |
| Enraizado (`root`) | não | sim | sim (sem deslocamento) | verde |
| Lento (`slow`) | mais devagar | sim | sim | azul |
| Silenciado (`silence`) | sim | sim | não | roxo |

## Habilidades com controle
| Herói | Habilidade | Efeito |
|---|---|---|
| Curupira | Q Raízes Vivas | enraíza 1,2 s |
| Iara | E Encanto | −45% de velocidade por 2 s |
| Cuca | E Sono Profundo | atordoa 1,3 s |
| Cuca | R Noite Sem Fim | atordoa 1,75 s |
| Matinta Pereira | Q Assobio Sombrio | silencia 2 s |
| Matinta Pereira | R Agouro | silencia 2,5 s |
| Mapinguari | R Rugido Primordial | atordoa 1,5 s |

## Regras
- Controle duro (atordoar ou enraizar) dá imunidade a novos controles duros até 1 s depois do fim. Assim não dá para travar alguém em cadeia; lentidão e silêncio continuam valendo.
- Lentidões não somam: vale a mais forte.
- Torres e núcleos são imunes.
- Bots não lançam habilidades enquanto estão atordoados ou silenciados. O jogador recebe o aviso "Atordoado!" ou "Silenciado!".

## Observado em simulação (6 partidas, todos no automático)
- Os heróis passam cerca de 10% da partida sob algum controle, a um custo de aproximadamente 0,45 ms por tick.
- A composição vermelha (Cuca e Matinta) concentra mais controle e venceu 5 de 6.
