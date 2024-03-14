# Ameciclo

Este é o repositório do site oficial da Ameciclo, uma organização dedicada à promoção da bicicleta como meio de transporte sustentável. O projeto é dividido em duas partes principais: o frontend e o backend.

## Backend

O backend, temporariamente desenvolvido neste repositório e em migração para o repositório `ameciclo/quadro`, utiliza o CMS Strapi.

### Para rodar o backend:

1. Certifique-se de que o Docker está instalado.
2. Certifique-se de que o Docker Compose está instalado.
3. Execute `sudo docker compose up` no terminal.
4. Acesse através de `localhost:1337`.

## Frontend

O frontend foi desenvolvido utilizando NextJS versão 12 e Tailwind CSS.

### Para rodar o frontend:

1. Certifique-se de que o Node.JS está instalado na sua máquina.
2. Navegue até a pasta `frontend`.
3. Execute `npm install` para instalar as dependências.
4. Execute `npm run dev` para iniciar o servidor de desenvolvimento.
5. Acesse através de `localhost:3000`.

**Atenção:** Para rodar o frontend, é necessário que o backend esteja operacional. Você pode rodar o backend localmente ou ajustar o arquivo `index.ts` para utilizar dados de produção.

## Lista de Tarefas (TO DO):

- Implementar a biblioteca de componentes desenvolvida na Plataforma de Dados.
- Na página inicial, adicionar anúncios para informações importantes, como as Eleições da Ameciclo.
- Na Agenda, destacar os próximos eventos.
- Criar a página da Biblioteca para listar livros disponíveis, controlar locações e reservas. Cada livro terá sua própria página com imagem, descrição e comentários.
- Desenvolver um blog para ser alimentado pelos membros da Ameciclo.
- Criar uma página para aquisição de brindes e doações, com destaque na página inicial.
- Adicionar um resumo do clipping de notícias, com contagem, listagem e acesso ao compilado de matérias.
- Na seção Quem Somos, incluir coordenações passadas e conselho fiscal, além de mini-bios dos associados.
- Disponibilizar boletins informativos no site e oferecer assinatura via newsletter.
- Criar um portal da transparência com links para acompanhamento de contas e documentos.
- Implementar o Ninho de Projetos para organizar subprojetos dentro de projetos maiores.
- Desenvolver o Portal da Pessoa Associada para atualização de cadastro e acesso a informações e funcionalidades.
- Completar a descrição dos projetos, especialmente os mais antigos, e aprimorar a apresentação das páginas de projetos.
- Criar páginas para apoiadores e patrocinadores.
- Estabelecer uma página com links importantes da Ameciclo, similar a um link.tree próprio.

[![Ameciclo](https://circleci.com/gh/Ameciclo/ameciclo.svg?style=svg)](https://app.circleci.com/pipelines/github/Ameciclo/ameciclo)

[![Vercel Logo](frontend/public/vercel-logo.svg)](https://vercel.com/?utm_source=ameciclo&utm_campaign=oss)
