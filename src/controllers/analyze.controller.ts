import { Request, Response } from 'express';
import { LexicalAnalyzer } from '../Analyzer/LexicalAnalyzer';
import { Token } from '../Analyzer/Token';
import { extraerPensum } from '../Analyzer/PensumParser';



let lastLexicalErrors: { fila: number; columna: number; lexema: string; token: string }[] = [];

export const home = (_req: Request, res: Response) => {
    res.render('pages/index', {
        tokens: [],
        errors: [],
        codigo: '',
        contador: 0
    });
};

export const analyze = (req: Request, res: Response) => {
    const input = req.body.txtArea || '';
    const pensumExtraido = extraerPensum(input);
    const lexicalAnalyzer = new LexicalAnalyzer();
    const tokenList = lexicalAnalyzer.scanner(input);
    const rawErrorList = lexicalAnalyzer.getErrorList();

    lastLexicalErrors = rawErrorList.map((errorToken: Token) => ({
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

    res.render('pages/index', {
        tokens: tokensToSend,
        errors: rawErrorList,
        codigo: input,
        contador: tokensToSend.length,
        carrera: pensumExtraido.carrera,
        semestres: pensumExtraido.semestres,
        tokenListScript: `<script>window.tokenList = ${JSON.stringify(tokensToSend)};</script>`
    });
};

export const errorReport = (_req: Request, res: Response) => {
    res.render('pages/errores', {
        erroresLexicos: lastLexicalErrors
    });
};


export const renderPensum = (req: Request, res: Response) => {
    const input = req.body.txtArea || '';

    const { carrera, semestres } = extraerPensum(input);

    res.render('pages/pensum', {
        carrera,
        semestres
    });
};