# Para Raissa, com amor

Uma declaração de SanSan para Raissa, feita para abrir no celular.

Esta versão inclui transições durante a rolagem, uma concha que revela os dois personagens juntos, mensagens em telas que deslizam horizontalmente e um coração que sobe a cada toque. O botão da concha também permite abri-la e fechá-la manualmente. A página respeita a preferência de movimento reduzido.

## GitHub Pages

Em Settings → Pages, use Deploy from a branch, branch main e pasta / (root).

Endereço: https://mathe2136.github.io/fjfj/

Não há instalação ou compilação. Mantenha index.html, styles.css, app.js, assets/ e vendor/ juntos. As imagens e o GSAP são servidos pelo próprio repositório. As fontes possuem alternativas locais caso Google Fonts ou Fontshare estejam indisponíveis.

## Referências de direção e movimento

- Lusion: https://lusion.co/about/ — narrativa visual e descoberta por interação.
- GSAP ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger/ — revelação de texto e transições ligadas à rolagem.

Composição e concha desenhadas para este projeto. Personagens fornecidos pelo autor da página.

GSAP 3.13.0 e ScrollTrigger preservam os avisos de licença nos arquivos em vendor/. Termos: https://gsap.com/standard-license/

## Nosso Spotify

A página `spotify.html` reúne a playlist San e Rai, a capa personalizada fornecida pelo autor e uma seleção de Alice e o Jaguadarte (1:47 a 2:10), Me Beija de GMeyer (0:01 a 1:23) e Best Part de Daniel Caesar e H.E.R. (2:09 a 2:47). Os botões carregam cada faixa no player oficial; o botão Playlist completa restaura a seleção integral. A reprodução é controlada pelo Spotify e depende da disponibilidade e das condições do serviço para o visitante. A capa personalizada pertence à apresentação do site; o conteúdo interno do player continua sob controle do Spotify.

Playlist: https://open.spotify.com/playlist/1cTilm7NeUkhR1FIsdrs3t

Use `spotify.css` e `spotify.js` para ajustar essa página. A navegação da página inicial inclui Nosso Spotify.

Os destaques incluem ondas decorativas animadas, sem logotipo, com controle de pausa e suporte a movimento reduzido. Os horários controlam o player de áudio local: cada seleção prepara o início indicado, e Ouvir trecho pausa no final escolhido. O controle com ondas animadas permite avançar e voltar; buscar fora do trecho muda para música inteira. Música inteira começa do início. Me Beija carrega o lançamento oficial de GMeyer (a faixa original aparece primeiro no player).

## Áudio no site

Os três arquivos enviados pelo autor estão em `assets/audio/`, em AAC/M4A com metadados de reprodução no início do arquivo. O player HTML5 tem controles personalizados com ondas animadas durante a reprodução, botão de pausa, tempo e busca real por toque, arrasto ou teclado. As três músicas e o player aparecem antes do botão Playlist completa. A reprodução exige um toque do visitante. O player e os links oficiais do Spotify continuam disponíveis separadamente; o controle de trechos é aplicado ao áudio hospedado no site.

## Concha e mensagens

A tampa da concha abre de 68° até 0° ao redor da dobradiça, sem ultrapassar 90° nem virar para dentro da base. A seção Que seja isso contém três telas com rolagem horizontal nativa, encaixe entre mensagens e indicador de posição. No celular, deslize para a esquerda para avançar e para a direita para voltar. Também há arrasto com mouse e navegação pelas setas, Home e End do teclado.


## Nossa linha do tempo e áudio da MiMi

A página inicial inclui quatro marcos sem ano presumido: 19/07 (primeiro oi), 14/08 (primeiras mensagens), 02/09 (entrega da pelúcia Nina) e 02/10 (pedido de namoro). Em Frases importantes para a MiMi, um botão reproduz e pausa `assets/audio/frases-mimi.m4a`, extraído do MP4 enviado pelo autor. Só a faixa de áudio é publicada, sem vídeo e sem reprodução automática. Os controles ficam em `quote-audio.js`.


## Direção da linha do tempo

A linha SVG é desenhada pela posição real da rolagem, com uma pérola na ponta e destaque do marco atual. O texto permanece disponível sem JavaScript e todas as datas aparecem sem animação quando movimento reduzido está ativado. O título acompanha a leitura em telas grandes e fica no fluxo normal no celular. Implementação própria em `timeline.js`.

Referências de direção: [Scroll-Drawn SVG Timeline](https://codepen.io/sainul/pen/bNqMpXq), pelo desenho progressivo do caminho; [KOTAverse](https://www.awwwards.com/sites/the-kotaverse), pela descoberta gradual dos marcos. A terceira referência enviada, Chrono Rail, não estava acessível durante esta atualização.


O botão Nina tem uma miniatura da pelúcia e cria uma bolinha com sua imagem a cada toque. As bolinhas sobem e desaparecem; com movimento reduzido, apenas aparecem e somem suavemente. A imagem está em `assets/nina.png`.
