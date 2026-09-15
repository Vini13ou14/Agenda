/* ============================================================
   formularios.js
   Responsável pela LÓGICA de cada formulário:
   - escolha de perfil (login ou cadastro)
   - preenchimento em cascata de estado -> cidade -> escola
   - validação e envio dos formulários de login e cadastro
   - preenchimento do painel final com os dados cadastrados
   ============================================================ */

/** Valida todos os campos obrigatórios, inclusive selects. */
function validarCamposObrigatorios(formulario) {
  const campos = formulario.querySelectorAll("input, select, textarea");

  for (const campo of campos) {
    if (campo.disabled) continue;

    const valor = (campo.value || "").trim();
    if (campo.required && !valor) {
      campo.setCustomValidity("Este campo é obrigatório.");
      campo.reportValidity();
      campo.focus();
      return false;
    }

    campo.setCustomValidity("");
  }

  return true;
}

/** Remove mensagens de validade antigas quando o usuário começa a preencher. */
function ativarValidacaoObrigatoria(formulario) {
  formulario.querySelectorAll("input, select, textarea").forEach((campo) => {
    campo.addEventListener("input", () => campo.setCustomValidity(""));
    campo.addEventListener("change", () => campo.setCustomValidity(""));
  });
}

/** Liga os botões de perfil (aluno/professor/gestão/responsável). */
function iniciarSelecaoDePerfil() {
  document.querySelectorAll("[data-perfil]").forEach((botao) => {
    botao.addEventListener("click", () => {
      const perfil = botao.dataset.perfil;
      const acao = botao.dataset.acao; // "login" ou "cadastro"

      estadoApp.perfilSelecionado = perfil;

      if (acao === "login") {
        document.querySelector("[data-titulo-login]").textContent =
          `Login do ${PERFIS_LEGIVEIS[perfil].toLowerCase()}`;
        document.getElementById("erro-login").hidden = true;
        document.getElementById("form-login").reset();
        mostrarTela("tela-login-form");
      }

      if (acao === "cadastro") {
        // começa um novo cadastro do zero para este perfil
        estadoApp.cadastroEmAndamento = { tipoPerfil: perfil };
        document.getElementById("form-criacao-conta").reset();
        mostrarTela("tela-criacao-conta");
      }
    });
  });
}

/** Preenche o <select> de estados uma única vez, ao carregar a página. */
function preencherSelectEstados() {
  const selectEstado = document.getElementById("select-estado");
  LISTA_ESTADOS.forEach(({ sigla, nome }) => {
    const opcao = document.createElement("option");
    opcao.value = sigla;
    opcao.textContent = nome;
    selectEstado.appendChild(opcao);
  });

  const selectEscolaridade = document.getElementById("select-escolaridade");
  LISTA_ESCOLARIDADE.forEach((item) => {
    const opcao = document.createElement("option");
    opcao.value = item;
    opcao.textContent = item;
    selectEscolaridade.appendChild(opcao);
  });
}

/** Quando o estado muda, recarrega as opções de cidade (e reseta escola). */
function iniciarCascataLocalizacao() {
  const selectEstado = document.getElementById("select-estado");
  const selectCidade = document.getElementById("select-cidade");
  const selectEscola = document.getElementById("select-escola");

  selectEstado.addEventListener("change", () => {
    const cidades = CIDADES_POR_ESTADO[selectEstado.value] || [];

    selectCidade.innerHTML = '<option value="" disabled selected>Selecionar cidade</option>';
    cidades.forEach((cidade) => {
      const opcao = document.createElement("option");
      opcao.value = cidade;
      opcao.textContent = cidade;
      selectCidade.appendChild(opcao);
    });
    selectCidade.disabled = false;

    selectEscola.innerHTML = '<option value="" disabled selected>Selecionar escola</option>';
    selectEscola.disabled = true;
  });

  selectCidade.addEventListener("change", () => {
    selectEscola.innerHTML = '<option value="" disabled selected>Selecionar escola</option>';
    ESCOLAS_PADRAO.forEach((escola) => {
      const opcao = document.createElement("option");
      opcao.value = escola;
      opcao.textContent = escola;
      selectEscola.appendChild(opcao);
    });
    selectEscola.disabled = false;
  });
}

