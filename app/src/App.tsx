import { Routes, Route } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';
import { DeviceDetail } from '@/pages/DeviceDetail';
import { Settings } from '@/pages/Settings';
import { Header } from '@/components/Header';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/device/:deviceId" element={<DeviceDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;