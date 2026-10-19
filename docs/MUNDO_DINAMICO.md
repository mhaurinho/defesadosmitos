# Mundo dinâmico — ciclo de luz, biomas, visão e runas

## Filosofia
O mapa é uma variável estratégica ativa. O dia, a noite e o território favorecem estilos de jogo, sem impedir que outros heróis participem. Nenhuma vantagem depende de uma dupla fixa. Combate 5v5 deve permitir disputa por espaço, emboscada, controle de objetivos e contrajogo.

## Relógio da partida
- Um ciclo completo dura **180 segundos** de simulação a 60 ticks/s.
- Quatro fases: amanhecer, dia, entardecer e noite; cada uma dura 45 segundos.
- Visão global: noite 66%, entardecer 80%, amanhecer 90%, dia 100%.
- A interface exibe fase e hora fictícia.

## Terrenos e afinidades
- **Rio** (faixa central vertical): Iara e Boto recebem +17% velocidade, +8% dano e regeneração de vida planejada.
- **Floresta**: Curupira, Caipora e Mapinguari têm +25% visão e +8% dano.
- **Névoa**: Saci e Matinta têm +45% visão e +13% velocidade.
- **Noite**: Saci, Matinta e Cuca recebem +40% visão individual e +6% dano.
- **Dia**: Boitatá recebe +10% dano.
- Os efeitos numéricos são hipóteses iniciais para testes de balanceamento, não valores finais.

## Runas
- A cada **45 segundos**, surge uma runa em um de cinco pontos predeterminados, em rotação.
- Uma runa expira após 25 segundos se não for coletada.
- Tipos: Fúria (+7 ataque), Guardião (+80 vida máxima), Clareza (+130 mana), Vento (+0,25 velocidade).
- O primeiro herói de qualquer equipe a entrar no raio de coleta recebe o efeito.
- **Limitação importante:** bônus de Fúria, Guardião e Vento permanecem pela partida nesta versão. É necessário adicionar duração, limites de acumulação e feedback visual antes do balanceamento final.

## Implementado
- Funções determinísticas para ciclo, bioma, afinidade, visão e surgimento de runas.
- Terreno influencia movimento e ataques básicos.
- Visão limita aquisição de alvos pela IA e ataques automáticos.
- Interface desenha rio, floresta, névoa, escurecimento noturno e runas.
- Coleta de runas aplica atributos ou recupera mana.

## Ainda não implementado
- Fog of war real (ocultar inimigos e revelar por equipes).
- Rio com correnteza, travessias, ponte e obstáculos.
- Regeneração ambiental aplicada por tick.
- IA com planejamento de rotas, emboscadas e prioridade de runas.
- Efeitos temporários com expiração para bônus.
- Balanceamento estatístico, testes automatizados e validação visual do build.

## Próximos testes
- Verificar que ambos os times podem coletar runas.
- Verificar transições de fase em limites de ticks.
- Testar visibilidade e aquisição de alvo à noite.
- Testar buffs dentro/fora de biomas e prevenção de empilhamento abusivo.
- Verificar se a partida pode terminar em todos os períodos.