/** Etapa 1 do cadastro: dados pessoais. */
function iniciarFormCriacaoConta() {
  const formulario = document.getElementById("form-criacao-conta");
  const mensagemErro = document.getElementById("erro-criacao-conta");

  ativarValidacaoObrigatoria(formulario);

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    if (!validarCamposObrigatorios(formulario)) return;

    const dados = new FormData(formulario);
    const senha = dados.get("senha");
    const confirmarSenha = dados.get("confirmarSenha");

    if (senha !== confirmarSenha) {
      mensagemErro.textContent = "As senhas não conferem. Tente novamente.";
      mensagemErro.hidden = false;
      return;
    }

    mensagemErro.hidden = true;

    // guarda os dados desta etapa no cadastro em andamento
    estadoApp.cadastroEmAndamento = {
      ...estadoApp.cadastroEmAndamento,
      nomeUsuario: dados.get("nomeUsuario").trim(),
      cpf: dados.get("cpf").trim(),
      dataNascimento: dados.get("dataNascimento"),
      senha,
    };

    document.getElementById("form-config-perfil").reset();
    document.getElementById("select-cidade").disabled = true;
    document.getElementById("select-escola").disabled = true;
    mostrarTela("tela-config-perfil");
  });
}

/** Etapa 2 do cadastro: estado, cidade, escola e escolaridade -> salva. */
function iniciarFormConfigPerfil() {
  const formulario = document.getElementById("form-config-perfil");

  ativarValidacaoObrigatoria(formulario);

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    if (!validarCamposObrigatorios(formulario)) return;

    const dados = new FormData(formulario);

    const usuarioCompleto = {
      ...estadoApp.cadastroEmAndamento,
      estado: dados.get("estado"),
      cidade: dados.get("cidade"),
      escola: dados.get("escola"),
      escolaridade: dados.get("escolaridade"),
    };

    salvarUsuario(usuarioCompleto);
    estadoApp.cadastroEmAndamento = null;

    // cadastro concluído: leva o usuário para logar com a conta recém-criada
    estadoApp.perfilSelecionado = usuarioCompleto.tipoPerfil;
    document.querySelector("[data-titulo-login]").textContent =
      `Login do ${PERFIS_LEGIVEIS[usuarioCompleto.tipoPerfil].toLowerCase()}`;

    const erroLogin = document.getElementById("erro-login");
    erroLogin.textContent = "Conta criada! Faça login com os dados que você acabou de cadastrar.";
    erroLogin.hidden = false;
    erroLogin.style.color = "#167a47";
    erroLogin.style.background = "#e8f8ef";

    document.getElementById("form-login").reset();
    mostrarTela("tela-login-form");
  });
}

/** Login: confere as credenciais e, se baterem, abre o painel com os dados. */
function iniciarFormLogin() {
  const formulario = document.getElementById("form-login");
  const mensagemErro = document.getElementById("erro-login");

  ativarValidacaoObrigatoria(formulario);

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    if (!validarCamposObrigatorios(formulario)) return;

    const dados = new FormData(formulario);
    const identificador = dados.get("identificador").trim();
    const senha = dados.get("senha");

    const usuarioEncontrado = buscarUsuario(estadoApp.perfilSelecionado, identificador, senha);

    if (!usuarioEncontrado) {
      mensagemErro.textContent = "Usuário/CPF, senha ou perfil incorretos.";
      mensagemErro.style.color = "";
      mensagemErro.style.background = "";
      mensagemErro.hidden = false;
      return;
    }

    mensagemErro.hidden = true;
    preencherPainel(usuarioEncontrado);
    mostrarTela("tela-painel");
  });
}

/** Mostra, no painel final, exatamente os dados preenchidos no cadastro. */
function preencherPainel(usuario) {
  const campos = {
    ...usuario,
    tipoPerfilLegivel: PERFIS_LEGIVEIS[usuario.tipoPerfil] || usuario.tipoPerfil,
  };

  document.querySelectorAll("[data-campo-painel]").forEach((elemento) => {
    const chave = elemento.dataset.campoPainel;
    elemento.textContent = campos[chave] || "—";
  });
}

/** Botão "sair" do painel: volta para a tela inicial. */
function iniciarLogout() {
  document.querySelectorAll("[data-acao-sair]").forEach((botao) => {
    botao.addEventListener("click", () => {
      estadoApp.perfilSelecionado = null;
      mostrarTela("tela-boas-vindas");
    });
  });
}
