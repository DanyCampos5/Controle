/* =============================================================
 * configuracao.js
 * Tudo que você pode querer ajustar SEM mexer na lógica:
 * preços, produtos, sabores, formas de recebimento e menu.
 * ============================================================= */

/**
 * Categorias de produto vendidas na feira.
 *  - A CHAVE (pastel, bebidaSimples...) é o código interno. Não mude depois de usar o sistema.
 *  - nome / nomeCurto: textos exibidos na tela.
 *  - preco: valor unitário em reais.
 *  - itens: sabores/produtos que aparecem nas telas de contagem.
 *    (não use aspas simples ' nos nomes dos itens)
 *
 * A ordem aqui é a ordem em que os campos aparecem nas telas Entrada e Fechamento.
 */
const CATEGORIAS_DE_PRODUTO = {
    pastel: {
        nome: 'Pastéis',
        nomeCurto: 'Pastel',
        preco: 12,
        itens: ['Carne', 'Queijo', 'Palmito', 'Presunto e Queijo', 'Frango Queijo', 'Carne e Queijo', 'Palmito Queijo', 'Palmito Frango', 'Coxinha Frango', 'Coxinha Carne']
    },
    pastelEspecial: {
        nome: 'Especiais',
        nomeCurto: 'Especial',
        preco: 24,
        itens: ['Pastelão', 'Pastelão Frango', 'Enroladão']
    },
    bebidaSimples: {
        nome: 'Bebidas simples',
        nomeCurto: 'B. simples',
        preco: 4,
        itens: ['Pingado', 'Água com Gás', 'Água sem Gás']
    },
    bebidaGelada: {
        nome: 'Bebidas geladas',
        nomeCurto: 'B. gelada',
        preco: 8,
        itens: ['Coca', 'Fanta', 'Sprite', 'Suco', 'Coca Zero', 'Guaraná', 'Chocomilk']
    },
    massaDePastel: {
        nome: 'Massas',
        nomeCurto: 'Massa',
        preco: 11,
        itens: ['Massa de Pastel']
    }
};

/** Lista com as chaves das categorias, na ordem definida acima. */
const CHAVES_DAS_CATEGORIAS = Object.keys(CATEGORIAS_DE_PRODUTO);

/** Formas de recebimento usadas no Fechamento. */
const FORMAS_DE_RECEBIMENTO = [
    { chave: 'pix', nome: 'Pix' },
    { chave: 'dinheiro', nome: 'Dinheiro' },
    { chave: 'cartao', nome: 'Cartão' }
];

/** Abas do menu de navegação (o id precisa existir em App.TELAS_POR_ABA). */
const ABAS_DO_MENU = [
    { id: 'entrada', nome: 'Entrada', icone: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6M9 16h4"/>' },
    { id: 'pasteis', nome: 'Pastéis', icone: '<path d="M3 13a9 9 0 0 1 18 0z"/><path d="M5 17h14M8 21h8"/>' },
    { id: 'bebidas', nome: 'Bebidas', icone: '<path d="M5 8h12v9a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"/><path d="M17 10h1a3 3 0 0 1 0 6h-1"/><path d="M9 3v2M13 3v2"/>' },
    { id: 'saida', nome: 'Fechamento', icone: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>' },
    { id: 'historico', nome: 'Histórico', icone: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' }
];

/** Nomes das chaves usadas no localStorage do navegador. */
const CHAVES_DE_ARMAZENAMENTO = {
    historicoDeRelatorios: 'feira_historico_relatorios',
    rascunhoDoDia: 'feira_rascunho_do_dia',

    // Chaves da versão anterior (lidas apenas pela migração, nunca apagadas)
    historicoAntigo: 'feira_v3_data',
    rascunhoAntigo: 'feira_v3_rascunho'
};