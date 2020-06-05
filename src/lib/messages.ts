import { IWSMessage, RobotRegistrationMsgType, RobotRegistrationMsg, ClientRegistrationMsgType, ClientRegistrationMsg } from "../types";

// Parse an input string into the appropriate message types
export function ParseMessage(input: string): IWSMessage{
  const parsedMsg = JSON.parse(input);
  switch (parsedMsg.Type) {
    case RobotRegistrationMsgType:
      return new RobotRegistrationMsg(parsedMsg['Payload']);
    case ClientRegistrationMsgType:
      return new ClientRegistrationMsg(parsedMsg['Payload']);
      
    default: 
      throw new Error(`unsupported type: ${parsedMsg.Type}`);
  } 
}