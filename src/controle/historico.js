const Historico = {
    render() {
        if (App.historico.length === 0) return '<div class="p-20 text-center text-gray-600 uppercase text-xs">Nenhum relatório salvo.</div>';

        return `
            <section class="p-4 max-w-4xl mx-auto pb-20">
                <h2 class="text-2xl font-bold text-[#d4a017] mb-8">HISTÓRICO</h2>
                <div class="space-y-6">
                    ${App.historico.map(r => this.itemRelatorio(r)).join('')}
                </div>
                <div class="mt-10 text-center">
                    <button onclick="App.resetarDia()" class="bg-zinc-800 text-white px-8 py-3 rounded-lg font-bold">INICIAR NOVO DIA</button>
                </div>
            </section>
        `;
    },

    itemRelatorio(r) {
        const dataF = r.data.split('-').reverse().join('/');
        return `
            <div class="card border-l-4 border-[#d4a017]">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <span class="block font-bold text-lg">${dataF}</span>
                        <span class="${r.dif < 0 ? 'text-red-500' : 'text-green-500'} font-bold text-xs uppercase">DIF: R$ ${r.dif.toFixed(2)}</span>
                    </div>
                    <button onclick="Historico.baixarPDF(${r.id})" class="text-[10px] bg-white/10 px-3 py-2 rounded uppercase font-bold">PDF</button>
                </div>
                <div class="grid grid-cols-2 gap-4 text-[10px] text-gray-400">
                    <div>VENDAS: P11: ${r.vendido.p11} | P22: ${r.vendido.p22} | Massa: ${r.vendido.m}</div>
                    <div class="text-right">CAIXA FINAL: R$ ${r.recebido.toFixed(2)}</div>
                </div>
            </div>
        `;
    },

    baixarPDF(id) {
        const r = App.historico.find(x => x.id === id);
        const el = document.createElement('div');
        el.className = 'pdf-export';
        el.innerHTML = `
            <h1 style="color:#d4a017">Relatório de Feira - ${r.data}</h1>
            <hr>
            <h3>Financeiro</h3>
            <p>Vendido: R$ ${r.totalVenda.toFixed(2)}</p>
            <p>Troco Inicial: R$ ${r.caixaIni.toFixed(2)}</p>
            <p><b>Recebido Total: R$ ${r.recebido.toFixed(2)}</b></p>
            <p>Diferença: R$ ${r.dif.toFixed(2)}</p>
            <hr>
            <h3>Quantidades</h3>
            <p>Pastéis R$11: ${r.vendido.p11}</p>
            <p>Especiais R$22: ${r.vendido.p22}</p>
            <p>Massas: ${r.vendido.m}</p>
        `;
        html2pdf().from(el).set({ filename: `Feira_${r.data}.pdf` }).save();
    }
};