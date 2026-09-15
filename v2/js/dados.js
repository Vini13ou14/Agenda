/* ============================================================
   dados.js
   Responsável só por DADOS: listas fixas (estado/cidade/escola/
   escolaridade) e as funções que salvam/leem contas cadastradas
   usando o localStorage do navegador.
   Nenhum outro arquivo deve mexer diretamente no localStorage —
   sempre passar por aqui.
   ============================================================ */

const CHAVE_ARMAZENAMENTO = "agendaEscolar.usuarios";

/* Rótulo "bonito" para cada tipo de perfil, usado nos títulos
   das telas e no painel final. */
const PERFIS_LEGIVEIS = {
  aluno: "Aluno",
  professor: "Professor",
  gestao: "Gestão",
  responsavel: "Responsável",
};

/* Cidades organizadas por estado (lista enxuta, só para o protótipo
   funcionar de ponta a ponta — pode ser expandida depois). */
const CIDADES_POR_ESTADO = {
  PE: ["Recife", "Santa Cruz do Capibaribe", "Caruaru", "Petrolina"],
  SP: ["São Paulo", "Campinas", "Santos", "Sorocaba"],
  RJ: ["Rio de Janeiro", "Niterói", "Petrópolis"],
  MG: ["Belo Horizonte", "Uberlândia", "Juiz de Fora"],
  BA: ["Salvador", "Feira de Santana", "Vitória da Conquista"],
  RS: ["Porto Alegre", "Caxias do Sul", "Pelotas"],
};

const LISTA_ESTADOS = [
  { sigla: "PE", nome: "Pernambuco" },
  { sigla: "SP", nome: "São Paulo" },
  { sigla: "RJ", nome: "Rio de Janeiro" },
  { sigla: "MG", nome: "Minas Gerais" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "RS", nome: "Rio Grande do Sul" },
];

/* Escolas fictícias — reaproveitadas para qualquer cidade escolhida. */
const ESCOLAS_PADRAO = [
  "Escola Municipal Novo Horizonte",
  "Colégio Estadual das Flores",
  "Instituto Educacional Girassol",
  "Escola Municipal Vale Verde",
];

const LISTA_ESCOLARIDADE = [
  "Educação Infantil",
  "Ensino Fundamental I",
  "Ensino Fundamental II",
  "Ensino Médio",
  "Ensino Superior",
];

/* -------------------- Acesso ao localStorage -------------------- */

/** Retorna a lista de usuários já cadastrados (array de objetos). */
function obterUsuarios() {
  try {
    const bruto = localStorage.getItem(CHAVE_ARMAZENAMENTO);
    return bruto ? JSON.parse(bruto) : [];
  } catch (erro) {
    console.error("Não foi possível ler os usuários salvos:", erro);
    return [];
  }
}

/** Adiciona um novo usuário cadastrado à lista salva. */
function salvarUsuario(usuario) {
  const usuarios = obterUsuarios();
  usuarios.push(usuario);
  localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(usuarios));
}

/**
 * Procura um usuário pelo tipo de perfil + (nome de usuário OU CPF) + senha.
 * Retorna o objeto do usuário se encontrar, ou null se não encontrar.
 */
function buscarUsuario(tipoPerfil, identificador, senha) {
  const usuarios = obterUsuarios();
  const identificadorNormalizado = identificador.trim().toLowerCase();

  return (
    usuarios.find((usuario) => {
      const nomeConfere = usuario.nomeUsuario.toLowerCase() === identificadorNormalizado;
      const cpfConfere = usuario.cpf.toLowerCase() === identificadorNormalizado;
      return (
        usuario.tipoPerfil === tipoPerfil &&
        (nomeConfere || cpfConfere) &&
        usuario.senha === senha
      );
    }) || null
  );
}
