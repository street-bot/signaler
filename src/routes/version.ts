import {VersionObj} from '../controller'
import { Request, Response } from 'express'

export function version(_: Request, res: Response): void {
  res.json(VersionObj())
}