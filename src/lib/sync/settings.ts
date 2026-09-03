import type { Defaults } from '../defaults'

export type VersionedSettings = { revision: number; payload: Defaults }

export function chooseSettingsRecord(left: VersionedSettings, right: VersionedSettings): VersionedSettings {
  return left.revision >= right.revision ? left : right
}
