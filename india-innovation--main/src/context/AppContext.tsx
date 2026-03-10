import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Complaint, DashboardStats } from '../types';
import { dashboardService } from '../services/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  read: boolean;
}

interface AppContextType {
  complaints: Complaint[];
  stats: DashboardStats | null;
  loading: boolean;
  refreshData: () => Promise<void>;
  notifications: Notification[];
  markAsRead: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  findComplaintById: (id: string) => Complaint | undefined;
  userRole: 'officer' | 'citizen';
  setUserRole: (role: 'officer' | 'citizen') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'officer' | 'citizen'>('officer');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Critical: Ward 7 Alert',
      message: 'Abnormal spike in Street Light complaints detected.',
      type: 'warning',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      read: false,
    },
    {
      id: '2',
      title: 'Performance Milestone',
      message: 'North Zone resolution rate reached 94% today.',
      type: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: true,
    },
    {
      id: '3',
      title: 'System Maintenance',
      message: 'Database sync scheduled for 02:00 AM tonight.',
      type: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      read: false,
    }
  ]);

  const refreshData = useCallback(async () => {
    try {
      const data = await dashboardService.getDashboardData();
      setComplaints(data.complaints);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const findComplaintById = useCallback((id: string) => {
    return complaints.find(c => c.id === id || c.id.includes(id));
  }, [complaints]);

  // Simulate real-time notifications
  useEffect(() => {
    const timer = setTimeout(() => {
      addNotification({
        title: 'New Grievance Logged',
        message: 'A high-priority complaint was just submitted from Ward 4.',
        type: 'warning'
      });
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const addNotification = (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...n,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [refreshData]);

  return (
    <AppContext.Provider value={{ complaints, stats, loading, refreshData, notifications, markAsRead, addNotification, findComplaintById, userRole, setUserRole }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
