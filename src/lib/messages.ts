import { IWSMessage, RobotRegistrationMsgType, RobotRegistrationMsg } from "../types";

// Parse an input string into the appropriate message types
export function ParseMessage(input: string): IWSMessage{
  const parsedMsg = JSON.parse(input);
  switch (parsedMsg.type) {
    case RobotRegistrationMsgType:
      return new RobotRegistrationMsg(parsedMsg['payload']);

    default: 
      throw new Error(`unsupported type: ${parsedMsg.type}`);
  } 
}