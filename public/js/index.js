document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const archivoMenu = document.getElementById('archivoMenu');
    const editor = document.getElementById('editor');
    const formPensum = document.getElementById('formPensum');
    const inputPensum = document.getElementById('pensumContent');

    // Manejo del menu Archivo
    archivoMenu.addEventListener('change', () => {
        const opcion = archivoMenu.value;

        if (opcion === 'limpiar') {
            editor.innerText = '';
        } else if (opcion === 'cargar') {
            fileInput.click(); // abrir selector de archivos
        } else if (opcion === 'guardar') {
            const textoPlano = editor.innerText;
            const blob = new Blob([textoPlano], { type: 'text/plain;charset=utf-8' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'archivo.plfp';
            a.click();
        }

        archivoMenu.selectedIndex = 0; // reiniciar menu
    });

    // Cargar contenido del archivo seleccionado
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.plfp')) {
            alert('Solo se permiten archivos con extension .plfp');
            fileInput.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            editor.innerText = event.target.result;
        };
        reader.readAsText(file);
    });

    // Enviar contenido limpio del editor al form pensum
    formPensum.addEventListener('submit', function () {
        inputPensum.value = editor.innerText;
    });

    // Enviar contenido del editor al input oculto antes de analizar
    const formAnalizar = document.querySelector('form[action="/analyze"]');
    const inputAnalizar = document.getElementById('txtAreaHidden');
    
    formAnalizar.addEventListener('submit', function () {
        inputAnalizar.value = editor.innerText;
});


    //Colorear el contenido si existe resultado de analisis (tokens)
    if (window.tokenList && Array.isArray(window.tokenList)) {
        const coloredHTML = window.tokenList.map(t => {
            const cls = getClassForToken(t.token);
            const escapedLexeme = escapeHtml(t.lexema);
            return `<span class="${cls}">${escapedLexeme}</span>`;
        }).join('');
        editor.innerHTML = coloredHTML;
    }

    function getClassForToken(tokenType) {
        switch (tokenType) {
            case 'PAR_OPEN':
            case 'PAR_CLOSE':
                return 'token-paren';
            case 'BRACE_OPEN':
            case 'BRACE_CLOSE':
                return 'token-brace';
            case 'BRACKET_OPEN':
            case 'BRACKET_CLOSE':
                return 'token-bracket';
            case 'COLON':
                return 'token-colon';
            case 'SEMICOLON':
                return 'token-semicolon';
            case 'COMMA':
                return 'token-comma';
            case 'NUMBER':
                return 'token-number';
            case 'STRING':
                return 'token-string';
            case 'RESERVED_WORD':
                return 'token-reserved';
            case 'UNKNOW':
                return 'token-error';
            default:
                return '';
        }
    }

    function escapeHtml(text) {
        return text.replace(/[&<>"']/g, function (m) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[m];
        });
    }
});
