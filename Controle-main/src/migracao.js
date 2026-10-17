/* =============================================================
 * migracao.js
 * Converte os dados salvos pela versão anterior (nomes como p11, b4)
 * para o formato novo (pastel, bebidaSimples...).
 *
 * Roda uma única vez, na primeira abertura. Depois que seus dados
 * antigos estiverem convertidos, este arquivo pode ser apagado
 * (lembre de remover a linha dele no index.html e a chamada em app.js).
 * ============================================================= */

const Migracao = {
    /** Tradução dos códigos antigos para os novos. */
    NOMES_ANTIGOS_PARA_NOVOS: {
        p11: 'pastel',
        p22: 'pastelEspecial',
        b4: 'bebidaSimples',
        b7: 'bebidaGelada',
        massa: 'massaDePastel',
        m: 'massaDePastel'
    },

    /** Preços praticados antes do reajuste (usados em relatórios que não guardaram o preço). */
    PRECOS_ANTIGOS: { pastel: 11, pastelEspecial: 22, bebidaSimples: 4, bebidaGelada: 7, massaDePastel: 10 },

    NOME_ANTIGO_DA_MASSA: 'Massa de Pastel R$10',

    /** Troca as chaves antigas pelas novas em um objeto. Ex.: { p11: 3 } vira { pastel: 3 } */
    renomearChaves(objetoAntigo = {}) {
        const objetoNovo = {};
        for (const [nomeAntigo, valor] of Object.entries(objetoAntigo)) {
            const nomeNovo = this.NOMES_ANTIGOS_PARA_NOVOS[nomeAntigo];
            if (nomeNovo) objetoNovo[nomeNovo] = valor;
        }
        return objetoNovo;
    },

    /** Converte um relatório do histórico antigo para o formato novo. */
    converterRelatorio(relatorio) {
        const jaEstaNoFormatoNovo = !relatorio.vendido;
        if (jaEstaNoFormatoNovo) return relatorio;

        const zeros = Object.fromEntries(CHAVES_DAS_CATEGORIAS.map(chave => [chave, 0]));
        const pagamentos = relatorio.pagamentos || {};
        const totalVendido = relatorio.totalVenda ?? 0;
        const caixaInicial = relatorio.caixaIni ?? 0;

        return {
            id: relatorio.id,
            data: relatorio.data || '',
            caixaInicial,
            quantidadeVendida: { ...zeros, ...this.renomearChaves(relatorio.vendido) },
            precosNaEpoca: { ...this.PRECOS_ANTIGOS, ...this.renomearChaves(relatorio.precos) },
            totalVendido,
            totalEsperado: relatorio.esperado ?? (totalVendido + caixaInicial),
            totalRecebido: relatorio.recebido ?? 0,
            diferenca: relatorio.dif ?? 0,
            recebimento: {
                pix: pagamentos.pix ?? 0,
                dinheiro: pagamentos.din ?? 0,
                cartao: pagamentos.car ?? 0
            }
        };
    },

    /** Converte o rascunho do dia (campos soltos) para o formato agrupado novo. */
    converterRascunho(rascunho) {
        const antigo = rascunho.dados || {};
        const contagemDeItens = { ...(rascunho.estoque || {}) };

        // O item de massa deixou de ter o preço no nome
        if (contagemDeItens[this.NOME_ANTIGO_DA_MASSA] !== undefined) {
            contagemDeItens['Massa de Pastel'] = (contagemDeItens['Massa de Pastel'] || 0) + contagemDeItens[this.NOME_ANTIGO_DA_MASSA];
            delete contagemDeItens[this.NOME_ANTIGO_DA_MASSA];
        }

        const doGrupo = (prefixo) => ({
            pastel: antigo[`${prefixo}p11`] ?? '',
            pastelEspecial: antigo[`${prefixo}p22`] ?? '',
            bebidaSimples: antigo[`${prefixo}b4`] ?? '',
            bebidaGelada: antigo[`${prefixo}b7`] ?? '',
            massaDePastel: antigo[prefixo ? 'sob_massa' : 'massa'] ?? ''
        });

        return {
            dadosDoDia: {
                dia: { data: antigo.data || '', caixaInicial: antigo.caixa ?? '' },
                quantidadeInicial: doGrupo(''),
                sobra: doGrupo('sob_'),
                recebimento: {
                    pix: antigo.r_pix ?? '',
                    dinheiro: antigo.r_din ?? '',
                    cartao: antigo.r_car ?? ''
                }
            },
            contagemDeItens
        };
    }
};