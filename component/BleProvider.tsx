import React, { createContext, useContext, useEffect, useState, PropsWithChildren } from 'react';
import { BleManager, Device } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform, Alert } from 'react-native';

interface Peripheral {
  id: string;
  name: string | null;
  rssi: number | null;
  serviceUUIDs: string[] | null;
  manufacturerData: string | null;
  mtu: number;
  rawScanRecord: string;
}

interface BleContextType {
  peripherals: Peripheral[];
  isScanning: boolean;
  startScan: () => Promise<void>;
  stopScan: () => void;
  statusMessage: string | null;
}

const BleContext = createContext<BleContextType | undefined>(undefined);

export const BleProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [manager] = useState(new BleManager());
  const [peripherals, setPeripherals] = useState<Peripheral[]>([]); // Use custom Peripheral type
  const [isScanning, setIsScanning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      manager.destroy();
    };
  }, [manager]);

  // Request Bluetooth permissions for Android 12 and above
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

  // Request location permission for Android and iOS
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

  // Start scanning for peripherals
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

  const stopScan = () => {
    manager.stopDeviceScan();
    setIsScanning(false);
    setStatusMessage('Scanning stopped');
  };

  return (
    <BleContext.Provider value={{ peripherals, isScanning, startScan, stopScan, statusMessage  }}>
      {children}
    </BleContext.Provider>
  );
};

export const useBle = (): BleContextType => {
  const context = useContext(BleContext);
  if (!context) {
    throw new Error('useBle must be used within a BleProvider');
  }
  return context;
};