import { Token, Type } from "./Token";

class LexicalAnalyzer {

    private row: number;
    private column: number;
    private auxChar: string;
    private state: number;
    private tokenList: Token[];
    private errorList: Token[];
    private reserverdWords: string[];

    constructor() {
        this.row = 1;
        this.column = 1;
        this.auxChar = '';
        this.state = 0;
        this.tokenList = [];
        this.errorList = [];
        this.reserverdWords = ['Carrera', 'Semestre', 'Curso', 'Nombre', 'Area', 'Prerrequisitos'];
    }

    scanner(input: string) {
        // Asegúrate de limpiar las listas al inicio de cada escaneo
        this.tokenList = [];
        this.errorList = [];
        this.row = 1; // Reiniciar fila y columna
        this.column = 1;
        this.auxChar = '';
        this.state = 0;

        input += '#'; // Marcador de fin de archivo

        for (let i: number = 0; i < input.length; i++) {
            let char = input[i]; // No declarar char con 'let' en cada iteración

            // Esto es crucial para manejar los caracteres que no inician un token
            // o que son solo espacios en blanco.
            if (this.state === 0) { // Solo en el estado inicial
                if (char === ' ' || char === '\t') {
                    this.column++;
                    continue; // Consumir espacio/tab y pasar al siguiente carácter
                }
                if (char === '\n') {
                    this.row++;
                    this.column = 1;
                    continue; // Consumir salto de línea y pasar al siguiente carácter
                }
                if (char === '\r') { // Manejar \r por si es CRLF
                    // Solo incrementa la fila si no es seguido de \n (ya lo maneja \n)
                    if (input[i + 1] !== '\n') {
                        this.row++;
                        this.column = 1;
                    }
                    continue; // Consumir y pasar al siguiente
                }
            }


            switch (this.state) {
                case 0:
                    switch (char) {
                        case '[':
                            this.addToken(Type.BRACKET_OPEN, char, this.row, this.column);
                            this.column++;
                            break; // No es necesario cambiar de estado para un solo carácter
                        case ']':
                            this.addToken(Type.BRACKET_CLOSE, char, this.row, this.column);
                            this.column++;
                            break;
                        case '{':
                            this.addToken(Type.BRACE_OPEN, char, this.row, this.column);
                            this.column++;
                            break;
                        case '}':
                            this.addToken(Type.BRACE_CLOSE, char, this.row, this.column);
                            this.column++;
                            break;
                        case '(':
                            this.addToken(Type.PAR_OPEN, char, this.row, this.column);
                            this.column++;
                            break;
                        case ')':
                            this.addToken(Type.PAR_CLOSE, char, this.row, this.column);
                            this.column++;
                            break;
                        case ':':
                            this.addToken(Type.COLON, char, this.row, this.column);
                            this.column++;
                            break;
                        case ';':
                            this.addToken(Type.SEMICOLON, char, this.row, this.column);
                            this.column++;
                            break;
                        case ',':
                            this.addToken(Type.COMMA, char, this.row, this.column);
                            this.column++;
                            break;
                        case '"':
                            this.state = 12; // Iniciar estado de cadena
                            this.addCharacter(char); // Añadir la primera comilla
                            break;

                        case '#': // Manejo del fin de archivo
                            if (i === input.length - 1) {
                                console.log("Analyze Finished");
                            } else {
                                // Esto maneja un '#' que no es fin de archivo, como un UNKNOW
                                this.addError(Type.UNKNOW, char, this.row, this.column);
                                this.column++;
                            }
                            break;

                        default: // Para letras y dígitos, iniciar el reconocimiento
                            if (/[a-zA-Z]/.test(char)) { // Identificadores y palabras reservadas
                                this.state = 11;
                                this.addCharacter(char);
                            } else if (/\d/.test(char)) { // Números
                                this.state = 10;
                                this.addCharacter(char);
                            } else { // Cualquier otro carácter desconocido
                                this.addError(Type.UNKNOW, char, this.row, this.column);
                                this.column++;
                            }
                            break;
                    }
                    break; // Fin de case 0

                case 10: // Números
                    if (/\d/.test(char)) {
                        this.addCharacter(char);
                    } else {
                        this.addToken(Type.NUMBER, this.auxChar, this.row, this.column - this.auxChar.length);
                        this.clean();
                        i--; // Reevaluar el carácter actual en el estado 0
                    }
                    break;

                case 11: // Identificadores y palabras reservadas
                    if (/[a-zA-Z0-9]/.test(char)) {
                        this.addCharacter(char);
                    } else {
                        if (this.reserverdWords.includes(this.auxChar)) {
                            this.addToken(Type.RESERVED_WORD, this.auxChar, this.row, this.column - this.auxChar.length);
                        } else {
                            // Si es un identificador, podrías tener un Type.IDENTIFIER
                            // Por ahora, si no es palabra reservada, lo dejas como UNKNOW según tu lógica original
                            this.addError(Type.UNKNOW, this.auxChar, this.row, this.column - this.auxChar.length);
                        }
                        this.clean();
                        i--; // Reevaluar el carácter actual en el estado 0
                    }
                    break;

                case 12: // Cadena (STRING)
                    this.addCharacter(char);
                    if (char === '"') {
                        // Se encontró la comilla de cierre
                        this.addToken(Type.STRING, this.auxChar, this.row, this.column - this.auxChar.length);
                        this.clean();
                    } else if (i === input.length - 1) { // Fin de archivo inesperado dentro de una cadena
                        this.addError(Type.UNKNOW, this.auxChar, this.row, this.column - this.auxChar.length);
                        this.clean();
                    }
                    // Si el carácter no es '"' y no es fin de archivo, sigue en el estado 12 (consumiendo la cadena)
                    break;

                // Los casos 1 al 9 no son necesarios como estados si solo consumen un carácter.
                // Pueden manejarse directamente en el case 0. He eliminado los estados intermedios.
            }
        }
        return this.tokenList;
    }

    private addCharacter(char: string) {
        this.auxChar += char;
        this.column++;
    }

    private clean() {
        this.state = 0;
        this.auxChar = '';
    }

    private addToken(type: Type, lexeme: string, row: number, column: number) {
        this.tokenList.push(new Token(type, lexeme, row, column));
    }

    private addError(type: Type, lexeme: string, row: number, column: number) {
        this.errorList.push(new Token(type, lexeme, row, column));
    }

    getErrorList() {
        return this.errorList;
    }

    getTokenList() {
        return this.tokenList;
    }
}

export { LexicalAnalyzer };