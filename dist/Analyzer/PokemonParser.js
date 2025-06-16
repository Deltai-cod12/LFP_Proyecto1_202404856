"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PokemonParser = void 0;
const Token_1 = require("./Token");
class PokemonParser {
    constructor(tokens) {
        this.jugadores = [];
        this.jugadorActual = null;
        this.tokens = tokens;
    }
    parse() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        let i = 0;
        while (i < this.tokens.length) {
            const token = this.tokens[i];
            // Detectar cabecera del jugador
            if (token.getType() === Token_1.Type.RESERVED_WORD &&
                token.getLexeme().toLowerCase() === "jugador" &&
                ((_a = this.tokens[i + 1]) === null || _a === void 0 ? void 0 : _a.getType()) === Token_1.Type.COLON &&
                ((_b = this.tokens[i + 2]) === null || _b === void 0 ? void 0 : _b.getType()) === Token_1.Type.STRING &&
                ((_c = this.tokens[i + 3]) === null || _c === void 0 ? void 0 : _c.getType()) === Token_1.Type.BRACE_OPEN) {
                // Si ya hay un jugador actual, agregarlo a la lista antes de crear uno nuevo
                if (this.jugadorActual) {
                    this.jugadores.push(this.jugadorActual);
                }
                const nombreToken = this.tokens[i + 2];
                this.jugadorActual = {
                    nombre: this.cleanString(nombreToken.getLexeme()),
                    pokemones: []
                };
                i += 4; // Saltar hasta el {
                continue;
            }
            // Detectar definicion de Pokémon (solo si hay jugador actual)
            if (this.jugadorActual &&
                token.getType() === Token_1.Type.STRING &&
                ((_d = this.tokens[i + 1]) === null || _d === void 0 ? void 0 : _d.getType()) === Token_1.Type.BRACKET_OPEN &&
                ((_e = this.tokens[i + 2]) === null || _e === void 0 ? void 0 : _e.getType()) === Token_1.Type.RESERVED_WORD &&
                ((_f = this.tokens[i + 3]) === null || _f === void 0 ? void 0 : _f.getType()) === Token_1.Type.BRACKET_CLOSE &&
                ((_g = this.tokens[i + 4]) === null || _g === void 0 ? void 0 : _g.getType()) === Token_1.Type.ASSIGN &&
                ((_h = this.tokens[i + 5]) === null || _h === void 0 ? void 0 : _h.getType()) === Token_1.Type.PAR_OPEN) {
                const nombrePokemon = this.cleanString(token.getLexeme());
                const tipo = this.tokens[i + 2].getLexeme().toLowerCase();
                const stats = {
                    salud: null,
                    ataque: null,
                    defensa: null
                };
                i += 6; // Posicionarse dentro del bloque de estadísticas
                // Leer las estadísticas
                while (i < this.tokens.length) {
                    if (((_j = this.tokens[i]) === null || _j === void 0 ? void 0 : _j.getType()) === Token_1.Type.BRACKET_OPEN &&
                        ((_k = this.tokens[i + 1]) === null || _k === void 0 ? void 0 : _k.getType()) === Token_1.Type.RESERVED_WORD &&
                        ((_l = this.tokens[i + 2]) === null || _l === void 0 ? void 0 : _l.getType()) === Token_1.Type.BRACKET_CLOSE &&
                        ((_m = this.tokens[i + 3]) === null || _m === void 0 ? void 0 : _m.getType()) === Token_1.Type.EQUAL &&
                        ((_o = this.tokens[i + 4]) === null || _o === void 0 ? void 0 : _o.getType()) === Token_1.Type.NUMBER &&
                        ((_p = this.tokens[i + 5]) === null || _p === void 0 ? void 0 : _p.getType()) === Token_1.Type.SEMICOLON) {
                        const nombreStat = this.tokens[i + 1].getLexeme().toLowerCase();
                        const valorStat = parseInt(this.tokens[i + 4].getLexeme());
                        if (["salud", "ataque", "defensa"].includes(nombreStat)) {
                            stats[nombreStat] = valorStat;
                        }
                        i += 6;
                        continue;
                    }
                    if (((_q = this.tokens[i]) === null || _q === void 0 ? void 0 : _q.getType()) === Token_1.Type.PAR_CLOSE) {
                        i++; // Salir del bloque del Pokémon
                        break;
                    }
                    console.warn("Estructura inesperada dentro del bloque del Pokémon:", this.tokens[i]);
                    break;
                }
                // Verificar que los stats estén completos antes de agregar
                if (stats.salud !== null && stats.ataque !== null && stats.defensa !== null) {
                    this.jugadorActual.pokemones.push({
                        nombre: nombrePokemon,
                        tipo,
                        salud: stats.salud,
                        ataque: stats.ataque,
                        defensa: stats.defensa
                    });
                }
                else {
                    console.warn(`Pokémon "${nombrePokemon}" con estadísticas incompletas. No sera agregado.`);
                }
                continue;
            }
            i++; // Incrementar manualmente
        }
        // Agregar el ultimo jugador encontrado si existe
        if (this.jugadorActual) {
            this.jugadores.push(this.jugadorActual);
            this.jugadorActual = null;
        }
        return this.jugadores;
    }
    cleanString(cadena) {
        return cadena.replace(/^"|"$/g, "");
    }
    // Calcuo de los IVS
    calcularIVs(pokemones) {
        return pokemones.map(pokemon => {
            const iv = ((pokemon.salud + pokemon.ataque + pokemon.defensa) / 45) * 100;
            return Object.assign(Object.assign({}, pokemon), { iv });
        });
    }
    //Los 6 mejores pokemons por IVS
    seleccionarMejoresSeis(pokemones) {
        const mejoresPorTipo = new Map();
        for (const pkm of pokemones) {
            const tipo = pkm.tipo.toLowerCase();
            if (!mejoresPorTipo.has(tipo)) {
                mejoresPorTipo.set(tipo, pkm);
            }
            else {
                const existente = mejoresPorTipo.get(tipo);
                if (pkm.iv > existente.iv) {
                    mejoresPorTipo.set(tipo, pkm);
                }
            }
        }
        // Ordenar por IV descendente 
        return Array.from(mejoresPorTipo.values())
            .sort((a, b) => b.iv - a.iv)
            .slice(0, 6);
    }
}
exports.PokemonParser = PokemonParser;
