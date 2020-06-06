import {VersionObj} from '../controller'

export function version(req: any, res: any): void {
  res.json(VersionObj())
}