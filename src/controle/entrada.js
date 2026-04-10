const Entrada = {
    render() {
        return `
            <section class="p-4 max-w-2xl mx-auto">
                <h2 class="text-2xl font-bold text-[#d4a017] mb-6">Configuração Inicial</h2>
                <div class="grid gap-4">
                    <div><label class="text-xs">DATA</label><input id="ent-date" type="date"></div>
                    <div><label class="text-xs">CAIXA INICIAL (R$)</label><input id="ent-caixa" type="number"></div>
                    <div><label class="text-xs">TOTAL PASTÉIS R$11</label><input id="ent-p-total" type="number"></div>
                    <div><label class="text-xs">TOTAL ESPECIAIS R$22</label><input id="ent-pe-total" type="number"></div>
                    <div><label class="text-xs">TOTAL BEBIDAS R$4</label><input id="ent-b4-total" type="number"></div>
                    <div><label class="text-xs">TOTAL BEBIDAS R$7</label><input id="ent-b7-total" type="number"></div>
                    <div><label class="text-xs">TOTAL MASSAS R$10</label><input id="ent-massa-total" type="number"></div>
                </div>
                <button onclick="App.switchTab('pasteis')" class="btn-primary w-full mt-6">Ir para Sabores</button>
            </section>
        `;
    }
};