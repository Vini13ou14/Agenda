/* ============================================================
   navegacao.js
   Navegação em uma única sessão + histórico do navegador.
   Cada troca de tela cria uma entrada no histórico, permitindo
   usar os botões Voltar/Avançar do navegador sem fechar o site.
   ============================================================ */

const estadoApp = {
  perfilSelecionado: null,
  cadastroEmAndamento: null,
};

let navegacaoIniciada = false;

/** Exibe a tela pelo id. */
function mostrarTela(idTela, registrarHistorico = true) {
  const tela = document.getElementById(idTela);
  if (!tela) return;

  document.querySelectorAll("[data-tela]").forEach((secao) => {
    secao.classList.toggle("tela--ativa", secao.id === idTela);
  });

  // Mantém a tela atual na URL sem recarregar a página.
  if (registrarHistorico && navegacaoIniciada) {
    const estadoHistorico = { tela: idTela };
    const url = `${window.location.pathname}${window.location.search}#${idTela}`;
    history.pushState(estadoHistorico, "", url);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/** Liga os botões de navegação interna. */
function iniciarNavegacaoBasica() {
  document.querySelectorAll("[data-ir-para]").forEach((botao) => {
    botao.addEventListener("click", () => {
      mostrarTela(botao.dataset.irPara);
    });
  });

  document.querySelectorAll("[data-voltar-para]").forEach((botao) => {
    botao.addEventListener("click", () => {
      mostrarTela(botao.dataset.voltarPara);
    });
  });

  // Botões Voltar/Avançar do próprio navegador.
  window.addEventListener("popstate", (evento) => {
    const telaHistorico =
      evento.state?.tela ||
      window.location.hash.replace("#", "") ||
      "tela-boas-vindas";

    mostrarTela(telaHistorico, false);
  });

  navegacaoIniciada = true;

  // Se a página for aberta já com uma aba/tela no hash, restaura-a.
  const telaInicial =
    window.location.hash.replace("#", "") || "tela-boas-vindas";

  history.replaceState({ tela: telaInicial }, "", window.location.href);
  mostrarTela(telaInicial, false);
}
