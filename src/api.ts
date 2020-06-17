import express from "express";
import { version, iceServers } from './routes';

export const router: express.Router = express.Router()

router.get('/version', version)
router.get('/iceservers', iceServers)