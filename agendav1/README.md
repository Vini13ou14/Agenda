# Área Escolar — Projeto Mobile First

Projeto feito em **HTML, CSS e JavaScript puro**, organizado com arquivos separados e baseado no fluxo das telas solicitadas.

## Estrutura do projeto

```text
cadastro_escolar_paginas_separadas/
│
├── index.html
├── README.md
│
├── assets/
│   └── estudantes.png
│
├── css/
│   └── style.css
│
├── js/
│   └── script.js
│
└── html/
    ├── area-login.html
    ├── login.html
    ├── area-cadastro.html
    ├── criar-conta.html
    ├── perfil.html
    └── dados.html
```

## Importante

Conforme solicitado:

- Apenas o `index.html` e o `README.md` ficam soltos na raiz.
- Todos os outros HTML ficam dentro da pasta `html`.
- O CSS fica dentro da pasta `css`.
- O JavaScript fica dentro da pasta `js`.
- A imagem dos estudantes fica dentro da pasta `assets`.
- A navegação acontece **na mesma aba**.
- Cada tela é um arquivo HTML separado.
- Os arquivos possuem comentários explicando suas partes principais.

## Fluxo do sistema

1. `index.html`
2. Área de login ou área de cadastro
3. Escolha do perfil
4. Criação de conta
5. Configurações de perfil
6. Finalização do cadastro
7. Login
8. Exibição dos dados cadastrados

## Como testar

1. Extraia o arquivo ZIP.
2. Abra o arquivo `index.html`.
3. Clique em **Cadastro**.
4. Escolha um perfil.
5. Preencha a primeira etapa.
6. Complete as configurações de perfil.
7. O cadastro será salvo no navegador.
8. Faça login com o **nome de usuário ou CPF** e a senha cadastrada.
9. A página final mostrará os dados informados.

## Responsividade

O projeto foi reforçado para ser **totalmente responsivo**, usando uma estratégia Mobile First.

- Layout fluido, sem larguras fixas que causem quebra em telas menores.
- `clamp()` para fontes, espaçamentos, imagens e tamanhos dos componentes.
- Celulares estreitos: conteúdo empilhado e botões em uma coluna.
- Celulares em paisagem: layout adaptado à altura reduzida.
- Tablets: menus e ações passam para duas colunas quando há espaço.
- Desktop: melhor aproveitamento horizontal sem esticar excessivamente os formulários.
- Monitores grandes: espaçamentos aumentam de forma proporcional.
- Dashboard: grade de dados passa de 1 para 2 e depois 3 colunas.
- `100dvh` para lidar melhor com barras dinâmicas dos navegadores móveis.
- `env(safe-area-inset-*)` para aparelhos com recortes/áreas seguras.
- Proteções contra overflow horizontal e textos longos.
- Campos de formulário e botões permanecem com área de toque adequada.
- Em telas com pouca altura ou quando o teclado virtual aparece, o conteúdo pode rolar verticalmente sem cortar campos.
- Suporte a `prefers-reduced-motion`.

Os arquivos HTML já possuem a meta `viewport` necessária para a responsividade.

## Persistência

Para facilitar o teste, o projeto usa o `localStorage` do navegador.

> Atenção: este é um protótipo de frontend. A senha fica armazenada localmente apenas para permitir o fluxo completo de teste. Em um sistema real, autenticação e senhas devem ser tratadas por um backend seguro.


## Preenchimento da tela

Todas as páginas foram configuradas para ocupar praticamente toda a altura disponível da viewport usando `100dvh`.

O comportamento é Mobile First e se adapta conforme a largura aumenta:

- celular: cartão ocupa a tela disponível;
- tablet: cartão aumenta junto com a viewport;
- desktop: conteúdo utiliza melhor o espaço vertical;
- monitor grande: layout continua preenchendo a tela, sem deixar um cartão pequeno centralizado.

A propriedade `100dvh` foi usada para funcionar melhor em navegadores mobile, considerando as barras dinâmicas do navegador.


## Ajuste de preenchimento da tela

As telas foram ajustadas para manter **no máximo 2px de afastamento externo** da borda da viewport.

- `.page` usa `padding: 2px`.
- Os cartões principais usam `width: 100%`.
- A altura utiliza `100dvh` para acompanhar a altura real da viewport em celulares.
- Em telas muito baixas, o conteúdo pode rolar verticalmente para impedir que campos desapareçam.
- A criação de conta mantém os 5 campos: usuário, CPF, nascimento, senha e confirmação de senha.
