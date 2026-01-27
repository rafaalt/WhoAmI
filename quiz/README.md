# WhoAmI? - TikTok Quiz Game 🎥

Um jogo interativo desenvolvido especificamente para criação de conteúdo viral (TikTok, Reels, Shorts). O objetivo é desafiar a audiência a adivinhar quem é o famoso, qual é o filme, série ou time escondido atrás das camadas de desfoque antes que o tempo acabe.

**🔗 Veja em ação no TikTok:** [LINK_DO_TIKTOK_AQUI]

## 🎮 Como Funciona

O jogo apresenta um desafio de revelação progressiva de imagens. Bolas rebatem dentro de um círculo, revelando gradualmente partes da imagem de fundo. Power-ups aparecem aleatoriamente para acelerar o processo e criar momentos emocionantes no vídeo.

### Recursos Principais
- **Formato Nativo 9:16:** Layout otimizado para gravação de tela de celular (com guia visual).
- **Mecânica de Revelação:** O jogo começa com uma tela preta que evolui gradualmente através de níveis de desfoque até a imagem nítida.
- **Power-ups Dinâmicos:**
  - ⭐️ **Estrela:** Adiciona mais bolas coloridas ao jogo.
  - 💣 **Bomba:** Explode uma grande área, revelando o conteúdo instantaneamente.
  - ⚡ **Laser:** Dispara um feixe que revela uma linha ou coluna inteira.
  - 🟣 **Mega Ball:** Aumenta temporariamente o raio de revelação da bola.
  - 💠 **Cluster:** Libera várias micro-esferas rápidas e temporárias.
- **Totalmente Customizável:** Fácil alteração de imagens, sons, cores, textos e física.

## 🚀 Como Usar (Para Criadores)

1. **Prepare o Desafio:**
   - Abra o arquivo `constants.js`.
   - Altere a imagem de fundo (`background`) para o desafio desejado (famoso, filme, escudo de time, etc).
   - Atualize o `playerName` com a resposta correta que aparecerá no final.
2. **Grave:**
   - Abra o `index.html` no navegador (sugere-se usar o *Live Server* do VS Code).
   - Ajuste seu software de gravação (OBS, gravador de celular) para capturar a área delimitada.
   - Toque na tela para iniciar a contagem regressiva.
3. **Engaje:**
   - Narre o vídeo tentando adivinhar junto com a audiência ou desafiando-os.
   - O jogo termina automaticamente após o tempo configurado, exibindo a resposta.

## ⚙️ Configuração (`constants.js`)

Toda a configuração do desafio é feita no arquivo `constants.js`. Você não precisa mexer no código complexo.

```javascript
const GAME_CONFIG = {
    playerName: "LIVERPOOL", // A resposta final que aparece quando o tempo acaba
    images: {
        background: 'person/lvpol.png', // A imagem oculta
        logo: 'assets/logo.png' // Seu logo ou marca d'água
    },
    texts: {
        title: "Acerte o time!", // Título que aparece durante o jogo
        subtitle: "Em quanto tempo você consegue adivinhar esse time?",
        victory: "Você acertou?",
        follow: ""
    },
    duration: 60000 // Duração da partida em milissegundos (ex: 60000 = 1 minuto)
};
```

## 🛠️ Estrutura do Projeto

- `index.html`: Estrutura base e container de simulação de tela.
- `style.css`: Estilização visual (Dark Mode).
- `script.js`: Lógica principal (Canvas API, Física, Power-ups).
- `constants.js`: Configurações editáveis pelo usuário.
- `assets/`: Pasta para armazenar imagens, ícones e sons.

## 📦 Instalação

Não requer instalação de dependências (Node/NPM) para rodar, pois é feito em Vanilla JS.

1. Clone o repositório.
2. Adicione suas imagens na pasta `assets` ou `person`.
3. Configure o `constants.js`.
4. Abra o `index.html` no navegador.