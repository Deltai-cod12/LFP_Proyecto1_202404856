import { Router } from 'express';
import { home, analyze, errorReport } from '../controllers/analyze.controller';
import { renderPensum } from '../controllers/analyze.controller';


const analyzeRouter = Router();

analyzeRouter.get('/', home);
analyzeRouter.post('/analyze', analyze);
analyzeRouter.post('/error-report', errorReport)
analyzeRouter.post('/pensum', renderPensum);
export default analyzeRouter;