console.log("APP.JS INIT");import UIKit
import CoreBluetooth

class ViewController: UIViewController, CBCentralManagerDelegate, CBPeripheralDelegate {

    var centralManager: CBCentralManager!
    var peripheral: CBPeripheral!

    var characteristic: CBCharacteristic?

    @IBOutlet weak var statusLabel: UILabel!
    @IBOutlet weak var receiveButton: UIButton!
    @IBOutlet weak var repeatButton: UIButton!

    var lastReceivedData: Data?

    override func viewDidLoad() {
        super.viewDidLoad()
        // Initialize central manager with delegate
        centralManager = CBCentralManager(delegate: self, queue: nil)
    }

    // Start scanning for devices when view appears
    override func viewDidAppear(_ animated: Bool) {
        scanForDevices()
    }

    // Scan for devices with service UUID
    func scanForDevices() {
        let serviceUUIDs: [CBUUID] = [CBUUID(string: "YOUR_SERVICE_UUID")]
        centralManager.scanForPeripherals(withServices: serviceUUIDs, options: nil)
        statusLabel.text = "Scanning for devices..."
    }

    // Stop scanning when view disappears
    override func viewDidDisappear(_ animated: Bool) {
        centralManager.stopScan()
    }

    // Connect to selected peripheral
    func connect(to peripheral: CBPeripheral) {
        centralManager.stopScan()
        self.peripheral = peripheral
        peripheral.delegate = self
        centralManager.connect(peripheral)
        statusLabel.text = "Connecting to device..."
    }

    // Discover services on connected peripheral
    func discoverServices(on peripheral: CBPeripheral) {
        peripheral.discoverServices(nil)
        statusLabel.text = "Discovering services..."
    }

    // Discover characteristics for service
    func discoverCharacteristics(for service: CBService) {
        peripheral.discoverCharacteristics(nil, for: service)
        statusLabel.text = "Discovering characteristics..."
    }

    // Send data over characteristic
    func sendData(data: Data) {
        if let characteristic = characteristic {
            peripheral.writeValue(data, for: characteristic, type: .withResponse)
            statusLabel.text = "Sent data: \(data.hexEncodedString())"
        }
    }

    // Handle button press to receive data
    @IBAction func receiveButtonPressed(_ sender: UIButton) {
        if let characteristic = characteristic {
            peripheral.readValue(for: characteristic)
            statusLabel.text = "Receiving data..."
        }
    }

    // Handle button press to repeat last received data
    @IBAction func repeatButtonPressed(_ sender: UIButton) {
        if let lastReceivedData = lastReceivedData {
            sendData(data: lastReceivedData)
            statusLabel.text = "Repeating last received data: \(lastReceivedData.hexEncodedString())"
        }
    }

    // MARK: - CBCentralManagerDelegate methods

    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        if central.state == .poweredOn {
            scanForDevices()
        } else {
            statusLabel.text = "Bluetooth is not turned on."
        }
    }

    func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
        connect(to: peripheral)
    }

    func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
        discoverServices(on: peripheral)
    }

    func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
        if let service = peripheral.services?.first {
            discoverCharacteristics(for: service)
        }
    }

    func peripheral(_ peripheral: CBPeripheral, didDiscover


import "./switcher";
