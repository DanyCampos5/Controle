/* =============================================================
 * avisos.js
 * Único arquivo que conversa com o SweetAlert2.
 * O resto do sistema só chama Avisos.mostrarSucesso(), mostrarErro()
 * e confirmar(). Se o SweetAlert não carregar (ex.: sem internet),
 * usa os avisos nativos do navegador e o sistema continua funcionando.
 * ============================================================= */

const Avisos = {
    /** Tema comum a todos os avisos (preto e amarelo). */
    TEMA: {
        background: '#1a1a1a',
        color: '#f5f5f5',
        heightAuto: false,        // não deixa o SweetAlert alterar a altura da página
        scrollbarPadding: false
    },

    sweetAlertDisponivel() {
        return typeof Swal !== 'undefined';
    },

    /** Mensagem rápida no topo da tela (some sozinha). */
    mostrarNotificacao(mensagem, icone) {
        if (!this.sweetAlertDisponivel()) {
            if (icone === 'error') window.alert(mensagem);
            return;
        }
        Swal.fire({
            ...this.TEMA,
            toast: true,
            position: 'top',
            icon: icone,
            title: mensagem,
            showConfirmButton: false,
            timer: 2400,
            timerProgressBar: true,
            customClass: { popup: 'swal-popup-feira' }
        });
    },

    mostrarSucesso(mensagem) { this.mostrarNotificacao(mensagem, 'success'); },
    mostrarErro(mensagem) { this.mostrarNotificacao(mensagem, 'error'); },

    /**
     * Pergunta "tem certeza?". Devolve true se a pessoa confirmou.
     * Uso:  if (!(await Avisos.confirmar({ titulo: '...', texto: '...' }))) return;
     */
    async confirmar({ titulo, texto, textoDoBotao = 'Confirmar', acaoPerigosa = false }) {
        if (!this.sweetAlertDisponivel()) {
            return window.confirm(`${titulo}\n\n${texto.replace(/<[^>]*>/g, '')}`);
        }

        const resultado = await Swal.fire({
            ...this.TEMA,
            icon: acaoPerigosa ? 'warning' : 'question',
            title: titulo,
            html: texto,
            showCancelButton: true,
            confirmButtonText: textoDoBotao,
            cancelButtonText: 'Cancelar',
            confirmButtonColor: acaoPerigosa ? '#ff5a5a' : '#ffc61a',
            cancelButtonColor: '#242424',
            reverseButtons: true,
            focusCancel: acaoPerigosa,
            customClass: {
                popup: 'swal-popup-feira',
                confirmButton: acaoPerigosa ? 'swal-botao-perigo' : 'swal-botao-confirmar',
                cancelButton: 'swal-botao-cancelar'
            }
        });
        return resultado.isConfirmed;
    }
};