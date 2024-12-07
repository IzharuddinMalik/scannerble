import React from 'react';
import { FlatList, View, Text, Button, StyleSheet } from 'react-native';
import { useBle } from './BleProvider';
import { Device } from 'react-native-ble-plx';

const BleScanner: React.FC = () => {
  const { peripherals, isScanning, startScan, stopScan } = useBle();

  const renderItem = ({ item }: { item: Device }) => (
    <View style={styles.deviceItem}>
      <Text style={styles.deviceName}>{item.name || 'Unnamed Device'}</Text>
      <Text style={styles.deviceId}>{item.id}</Text>
      <Text style={styles.deviceId}>Signal Strenght: {item.rssi} ms</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.button}>
        <Button title={isScanning ? 'Stop Scanning' : 'Start Scanning'} onPress={isScanning ? stopScan : startScan} />
      </View>
      <FlatList
        data={peripherals as Device[]}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  deviceItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  deviceName: { fontSize: 16, fontWeight: 'bold' },
  deviceId: { fontSize: 12, color: '#555' },
  noDevices: { textAlign: 'center', marginTop: 20, fontSize: 16 },
  button:{marginTop: 40}
});

export default BleScanner;