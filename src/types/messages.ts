// Message type constants
export const RobotRegistrationMsgType = 'RReg';
export const ClientRegistrationMsgType = 'CReg';
export const ErrMsgType = 'err';
export const RegSuccessType = 'RegSuccess';

// WebSocket message type
export interface IWSMessage {
  Type: string, 
  Payload: any,
  ToString(): string
}

// Robot registration message payload type
export interface IRobotRegistrationPayload {
  RobotID: string
}

export class WSMessage implements IWSMessage {
  Type: string;
  Payload: any;

  constructor() {
    this.Type = "";
    this.Payload = {}
  }

  public ToString(): string {
    return JSON.stringify(this);
  } 
}

// Robot registration message 
export class RobotRegistrationMsg extends WSMessage {
  Payload: IRobotRegistrationPayload;

  constructor(payload: any) {
    super()
    this.Type = RobotRegistrationMsgType;
    this.Payload = {RobotID: payload['RobotID']};
  }
}

// Client registration message 
export class ClientRegistrationMsg extends WSMessage {
  Payload: IRobotRegistrationPayload;

  constructor(payload: any) {
    super();
    this.Type = ClientRegistrationMsgType;
    this.Payload = {RobotID: payload['RobotID']};
  }
}

export class ErrorMsg extends WSMessage {
  constructor(msg: string) {
    super();
    this.Type = ErrMsgType;
    this.Payload = msg;
  }
}