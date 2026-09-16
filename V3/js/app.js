/* =========================================================
   APP.JS
   ---------------------------------------------------------
   Lógica de cada tela do app.

   Como o router.js troca o HTML de #app-content a cada
   navegação, os elementos de uma tela só existem enquanto
   ela está visível. Por isso cada tela tem sua própria
   função "init", chamada toda vez que a tela é carregada.

   Os dados permanentes (contas e sessão) ficam no
   localStorage, acessados pelo módulo Storage (js/storage.js).
   O objeto `state` abaixo guarda só o que é temporário.
   ========================================================= */

function atualizarHora() {
  const agora = new Date();
  const horas = String(agora.getHours()).padStart(2, "0");
  const minutos = String(agora.getMinutes()).padStart(2, "0");

  document.querySelectorAll(".clock").forEach((clockEl) => {
    clockEl.textContent = `${horas}:${minutos}`;
  });
}

/* ---------------------------------------------------------
   ESTADO TEMPORÁRIO (perdido ao recarregar — de propósito)
   --------------------------------------------------------- */
const state = {
  mode: null,          // "login" | "cadastro"
  pendingRole: null,   // perfil escolhido na tela de seleção
  cadastroDados: null, // dados entre a 1ª e a 2ª etapa do cadastro
  justCreated: false,  // true logo após finalizar um cadastro
  contaAtual: null,    // conta exibida no painel
};

/* Perfis disponíveis, com a cor (tone) usada nos botões */
const ROLES = {
  aluno:        { id: "aluno",        label: "aluno",        tone: "blue"  },
  professor:    { id: "professor",    label: "professor",    tone: "green" },
  gestao:       { id: "gestao",       label: "gestão",       tone: "blue"  },
  responsaveis: { id: "responsaveis", label: "responsáveis", tone: "green" },
};

/* ---------------------------------------------------------
   DESPACHANTE DE TELAS
   O router.js chama esta função assim que injeta uma tela.
   --------------------------------------------------------- */
window.onScreenLoaded = function (name) {
  atualizarHora();

  // GUARDA DE NAVEGAÇÃO
  // Se alguém recarregar a página em #perfil ou #login, o estado
  // temporário terá se perdido e a tela quebraria. Nesse caso,
  // voltamos ao começo em vez de mostrar uma tela sem dados.
  if (!podeAbrir(name)) {
    Router.replace("welcome");
    return;
  }

  updateSteps(name);

  switch (name) {
    case "welcome":   initWelcome();   break;
    case "role":      initRole();      break;
    case "login":     initLogin();     break;
    case "cadastro":  initCadastro();  break;
    case "perfil":    initPerfil();    break;
    case "dashboard": initDashboard(); break;
    default:          Router.replace("welcome");
  }
};

/** Verifica se a tela tem o estado mínimo necessário para abrir. */
function podeAbrir(name) {
  switch (name) {
    case "role":
      return Boolean(state.mode);
    case "login":
    case "cadastro":
      return Boolean(state.pendingRole);
    case "perfil":
      return Boolean(state.pendingRole && state.cadastroDados);
    case "dashboard":
      // Aqui vale a conta em memória OU a sessão salva no navegador
      return Boolean(state.contaAtual || Storage.contaLogada());
    default:
      return true; // welcome sempre pode
  }
}

/** Atualiza o indicador de progresso do painel lateral (desktop). */
function updateSteps(screenName) {
  const order = {
    welcome: 0,
    role: 1,
    cadastro: 2,
    login: 2,
    perfil: 3,
    dashboard: 3,
  };

  const current = order[screenName] ?? 0;

  document.querySelectorAll(".step").forEach((stepEl) => {
    stepEl.classList.toggle("done", Number(stepEl.dataset.step) <= current);
  });
}

/** Busca um elemento de forma segura e centralizada. */
const getElement = (id) => document.getElementById(id);

/** Cria um clique seguro, ignorando elementos que não existem. */
function bindClick(id, handler) {
  const element = getElement(id);
  if (element) {
    element.addEventListener("click", handler);
  }
}

/** Mostra uma mensagem de erro de forma segura dentro do formulário. */
function showError(errorEl, message) {
  if (!errorEl) return;
  errorEl.textContent = message;
  errorEl.hidden = false;
}

/** Limpa o fluxo temporário ao voltar para a tela inicial. */
function resetTransientState() {
  state.mode = null;
  state.pendingRole = null;
  state.cadastroDados = null;
}

/* =========================================================
   TELA: BOAS-VINDAS
   ========================================================= */
