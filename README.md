[![Deploy Code](https://github.com/Nucleo42/marvin-bot/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/Nucleo42/marvin-bot/actions/workflows/deploy.yml)
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

# Marvin - bot oficial da comunidade Nucleo 42

- [Marvin - bot oficial da comunidade Nucleo 42](#marvin---bot-oficial-da-comunidade-nucleo-42)
  - [Referência](#referência)
  - [Funções e Comandos](#funções-e-comandos)
    - [Observações](#observações)
    - [`/ping` comando](#ping-comando)
    - [`/set-greeting` comando/função](#set-greeting-comandofunção)
    - [`/set-welcome` comando/função](#set-welcome-comandofunção)
    - [`/set-member-count` comando/função](#set-member-count-comandofunção)
    - [`/set-announcement-react` comando/função](#set-announcement-react-comandofunção)
    - [`/set-auto-ban` comando/função](#set-auto-ban-comandofunção)
  - [Template de servidor](#template-de-servidor)
  - [Como  contribuir](#como--contribuir)
    - [Importante](#importante)
    - [Passo a passo para contribuir:](#passo-a-passo-para-contribuir)
  - [Rodando localmente](#rodando-localmente)
    - [Antes de começar](#antes-de-começar)
    - [Iniciando o projeto](#iniciando-o-projeto)
    - [Testando localmente](#testando-localmente)
  - [Suporte](#suporte)
  - [Feedback](#feedback)
  - [Contribuidores ✨](#contribuidores-)

## Referência

 - [discord.js - lib for discord api](https://discord.js.org/)
 - [Discord Developer Portal](https://discord.com/developers/docs/intro)
 - [Drizzle ORM - next gen TypeScript ORM](https://orm.drizzle.team/)
 - [node-canvas-  Canvas implementation for Node.js](https://github.com/Automattic/node-canvas)


## Funções e Comandos

### Observações  
- A maioria dos comandos contem a opção `is_enabled` que pode ser `true`ou `false` e serve para ativar ou desativar uma funcionalidade.
- Os comandos aqui listado como `admin` só podem ser usado por cargos que tenha permissão de administrado ou com os  respectivos  cargos:      
  - **admin**
  - **administrator**
  - **administrador**

### `/ping` comando
- usado para testar o servidor, mas com um pequeno **easter egg** do *guia do mochileiro das galaxias*.

### `/set-greeting` comando/função  
- Quando ativado, envia uma mensagem de "bom dia" todos os dias no horário determinado no `cron-job`.
- pode haver um pequeno **easter egg**.
- **Admin**: sim.

### `/set-welcome` comando/função 
- Esse comando ativa a função de mensagem personalizada de entrada de novos membros.
- tem **campos** opcionais para definir algumas configurações, como por exemplo, qual o canal de regras, para assim, criar um link para o canal.
- **Admin**: sim.
- veja o exemplo: 
  
  <img src="./static/images/welcome.jpg" alt="imagem de exemplo de entrada de membro">

### `/set-member-count` comando/função
- Esse comando ativa a função de contagem de membro no servidor.
- Quanto ativo, busca por um canal chamado `Membros:` e caso nao exista, ele cria um.
- é possível editar o canal posteriormente conforme necessário, inclusive adicionado um emoji, mas o nome tem que conter `Membros:`.
- **Admin**: sim.
- Exemplo: 
- 
  <img src="./static/images/member.jpg" alt="exemplo de contagem de membro">

### `/set-announcement-react` comando/função
- Quando ativado, reage a todas as mensagem enviada no `canal especificado por você`, usando o emoji escolhido.
- Você deve copiar o emoji e não o nome dele, por exemplo: `:purple_heart:` não funciona, mas `💜` funciona perfeitamente.
- Se for um emoji customizado, deve informar o `id` do emoji e não o nome.
- **Admin**: sim.
  

### `/set-auto-ban` comando/função
- Principal comando do bot, feito para evitar `spam` no servidor.
- Quando essa função está ativa e um `novo membro` entrar no servidor, ele é automaticamente adicionado a uma `lista de ban`.
- Para o `membro` continuar no servidor, ele deve enviar uma mensagem no canal de `Apresentação` ou qualquer `canal definido por você`.  
- O tempo padrão de banimento é  de `1 hora`, mas pode ser ajustado no arquivo `.env`.
- **Tags** necessária no servidor: `Pendente` e `Verificado`.
- **Admin**: sim.


## Template de servidor
- Use este template para criar seu próprio servidor e testar todas as funções do `marvin` já com canais e tags criadas.
- template discord: https://discord.new/KPZR4j5jWK8z

## Como  contribuir
### Importante

- Antes de começa a contribuir, leia a documentação da estrutura [clicando aqui](https://github.com/Nucleo42/marvin-bot/blob/main/docs/infrastructure.md).

### Passo a passo para contribuir:

1. Crie um fork deste repositório.
2. Envie seus commits em inglês.
3. Marque as `#issues` relacionada com seu `PR`.
4. Antes de enviar seu Pull Request, é essencial manter sua branch local atualizada para evitar conflitos. [Saiba Mais](https://www.freecodecamp.org/portuguese/news/git-pull-explicado/).
   - Para fazer isso:
   - Na página inicial do seu **Fork** no GitHub, localize o botão **Sync fork** para sincronizar seu repositório com as atualizações do repositório oficial.
   - Em seguida, execute o seguinte comando no seu terminal: `git pull <repositorio> <branch>`.
5. Faça um `build`da aplicação e teste localmente antes de abrir um `PR` 
5. Solicite um pull request na branch `develop`.
   - Preencha todas as informações do template e envie.



## Rodando localmente

### Antes de começar
- pegue seu token do discord em: https://discord.com/developers/docs/quick-start/getting-started#step-1-creating-an-app
- inicie seu banco de dados `postgres` localmente ou use compose: `docker-compose.yml`
- crie um arquivo `.env`na raiz do projeto com os valores preenchido baseado no `.env.example`

### Iniciando o projeto

Clone o `projeto

```bash
  git clone https://github.com/Nucleo42/marvin-bot.git
```

Entre no diretório do projeto

```bash
  cd marvin-bot
```

Instale as dependências

```bash
  yarn 
```

Rode as migrate do banco de dados

```bash
  yarn  migration
```

Inicie a aplicação

```bash
  yarn  dev
```
### Testando localmente

Faça o build da aplicação com

```bash
  yarn  build
```

Inicie a aplicação

```bash
  yarn  start
```

## Suporte
- Entre na nossa comunidade do `discord` para duvidas e suporte
- https://discord.gg/wKDGnsUQge

## Feedback

Se você tiver algum feedback, por favor nos deixe saber por meio de `issues` nesse repositório

## Contribuidores ✨


Um agradecimento a todos!!([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/parlandin"><img src="https://avatars.githubusercontent.com/u/56051040?v=4?s=100" width="100px;" alt="Gustavo Parlandim"/><br /><sub><b>Gustavo Parlandim</b></sub></a><br /><a href="#maintenance-parlandin" title="Maintenance">🚧</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
Este projeto segue contribuições de [all-contributors](https://github.com/all-contributors/all-contributors). contribuições de qualquer tipo bem-vindas!
