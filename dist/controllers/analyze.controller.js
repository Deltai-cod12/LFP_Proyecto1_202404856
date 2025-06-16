"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorReport = exports.analyze = exports.home = void 0;
const LexicalAnalyzer_1 = require("../Analyzer/LexicalAnalyzer");
const PokemonParser_1 = require("../Analyzer/PokemonParser");
const pokeapi_1 = require("../utils/pokeapi");
let lastLexicalErrors = [];
const home = (_req, res) => {
    res.render('pages/index', {
        tokens: [],
        errors: [],
        codigo: '',
        contador: 0,
        jugadores: [] // cambiar player a jugadores (array)
    });
};
exports.home = home;
const analyze = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const input = req.body.txtArea || '';
    const lexicalAnalyzer = new LexicalAnalyzer_1.LexicalAnalyzer();
    const tokenList = lexicalAnalyzer.scanner(input);
    const rawErrorList = lexicalAnalyzer.getErrorList();
    lastLexicalErrors = rawErrorList.map((errorToken) => ({
        fila: errorToken.getRow(),
        columna: errorToken.getColumn(),
        lexema: errorToken.getLexeme(),
        token: errorToken.getTypeTokenString()
    }));
    const tokensToSend = tokenList.map(token => ({
        fila: token.getRow(),
        columna: token.getColumn(),
        lexema: token.getLexeme(),
        token: token.getTypeTokenString()
    }));
    let jugadores = [];
    function calcularIV(pokemon) {
        return ((pokemon.salud + pokemon.ataque + pokemon.defensa) / 45) * 100;
    }
    if (lastLexicalErrors.length === 0) {
        try {
            const parser = new PokemonParser_1.PokemonParser(tokenList);
            jugadores = parser.parse();
            jugadores = yield Promise.all(jugadores.map((jugador) => __awaiter(void 0, void 0, void 0, function* () {
                const pokemonesConIV = yield Promise.all(jugador.pokemones.map((p) => __awaiter(void 0, void 0, void 0, function* () {
                    return (Object.assign(Object.assign({}, p), { iv: calcularIV(p), sprite: (yield (0, pokeapi_1.obtenerSprite)(p.nombre.toLowerCase())) || '' }));
                })));
                pokemonesConIV.sort((a, b) => b.iv - a.iv);
                const seleccionados = [];
                const tiposUsados = new Set();
                for (const p of pokemonesConIV) {
                    if (!tiposUsados.has(p.tipo)) {
                        seleccionados.push(p);
                        tiposUsados.add(p.tipo);
                    }
                    if (seleccionados.length === 6)
                        break;
                }
                return {
                    nombre: jugador.nombre,
                    pokemones: seleccionados
                };
            })));
        }
        catch (e) {
            console.error('Error al parsear:', e);
        }
    }
    console.log(JSON.stringify(jugadores, null, 2));
    res.render('pages/index', {
        tokens: tokensToSend,
        errors: rawErrorList,
        codigo: input,
        contador: tokensToSend.length,
        jugadores
    });
});
exports.analyze = analyze;
const errorReport = (_req, res) => {
    res.render('pages/errores', {
        erroresLexicos: lastLexicalErrors
    });
};
exports.errorReport = errorReport;
