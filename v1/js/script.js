/* =========================================================
   PROJETO: ÁREA ESCOLAR
   ARQUIVO: js/script.js

   Este arquivo é usado por todas as páginas HTML.
   As funções verificam se os elementos existem antes de executar.
   ========================================================= */

"use strict";


/* =========================================================
   1. CONFIGURAÇÕES
   ========================================================= */

/* Chave usada para guardar a conta final no navegador. */
const STORAGE_KEY = "cadastroEscolarDemo";

/* Chave usada para guardar temporariamente a primeira etapa. */
const PENDING_KEY = "cadastroEscolarPendente";

/* Nomes amigáveis dos perfis. */
const ROLE_LABELS = {
    aluno: "Aluno",
    professor: "Professor",
    gestao: "Gestão",
    responsaveis: "Responsável"
};


/* =========================================================
   2. FUNÇÕES AUXILIARES
   ========================================================= */

/* Atalho para document.querySelector. */
const $ = (selector) => document.querySelector(selector);

/*
   Remove tudo que não for número.
   É útil para comparar CPF digitado com CPF salvo.
*/
function onlyNumbers(value) {
    return String(value).replace(/\D/g, "");
}

/*
   Formata o CPF enquanto o usuário digita.
   Exemplo:
   12345678901 -> 123.456.789-01
*/
function formatCPF(value) {
    const numbers = onlyNumbers(value).slice(0, 11);

    if (numbers.length <= 3) return numbers;

    if (numbers.length <= 6) {
        return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    }

    if (numbers.length <= 9) {
        return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    }

    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
}

/* Converte YYYY-MM-DD para DD/MM/YYYY. */
function formatDate(dateString) {
    if (!dateString) return "-";

    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
}

/* Exibe mensagens de erro ou sucesso em um formulário. */
function setMessage(elementId, message, success = false) {
    const element = $(`#${elementId}`);

    if (!element) return;

    element.textContent = message;
    element.classList.toggle("success", success);
}

/* Lê uma chave JSON do localStorage. */
function readStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("Erro ao ler dados:", error);
        return null;
    }
}

/* Salva um objeto como JSON no localStorage. */
function writeStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

/*
   Escapa texto antes de inseri-lo com innerHTML.
   É uma boa prática mesmo neste protótipo.
*/
function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   3. ÁREA DE CADASTRO - ESCOLHA DO PERFIL
   ========================================================= */

/*
   Cada botão de perfil recebe um clique.
   Antes de navegar para criar-conta.html, salvamos o perfil
   temporariamente para usá-lo nas próximas páginas.
*/
document.querySelectorAll(".register-role").forEach((link) => {
    link.addEventListener("click", () => {
        localStorage.setItem("cadastroPerfilSelecionado", link.dataset.role);
    });
});


/* =========================================================
   4. CRIAÇÃO DA CONTA - PRIMEIRA ETAPA
   ========================================================= */

const cpfInput = $("#cpf");

/* Só adiciona o evento se esta página possuir o campo CPF. */
if (cpfInput) {
    cpfInput.addEventListener("input", (event) => {
        event.target.value = formatCPF(event.target.value);
    });
}

const accountForm = $("#account-form");

/*
   Processa a primeira parte do cadastro.
   Ao terminar, os dados são guardados temporariamente e a página
   perfil.html é aberta na mesma aba.
*/
if (accountForm) {
    accountForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const userName = $("#user-name").value.trim();
        const cpf = $("#cpf").value.trim();
        const birthDate = $("#birth-date").value;
        const password = $("#password").value;
        const confirmPassword = $("#confirm-password").value;

        if (!userName || !cpf || !birthDate || !password || !confirmPassword) {
            setMessage("account-message", "Preencha todos os campos.");
            return;
        }

        if (onlyNumbers(cpf).length !== 11) {
            setMessage("account-message", "Digite um CPF com 11 números.");
            return;
        }

        if (password.length < 4) {
            setMessage(
                "account-message",
                "A senha precisa ter pelo menos 4 caracteres."
            );
            return;
        }

        if (password !== confirmPassword) {
            setMessage("account-message", "As senhas não conferem.");
            return;
        }

        /* Recupera o perfil escolhido na página anterior. */
        const role = localStorage.getItem("cadastroPerfilSelecionado") || "aluno";

        /*
           Salva somente a primeira etapa.
           Ainda não é o cadastro final.
        */
        writeStorage(PENDING_KEY, {
            userName,
            cpf,
            birthDate,
            password,
            role
        });

        /*
           Troca de página na mesma aba.
           O arquivo está dentro da mesma pasta html.
        */
        window.location.href = "perfil.html";
    });
}


/* =========================================================
   5. CONFIGURAÇÕES DE PERFIL - SEGUNDA ETAPA
   ========================================================= */

const profileForm = $("#profile-form");

