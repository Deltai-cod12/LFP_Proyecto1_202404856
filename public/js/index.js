document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const archivoMenu = document.getElementById('archivoMenu');
    const editor = document.getElementById('editor');
    const formPensum = document.getElementById('formPensum');
    const inputPensum = document.getElementById('pensumContent');

    // Manejo del menú Archivo
    archivoMenu.addEventListener('change', () => {
        const opcion = archivoMenu.value;

        if (opcion === 'limpiar') {
            editor.value = '';
        } else if (opcion === 'cargar') {
            fileInput.click(); // abrir selector de archivos
        } else if (opcion === 'guardar') {
            const blob = new Blob([editor.value], { type: 'text/plain;charset=utf-8' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'archivo.plfp';
            a.click();
        }

        archivoMenu.selectedIndex = 0; // reiniciar menú
    });

    // Cargar contenido del archivo seleccionado
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];

        if (!file) return;

        // Validar que sea archivo .plfp
        if (!file.name.toLowerCase().endsWith('.plfp')) {
            alert('Solo se permiten archivos con extensión .plfp');
            fileInput.value = ''; // limpiar selección
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            editor.value = event.target.result;
        };
        reader.readAsText(file);
    });

    // Asignar el contenido del textarea al input oculto del botón Pensum
    formPensum.addEventListener('submit', function (e) {
        inputPensum.value = editor.value;
    });
});
