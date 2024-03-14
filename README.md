# Ameciclo

Esse é o repositório do site oficial da Ameciclo.
Ele está divido em duas partes, uma é o frontend, que deve permanecer nesse repositório.
A segunda parte é o backend, que está sendo movido para o repositório ameciclo/quadro.

## O Backend
O backend principal, e que aqui está temporiamente desenvolvido e migrando para ameciclo/quadro, é um CMS do Strapi.

Para rodar o BACKEND:
1) Ter o Docker instalado
2) Ter o Docker Compose instalado
3) Executar ```sudo docker compose up``` 
4) Deve acessar em localhost:1337
   
## O Frontend

Está desenvolvido em NextJS, versão 12, com Tailwind.

Para rodar o FRONTEND:
1) Ter o Node.JS instalado em sua máquina.
2) Entre na pasta frontend
3) Execute ```npm install```
4) Execute ```npm run dev```
5) Deve acessar em localhost:3000

Atenção! Para rodar o frontend, é necessário que o Backend esteja rodando. Portanto, ou executa-se o backend em sua máquina ou troca em index.ts o endereço do localhost para pegar os dados em produção.   

## TO DO:

1) Usar a biblioteca de componentes desenvolvida na Plataforma de Dados neste repositório.
2) Página inicial: Criação de anúncios a serem colocados na página principal, para coisas importantes como as Eleições da Ameciclo.
3) Agenda: Colocar os próximos eventos em destaque na página da Agenda.
4) Biblioteca: Página da biblioteca que listará os livros disponíveis na Ameciclo, possibilitará o controle de locação e disponibilizará a possibilidade de reserva. Cada livro terá sua página com imagem, descrição completa e possíveis comentários advindos do Foca na Leitura, por exemplo, como num clube de livros.
Blog
5) Criação de um blog a ser alimentado por ameciclistas. Já existe a estrutura no LoaCima
6) Brindes e doações: Criar a página que possibilitará a aquisição dos nossos brindes e doações voluntárias diretamente pelo site. Além de se anunciar esses brindes na página inicial do site, em um carrossel. 
7) Clipping: Colocar um sumário do clipping de notícias da Ameciclo, possibilitar a contagem de notícias onde saímos, listar locais e principais matérias e disponibilizar para o público o compilado. É interessante que as matérias estejam correlacionadas com os Grupos de Trabalho e Projetos, quando possível.
8) Quem somos: Inserção de pessoas de coordenações antigas no campo coordenação, em tamanho menor e abaixo da coordenação atual. O mesmo vale para o conselho fiscal. Adição da mini-bio das pessoas associadas.
9) Boletim informativo: Os boletins estarão disponibilizados mensalmente também no site, além de serem enviados pelo e-mail. Também terá a possibilidade de assinar (newsletter). Serão alimentados pelo bot, como informado na parte anterior da proposta, bem como possibilitará a revisão anterior direta pelo site, pelas pessoas da comunicação/coordenação.
10) Transparência: Criação de um portal da transparência, juntando os links importantes para o acompanhamento de contas e documentos da Ameciclo.
11) Ninho de projetos: Alguns projetos tem edições ou etapas separadas, por exemplo o Bota pra Rodar que tem Caranguejo Tabaiares, Entra Apulso e Vila Santa Luzia, ou ainda o Alinhando as Rodas e Solta o Frei, que tem várias edições. A ideia é criar um aninhamento que possibilite cada projeto ter uma subpágina com seus subprojetos.
12) Portal da pessoa associada: Portal que possibilita a pessoa atualizar seu cadastro e ter acesso a informações como os links dos GTs, Transparência e funcionalidades disponíveis no bot . Teria a possibilidade de criação de documentos e eventos, acompanhamento das demandas e pautas das reuniões. Assim como comentar sobre livros, reservá-los.
11) Projetos: Complementação da descrição dos projetos, em especial os mais antigos. Melhoria da página, com redução do número de fotos exibidas, separação entre patrocinadores e apoiadores, colocação do botão “quero contribuir” e “quero contratar” na página.
12) Apoiadores: Criação da página de apoiadores e patrocinadores da Ameciclo.
13) Links: Criação da página de links importantes da Ameciclo, como um link.tree só nosso.

[![Ameciclo](https://circleci.com/gh/Ameciclo/ameciclo.svg?style=svg)](https://app.circleci.com/pipelines/github/Ameciclo/ameciclo)

[![Vercel Logo](frontend/public/vercel-logo.svg)](https://vercel.com/?utm_source=ameciclo&utm_campaign=oss)
