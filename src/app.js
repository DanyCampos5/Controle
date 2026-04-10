const App = {
    abaAtual: 'entrada',
    estoque: {},
    historico: JSON.parse(localStorage.getItem('feira_v3_data')) || [],

    init() {
        this.switchTab('entrada');
    },

    switchTab(aba) {
        this.abaAtual = aba;
        this.renderMenu();
        const main = document.getElementById('conteudo-principal');
        
        if(aba === 'entrada') main.innerHTML = Entrada.render();
        if(aba === 'pasteis') main.innerHTML = Pasteis.render();
        if(aba === 'bebidas') main.innerHTML = Bebidas.render();
        if(aba === 'saida') main.innerHTML = Saida.render();
        if(aba === 'historico') main.innerHTML = Historico.render();
        
        // Mantém a data de hoje se for a aba entrada
        if(aba === 'entrada' && !document.getElementById('ent-date').value) {
            document.getElementById('ent-date').valueAsDate = new Date();
        }
    },

    renderMenu() {
        const abas = [
            {id: 'entrada', nome: '1. Entrada'},
            {id: 'pasteis', nome: '2. Pastéis'},
            {id: 'bebidas', nome: '3. Bebidas'},
            {id: 'saida', nome: '4. Fechamento'},
            {id: 'historico', nome: '5. Histórico'}
        ];
        document.getElementById('menu-abas').innerHTML = abas.map(a => `
            <button onclick="App.switchTab('${a.id}')" class="${this.abaAtual === a.id ? 'tab-active' : 'tab-inactive'} px-4 py-3 text-sm font-medium whitespace-nowrap">${a.nome}</button>
        `).join('');
    },

    updateEstoque(item, qtd) {
        this.estoque[item] = Math.max(0, (this.estoque[item] || 0) + qtd);
        this.switchTab(this.abaAtual); // Re-renderiza para atualizar numero
    },

    calcularValores() {
        const getV = (id) => Number(document.getElementById(id)?.value) || 0;
        
        const vendido = {
            p11: getV('ent-p-total') - getV('sob-p11'),
            p22: getV('ent-pe-total') - getV('sob-p22'),
            b4: getV('ent-b4-total') - getV('sob-b4'),
            b7: getV('ent-b7-total') - getV('sob-b7'),
            m: getV('ent-massa-total') - getV('sob-massa')
        };

        const totalVenda = (vendido.p11 * 11) + (vendido.p22 * 22) + (vendido.b4 * 4) + (vendido.b7 * 7) + (vendido.m * 10);
        const recebido = getV('r-pix') + getV('r-din') + getV('r-car');
        const esperado = totalVenda + getV('ent-caixa');

        return { totalVenda, recebido, esperado, dif: recebido - esperado, vendido, data: document.getElementById('ent-date').value };
    },

    salvarRelatorio() {
        const dados = this.calcularValores();
        this.historico.unshift({ id: Date.now(), ...dados });
        localStorage.setItem('feira_v3_data', JSON.stringify(this.historico));
        this.switchTab('historico');
    }
};

App.init();