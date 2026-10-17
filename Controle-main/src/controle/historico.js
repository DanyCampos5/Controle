/* =============================================================
 * historico.js — Aba 5: relatórios dos dias finalizados.
 * Filtro por período, totais, PDF individual e exportação em CSV.
 * ============================================================= */

const Historico = {
    /** Filtro ativo: 'tudo', '7dias' ou 'mes'. */
    periodoSelecionado: 'tudo',

    OPCOES_DE_PERIODO: [
        { id: 'tudo', nome: 'Tudo' },
        { id: '7dias', nome: 'Últimos 7 dias' },
        { id: 'mes', nome: 'Este mês' }
    ],

    TEXTOS_DA_SITUACAO: { batendo: 'Batendo', faltando: 'Faltou', sobrando: 'Sobrou' },


    /* ---------- Dados ---------- */

    obterRelatoriosDoPeriodo() {
        const relatorios = App.historicoDeRelatorios;
        const hoje = App.dataDeHoje();

        if (this.periodoSelecionado === 'mes') {
            return relatorios.filter(relatorio => (relatorio.data || '').slice(0, 7) === hoje.slice(0, 7));
        }
        if (this.periodoSelecionado === '7dias') {
            const seteDiasAtras = new Date();
            seteDiasAtras.setDate(seteDiasAtras.getDate() - 6);
            const dataLimite = App.formatarDataIso(seteDiasAtras);
            return relatorios.filter(relatorio => (relatorio.data || '') >= dataLimite);
        }
        return relatorios;
    },

    selecionarPeriodo(idDoPeriodo) {
        this.periodoSelecionado = idDoPeriodo;
        App.trocarAba('historico');
    },

    /** Soma um valor de todos os relatórios da lista. */
    somarRelatorios(relatorios, obterValor) {
        return relatorios.reduce((total, relatorio) => total + (Number(obterValor(relatorio)) || 0), 0);
    },


    /* ---------- Tela ---------- */

    render() {
        if (App.historicoDeRelatorios.length === 0) return this.renderizarTelaVazia();

        const relatorios = this.obterRelatoriosDoPeriodo();
        const totalVendido = this.somarRelatorios(relatorios, r => r.totalVendido);
        const somaDasDiferencas = this.somarRelatorios(relatorios, r => r.diferenca);

        const botoesDePeriodo = this.OPCOES_DE_PERIODO.map(opcao => `
            <button type="button" class="filtro-de-periodo ${this.periodoSelecionado === opcao.id ? 'selecionado' : ''}"
                onclick="Historico.selecionarPeriodo('${opcao.id}')">${opcao.nome}</button>
        `).join('');

        const linhasPorFormaDePagamento = FORMAS_DE_RECEBIMENTO.map(forma => `
            <div class="tabela-resumo-linha">
                <span>${forma.nome}</span>
                <b>${App.formatarMoeda(this.somarRelatorios(relatorios, r => r.recebimento?.[forma.chave]))}</b>
            </div>
        `).join('');

        return `
            <section class="tela">
                <div class="tela-cabecalho"><h2>Histórico</h2></div>

                <div class="filtros-de-periodo">${botoesDePeriodo}</div>

                <div class="indicadores-do-periodo">
                    <div class="indicador"><span>Dias</span><b>${relatorios.length}</b></div>
                    <div class="indicador"><span>Vendido</span><b>${App.formatarMoeda(totalVendido)}</b></div>
                    <div class="indicador"><span>Diferença</span><b style="color:${somaDasDiferencas < 0 ? 'var(--cor-erro)' : 'var(--cor-sucesso)'}">${App.formatarMoeda(somaDasDiferencas)}</b></div>
                </div>

                <div class="cartao tabela-resumo">
                    <div class="cartao-titulo">Recebido por forma de pagamento</div>
                    ${linhasPorFormaDePagamento}
                </div>

                ${relatorios.length
                    ? relatorios.map(relatorio => this.renderizarCartaoDoRelatorio(relatorio)).join('')
                    : '<div class="estado-vazio"><p>Nenhum relatório neste período.</p></div>'}

                <div class="acoes-do-fim-da-tela">
                    <button type="button" class="botao-secundario" onclick="Historico.exportarCsv()">Exportar CSV</button>
                    <button type="button" class="botao-secundario" onclick="App.iniciarNovoDia()">Iniciar novo dia</button>
                </div>
            </section>
        `;
    },

    renderizarTelaVazia() {
        return `
            <section class="tela">
                <div class="estado-vazio">
                    <div class="estado-vazio-icone">🧾</div>
                    <p>Nenhum relatório salvo ainda.<br>Finalize um dia para ele aparecer aqui.</p>
                    <button type="button" class="botao-secundario" onclick="App.iniciarNovoDia()">Iniciar novo dia</button>
                </div>
            </section>`;
    },

    renderizarCartaoDoRelatorio(relatorio) {
        const situacao = App.obterSituacaoDoCaixa(relatorio.diferenca);

        // Uma etiqueta por categoria, ex.: "Pastel 12  3" (nome + preço da época + quantidade vendida)
        const etiquetasDeQuantidade = CHAVES_DAS_CATEGORIAS.map(chave => {
            const quantidade = relatorio.quantidadeVendida[chave] ?? 0;
            const preco = relatorio.precosNaEpoca[chave];
            return `<span class="quantidade-vendida ${quantidade ? '' : 'zerada'}"><i>${CATEGORIAS_DE_PRODUTO[chave].nomeCurto} ${preco}</i>${quantidade}</span>`;
        }).join('');

        const textoDosRecebimentos = FORMAS_DE_RECEBIMENTO
            .map(forma => `${forma.nome} ${App.formatarMoeda(relatorio.recebimento?.[forma.chave])}`)
            .join(' · ');

        return `
            <article class="cartao-relatorio">
                <div class="cartao-relatorio-topo">
                    <div>
                        <div class="cartao-relatorio-data">${App.formatarDataBrasileira(relatorio.data)}</div>
                        <span class="selo-situacao ${situacao}">${this.TEXTOS_DA_SITUACAO[situacao]} · ${App.formatarMoeda(relatorio.diferenca)}</span>
                    </div>
                    <div class="cartao-relatorio-acoes">
                        <button type="button" class="botao-pequeno dourado" onclick="Historico.baixarPdf(${relatorio.id})">PDF</button>
                        <button type="button" class="botao-pequeno perigo" onclick="Historico.excluirRelatorio(${relatorio.id})">Excluir</button>
                    </div>
                </div>

                <div class="quantidades-vendidas">${etiquetasDeQuantidade}</div>

                <div class="cartao-relatorio-rodape">
                    <span>Vendido <b>${App.formatarMoeda(relatorio.totalVendido)}</b></span>
                    <span>Caixa final <b>${App.formatarMoeda(relatorio.totalRecebido)}</b></span>
                </div>
                <div class="cartao-relatorio-pagamentos">${textoDosRecebimentos}</div>
            </article>
        `;
    },


    /* ---------- Ações ---------- */

    async excluirRelatorio(idDoRelatorio) {
        const confirmou = await Avisos.confirmar({
            titulo: 'Excluir relatório?',
            texto: 'Essa ação não pode ser desfeita.',
            textoDoBotao: 'Excluir',
            acaoPerigosa: true
        });
        if (!confirmou) return;

        App.historicoDeRelatorios = App.historicoDeRelatorios.filter(relatorio => relatorio.id !== idDoRelatorio);
        App.salvarHistorico();
        App.trocarAba('historico');
        Avisos.mostrarSucesso('Relatório excluído');
    },

    /** Gera uma planilha (abre direto no Excel) com os relatórios do período filtrado. */
    exportarCsv() {
        const relatorios = this.obterRelatoriosDoPeriodo();
        if (!relatorios.length) return Avisos.mostrarErro('Nada para exportar');

        const formatarNumero = valor => (Number(valor) || 0).toFixed(2).replace('.', ',');

        const cabecalho = [
            'Data', 'Caixa inicial', 'Vendido', 'Esperado', 'Recebido', 'Diferença',
            ...FORMAS_DE_RECEBIMENTO.map(forma => forma.nome),
            ...CHAVES_DAS_CATEGORIAS.map(chave => `${CATEGORIAS_DE_PRODUTO[chave].nome} vendidos`)
        ];

        const linhas = relatorios.map(relatorio => [
            App.formatarDataBrasileira(relatorio.data),
            formatarNumero(relatorio.caixaInicial),
            formatarNumero(relatorio.totalVendido),
            formatarNumero(relatorio.totalEsperado),
            formatarNumero(relatorio.totalRecebido),
            formatarNumero(relatorio.diferenca),
            ...FORMAS_DE_RECEBIMENTO.map(forma => formatarNumero(relatorio.recebimento?.[forma.chave])),
            ...CHAVES_DAS_CATEGORIAS.map(chave => relatorio.quantidadeVendida[chave] ?? 0)
        ].join(';'));

        // '\uFEFF' faz o Excel reconhecer os acentos corretamente
        const conteudo = '\uFEFF' + [cabecalho.join(';'), ...linhas].join('\n');
        const endereco = URL.createObjectURL(new Blob([conteudo], { type: 'text/csv;charset=utf-8' }));

        const link = document.createElement('a');
        link.href = endereco;
        link.download = `Feira_historico_${App.dataDeHoje()}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(endereco);

        Avisos.mostrarSucesso('CSV exportado');
    },

    /** Gera e baixa o PDF de um relatório. */
    baixarPdf(idDoRelatorio) {
        const relatorio = App.historicoDeRelatorios.find(item => item.id === idDoRelatorio);
        if (!relatorio) return;

        const linhaDaTabela = (descricao, valor) => `
            <tr>
                <td style="padding:8px 0;border-bottom:1px solid #eee">${descricao}</td>
                <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right"><b>${valor}</b></td>
            </tr>`;

        const linhasDeQuantidade = CHAVES_DAS_CATEGORIAS.map(chave => linhaDaTabela(
            `${CATEGORIAS_DE_PRODUTO[chave].nome} R$ ${relatorio.precosNaEpoca[chave]}`,
            relatorio.quantidadeVendida[chave] ?? 0
        )).join('');

        const textoDosRecebimentos = FORMAS_DE_RECEBIMENTO
            .map(forma => `${forma.nome} ${App.formatarMoeda(relatorio.recebimento?.[forma.chave])}`)
            .join(' · ');

        const documento = document.createElement('div');
        documento.style.cssText = 'padding:24px;color:#111;background:#fff;font-family:Arial,sans-serif;font-size:14px;';
        documento.innerHTML = `
            <h1 style="margin:0 0 4px;color:#d4a017;font-size:24px">Relatório de Feira</h1>
            <div style="color:#666;margin-bottom:18px">${App.formatarDataBrasileira(relatorio.data)}</div>

            <h3 style="margin:18px 0 6px">Financeiro</h3>
            <table style="width:100%;border-collapse:collapse">
                ${linhaDaTabela('Vendido', App.formatarMoeda(relatorio.totalVendido))}
                ${linhaDaTabela('Troco inicial', App.formatarMoeda(relatorio.caixaInicial))}
                ${linhaDaTabela('Esperado em caixa', App.formatarMoeda(relatorio.totalEsperado))}
                ${linhaDaTabela('Recebido total', App.formatarMoeda(relatorio.totalRecebido))}
                ${linhaDaTabela('Diferença', App.formatarMoeda(relatorio.diferenca))}
            </table>
            <p style="color:#666;font-size:12px">${textoDosRecebimentos}</p>

            <h3 style="margin:18px 0 6px">Quantidades vendidas</h3>
            <table style="width:100%;border-collapse:collapse">${linhasDeQuantidade}</table>
        `;

        html2pdf().from(documento).set({
            margin: 10,
            filename: `Feira_${relatorio.data || relatorio.id}.pdf`,
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4' }
        }).save();
    }
};