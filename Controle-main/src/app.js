/* =============================================================
 * app.js
 * Coração do sistema: guarda o estado, navega entre as abas,
 * faz os cálculos e salva os dados no navegador (localStorage).
 *
 * Organização deste arquivo:
 *   1. Estado             4. Utilitários (datas, moeda, ids)
 *   2. Inicialização      5. Navegação
 *   3. Armazenamento      6. Contagem de itens
 *                         7. Fechamento e ações do dia
 * ============================================================= */

const App = {

    /* ---------- 1. ESTADO ---------- */

    abaAtual: 'entrada',

    /**
     * Tudo que é digitado no dia, agrupado:
     *  dia:               { data, caixaInicial }
     *  quantidadeInicial: { pastel, pastelEspecial, ... }  (total com que começou o dia)
     *  sobra:             { pastel, pastelEspecial, ... }  (o que sobrou no fim do dia)
     *  recebimento:       { pix, dinheiro, cartao }
     */
    dadosDoDia: {},

    /** Quantidade contada de cada sabor/produto. Ex.: { 'Carne': 5, 'Coca': 12 } */
    contagemDeItens: {},

    /** Relatórios dos dias já finalizados (mais recente primeiro). */
    historicoDeRelatorios: [],

    /** Qual módulo desenha cada aba. */
    TELAS_POR_ABA: { entrada: Entrada, pasteis: Pasteis, bebidas: Bebidas, saida: Saida, historico: Historico },


    /* ---------- 2. INICIALIZAÇÃO ---------- */

    iniciar() {
        this.historicoDeRelatorios = this.carregarHistorico();

        const rascunho = this.carregarRascunho();
        this.dadosDoDia = rascunho.dadosDoDia;
        this.contagemDeItens = rascunho.contagemDeItens;

        this.atualizarDataNoCabecalho();
        this.trocarAba('entrada');
    },


    /* ---------- 3. ARMAZENAMENTO (localStorage) ---------- */

    lerDoArmazenamento(chave, valorPadrao) {
        try { return JSON.parse(localStorage.getItem(chave)) ?? valorPadrao; }
        catch { return valorPadrao; }
    },

    gravarNoArmazenamento(chave, valor) {
        try { localStorage.setItem(chave, JSON.stringify(valor)); }
        catch (erro) { console.warn('Não foi possível salvar os dados', erro); }
    },

    /** Lê o histórico; na primeira vez, converte o da versão anterior. */
    carregarHistorico() {
        const salvo = this.lerDoArmazenamento(CHAVES_DE_ARMAZENAMENTO.historicoDeRelatorios, null);
        if (salvo) return salvo;

        const antigo = this.lerDoArmazenamento(CHAVES_DE_ARMAZENAMENTO.historicoAntigo, []);
        const convertido = antigo.map(relatorio => Migracao.converterRelatorio(relatorio));
        if (convertido.length) this.gravarNoArmazenamento(CHAVES_DE_ARMAZENAMENTO.historicoDeRelatorios, convertido);
        return convertido;
    },

    /** Lê o rascunho do dia em andamento; na primeira vez, converte o da versão anterior. */
    carregarRascunho() {
        let rascunho = this.lerDoArmazenamento(CHAVES_DE_ARMAZENAMENTO.rascunhoDoDia, null);

        if (!rascunho) {
            const antigo = this.lerDoArmazenamento(CHAVES_DE_ARMAZENAMENTO.rascunhoAntigo, null);
            if (antigo) rascunho = Migracao.converterRascunho(antigo);
        }

        // Garante que todos os campos existam, mesmo se o rascunho vier incompleto
        const dadosDoDia = this.criarDadosDoDiaVazios();
        for (const grupo of Object.keys(dadosDoDia)) {
            dadosDoDia[grupo] = { ...dadosDoDia[grupo], ...(rascunho?.dadosDoDia?.[grupo] || {}) };
        }
        return { dadosDoDia, contagemDeItens: rascunho?.contagemDeItens || {} };
    },

    salvarHistorico() {
        this.gravarNoArmazenamento(CHAVES_DE_ARMAZENAMENTO.historicoDeRelatorios, this.historicoDeRelatorios);
    },

    salvarRascunho() {
        this.gravarNoArmazenamento(CHAVES_DE_ARMAZENAMENTO.rascunhoDoDia, {
            dadosDoDia: this.dadosDoDia,
            contagemDeItens: this.contagemDeItens
        });
    },

    criarDadosDoDiaVazios() {
        const vazioPorCategoria = () => Object.fromEntries(CHAVES_DAS_CATEGORIAS.map(chave => [chave, '']));
        return {
            dia: { data: this.dataDeHoje(), caixaInicial: '' },
            quantidadeInicial: vazioPorCategoria(),
            sobra: vazioPorCategoria(),
            recebimento: Object.fromEntries(FORMAS_DE_RECEBIMENTO.map(forma => [forma.chave, '']))
        };
    },

    /** Guarda o que foi digitado em um campo e salva o rascunho. */
    salvarCampo(grupo, campo, valor) {
        this.dadosDoDia[grupo][campo] = valor;
        this.salvarRascunho();
        if (grupo === 'dia' && campo === 'data') this.atualizarDataNoCabecalho();
    },

    /** Lê um campo como número (vazio vira 0). */
    obterNumero(grupo, campo) {
        return Number(this.dadosDoDia[grupo][campo]) || 0;
    },


    /* ---------- 4. UTILITÁRIOS ---------- */

    /** Date do JavaScript -> '2026-10-17' (usa o fuso local, não UTC). */
    formatarDataIso(data) {
        const doisDigitos = numero => String(numero).padStart(2, '0');
        return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
    },

    dataDeHoje() { return this.formatarDataIso(new Date()); },

    /** '2026-10-17' -> '17/10/2026' */
    formatarDataBrasileira(dataIso) {
        return dataIso ? dataIso.split('-').reverse().join('/') : 'Sem data';
    },

    /** '2026-10-17' -> 'sáb, 17 out' */
    formatarDataCurta(dataIso) {
        if (!dataIso) return 'Sem data';
        const [ano, mes, dia] = dataIso.split('-').map(Number);
        return new Date(ano, mes - 1, dia)
            .toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
            .replace(/\./g, '');
    },

    /** 12 -> 'R$ 12,00' */
    formatarMoeda(valor) {
        return (Number(valor) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    },

    /** Preço atual de uma categoria, para rótulos: 'R$ 12' */
    formatarPreco(chaveDaCategoria) {
        return 'R$ ' + CATEGORIAS_DE_PRODUTO[chaveDaCategoria].preco.toLocaleString('pt-BR');
    },

    /** 'Água com Gás' -> 'Agua_com_Gas' (serve de id no HTML). */
    gerarIdParaElemento(texto) {
        return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\W+/g, '_');
    },

    somarContagem(listaDeItens) {
        return listaDeItens.reduce((total, item) => total + (this.contagemDeItens[item] || 0), 0);
    },

    /** Compara o caixa: 'batendo', 'faltando' ou 'sobrando'. */
    obterSituacaoDoCaixa(diferenca) {
        if (Math.abs(diferenca) < 0.005) return 'batendo';
        return diferenca < 0 ? 'faltando' : 'sobrando';
    },

    atualizarDataNoCabecalho() {
        const elemento = document.getElementById('cabecalho-data');
        if (elemento) elemento.textContent = this.formatarDataCurta(this.dadosDoDia.dia.data);
    },


    /* ---------- 5. NAVEGAÇÃO ---------- */

    trocarAba(idDaAba) {
        this.abaAtual = idDaAba;
        this.renderizarMenu();

        const tela = this.TELAS_POR_ABA[idDaAba];
        const areaPrincipal = document.getElementById('conteudo-principal');
        areaPrincipal.innerHTML = tela.render();
        areaPrincipal.scrollTop = 0;

        // Algumas telas precisam de um ajuste logo após serem desenhadas
        if (typeof tela.aoExibir === 'function') tela.aoExibir();
    },

    renderizarMenu() {
        document.getElementById('menu-abas').innerHTML = ABAS_DO_MENU.map(aba => `
            <button type="button" onclick="App.trocarAba('${aba.id}')" class="${this.abaAtual === aba.id ? 'aba-ativa' : 'aba-inativa'}">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${aba.icone}</svg>
                ${aba.nome}
            </button>
        `).join('');
    },


    /* ---------- 6. CONTAGEM DE ITENS ---------- */

    /**
     * Soma (+1) ou subtrai (-1) um item e atualiza a tela sem redesenhá-la.
     * O total da categoria correspondente na Entrada é atualizado automaticamente.
     */
    alterarContagem(nomeDoItem, variacao) {
        this.contagemDeItens[nomeDoItem] = Math.max(0, (this.contagemDeItens[nomeDoItem] || 0) + variacao);

        for (const [chave, categoria] of Object.entries(CATEGORIAS_DE_PRODUTO)) {
            if (categoria.itens.includes(nomeDoItem)) {
                this.dadosDoDia.quantidadeInicial[chave] = this.somarContagem(categoria.itens);
            }
        }
        this.salvarRascunho();

        // Atualiza só o número do item (com uma pequena animação)
        const quantidade = this.contagemDeItens[nomeDoItem];
        const elementoDaQuantidade = document.getElementById(`quantidade-${this.gerarIdParaElemento(nomeDoItem)}`);
        if (elementoDaQuantidade) {
            elementoDaQuantidade.textContent = quantidade;
            elementoDaQuantidade.classList.remove('animar-numero');
            void elementoDaQuantidade.offsetWidth; // força o navegador a reiniciar a animação
            elementoDaQuantidade.classList.add('animar-numero');
            elementoDaQuantidade.closest('.item-de-estoque')?.classList.toggle('com-quantidade', quantidade > 0);
        }

        // Atualiza a barra de totais fixa no topo
        const barraDeTotais = document.getElementById('barra-de-totais');
        const telaAtual = this.TELAS_POR_ABA[this.abaAtual];
        if (barraDeTotais && telaAtual.categorias) {
            barraDeTotais.innerHTML = Componentes.totaisDasCategorias(telaAtual.categorias);
        }
    },


    /* ---------- 7. FECHAMENTO E AÇÕES DO DIA ---------- */

    /**
     * Calcula o resultado do dia com o que foi digitado.
     * Este mesmo objeto (mais um id) é o que vira o relatório no histórico.
     */
    calcularFechamento() {
        const quantidadeVendida = {};
        const precosNaEpoca = {};
        let totalVendido = 0;

        for (const chave of CHAVES_DAS_CATEGORIAS) {
            const preco = CATEGORIAS_DE_PRODUTO[chave].preco;
            quantidadeVendida[chave] = this.obterNumero('quantidadeInicial', chave) - this.obterNumero('sobra', chave);
            precosNaEpoca[chave] = preco; // guardado para o relatório continuar correto se o preço mudar
            totalVendido += quantidadeVendida[chave] * preco;
        }

        const recebimento = {};
        for (const forma of FORMAS_DE_RECEBIMENTO) {
            recebimento[forma.chave] = this.obterNumero('recebimento', forma.chave);
        }

        const totalRecebido = Object.values(recebimento).reduce((soma, valor) => soma + valor, 0);
        const caixaInicial = this.obterNumero('dia', 'caixaInicial');
        const totalEsperado = totalVendido + caixaInicial;

        return {
            data: this.dadosDoDia.dia.data,
            caixaInicial,
            quantidadeVendida,
            precosNaEpoca,
            totalVendido,
            totalEsperado,
            totalRecebido,
            diferenca: totalRecebido - totalEsperado,
            recebimento
        };
    },

    /** Valida, pede confirmação e salva o relatório do dia no histórico. */
    async finalizarDia() {
        const fechamento = this.calcularFechamento();

        if (!fechamento.data) {
            Avisos.mostrarErro('Informe a data na aba Entrada');
            return this.trocarAba('entrada');
        }
        if (Object.values(fechamento.quantidadeVendida).some(quantidade => quantidade < 0)) {
            return Avisos.mostrarErro('Alguma sobra é maior que a quantidade inicial');
        }

        const confirmou = await Avisos.confirmar({
            titulo: 'Finalizar o dia?',
            texto: `Diferença do caixa: <b>${this.formatarMoeda(fechamento.diferenca)}</b><br>O relatório será salvo no histórico.`,
            textoDoBotao: 'Finalizar'
        });
        if (!confirmou) return;

        this.historicoDeRelatorios.unshift({ id: Date.now(), ...fechamento });
        this.salvarHistorico();
        this.trocarAba('historico');
        Avisos.mostrarSucesso('Relatório salvo');
    },

    /** Limpa os dados do dia (o histórico é mantido). */
    async iniciarNovoDia() {
        const confirmou = await Avisos.confirmar({
            titulo: 'Iniciar novo dia?',
            texto: 'As contagens, sobras e recebimentos do dia atual serão limpos. O histórico é mantido.',
            textoDoBotao: 'Iniciar',
            acaoPerigosa: true
        });
        if (!confirmou) return;

        this.dadosDoDia = this.criarDadosDoDiaVazios();
        this.contagemDeItens = {};
        this.salvarRascunho();
        this.atualizarDataNoCabecalho();
        this.trocarAba('entrada');
        Avisos.mostrarSucesso('Novo dia iniciado');
    }
};

App.iniciar();