function initWelcome() {
  // Voltar ao início limpa o fluxo pela metade que tenha ficado.
  resetTransientState();

  bindClick("btn-go-login", () => {
    state.mode = "login";
    Router.navigate("role");
  });

  bindClick("btn-go-cadastro", () => {
    state.mode = "cadastro";
    Router.navigate("role");
  });

  // Sessão salva: permite entrar direto, sem digitar a senha.
  const conta = Storage.contaLogada();
  if (conta) {
    const sessaoEl = getElement("welcome-sessao");
    const textoSessaoEl = getElement("welcome-sessao-texto");

    if (sessaoEl) sessaoEl.hidden = false;
    if (textoSessaoEl) {
      textoSessaoEl.textContent = `você está conectado como ${conta.username}.`;
    }

    bindClick("btn-continuar-sessao", () => {
      state.contaAtual = conta;
      state.justCreated = false;
      Router.navigate("dashboard");
    });
  }

  // Contagem de contas salvas + botão de apagar tudo.
  const contas = Storage.listarContas();
  if (contas.length > 0) {
    const noteEl = getElement("storage-note");
    const countEl = getElement("storage-count");

    if (noteEl) noteEl.hidden = false;
    if (countEl) {
      countEl.textContent = `${contas.length} conta(s) salva(s) neste navegador · `;
    }

    bindClick("btn-apagar-dados", () => {
      const confirmar = confirm(
        "Isso vai apagar todas as contas salvas neste navegador. Deseja continuar?"
      );

      if (!confirmar) return;

      Storage.apagarTudo();
      state.contaAtual = null;
      Router.navigate("welcome");
    });
  }
}

/* =========================================================
   TELA: ESCOLHA DE PERFIL
   ========================================================= */
function initRole() {
  document.getElementById("role-title").textContent =
    state.mode === "login" ? "área de login" : "cadastrar conta";

  document.getElementById("btn-role-back").addEventListener("click", () => Router.back());

  // Um listener só para os 4 botões (delegação de evento)
  document.getElementById("role-list").addEventListener("click", (event) => {
    const button = event.target.closest(".role-btn");
    if (!button) return;

    state.pendingRole = ROLES[button.dataset.role];
    Router.navigate(state.mode === "login" ? "login" : "cadastro");
  });
}

/* =========================================================
   TELA: LOGIN
   ========================================================= */
function initLogin() {
  const role = state.pendingRole;
  document.getElementById("login-title").textContent = `login do ${role.label}`;

  // Aviso "conta criada" só aparece se viemos direto do cadastro
  document.getElementById("login-hint").hidden = !state.justCreated;

  // Pinta a caixa e o botão com a cor do perfil escolhido
  applyTone(document.getElementById("login-box"), role.tone);
  applyTone(document.getElementById("btn-login-submit"), role.tone);

  // Recém-cadastrado: já deixa o CPF preenchido
  if (state.justCreated && state.cadastroDados) {
    document.getElementById("login-identifier").value = state.cadastroDados.cpf;
  }

  document.getElementById("btn-login-back").addEventListener("click", () => Router.back());

  // Enter em qualquer campo também faz login
  document.querySelectorAll("#login-box .input").forEach((campo) => {
    campo.addEventListener("keydown", (e) => {
      if (e.key === "Enter") fazerLogin();
    });
  });

  document.getElementById("btn-login-submit").addEventListener("click", fazerLogin);

  function fazerLogin() {
    const identifier = document.getElementById("login-identifier").value.trim();
    const senha = document.getElementById("login-senha").value;
    const lembrar = document.getElementById("login-lembrar").checked;
    const errorEl = document.getElementById("login-error");

    if (!identifier || !senha) {
      showError(errorEl, "Preencha o Nome/CPF e a senha.");
      return;
    }

    // Procura a conta salva para este perfil
    const conta = Storage.buscarConta(identifier, role.id);

    if (!conta) {
      showError(errorEl, "Conta não encontrada para esse perfil. Cadastre-se primeiro.");
      return;
    }
    if (conta.senha !== senha) {
      showError(errorEl, "Nome/CPF ou senha incorretos.");
      return;
    }

    errorEl.hidden = true;

    // "Manter conectado" grava a sessão; caso contrário, limpa
    if (lembrar) {
      Storage.salvarSessao(conta.cpf, conta.role.id);
    } else {
      Storage.limparSessao();
    }

    state.contaAtual = conta;
    state.justCreated = false;
    Router.navigate("dashboard");
  }
}

/* =========================================================
   TELA: CRIAÇÃO DE CONTA (1ª etapa)
   ========================================================= */
