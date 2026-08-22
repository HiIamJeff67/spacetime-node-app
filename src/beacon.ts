import type { BeaconObservation } from './api'

export type { BeaconObservation } from './api'

type BluetoothLEScan = { stop: () => void }

type BluetoothAdvertisementEvent = Event & {
  manufacturerData?: Map<number, DataView>
}

type BluetoothScanner = EventTarget & {
  requestLEScan: (options: {
    filters: Array<{
      manufacturerData: Array<{
        companyIdentifier: number
        dataPrefix?: Uint8Array
      }>
    }>
    keepRepeatedDevices?: boolean
  }) => Promise<BluetoothLEScan>
}

function scanner(): BluetoothScanner | null {
  if (!window.isSecureContext) return null
  const bluetooth = (navigator as Navigator & { bluetooth?: BluetoothScanner }).bluetooth
  return bluetooth && typeof bluetooth.requestLEScan === 'function' ? bluetooth : null
}

export function supportsBeaconScan() {
  return scanner() !== null
}

function formatUUID(bytes: Uint8Array) {
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`.toUpperCase()
}

function parseIBeacon(data: DataView): BeaconObservation | null {
  if (data.byteLength < 25 || data.getUint8(0) !== 0x02 || data.getUint8(1) !== 0x15) return null
  const bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
  return {
    uuid: formatUUID(bytes.slice(2, 18)),
    major: data.getUint16(18, false),
    minor: data.getUint16(20, false),
    power: data.getInt8(24),
  }
}

export async function startBeaconScan(onDetected: (observation: BeaconObservation) => void) {
  const bluetooth = scanner()
  if (!bluetooth) {
    throw new Error(window.isSecureContext ? '此 Chrome 環境不支援 Beacon 廣播掃描' : 'Beacon 掃描需要 HTTPS')
  }

  let scan: BluetoothLEScan | null = null
  let stopped = false
  const stop = () => {
    if (stopped) return
    stopped = true
    scan?.stop()
    bluetooth.removeEventListener('advertisementreceived', handleAdvertisement)
  }
  const handleAdvertisement = (event: Event) => {
    const data = (event as BluetoothAdvertisementEvent).manufacturerData?.get(0x004c)
    const observation = data ? parseIBeacon(data) : null
    if (observation) {
      onDetected(observation)
      stop()
    }
  }

  bluetooth.addEventListener('advertisementreceived', handleAdvertisement)
  try {
    scan = await bluetooth.requestLEScan({
      filters: [{
        manufacturerData: [{
          // Apple iBeacon advertisement: 0x02 0x15 + UUID/Major/Minor/Power.
          companyIdentifier: 0x004c,
          dataPrefix: new Uint8Array([0x02, 0x15]),
        }],
      }],
      keepRepeatedDevices: true,
    })
  } catch (error) {
    stop()
    throw error
  }
  if (stopped) scan.stop()
  return stop
}
