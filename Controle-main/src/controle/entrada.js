/* =============================================================
 * entrada.js — Aba 1: data, caixa inicial e quantidades iniciais.
 * ============================================================= */

const Entrada = {
    render() {
        const totalDeCategorias = CHAVES_DAS_CATEGORIAS.length;

        // Um campo para cada categoria. Se sobrar um sozinho na última linha, ele ocupa as 2 colunas.
        const camposDeQuantidade = CHAVES_DAS_CATEGORIAS.map((chave, posicao) => {
            const categoria = CATEGORIAS_DE_PRODUTO[chave];
            const ficariaSozinhoNaUltimaLinha = posicao === totalDeCategorias - 1 && totalDeCategorias % 2 === 1;

            return Componentes.campoDeFormulario({
                rotulo: categoria.nome,
                grupo: 'quantidadeInicial',
                campo: chave,
                etiquetaPreco: App.formatarPreco(chave),
                classeExtra: ficariaSozinhoNaUltimaLinha ? 'ocupa-2-colunas' : ''
            });
        }).join('');

        return `
            <section class="tela">
                <div class="tela-cabecalho">
                    <h2>Configuração inicial</h2>
                    <p>Defina o dia e com quanto você começa a feira.</p>
                </div>

                <div class="duas-colunas">
                    <div class="cartao">
                        <div class="cartao-titulo">Dia</div>
                        <div class="grade-2-colunas">
                            ${Componentes.campoDeFormulario({ rotulo: 'Data', grupo: 'dia', campo: 'data', tipo: 'date' })}
                            ${Componentes.campoDeFormulario({ rotulo: 'Caixa inicial (R$)', grupo: 'dia', campo: 'caixaInicial' })}
                        </div>
                    </div>

                    <div class="cartao">
                        <div class="cartao-titulo">Quantidades iniciais</div>
                        <p class="texto-de-ajuda">Ao contar os sabores nas abas Pastéis e Bebidas, estes totais são preenchidos automaticamente. Você também pode digitar direto aqui.</p>
                        <div class="grade-2-colunas">${camposDeQuantidade}</div>
                    </div>
                </div>

                <button type="button" class="botao-principal" onclick="App.trocarAba('pasteis')">Contar sabores →</button>
            </section>
        `;
    }
};