if (profileForm) {
    profileForm.addEventListener("submit", (event) => {
        event.preventDefault();

        /* Recupera os dados da primeira etapa. */
        const pendingAccount = readStorage(PENDING_KEY);

        if (!pendingAccount) {
            setMessage(
                "profile-message",
                "Dados da primeira etapa não encontrados. Faça o cadastro novamente."
            );
            return;
        }

        const state = $("#state").value;
        const city = $("#city").value;
        const school = $("#school").value;
        const education = $("#education").value;

        if (!state || !city || !school || !education) {
            setMessage("profile-message", "Preencha todas as opções.");
            return;
        }

        /*
           Junta as duas etapas em um único objeto.
        */
        const finalAccount = {
            ...pendingAccount,
            state,
            city,
            school,
            education,
            createdAt: new Date().toISOString()
        };

        /*
           Salva o cadastro final e remove o temporário.
           Observação: é somente para teste de frontend.
        */
        writeStorage(STORAGE_KEY, finalAccount);
        localStorage.removeItem(PENDING_KEY);

        /* Troca para a página de login na mesma aba. */
        window.location.href = "login.html";
    });
}


/* =========================================================
   6. LOGIN
   ========================================================= */

const loginTitle = $("#login-title");

/*
   Lê o perfil informado na URL.
   Exemplo: login.html?perfil=professor
*/
if (loginTitle) {
    const params = new URLSearchParams(window.location.search);
    const profile = params.get("perfil");

    if (profile && ROLE_LABELS[profile]) {
        loginTitle.textContent = `Login do ${ROLE_LABELS[profile].toLowerCase()}`;
    }
}

/* Mostra dados de teste quando existe uma conta salva. */
function updateTestLoginData() {
    const account = readStorage(STORAGE_KEY);
    const box = $("#test-login-data");

    if (!box) return;

    if (!account) {
        box.classList.add("hidden");
        return;
    }

    /*
       As credenciais aparecem apenas para facilitar os testes.
       Nunca faça isso em uma aplicação real.
    */
    box.innerHTML = `
        <strong>Dados para teste</strong><br>
        Usuário: <b>${escapeHTML(account.userName)}</b><br>
        CPF: <b>${escapeHTML(account.cpf)}</b><br>
        Senha: <b>${escapeHTML(account.password)}</b>
    `;

    box.classList.remove("hidden");
}

/* Executa a exibição dos dados de teste na página de login. */
updateTestLoginData();

const loginForm = $("#login-form");

if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const account = readStorage(STORAGE_KEY);

        if (!account) {
            setMessage(
                "login-message",
                "Nenhum cadastro encontrado. Faça o cadastro primeiro."
            );
            return;
        }

        const loginUser = $("#login-user").value.trim();
        const loginPassword = $("#login-password").value;

        /*
           O login pode ser feito pelo nome de usuário OU pelo CPF.
        */
        const userMatches =
            loginUser.toLowerCase() === account.userName.toLowerCase() ||
            onlyNumbers(loginUser) === onlyNumbers(account.cpf);

        if (!userMatches || loginPassword !== account.password) {
            setMessage(
                "login-message",
                "Usuário/CPF ou senha incorretos."
            );
            return;
        }

        /* Login correto: abre a página que mostra os dados. */
        window.location.href = "dados.html";
    });
}


/* =========================================================
   7. PÁGINA FINAL - DADOS CADASTRADOS
   ========================================================= */

function renderDashboard() {
    const account = readStorage(STORAGE_KEY);

    /*
       Só continua se os elementos desta página existirem.
    */
    if (!$("#dashboard-name")) return;

    /*
       Caso alguém abra dados.html sem cadastro, volta para o login.
    */
    if (!account) {
        window.location.href = "login.html";
        return;
    }

    $("#dashboard-name").textContent = account.userName;
    $("#dashboard-role").textContent =
        ROLE_LABELS[account.role] || account.role || "Usuário";

    $("#data-username").textContent = account.userName;
    $("#data-cpf").textContent = account.cpf;
    $("#data-birth").textContent = formatDate(account.birthDate);
    $("#data-state").textContent = account.state;
    $("#data-city").textContent = account.city;
    $("#data-school").textContent = account.school;
    $("#data-education").textContent = account.education;
}

/* Preenche o dashboard se estivermos na página dados.html. */
renderDashboard();


/* =========================================================
   8. APAGAR CADASTRO DE TESTE
   ========================================================= */

const clearAccountButton = $("#clear-account-button");

if (clearAccountButton) {
    clearAccountButton.addEventListener("click", () => {
        const confirmed = window.confirm(
            "Deseja apagar o cadastro de teste salvo neste navegador?"
        );

        if (!confirmed) return;

        /* Remove todos os dados usados pelo fluxo. */
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(PENDING_KEY);
        localStorage.removeItem("cadastroPerfilSelecionado");

        /* Retorna para o início do projeto. */
        window.location.href = "../index.html";
    });
}
