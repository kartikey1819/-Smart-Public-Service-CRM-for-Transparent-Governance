import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AppProvider } from './context/AppContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import ComplaintDetails from './pages/ComplaintDetails';
import Analytics from './pages/Analytics';
import TraceGrievance from './pages/TraceGrievance';
import CitizenDashboard from './pages/CitizenDashboard';

// Custom Ant Design theme to match government style
const themeConfig = {
  token: {
    colorPrimary: '#138808', // gov-green
    borderRadius: 12,
    fontFamily: 'Inter, system-ui, sans-serif',
    colorBgContainer: '#ffffff',
    colorTextHeading: '#1a1a1a',
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#138808', // gov-green
    },
    Menu: {
      darkItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(255, 255, 255, 0.1)',
      darkItemColor: 'rgba(255, 255, 255, 0.65)',
      darkItemSelectedColor: '#ffffff',
    },
    Button: {
      borderRadius: 12,
      controlHeight: 40,
    },
    Card: {
      borderRadiusLG: 16,
    },
    Table: {
      borderRadius: 16,
    },
  },
};

export default function App() {
  return (
    <ConfigProvider theme={themeConfig}>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="citizen" element={<CitizenDashboard />} />
              <Route path="submit" element={<SubmitComplaint />} />
              <Route path="complaint/:id" element={<ComplaintDetails />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="trace" element={<TraceGrievance />} />
            </Route>
          </Routes>
        </Router>
      </AppProvider>
    </ConfigProvider>
  );
}
