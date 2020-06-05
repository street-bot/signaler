import WebSocket from 'ws';
import * as http from 'http';
import { ParseMessage } from './messages';
import {Logger} from 'pino';
import { RobotRegistrationMsgType, ConnectionTableEntry, IRobotRegistrationPayload, ClientRegistrationMsgType, ErrorMsg, ExtendedWebSocket, RobotType, ClientType} from '../types';

export class WSTransport {
  private wss: WebSocket.Server;
  private logger: Logger;
  private connTable: Map<string, ConnectionTableEntry>;

  constructor(server: http.Server, logger: Logger, connTable: Map<string, ConnectionTableEntry>) {
    this.logger = logger;
    this.wss = new WebSocket.Server({server});
    this.connTable = connTable;
  }

  private handleRobotDeregistration(ws: ExtendedWebSocket) {
    const connectionEntry = this.connTable.get(ws.RobotID);
    if (connectionEntry) {
      if(connectionEntry.Client?.RobotID) {
        // Dessociate any connected clients
        connectionEntry.Client.RobotID = "";
      }
      this.connTable.delete(ws.RobotID);
      this.logger.info(`Deregistered robot ${ws.RobotID}`);
    } else {
      this.logger.warn('Robot disconnected without a valid connection entry');
    }
  }

  private handleClientDeregistration(ws: ExtendedWebSocket) {
    if (ws.RobotID !== "") {
      // The client is associated with a robot
      const connEntry = this.connTable.get(ws.RobotID);
      if (connEntry){
        connEntry.Client = undefined;
      } else {
        this.logger.error(`Client WebSocket associated with robot ${ws.RobotID} without the corresponding connection entry!`);
      }

      ws.RobotID = "";
    }

    // The client is not associated with any robots
  }

  private handleRobotRegistration(ws: ExtendedWebSocket, payload: IRobotRegistrationPayload) {
    const entry = {
      Robot: ws,
      Client: undefined
    }
    if(this.connTable.get(payload.RobotID)) {
      throw new Error(`RobotID ${payload.RobotID} is already registered!`)
    }
    this.connTable.set(payload.RobotID, entry); // Set the connection Table with the RobotID and WebSocket object(s)
    ws.RobotID = payload.RobotID;               // Set the RobotID associated with this WebSocket connection
    this.logger.info(`Registered robot: ${payload.RobotID}`);
  }

  private handleClientRegistration(ws: ExtendedWebSocket, payload: IRobotRegistrationPayload) {
    const robotEntry = this.connTable.get(payload.RobotID)
    if (robotEntry) {
      robotEntry.Client = ws;
      this.connTable.set(payload.RobotID, robotEntry);
      ws.RobotID = payload.RobotID; // Set the RobotID associated with this WebSocket connection
      this.logger.info(`Registered client on robot: ${payload.RobotID}`);
    } else {
      throw new Error(`RobotID ${payload.RobotID} not registered on signaling relay`);
    }
  }

  public register(): void {
    this.wss.on('connection', (ws: ExtendedWebSocket) => {
      this.logger.info('A client connected!');
      ws.on('message', (msg: string) => {
        try {
          const parsedMsg = ParseMessage(msg);
          switch(parsedMsg.Type) {
            case RobotRegistrationMsgType:
              ws.Type = RobotType;    // Set WebSocket connection type
              this.handleRobotRegistration(ws, parsedMsg.Payload);
              break;
            case ClientRegistrationMsgType:
              ws.Type = ClientType;   // Set WebSocket connection type
              this.handleClientRegistration(ws, parsedMsg.Payload);
              break;
          }
        } catch (e) {
          this.logger.error(e);
          ws.send(JSON.stringify(new ErrorMsg(e.message)));
        }
      });

      // Register/Deregister robot and client
      ws.on('close', (code: number, reason: string) => {
        switch(ws.Type) {
          case RobotType: 
            this.logger.info(`${RobotType} disconnected due to ${code.toString()}:${reason}`);
            this.handleRobotDeregistration(ws);
            break;
          case ClientType: 
            this.logger.info(`${ClientType} disconnected due to ${code.toString()}:${reason}`);
            this.handleClientDeregistration(ws);
            break;
          default: 
            this.logger.warn('Unregistered client disconnected!');
        }
      })
    })
  }
}