function initCadastro() {
  document.getElementById("btn-cadastro-back").addEventListener("click", () => Router.back());

  document.getElementById("btn-cadastro-avancar").addEventListener("click", () => {
    const username = document.getElementById("cad-username").value.trim();
    const cpf = document.getElementById("cad-cpf").value.trim();
    const nascimento = document.getElementById("cad-nascimento").value;
    const senha = document.getElementById("cad-senha").value;
    const confirmar = document.getElementById("cad-confirmar").value;
    const errorEl = document.getElementById("cadastro-error");

    if (!username || !cpf || !nascimento || !senha || !confirmar) {
      showError(errorEl, "Preencha todos os campos para continuar.");
      return;
    }
    if (senha.length < 4) {
      showError(errorEl, "A senha precisa ter pelo menos 4 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      showError(errorEl, "As senhas não coincidem.");
      return;
    }
    // Evita duas contas iguais no mesmo perfil
    if (Storage.contaExiste(cpf, state.pendingRole.id)) {
      showError(errorEl, "Já existe uma conta com esse CPF neste perfil.");
      return;
    }

    errorEl.hidden = true;

    // Guarda para juntar com os dados da próxima etapa
    state.cadastroDados = { username, cpf, nascimento, senha };
    Router.navigate("perfil");
  });
}

/* =========================================================
   TELA: CONFIGURAÇÕES DE PERFIL (2ª etapa — grava os dados)
   ========================================================= */
function initPerfil() {
  const estadoSelect = document.getElementById("perfil-estado");
  const cidadeSelect = document.getElementById("perfil-cidade");
  const errorEl = document.getElementById("perfil-error");

  if (!estadoSelect || !cidadeSelect) return;

  carregarEstadosDoIbge(estadoSelect, cidadeSelect, errorEl);

  document.getElementById("btn-perfil-back").addEventListener("click", () => Router.back());

  estadoSelect.addEventListener("change", () => {
    const estadoSelecionado = estadoSelect.value;

    if (!estadoSelecionado) {
      cidadeSelect.innerHTML = '<option value="" disabled selected>selecione um estado primeiro</option>';
      cidadeSelect.disabled = true;
      return;
    }

    carregarMunicipiosDoEstado(estadoSelecionado, cidadeSelect, errorEl);
  });

  document.getElementById("btn-finalizar").addEventListener("click", () => {
    const estado = estadoSelect.value;
    const cidade = cidadeSelect.value;
    const escola = document.getElementById("perfil-escola").value;
    const escolaridade = document.getElementById("perfil-escolaridade").value;

    if (!estado || !cidade || !escola || !escolaridade) {
      showError(errorEl, "Selecione todas as opções para finalizar.");
      return;
    }

    errorEl.hidden = true;

    // Salva o nome completo do estado para a conta final.
    const estadoNome = estadoSelect.options[estadoSelect.selectedIndex]?.textContent || estado;

    // Junta todas as etapas do cadastro em uma conta final.
    const conta = {
      role: state.pendingRole,
      ...state.cadastroDados,
      estado: estadoNome,
      cidade,
      escola,
      escolaridade,
      criadoEm: new Date().toISOString(),
    };

    const salvou = Storage.salvarConta(conta);
    if (!salvou) {
      showError(errorEl, "Não foi possível salvar os dados neste navegador.");
      return;
    }

    state.justCreated = true;
    Router.navigate("login");
  });
}

/** Carrega os 27 estados brasileiros diretamente da API oficial do IBGE. */
async function carregarEstadosDoIbge(estadoSelect, cidadeSelect, errorEl) {
  if (!estadoSelect || !cidadeSelect) return;

  estadoSelect.disabled = true;
  cidadeSelect.disabled = true;
  cidadeSelect.innerHTML = '<option value="" disabled selected>selecione um estado primeiro</option>';
  estadoSelect.innerHTML = '<option value="" disabled selected>carregando estados...</option>';

  try {
    const estados = await Localidades.carregarEstados();

    estadoSelect.innerHTML = '<option value="" disabled selected>selecionar estado</option>';

    estados
      .slice()
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
      .forEach((estado) => {
        const option = document.createElement("option");
        option.value = estado.sigla;
        option.dataset.codigo = String(estado.id);
        option.textContent = estado.nome;
        estadoSelect.appendChild(option);
      });

    estadoSelect.disabled = false;
    cidadeSelect.disabled = true;
    cidadeSelect.innerHTML = '<option value="" disabled selected>selecione um estado primeiro</option>';
    if (errorEl) errorEl.hidden = true;
  } catch (error) {
    estadoSelect.innerHTML = '<option value="" disabled selected>não foi possível carregar os estados</option>';
    showError(errorEl, "Não foi possível carregar os estados. Verifique sua conexão e tente novamente.");
    console.error("Erro ao carregar estados:", error);
  }
}

/** Busca os municípios do estado selecionado e os preenche na segunda lista. */
async function carregarMunicipiosDoEstado(siglaEstado, cidadeSelect, errorEl) {
  if (!cidadeSelect) return;

  const estadoSelect = document.getElementById("perfil-estado");
  const codigoEstado = estadoSelect?.selectedOptions?.[0]?.dataset?.codigo;

  if (!siglaEstado || !codigoEstado) {
    cidadeSelect.innerHTML = '<option value="" disabled selected>selecione um estado primeiro</option>';
    cidadeSelect.disabled = true;
    return;
  }

  cidadeSelect.disabled = true;
  cidadeSelect.innerHTML = '<option value="" disabled selected>carregando cidades...</option>';

  try {
    const municipios = await Localidades.carregarMunicipios(Number(codigoEstado));

    cidadeSelect.innerHTML = '<option value="" disabled selected>selecionar cidade</option>';

    municipios
      .slice()
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
      .forEach((municipio) => {
        const option = document.createElement("option");
        option.value = municipio.nome;
        option.textContent = municipio.nome;
        cidadeSelect.appendChild(option);
      });

    cidadeSelect.disabled = false;
    cidadeSelect.value = "";
    if (errorEl) errorEl.hidden = true;
  } catch (error) {
    cidadeSelect.innerHTML = '<option value="" disabled selected>não foi possível carregar as cidades</option>';
    cidadeSelect.disabled = true;
    showError(errorEl, "Não foi possível carregar os municípios. Verifique sua conexão e tente novamente.");
    console.error("Erro ao carregar municípios:", error);
  }
}

/** Alterna o tema claro/escuro do app e salva a escolha no navegador. */
function applyTheme(themeName) {
  const theme = themeName === "dark" ? "dark" : "light";
  document.body.dataset.theme = theme;

  const logoutBtn = document.getElementById("btn-sair");
  if (logoutBtn) {
    if (theme === "dark") {
      logoutBtn.style.color = "#f8fbff";
      logoutBtn.style.background = "linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(59, 130, 246, 0.1))";
      logoutBtn.style.border = "1px solid rgba(191, 219, 254, 0.42)";
      logoutBtn.style.boxShadow = "0 10px 20px rgba(59, 130, 246, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.08)";
    } else {
      logoutBtn.style.color = "#1f2937";
      logoutBtn.style.background = "rgba(15, 23, 42, 0.04)";
      logoutBtn.style.border = "1px solid rgba(148, 163, 184, 0.2)";
      logoutBtn.style.boxShadow = "none";
    }
  }

  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  const icon = toggle.querySelector(".theme-toggle-icon");
  const text = toggle.querySelector(".theme-toggle-text");

  if (icon) {
    icon.textContent = theme === "dark" ? "🌙" : "☀️";
  }

  if (text) {
    text.textContent = theme === "dark" ? "Escuro" : "Claro";
  }
}

function initThemeToggle() {
  const savedTheme = localStorage.getItem("agenda_escolar:theme") || "light";
  applyTheme(savedTheme);

  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  toggle.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("agenda_escolar:theme", nextTheme);
    applyTheme(nextTheme);
  });
}

/** Aplica a cor (azul/verde) do perfil escolhido a um elemento. */
function applyTone(element, tone) {
  element.classList.remove("btn-blue", "btn-green");
  if (element.id === "login-box") {
    element.style.borderColor = tone === "blue" ? "#2563eb" : "#047857";
  } else {
    element.classList.add(tone === "blue" ? "btn-blue" : "btn-green");
  }
}

/** Converte "AAAA-MM-DD" (do <input type="date">) para "DD/MM/AAAA". */
function formatDate(isoDate) {
  if (!isoDate) return "—";
  const [ano, mes, dia] = isoDate.split("-");
  return `${dia}/${mes}/${ano}`;
}

/** Formata a data/hora de criação da conta em português. */
function formatDateTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/* =========================================================
   PONTO DE PARTIDA
   Se já existe uma sessão salva, abre direto no painel.
   Caso contrário, começa pela tela de boas-vindas.
   ========================================================= */
atualizarHora();
setInterval(atualizarHora, 60000);
initThemeToggle();

const contaSalva = Storage.contaLogada();
if (contaSalva) {
  state.contaAtual = contaSalva;
  Router.start("dashboard");
} else {
  Router.start("welcome");
}
