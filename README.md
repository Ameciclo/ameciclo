- [Issue desta Migração](https://github.com/Ameciclo/ameciclo/issues/108)
- [Pull Request desta Migração](https://github.com/Ameciclo/ameciclo/pull/109)

## Tarefas necessárias para plena migração

# Configurações
  - [x] INSTALAÇÃO - Remoção do projeto Next e Instalação do projeto em Remix.(https://github.com/Ameciclo/ameciclo/pull/109/commits/60af05d0758ff4c97f263340dda00ae5b07d2a9c)
  - [x] SEO - do Site (https://github.com/Ameciclo/ameciclo/pull/109/commits/07ed05b5a6cd5cf9e471f2f47a3037c3105997cc).
  - [x] ARQUITETURA - Definir arquitetura de processamento de dados para o Front em Remix (actions e loaders)
    - Loaders componentizados em `app/handlers/actions` e `app/handlers/loaders`
      - Por enquanto estamos fazendo os loaders e actions dentro do componente responsável. Em breve serão separados para as pastas correspondentes..
  - [ ] DEPLOY - Gerar pipeline.
  - [ ] Dockerização

--------------

# Páginas

## Comuns
- [x] `root.tsx` (https://github.com/Ameciclo/ameciclo/pull/109/commits/60af05d0758ff4c97f263340dda00ae5b07d2a9c)
- [x] `Footer.tsx` (https://github.com/Ameciclo/ameciclo/pull/109/commits/60af05d0758ff4c97f263340dda00ae5b07d2a9c)
- [x] `Navbar.tsx` (https://github.com/Ameciclo/ameciclo/pull/109/commits/60af05d0758ff4c97f263340dda00ae5b07d2a9c https://github.com/Ameciclo/ameciclo/pull/109/commits/e8dfaa247d21c0ea8ac04c9b5242e87e8cb17a64)
  - [ ] #BUG - Logo ainda não implementada
- [x] `GoogleAnalytics.tsx` (https://github.com/Ameciclo/ameciclo/pull/109/commits/60af05d0758ff4c97f263340dda00ae5b07d2a9c)
- [x] `$404 - Página Não Encontrada` (https://github.com/Ameciclo/ameciclo/pull/109/commits/c5e507f3ab40523875173675a411a474ee1a13e8)
- [x] Breadcrumb https://github.com/Ameciclo/ameciclo/commit/3f0eee7f0c3f31ed96b35f840e8ef4c0eefebdcf
  - [ ]  #BUG - Subcomponente BreadcrumbItem nao linka para páginas dos itens
- [x] SEO https://github.com/Ameciclo/ameciclo/commit/3f0eee7f0c3f31ed96b35f840e8ef4c0eefebdcf
   
## Páginas de (ameciclo.org)
  - [x] `/home`
    - [x] [`Banner.tsx`](https://github.com/Ameciclo/ameciclo/pull/109/commits/e1bf8dd5602af44b85b12dc460eedd6eaafa3bd1)
    - [x] SectionCallToAction.tsx
          - [x] #BUG - problemas com requisição de `cms.ameciclo.org/home`, dado simplesmente nao chega e lança erro de home = null, por enquanto, usando os links dos botoes inseridos de forma manual mesmo. https://github.com/Ameciclo/ameciclo/pull/109/commits/1d4922265e3f56b48572b7b6999d8f31cdeee239 https://github.com/Ameciclo/ameciclo/pull/109#issuecomment-2663213724
    - [x] SectionCarousel.tsx https://github.com/Ameciclo/ameciclo/pull/109/commits/f8b819602bdd04031b996fbe0aede5d8c7c5c617
          - [ ] #BUG - arrumar design quebrado
            - pode ser problema com lib `keen-slider`
          - [x] #BUG - problemas com requisições do strapi  https://github.com/Ameciclo/ameciclo/commit/1d4922265e3f56b48572b7b6999d8f31cdeee239  https://github.com/Ameciclo/ameciclo/pull/109/commits/38970fb409cf5db32388babbc1274eb4dbcf0302 https://github.com/Ameciclo/ameciclo/pull/109#issuecomment-2663213724
          - [x] #BUGResolve aviso (warning) do componente https://github.com/Ameciclo/ameciclo/pull/109/commits/38970fb409cf5db32388babbc1274eb4dbcf0302
    - [x] SectionData.tsx https://github.com/Ameciclo/ameciclo/pull/109/commits/60d2f97b554d05f277a62f7dfd0d903b5a2d6e66
          - [ ] #BUG - Problemas com a lib de animação
  - [x] `/quem_somos` https://github.com/Ameciclo/ameciclo/pull/109/commits/3f0eee7f0c3f31ed96b35f840e8ef4c0eefebdcf
    Componentes
    - [x] Breadcrumb https://github.com/Ameciclo/ameciclo/commit/3f0eee7f0c3f31ed96b35f840e8ef4c0eefebdcf
    - [x] SEO https://github.com/Ameciclo/ameciclo/commit/3f0eee7f0c3f31ed96b35f840e8ef4c0eefebdcf
    - [x] Tabs https://github.com/Ameciclo/ameciclo/commit/3f0eee7f0c3f31ed96b35f840e8ef4c0eefebdcf
      - [ ] #BUG - Botoes de tabs não estão filtrando
  - [x] `/agenda` https://github.com/Ameciclo/ameciclo/pull/109/commits/354867d809b0a542c49715abb19e0e43e82a59ab  https://github.com/Ameciclo/ameciclo/pull/109/commits/abc2c68af457c51d69d24cfe42f58db63035e4c3
  Componentes
      - [x] EventCalendar https://github.com/Ameciclo/ameciclo/commit/354867d809b0a542c49715abb19e0e43e82a59ab
    - [ ] #BUG - Error: A chave da API do Google Calendar não está definida.
  - [x] `/projetos` https://github.com/Ameciclo/ameciclo/pull/109/commits/c928bbae92ca5eb4942d48ae0e09fb9dc893a782
  Componentes
    - [x] ProjectCard  https://github.com/Ameciclo/ameciclo/pull/109/commits/c928bbae92ca5eb4942d48ae0e09fb9dc893a782
      - [ ] #BUG - Botão para exibir mais projetos nao está respondendo
  - [x] `/contato` https://github.com/Ameciclo/ameciclo/pull/109/commits/9d1933e73668b02bf270c8f0a0435b4669e42514
    - [x] #BUG - Error: Failed to resolve entry for package "react-map-gl". The package may have incorrect main/module/exports specified in its package.json: Missing "." specifier in "react-map-gl" package (resolvido https://github.com/Ameciclo/ameciclo/pull/109/commits/5820b032de1e5cbfa52f5a82d3d8294c5ef8dd62): 

        - A versão 7 do react-map-gl tem problemas de compatibilidade com Vite, então a solução mais direta é fazer downgrade para a versão 6. 

                > npm remove react-map-gl
                > npm install react-map-gl@6

    - [ ] #BUG - botão de participe não está direcionando
              
  - [x] `/status` https://github.com/Ameciclo/ameciclo/pull/109/commits/8be86ac73b7d71ec790891c25cd24936fd0bdf58 https://github.com/Ameciclo/ameciclo/pull/109/commits/6c305224df7c489eb2e1d4c7ac76bff02fe7dba3

## Páginas de (dados.ameciclo.org)
  - [ ] `/dados`
    Componentes
    - [ ] BannerData
    - [ ] ExplanationBoxes
    - [ ] CardsSession
    - [ ] ImagesGrid

  - [ ] `/dados/contagens`
    Componentes
    - [ ] Banner
    - [ ] Breadcrumb
    - [ ] StatisticsBox
    - [ ] ExplanationBoxes
    - [ ] InfoCards
    - [ ] Map
    - [ ] ContagensTable
    - [ ] CardsSession

  - [ ] `/dados/documentos`
    Componentes
    - [ ] Banner
    - [ ] Breadcrumb
    - [ ] ExplanationBoxes
    - [ ] DocumentsSession
  - [ ] `/dados/ideciclo`
    Componentes
    - [ ] NavCoverIdeciclo
    - [ ] Breadcrumb
    - [ ] StatisticsBoxIdeciclo
    - [ ] ExplanationBoxesIdeciclo
    - [ ] IdecicloClientSide
  - [ ] `/dados/perfil`
    Componentes
    - [ ] NavCover
    - [ ] Breadcrumb
    - [ ] ExplanationBoxes
    - [ ] PerfilClientSide
  - [ ] `/dados/observatorio/execucao_cicloviaria`
    Componentes
    - [ ] NavCover
    - [ ] Breadcrumb
    - [ ] StatisticsBox
    - [ ] ExplanationBoxes
    - [ ] Map
    - [ ] ObservatorioClientSide
    - [ ] CardsSession
## Páginas de (loaclima.ameciclo.org)
  - [ ] `/dados/observatorio/loaclima`
    Componentes
    - [ ] Banner
    - [ ] HomeTextAbout
    - [ ] HomeProposals
    - [ ] HomeLastNews
    - [ ] HomeFaq
    - [ ] ObservatoryArea

## Páginas de (dom.ameciclo.org)
  - [ ] `/dados/observatorio/dom`
    Componentes
    - [ ] Banner
    - [ ] HomeTextAbout
    - [ ] HomeProposals 
    - [ ] HomeLastNews
    - [ ] HomeFaq
    - [ ] ObservatoryArea


# Observações 
- [x] Separar Loaders dos arquivos seguindo definição de arquitetura deste documento.
- [x] Mapear estrutura LOAClima e DOM.
- [x] Discutir reformulação de barra de navegação
  - Discutir fusão do Observatório do loa e do dom serem já ná página inicial junto com as informações dos dados. 
  Sugestão replanejar uma nova página de início para os dados que contemple mais interação entre os dados e informativos relevantes sobre esses dados junto à apresentação da página como, o que é aquele observatório, como colaborar, de onde vem e como sao filtrados esses dados, etc....
  - Discutir como linkar todas as páginas da barra de navegação da página de dados e das paginas loa e dom que foram feitas como página independente e agora serão parte do ameciclo.org. Ou se se mantem essa logica de uma nav especifica para cada plataforma, o que não é tao bom para experiencia do usuário mas inicialmente pode evitar replanejamento de páginas home.
    - Foi definido então que vamos pegar apenas o observatório de cada página (dados.ameciclo.org, loaclima.ameciclo.org e dom.ameciclo.org) e incluir na pagina inicial dos dados e que na navbar o botao dados vai abrir um submenu com outras abas referente aos dados, além de incluir na página inicial dos dados, os cards dos novos observatorios, loa e dom. assim muda o escopo de tarefas de migração dessas paginas para:

> Dados
/dados
/dados/contagens
/dados/documentos
/dados/ideciclo
/dados/perfil
/dados/observatorio/execucao_cicloviaria
/dados/observatorio/loa
/dados/observatorio/dom

--------------
