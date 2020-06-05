import express from "express";
import {version} from './routes';

export const router: express.Router = express.Router()

router.get('/version', version)