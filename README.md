# ⚔ Defesa dos Mitos

Jogo original de estratégia e combate em arena para navegador, inspirado nas convenções clássicas de RTS e MOBA.

## Estado atual
**Protótipo alfa implementado**: arena 2D, movimento por clique, herói azul, tropas de duas facções, torres, bases, combate automático, habilidade **Q** de dano em área, **W** de cura, ouro, experiência, níveis, vitória e derrota. O código foi publicado, mas ainda **não foi validado em execução neste ambiente**.

## Rodar localmente
Requisitos: Node.js 22+ e npm.

```bash
git clone https://github.com/mhaurinho/defesadosmitos.git
cd defesadosmitos
npm install
npm run dev
```

Abra o endereço local exibido pelo Vite.

### Comandos
- Clique no mapa: movimentar herói.
- **Q**: explosão de dano em área (cooldown).
- **W**: cura (cooldown).
- Aproximar-se de inimigos: ataque automático.
- Botão **Reiniciar partida**: começar de novo.

## Documentação
- [Arquitetura e roadmap](docs/ARQUITETURA.md)
- [REA — Reverse Engineer Anything](https://github.com/morluto/rea): ferramenta opcional de pesquisa de engenharia reversa, não componente obrigatório do jogo.

## Próximas entregas
Simulação determinística, IA dos bots, inventário, quatro heróis, três rotas, testes e evolução do visual. Arte, código e identidade próprios.
