const ActiveX = require('winax');
const HardwareCollection = require('./HardwareCollection.js');

/**
 * @name OpenHardwareMonitor
 * Represents an OpenHardwareMonitor API client.
 * OpenHardwareMonitor#hardware
    Device (CPU)
    |--Sensor Type (Temperature)
       |--Sensor (CPU Core)
          |--Value
          |--[Min]
          |--[Max]
 * @class
 */
class OpenHardwareMonitor {
  /**
   * @returns OpenHardwareMonitor
   */
  constructor() {
    this.conn = new ActiveX.Object('WbemScripting.SWbemLocator');
    this.svr = this.conn.ConnectServer('.', 'root\\OpenHardwareMonitor');

    this.hardware = {}

    this.refreshDevices()
  }

  /**
   * Refreshes the devices
   */
  refreshDevices() {
    this.hardwareList
    .forEach(hardware => {
      // Hardware contains a collection of each hardware type (CPU, GPU, Ram)
      if(!this.hardware[hardware.HardwareType]) {
        this.hardware[hardware.HardwareType] = new HardwareCollection()
      }

      // Device is a discrete and unique hardware device
      let device = {}
      device.name = hardware.Name
      device.identifier = hardware.Identifier
      device.type = hardware.HardwareType
      device.instanceId = hardware.InstanceId

      // Construct sensor list
      let sensors = this.query(`SELECT * FROM Sensor WHERE Parent = "${hardware.Identifier}"`)

      device.sensors = {}

      sensors.forEach(sensor => {
        if(!device.sensors[sensor.SensorType]) {
          device.sensors[sensor.SensorType] = {}
        }

        Object.defineProperty(device.sensors[sensor.SensorType], sensor.Name, {
          get: () => this.query(`SELECT * FROM Sensor WHERE (Parent = "${hardware.Identifier}") AND (Name = "${sensor.Name}")`)[0],
          enumerable: true,
          configurable: true
        })
      })

      this.hardware[hardware.HardwareType].push(device)
    })
  }

  /**
   * Query the database to get hardware information
   * @param {String} queryString An SQL query string
   * @returns {Array<Object>} An array of query response objects
   * @method
   * @public
   */
  query(queryString) {
    const results = [];
    const queryResponse = this.svr.ExecQuery(queryString);

    for (let i = 0; i < queryResponse.Count; i += 1) {
      const properties = queryResponse.ItemIndex(i).Properties_;
      let count = properties.Count;
      const propEnum = properties._NewEnum;
      const obj = {};

      while (count) {
        count -= 1;
        const prop = propEnum.Next(1);
        obj[prop.Name] = prop.Value;
      }
      
      results.push(obj);
    }

    return results;
  }

  get hardwareList() {
    return this.query('Select * from Hardware');
  }

  get sensorList() {
    return this.query('SELECT * FROM Sensor')
  }
}

module.exports = OpenHardwareMonitor;