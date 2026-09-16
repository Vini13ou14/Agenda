/* =========================================================
   LOCALIDADES DO IBGE
   ---------------------------------------------------------
   Consulta a API oficial do IBGE para manter a lista de
   estados e municípios atualizada sem duplicar milhares de
   nomes dentro do projeto.
   ========================================================= */

const Localidades = (() => {
  const API_BASE = "https://servicodados.ibge.gov.br/api/v1/localidades";
  const municipiosCache = new Map();

  /** Busca os 27 estados brasileiros ordenados pelo nome. */
  async function carregarEstados() {
    const response = await fetch(`${API_BASE}/estados?orderBy=nome`);
    if (!response.ok) {
      throw new Error("Não foi possível carregar os estados.");
    }

    return response.json();
  }

  /** Busca e memoriza os municípios do estado selecionado. */
  async function carregarMunicipios(estadoId) {
    if (municipiosCache.has(estadoId)) {
      return municipiosCache.get(estadoId);
    }

    const response = await fetch(`${API_BASE}/estados/${estadoId}/municipios?orderBy=nome`);
    if (!response.ok) {
      throw new Error("Não foi possível carregar os municípios.");
    }

    const municipios = await response.json();
    municipiosCache.set(estadoId, municipios);
    return municipios;
  }

  return { carregarEstados, carregarMunicipios };
})();