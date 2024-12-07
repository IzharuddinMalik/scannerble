import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useBle } from './BleProvider';

const BleStatus = () => {
  const { statusMessage } = useBle();

  return (
    <View style={styles.statusContainer}>
      {statusMessage && <Text style={styles.statusText}>{statusMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  statusContainer: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  statusText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default BleStatus;