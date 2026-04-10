const Saida = {
    render() {
        return `
            <section class="p-4 max-w-xl mx-auto space-y-6">
                <div class="card border-l-4 border-yellow-600">
                    <h3 class="text-xs font-bold mb-4">SOBRAS</h3>
                    <div class="grid grid-cols-2 gap-2">
                        <input id="sob-p11" type="number" placeholder="Sobra P11" oninput="Saida.preview()">
                        <input id="sob-p22" type="number" placeholder="Sobra P22" oninput="Saida.preview()">
                        <input id="sob-b4" type="number" placeholder="Sobra B4" oninput="Saida.preview()">
                        <input id="sob-b7" type="number" placeholder="Sobra B7" oninput="Saida.preview()">
                        <input class="col-span-2" id="sob-massa" type="number" placeholder="Sobra Massa" oninput="Saida.preview()">
                    </div>
                </div>
                <div class="card border-l-4 border-green-600">
                    <h3 class="text-xs font-bold mb-4">RECEBIMENTOS</h3>
                    <div class="grid grid-cols-3 gap-2">
                        <input id="r-pix" type="number" placeholder="PIX" oninput="Saida.preview()">
                        <input id="r-din" type="number" placeholder="DIN" oninput="Saida.preview()">
                        <input id="r-car" type="number" placeholder="CART" oninput="Saida.preview()">
                    </div>
                </div>
                <div id="saida-preview" class="text-center py-4 text-3xl font-bold">R$ 0,00</div>
                <button onclick="App.salvarRelatorio()" class="btn-primary w-full">FINALIZAR DIA</button>
            </section>
        `;
    },

    preview() {
        const dados = App.calcularValores();
        const el = document.getElementById('saida-preview');
        el.textContent = dados.dif.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
        el.style.color = dados.dif < 0 ? '#ff4444' : '#4ade80';
    }
};