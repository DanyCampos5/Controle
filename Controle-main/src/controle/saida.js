/* =============================================================
 * saida.js — Aba 4: fechamento do dia (sobras e recebimentos).
 * Mostra em tempo real se o caixa está batendo.
 * ============================================================= */

const Saida = {
    TEXTOS_DA_SITUACAO: {
        neutro: 'Preencha os campos abaixo',
        batendo: 'Caixa batendo ✓',
        faltando: 'Faltando dinheiro',
        sobrando: 'Sobrando dinheiro'
    },

    render() {
        const totalDeCategorias = CHAVES_DAS_CATEGORIAS.length;

        const camposDeSobra = CHAVES_DAS_CATEGORIAS.map((chave, posicao) => {
            const ficariaSozinhoNaUltimaLinha = posicao === totalDeCategorias - 1 && totalDeCategorias % 2 === 1;

            return Componentes.campoDeFormulario({
                rotulo: `${CATEGORIAS_DE_PRODUTO[chave].nome} ${App.formatarPreco(chave)}`,
                grupo: 'sobra',
                campo: chave,
                classeExtra: ficariaSozinhoNaUltimaLinha ? 'ocupa-2-colunas' : '',
                aoDigitar: 'Saida.atualizarPrevia()',
                comDica: true
            });
        }).join('');

        const camposDeRecebimento = FORMAS_DE_RECEBIMENTO.map(forma => Componentes.campoDeFormulario({
            rotulo: forma.nome,
            grupo: 'recebimento',
            campo: forma.chave,
            aoDigitar: 'Saida.atualizarPrevia()'
        })).join('');

        return `
            <section class="tela">
                <div class="tela-cabecalho">
                    <h2>Fechamento</h2>
                    <p>Informe o que sobrou e o que você recebeu.</p>
                </div>

                <div id="painel-diferenca" class="painel-diferenca" data-situacao="neutro">
                    <div class="painel-diferenca-rotulo">Diferença do caixa</div>
                    <div id="painel-diferenca-valor" class="painel-diferenca-valor">R$ 0,00</div>
                    <span id="painel-diferenca-status" class="painel-diferenca-status">${this.TEXTOS_DA_SITUACAO.neutro}</span>
                </div>

                <div id="aviso-sobra-maior-que-inicial" class="aviso-inline">
                    ⚠ Alguma sobra é maior que a quantidade inicial. Confira os números.
                </div>

                <div class="duas-colunas">
                    <div class="cartao">
                        <div class="cartao-titulo">Sobras</div>
                        <div class="grade-2-colunas">${camposDeSobra}</div>
                    </div>

                    <div>
                        <div class="cartao">
                            <div class="cartao-titulo">Recebimentos</div>
                            <div class="grade-3-colunas">${camposDeRecebimento}</div>
                        </div>

                        <div class="cartao tabela-resumo">
                            <div class="tabela-resumo-linha"><span>Vendido</span><b id="resumo-total-vendido">R$ 0,00</b></div>
                            <div class="tabela-resumo-linha"><span>+ Caixa inicial</span><b id="resumo-caixa-inicial">R$ 0,00</b></div>
                            <div class="tabela-resumo-linha"><span>= Esperado</span><b id="resumo-total-esperado">R$ 0,00</b></div>
                            <div class="tabela-resumo-linha"><span>Recebido</span><b id="resumo-total-recebido">R$ 0,00</b></div>
                        </div>
                    </div>
                </div>

                <button type="button" class="botao-principal" onclick="App.finalizarDia()">Finalizar dia</button>
            </section>
        `;
    },

    /** Chamado automaticamente pelo App logo depois que a tela é desenhada. */
    aoExibir() {
        this.atualizarPrevia();
    },

    /** Recalcula e atualiza o painel de diferença e os resumos, sem redesenhar a tela. */
    atualizarPrevia() {
        const painel = document.getElementById('painel-diferenca');
        if (!painel) return;

        const fechamento = App.calcularFechamento();
        const algumaSobraInvalida = Object.values(fechamento.quantidadeVendida).some(quantidade => quantidade < 0);
        const semMovimento = fechamento.totalVendido === 0 && fechamento.totalRecebido === 0;
        const situacao = semMovimento ? 'neutro' : App.obterSituacaoDoCaixa(fechamento.diferenca);

        painel.dataset.situacao = situacao;
        document.getElementById('painel-diferenca-valor').textContent = App.formatarMoeda(fechamento.diferenca);
        document.getElementById('painel-diferenca-status').textContent = this.TEXTOS_DA_SITUACAO[situacao];

        document.getElementById('resumo-total-vendido').textContent = App.formatarMoeda(fechamento.totalVendido);
        document.getElementById('resumo-caixa-inicial').textContent = App.formatarMoeda(fechamento.caixaInicial);
        document.getElementById('resumo-total-esperado').textContent = App.formatarMoeda(fechamento.totalEsperado);
        document.getElementById('resumo-total-recebido').textContent = App.formatarMoeda(fechamento.totalRecebido);

        document.getElementById('aviso-sobra-maior-que-inicial').style.display = algumaSobraInvalida ? 'block' : 'none';

        // Dica abaixo de cada campo de sobra: "vendeu X de Y"
        for (const chave of CHAVES_DAS_CATEGORIAS) {
            const dica = document.getElementById(`dica-sobra-${chave}`);
            if (!dica) continue;
            const vendida = fechamento.quantidadeVendida[chave];
            dica.textContent = `vendeu ${vendida} de ${App.obterNumero('quantidadeInicial', chave)}`;
            dica.classList.toggle('negativa', vendida < 0);
        }
    }
};