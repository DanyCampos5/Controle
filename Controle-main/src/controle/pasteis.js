/* =============================================================
 * pasteis.js — Aba 2: contagem dos sabores de pastel e da massa.
 * Para mudar sabores ou preços, edite src/configuracao.js.
 * ============================================================= */

const Pasteis = {
    /** Categorias exibidas nesta aba (definidas em configuracao.js). */
    categorias: ['pastel', 'pastelEspecial', 'massaDePastel'],

    render() {
        return Componentes.telaDeContagem({
            categorias: this.categorias,
            textoDoBotao: 'Ir para Bebidas →',
            abaDestino: 'bebidas'
        });
    }
};