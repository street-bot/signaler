import { Request, Response } from 'express';
import iceServerData from '../config/iceServers.json';

export function iceServers(_: Request, res: Response): void {
  res.json({
    iceServers: iceServerData,
  });
}