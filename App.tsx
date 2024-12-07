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