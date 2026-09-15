/* ============================================================
   app.js
   Ponto de entrada: espera o HTML carregar e liga cada pedaço
   de funcionalidade definido nos outros arquivos JS.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  preencherSelectEstados();

  iniciarNavegacaoBasica();
  iniciarSelecaoDePerfil();
  iniciarCascataLocalizacao();

  iniciarFormCriacaoConta();
  iniciarFormConfigPerfil();
  iniciarFormLogin();
  iniciarLogout();

  // sempre começa a experiência pela tela de boas-vindas
  mostrarTela("tela-boas-vindas");
});
