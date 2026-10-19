# Defesa dos Mitos — Balanceamento por simulação

```bash
npm run sim -- [partidas=40] [semente=1] [minutosMáx=25]
```

O simulador roda partidas 5v5 com drafts aleatórios e repetíveis pela semente, com os dez heróis controlados pela IA (`autopilot`). Ele mostra:
- a taxa de vitória de cada lado;
- a duração das partidas;
- quantas torres caem e em que minuto;
- por herói: vitórias, abates, mortes e dano em heróis por minuto.

Com 20 partidas a margem é de cerca de ±11%; com 100, de ±5%. Use 100 ou mais antes de mexer em atributo de herói.

## Ritmo da partida (2026-10-19)
| Métrica | Antes | Depois |
|---|---|---|
| Mortes por herói/min | 4,5 | ~2 |
| Queda média das torres | min 2,3 | min 5,8 |
| Duração média | 4–8 min | 8,5 min (5,5–11,7) |
| Azul × vermelho | 50/50 | 45/55 (ruído com n=20) |

Mudanças que levaram a esses números:
- Renascimento de 3 s + 0,75 s por nível (antes, 3 s fixos).
- Por nível: +60 de vida e +3 de ataque (antes, +35 e +5).
- Torre com 2800 de vida e armadura 30.
- Núcleo invulnerável enquanto o time ainda tem alguma torre de pé.
- Bots recuam com 35% de vida (antes, 23%).

## Heróis (linha de base, 100 partidas, antes dos ajustes de ritmo)
Cuca 70% · Matinta 66% · Iara 58% · Caipora 54% · Boto 51% · Boitatá 49% · Mula 47% · Saci 42% · Mapinguari 34% · Curupira 29%.

Os heróis com controle forte lideram, e os de corpo a corpo e o tanque ficam para trás. Antes de ajustar atributos, rode de novo com o ritmo novo.
