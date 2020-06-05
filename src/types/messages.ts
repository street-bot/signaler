// Message type constants
export const RobotRegistrationMsgType = 'RReg';
export const ClientRegistrationMsgType = 'CReg';
export const ErrMsgType = 'err';

// WebSocket message type
export interface IWSMessage {
  type: string, 
  payload: any,
  toString(): string
}

// Robot registration message payload type
export interface IRobotRegistrationPayload {
  RobotID: string
}

export class WSMessage implements IWSMessage {
  type: string;
  payload: any;

  constructor() {
    this.type = "";
    this.payload = {}
  }

  public toString(): string {
    return JSON.stringify(this);
  } 
}

// Robot registration message 
export class RobotRegistrationMsg extends WSMessage {
  payload: IRobotRegistrationPayload;

  constructor(payload: any) {
    super()
    this.type = RobotRegistrationMsgType;
    this.payload = {RobotID: payload['RobotID']};
  }
}

// Client registration message 
export class ClientRegistrationMsg extends WSMessage {
  payload: IRobotRegistrationPayload;

  constructor(payload: any) {
    super();
    this.type = ClientRegistrationMsgType;
    this.payload = {RobotID: payload['RobotID']};
  }
}

export class ErrorMsg extends WSMessage {
  constructor(msg: string) {
    super();
    this.type = ErrMsgType;
    this.payload = msg;
  }
}