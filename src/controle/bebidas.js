const Bebidas = {
    bebidas4: ['Pingado', 'Água com Gás', 'Água sem Gás'],
    bebidas7: ['Coca', 'Fanta', 'Sprite', 'Suco', 'Coca Zero', 'Guaraná', 'Chocomilk'],

    render() {
        let html = '<section class="p-4 max-w-xl mx-auto">';
        html += '<h2 class="text-xl font-bold text-[#d4a017] mb-4">ESTOQUE DE BEBIDAS</h2>';
        html += '<div class="section-title">Bebidas R$ 4</div>' + this.renderLista(this.bebidas4);
        html += '<div class="section-title">Bebidas R$ 7</div>' + this.renderLista(this.bebidas7);
        html += '<button onclick="App.switchTab(\'saida\')" class="btn-primary w-full mt-6">IR PARA FECHAMENTO</button></section>';
        return html;
    },

    renderLista(items) {
        return items.map(item => `
            <div class="card flex justify-between items-center py-2">
                <span class="text-sm">${item}</span>
                <div class="flex items-center bg-black border border-zinc-800 rounded-lg px-2">
                    <button onclick="App.updateEstoque('${item}', -1)" class="text-[#d4a017] font-bold px-3 py-1">-</button>
                    <span class="font-bold min-w-[30px] text-center">${App.estoque[item] || 0}</span>
                    <button onclick="App.updateEstoque('${item}', 1)" class="text-[#d4a017] font-bold px-3 py-1">+</button>
                </div>
            </div>
        `).join('');
    }
};