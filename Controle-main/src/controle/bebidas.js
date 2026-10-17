/* =============================================================
 * bebidas.js — Aba 3: contagem das bebidas.
 * Para mudar bebidas ou preços, edite src/configuracao.js.
 * ============================================================= */

const Bebidas = {
    /** Categorias exibidas nesta aba (definidas em configuracao.js). */
    categorias: ['bebidaSimples', 'bebidaGelada'],

    render() {
        return Componentes.telaDeContagem({
            categorias: this.categorias,
            textoDoBotao: 'Ir para Fechamento →',
            abaDestino: 'saida'
        });
    }
};