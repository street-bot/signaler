// Message type constants
export const RobotRegistrationMsgType = 'RReg';
export const ClientRegistrationMsgType = 'CReg';
export const OfferMsgType = 'Offer';
export const OfferResponseMsgType = 'OfferResponse';
export const ErrMsgType = 'Err';
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

// SDP payload type
export interface ISDPPayload {
  SDPStr: string
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

// SDP Offer message 
export class OfferMsg extends WSMessage {
  Payload: ISDPPayload;

  constructor(payload: any) {
    super();
    this.Type = OfferMsgType;
    this.Payload = {SDPStr: payload['SDPStr']};
  }
}

// SDP Response message 
export class OfferResponseMsg extends WSMessage {
  Payload: ISDPPayload;

  constructor(payload: any) {
    super();
    this.Type = OfferResponseMsgType;
    this.Payload = {SDPStr: payload['SDPStr']};
  }
}

export class ErrorMsg extends WSMessage {
  constructor(msg: string) {
    super();
    this.Type = ErrMsgType;
    this.Payload = msg;
  }
}