import * as types from "../types";

// Parse an input string into the appropriate message types
export function ParseMessage(input: string): types.IWSMessage{
  const parsedMsg = JSON.parse(input);
  switch (parsedMsg.Type) {
    case types.RobotRegistrationMsgType:
      return new types.RobotRegistrationMsg(parsedMsg['Payload']);
    case types.ClientRegistrationMsgType:
      return new types.ClientRegistrationMsg(parsedMsg['Payload']);
    case types.OfferMsgType:
      return new types.OfferMsg(parsedMsg['Payload']);
    case types.OfferResponseMsgType:
      return new types.OfferResponseMsg(parsedMsg['Payload']);
      
    default: 
      throw new Error(`unsupported type: ${parsedMsg.Type}`);
  } 
}