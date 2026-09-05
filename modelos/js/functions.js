const areaPaginas = document.getElementById('escolha-paginas');
const paginaEscolar = document.getElementById('pagina-escolar')
const imagem = document.getElementById('imagem-pagina-inicial-aluno')

function limparArea(){
    areaPaginas.innerHTML = "";
}

paginaEscolar.addEventListener('click', function(){
    imagem.remove()

    

    limparArea()

})