/* =============================================================
 * componentes.js
 * Pedaços de tela reutilizados em várias abas.
 * Cada função devolve um texto HTML.
 * ============================================================= */

const Componentes = {
    /**
     * Campo de formulário (rótulo + caixa de digitação + dica opcional).
     * O valor é lido e gravado em App.dadosDoDia[grupo][campo].
     *  - aoDigitar: código extra executado a cada tecla (ex.: 'Saida.atualizarPrevia()')
     */
    campoDeFormulario({ rotulo, grupo, campo, tipo = 'number', etiquetaPreco = '', classeExtra = '', aoDigitar = '', comDica = false }) {
        const idDoCampo = `campo-${grupo}-${campo}`;
        const atributosNumericos = tipo === 'number' ? 'min="0" inputmode="decimal" placeholder="0"' : '';
        const etiqueta = etiquetaPreco ? `<span class="etiqueta-preco">${etiquetaPreco}</span>` : '';
        const dica = comDica ? `<small id="dica-${grupo}-${campo}" class="campo-dica"></small>` : '';

        return `
            <div class="campo-formulario ${classeExtra}">
                <label for="${idDoCampo}">${rotulo}${etiqueta}</label>
                <input id="${idDoCampo}" type="${tipo}" ${atributosNumericos}
                    value="${App.dadosDoDia[grupo][campo] ?? ''}"
                    oninput="App.salvarCampo('${grupo}', '${campo}', this.value); ${aoDigitar}">
                ${dica}
            </div>`;
    },

    /** Título amarelo com linha que separa seções. */
    tituloDeSecao(texto) {
        return `<div class="titulo-secao">${texto}</div>`;
    },

    /** Uma linha com o nome do item e os botões − e +. */
    itemDeContagem(nomeDoItem) {
        const quantidade = App.contagemDeItens[nomeDoItem] || 0;
        const idDaQuantidade = `quantidade-${App.gerarIdParaElemento(nomeDoItem)}`;

        return `
            <div class="item-de-estoque ${quantidade > 0 ? 'com-quantidade' : ''}">
                <span class="item-nome">${nomeDoItem}</span>
                <div class="contador">
                    <button type="button" onclick="App.alterarContagem('${nomeDoItem}', -1)" aria-label="Diminuir ${nomeDoItem}">−</button>
                    <span id="${idDaQuantidade}" class="contador-quantidade">${quantidade}</span>
                    <button type="button" onclick="App.alterarContagem('${nomeDoItem}', 1)" aria-label="Aumentar ${nomeDoItem}">+</button>
                </div>
            </div>`;
    },

    /** Título da categoria (com preço) seguido da lista de itens para contar. */
    secaoDeCategoria(chaveDaCategoria) {
        const categoria = CATEGORIAS_DE_PRODUTO[chaveDaCategoria];
        const itens = categoria.itens.map(item => this.itemDeContagem(item)).join('');
        return this.tituloDeSecao(`${categoria.nome} ${App.formatarPreco(chaveDaCategoria)}`)
             + `<div class="lista-de-itens">${itens}</div>`;
    },

    /** Mini-cartões fixos no topo com o total de cada categoria. */
    totaisDasCategorias(categorias) {
        return categorias.map(chave => `
            <div class="total-resumido">
                <span>${CATEGORIAS_DE_PRODUTO[chave].nome} ${App.formatarPreco(chave)}</span>
                <b>${App.obterNumero('quantidadeInicial', chave)}</b>
            </div>`).join('');
    },

    /** Tela completa de contagem (usada por Pastéis e Bebidas). */
    telaDeContagem({ categorias, textoDoBotao, abaDestino }) {
        return `
            <section class="tela">
                <div id="barra-de-totais" class="barra-de-totais">${this.totaisDasCategorias(categorias)}</div>
                ${categorias.map(chave => this.secaoDeCategoria(chave)).join('')}
                <button type="button" class="botao-principal" onclick="App.trocarAba('${abaDestino}')">${textoDoBotao}</button>
            </section>`;
    }
};