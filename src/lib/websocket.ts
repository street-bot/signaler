import WebSocket from 'ws';
import * as http from 'http';
import { ParseMessage } from './messages';
import {Logger} from 'pino';
import * as types from '../types';

export class WSTransport {
  private wss: WebSocket.Server;
  private logger: Logger;
  private connTable: Map<string, types.ConnectionTableEntry>;

  constructor(server: http.Server, logger: Logger, connTable: Map<string, types.ConnectionTableEntry>) {
    this.logger = logger;
    this.wss = new WebSocket.Server({server});
    this.connTable = connTable;
  }

  private handleRobotDeregistration(ws: types.ExtendedWebSocket) {
    const connectionEntry = this.connTable.get(ws.RobotID);
    if (connectionEntry) {
      if(connectionEntry.Client?.RobotID) {
        // Inform the client that the robot has been disconnected
        const dregMsg = new types.RobotDeregistrationMsg(connectionEntry.Client.RobotID);
        connectionEntry.Client.send(dregMsg.ToString());
        // Dessociate any connected clients
        connectionEntry.Client.RobotID = "";
      }
      this.connTable.delete(ws.RobotID);
      this.logger.info(`Deregistered robot ${ws.RobotID}`);
    } else {
      this.logger.warn('Robot disconnected without a valid connection entry');
    }
  }

  private handleClientDeregistration(ws: types.ExtendedWebSocket) {
    if (ws.RobotID !== "") {
      // The client is associated with a robot
      const connEntry = this.connTable.get(ws.RobotID);
      if (connEntry){
        const dregMsg = new types.ClientDeregistrationMsg();
        connEntry.Robot.send(dregMsg.ToString()); // Tell the robot that the client has disconnected
        connEntry.Client = undefined;
      } else {
        this.logger.error(`Client WebSocket associated with robot ${ws.RobotID} without the corresponding connection entry!`);
      }

      this.logger.info(`Successfully deregistered client ${ws.RobotID}`);
      ws.RobotID = "";
    }

    // The client is not associated with any robots
  }

  private handleRobotRegistration(ws: types.ExtendedWebSocket, payload: types.IRobotRegistrationPayload) {
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

  private handleClientRegistration(ws: types.ExtendedWebSocket, payload: types.IRobotRegistrationPayload) {
    const robotEntry = this.connTable.get(payload.RobotID)
    if (robotEntry) {
      robotEntry.Client = ws;
      this.connTable.set(payload.RobotID, robotEntry);
      ws.RobotID = payload.RobotID; // Set the RobotID associated with this WebSocket connection
      this.logger.info(`Registered client on robot: ${payload.RobotID}`);
      const successResponse = new types.WSMessage();
      successResponse.Type = types.RegSuccessType;
      successResponse.Payload = payload;  // Reflect the RobotID payload
      ws.send(successResponse.ToString());
    } else {
      throw new Error(`RobotID ${payload.RobotID} not registered on signaling relay`);
    }
  }

  private handleOffer(ws: types.ExtendedWebSocket, parsedMsg: types.OfferMsg) {
    if(ws.RobotID === '') {
      throw new Error('Cannot send offer; client is not registered with any RobotID');
    }

    const connEntry = this.connTable.get(ws.RobotID);
    if (connEntry) {
      if(connEntry.Robot.readyState === WebSocket.OPEN){
        connEntry.Robot.send(parsedMsg.ToString()); // Relay the message as-is
        this.logger.info(`Relayed offer for ${ws.RobotID}`);
      } else {
        throw new Error(`Robot ${ws.RobotID} websocket is not in non-OPEN state: ${connEntry.Robot.readyState}`);
      }
    } else {
      throw new Error(`Could not find entry in connection table for ${ws.RobotID}`);
    }
  }

  private handleOfferResponse(ws: types.ExtendedWebSocket, parsedMsg: types.OfferResponseMsg) {
    if(ws.RobotID === '') {
      throw new Error('Cannot send offer; robot is not registered yet');
    }

    const connEntry = this.connTable.get(ws.RobotID);
    if (connEntry) {
      if(connEntry.Client?.readyState === WebSocket.OPEN){
        connEntry.Client.send(parsedMsg.ToString()); // Relay the message as-is
        this.logger.info(`Relayed offer resposne for ${ws.RobotID}`);
      } else {
        throw new Error(`Client ${ws.RobotID} websocket is not in non-OPEN state: ${connEntry.Robot.readyState}`);
      }
    } else {
      throw new Error(`Could not find entry in connection table for ${ws.RobotID}`);
    }
  }

  public register(): void {
    this.wss.on('connection', (ws: types.ExtendedWebSocket) => {
      this.logger.info('A client connected!');

      // // Keep-alive ping echoes
      // ws.on('ping', () => {
      //   this.logger.info("ping");
      // })

      ws.on('message', (msg: string) => {
        try {
          const parsedMsg = ParseMessage(msg);
          switch(parsedMsg.Type) {
            // Registration
            case types.RobotRegistrationMsgType:
              ws.Type = types.RobotType;    // Set WebSocket connection type
              this.handleRobotRegistration(ws, parsedMsg.Payload);
              break;
            case types.ClientRegistrationMsgType:
              ws.Type = types.ClientType;   // Set WebSocket connection type
              this.handleClientRegistration(ws, parsedMsg.Payload);
              break;

            // Offer negotiation
            case types.OfferMsgType:
              this.handleOffer(ws, parsedMsg);
              break;
            case types.OfferResponseMsgType:
              this.handleOfferResponse(ws, parsedMsg);
              break;

          }
        } catch (e) {
          this.logger.error(e);
          ws.send(JSON.stringify(new types.ErrorMsg(e.message)));
        }
      });

      // Register/Deregister robot and client
      ws.on('close', (code: number, reason: string) => {
        switch(ws.Type) {
          case types.RobotType:
            this.logger.info(`${types.RobotType} disconnected due to ${code.toString()}:${reason}`);
            this.handleRobotDeregistration(ws);
            break;
          case types.ClientType:
            this.logger.info(`${types.ClientType} disconnected due to ${code.toString()}:${reason}`);
            this.handleClientDeregistration(ws);
            break;
          default:
            this.logger.warn('Unregistered client disconnected!');
        }
      })
    })
  }
}