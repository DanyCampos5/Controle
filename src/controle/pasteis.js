const Pasteis = {
    sabores11: ['Carne', 'Queijo', 'Palmito', 'Presunto e Queijo', 'Frango Queijo', 'Carne e Queijo', 'Palmito Queijo', 'Palmito Frango', 'Coxinha Frango', 'Coxinha Carne'],
    especiais22: ['Pastelão', 'Pastelão Frango', 'Enroladão'],
    
    render() {
        let html = '<section class="p-4 max-w-xl mx-auto">';
        html += '<div class="section-title">Pastéis R$ 11</div>' + this.renderLista(this.sabores11);
        html += '<div class="section-title">Especiais R$ 22</div>' + this.renderLista(this.especiais22);
        html += '<div class="section-title">Extras</div>' + this.renderLista(['Massa de Pastel R$10']);
        html += '<button onclick="App.switchTab(\'bebidas\')" class="btn-primary w-full mt-6">Ir para Bebidas</button></section>';
        return html;
    },

    renderLista(items) {
        return items.map(item => `
            <div class="card flex justify-between items-center">
                <span class="text-sm">${item}</span>
                <div class="flex items-center gap-3">
                    <button onclick="App.updateEstoque('${item}', -1)" class="text-[#d4a017] font-bold text-xl px-2">-</button>
                    <span class="font-bold">${App.estoque[item] || 0}</span>
                    <button onclick="App.updateEstoque('${item}', 1)" class="text-[#d4a017] font-bold text-xl px-2">+</button>
                </div>
            </div>
        `).join('');
    }
};