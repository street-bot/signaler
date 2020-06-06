import express from "express";
import cors from "cors";
import {router} from './api';
import * as bodyParser from 'body-parser';
import * as http from "http";
import { WSTransport } from "./lib/websocket";
import { Logger } from 'pino';
import { createLogger } from './log';
import { ConnectionTableEntry } from "./types";

export class SignalServer {
    private port: number
    private httpServer: http.Server
    private app: express.Application
    private rt: WSTransport
    private logger: Logger;
    private connTable: Map<string, ConnectionTableEntry>;

    constructor() {
        this.app = express();
        this.registerMiddlewares();
        this.registerUnauthenticatedRoutes();
        this.logger = createLogger();
        this.connTable = new Map<string, ConnectionTableEntry>();

        this.port = 8080;
        this.httpServer = http.createServer(this.app);
        this.rt = new WSTransport(this.httpServer, this.logger, this.connTable);
    }

    public start(): void {
        this.rt.register();
        this.httpServer.listen(this.port, () => {
            console.log("Running server on port %s", this.port);
        });
    }

    private registerMiddlewares() {
        this.app.use(cors());
        this.app.use(bodyParser.json());
    }

    private registerUnauthenticatedRoutes() {
        this.app.use('/', router)
    }
}