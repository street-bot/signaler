// eslint-disable @typescript-eslint/explicit-module-boundary-types
import WebSocket from "ws";

export interface ConnectionTableEntry {
  Robot: ExtendedWebSocket, 
  Client: ExtendedWebSocket | undefined
}

export const ClientType = 'Client';
export const RobotType = 'Robot';

export class ExtendedWebSocket extends WebSocket {
  RobotID: string;
  Type: string; 

  // @ts-expect-error
  constructor(...args) {
    // @ts-expect-error
    super(...args);
    this.RobotID = "";
    this.Type = "";
  }
}