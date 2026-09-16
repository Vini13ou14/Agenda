/* =========================================================
   TELA: CONFIGURAÇÕES DE PERFIL (2ª e última etapa)
   ---------------------------------------------------------
   Ao clicar em "finalizar", o js/app.js junta estes dados com
   os da etapa anterior e grava a conta no navegador.

  Os estados e municípios são carregados pela API oficial do
  IBGE. Ao escolher um estado, a lista de municípios é filtrada
  automaticamente para aquele estado.
   ========================================================= */

PAGES.perfil = `
<section class="screen" id="screen-perfil">

  <div class="screen-top">
    <span class="clock">9:30</span>
  </div>

  <header class="screen-header">
    <h1 class="title-md">configurações de perfil</h1>
    <button class="link-back" id="btn-perfil-back">← voltar</button>
  </header>

  <div class="stack">

    <div class="select-wrap">
      <select class="input" id="perfil-estado" aria-label="Selecione o estado">
        <option value="" disabled selected>carregando estados...</option>
      </select>
    </div>

    <div class="select-wrap">
      <select class="input" id="perfil-cidade" aria-label="Selecione a cidade" disabled>
        <option value="" disabled selected>selecione um estado primeiro</option>
      </select>
    </div>

    <div class="select-wrap">
      <select class="input" id="perfil-escola">
        <option value="" disabled selected>selecionar escola</option>
        <option>Escola Municipal José da Silva</option>
        <option>Colégio Estadual Paulo Freire</option>
        <option>Instituto Educacional Girassol</option>
      </select>
    </div>

    <div class="select-wrap">
      <select class="input" id="perfil-escolaridade">
        <option value="" disabled selected>escolaridade</option>
        <option>Educação infantil</option>
        <option>Fundamental I</option>
        <option>Fundamental II</option>
        <option>Ensino Médio</option>
      </select>
    </div>

    <p class="error" id="perfil-error" hidden></p>

    <div class="center">
      <button class="btn btn-blue btn-inline" id="btn-finalizar">finalizar</button>
    </div>

  </div>

</section>
`;
