Scanner App for Scan Bluetooth Low Energy (BLE) using React Native Typescript.

To install the apps :
1. Clone this app using : git clone https://github.com/IzharuddinMalik/scannerble.git
2. Open the folder scannerble, then run npm i
3. Once install package is finished, then run npx react-native run-android to link the dependencies into android
4. After step 3 is finished, then run npx expo start, then reload the app

In this project we used dependencies such as :
1. @react-native-community/cli
2. expo-status-bar
3. react-native-ble-plx, this dependency is used to get Bluetooth Low Energy (BLE)

Let me drop step to developed this app:
1. Create components folder
2. Create BleProvider.tsx, This file is used to handle bluetooth permission, handle request location, set message, start scan and stop scan.
   ### Handle bluetooth permission
   ```tsx
   const requestBluetoothPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      const grantedScan = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
      );
      const grantedConnect = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
      );
      return (
        grantedScan === PermissionsAndroid.RESULTS.GRANTED &&
        grantedConnect === PermissionsAndroid.RESULTS.GRANTED
      );
    }
    return true;
   };
   ```

   ### handle request location
   ```tsx
    const requestPermissions = async (): Promise<boolean> => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Location permission is required to scan for BLE devices.');
          return false;
        }
      }
      return true;
    };
   ```

   ### Handle start scan
   ```tsx
   const startScan = async () => {
    if (isScanning) return;

    const hasLocationPermission = await requestPermissions();
    const hasBluetoothPermission = await requestBluetoothPermissions();
    if (!hasLocationPermission || !hasBluetoothPermission) return;

    setPeripherals([]);
    setIsScanning(true);
    setStatusMessage('Scanning for devices...'); // Set scanning feedback message
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error(error);
        setIsScanning(false);
        return;
      }
      if (device && device.id) {
        // Access the RSSI value and store only required properties
        const rssi = device.rssi; // Signal strength
        const peripheral: Peripheral = {
          id: device.id,
          name: device.name,
          rssi,
          serviceUUIDs: device.serviceUUIDs,
          manufacturerData: device.manufacturerData,
          mtu: device.mtu,
          rawScanRecord: device.rawScanRecord,
        };

        // Add the device to the peripherals list
        setPeripherals((prev) => {
          if (prev.some((p) => p.id === device.id)) return prev;
          return [...prev, peripheral];
        });
      }
    });

    setTimeout(() => stopScan(), 10000); // Stop scanning after 10 seconds
   };
   ```
   ### Handle stop scan
   ```tsx
   const stopScan = () => {
    manager.stopDeviceScan();
    setIsScanning(false);
    setStatusMessage('Scanning stopped');
   };
   ```

4. Create BleScanner.tsx, This file is used to handle UI, added button for doing scanning and stop scanning and added FlatList to retrieve peripherals info and showing into each item.
5. Create BleStatus.tsx, This file is used to handle status when we start scanning and stop scanning, this mean to inform us that application doing scanning and stop scanning.
6. Then modify App.tsx into below :
   ```tsx
    import React from 'react';
    import { BleProvider } from './component/BleProvider';
    import BleScanner from './component/BleScanner';
    import BleStatus from './component/BleStatus';
    
    const App: React.FC = () => {
      return (
        <BleProvider>
          <BleStatus />
          <BleScanner />
        </BleProvider>
      );
    };
    
    export default App;
