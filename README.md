[![Deploy Code](https://github.com/Nucleo42/marvin-bot/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/Nucleo42/marvin-bot/actions/workflows/deploy.yml)

# Marvin - bot oficial da comunidade Nucleo 42

- [Marvin - bot oficial da comunidade Nucleo 42](#marvin---bot-oficial-da-comunidade-nucleo-42)
  - [Referência](#referência)
  - [Como  contribuir](#como--contribuir)
    - [Importante](#importante)
    - [Passo a passo para contribuir:](#passo-a-passo-para-contribuir)
  - [Rodando localmente](#rodando-localmente)
    - [Antes de começar](#antes-de-começar)
    - [Iniciando o projeto](#iniciando-o-projeto)
    - [Testando localmente](#testando-localmente)
  - [Suporte](#suporte)
  - [Feedback](#feedback)
  - [Contribuidores](#contribuidores)

## Referência

 - [discord.js - lib for discord api](https://discord.js.org/)
 - [Discord Developer Portal](https://discord.com/developers/docs/intro)
 - [Drizzle ORM - next gen TypeScript ORM](https://orm.drizzle.team/)
 - [node-canvas-  Canvas implementation for Node.js](https://github.com/Automattic/node-canvas)



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

Clone o projeto

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

## Contribuidores

