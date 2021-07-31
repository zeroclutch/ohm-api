/**
 * monitor.js
 * Monitor a sensor over a given interval
 */

const OpenHardwareMonitor = require('../lib/OpenHardwareMonitor.js')
const ohm = new OpenHardwareMonitor()

const INTERVAL_MS = 1000

console.log(ohm.sensorList)
console.log(ohm.hardware)
setInterval(() => console.log(ohm.hardware.HDD[0].sensors.Temperature.Temperature), INTERVAL_MS)
setInterval(() => console.log(ohm.hardware.GpuNvidia[0].sensors.Control['GPU Fan']), INTERVAL_MS)