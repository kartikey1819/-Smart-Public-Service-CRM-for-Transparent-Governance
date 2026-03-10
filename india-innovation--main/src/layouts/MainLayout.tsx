import React, { useState, useEffect } from 'react';
import * as Antd from 'antd';
import {
  DashboardOutlined,
  PlusCircleOutlined,
  BarChartOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BellOutlined,
  UserOutlined,
  GlobalOutlined,
  CheckOutlined,
  SearchOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';

const { Layout, Menu, Button, Typography, Space, Badge, Dropdown, List, Avatar } = Antd as any;
const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Empty } = Antd as any;

const SessionTimer: React.FC<{ role: string }> = ({ role }) => {
  const [timeLeft, setTimeLeft] = useState(240); // 4 minutes
  const { t } = useTranslation();

  useEffect(() => {
    if (role !== 'citizen') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [role]);

  if (role !== 'citizen') return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-2xl border border-white/10 backdrop-blur-md">
      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
        <ClockCircleOutlined className="text-emerald-400 text-lg animate-pulse" />
      </div>
      <div className="flex flex-col">
        <Text className="text-[10px] text-white/40 font-black uppercase tracking-widest leading-none">Session Health</Text>
        <Text className="text-lg font-black text-white leading-none mt-1">
          {minutes}:{seconds < 10 ? '0' : ''}{seconds}
        </Text>
      </div>
    </div>
  );
};

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { notifications, markAsRead, userRole, setUserRole } = useAppContext();

  const officerMenuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: t('dashboard'),
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: t('analytics'),
    },
  ];

  const citizenMenuItems = [
    {
      key: '/citizen',
      icon: <UserOutlined />,
      label: t('my_grievances') || 'My Grievances',
    },
    {
      key: '/submit',
      icon: <PlusCircleOutlined />,
      label: t('submit_complaint'),
    },
    {
      key: '/trace',
      icon: <SearchOutlined />,
      label: t('trace_grievance'),
    },
  ];

  const menuItems = userRole === 'officer' ? officerMenuItems : citizenMenuItems;

  const handleRoleChange = (newRole: 'officer' | 'citizen') => {
    setUserRole(newRole);
    if (newRole === 'officer') {
      navigate('/');
    } else {
      navigate('/citizen');
    }
  };

  const languages = [
    { key: 'en', label: 'English' },
    { key: 'hi', label: 'हिन्दी' },
    { key: 'mr', label: 'मराठी' },
    { key: 'gu', label: 'ગુજરાતી' },
    { key: 'ta', label: 'தமிழ்' },
    { key: 'te', label: 'తెలుగు' },
    { key: 'bn', label: 'বাংলা' },
    { key: 'kn', label: 'ಕನ್ನಡ' },
    { key: 'pa', label: 'ਪੰਜਾਬੀ' },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const notificationMenu = {
    items: [],
    dropdownRender: () => (
      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-100 w-[350px]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <Text strong className="text-slate-700">{t('notifications')}</Text>
          <Space>
            <Button 
              type="link" 
              size="small" 
              className="text-[10px] text-slate-400 uppercase font-bold"
              onClick={() => {
                notifications.forEach(n => markAsRead(n.id));
                Antd.message.success('All notifications marked as read');
              }}
            >
              Mark all as read
            </Button>
            <Badge count={notifications.filter(n => !n.read).length} className="gov-badge" />
          </Space>
        </div>
        {notifications.length > 0 ? (
          <List
            className="max-h-[400px] overflow-auto"
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item: any) => (
              <List.Item 
                className={`px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${!item.read ? 'bg-blue-50/30' : ''}`}
                onClick={() => {
                  markAsRead(item.id);
                  Antd.message.info(`Notification: ${item.title}`);
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={item.type === 'warning' ? <BellOutlined /> : <CheckOutlined />} 
                      className={item.type === 'warning' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}
                    />
                  }
                  title={<Text strong className="text-sm text-slate-700">{item.title}</Text>}
                  description={
                    <div className="flex flex-col">
                      <Text className="text-xs text-slate-500">{item.message}</Text>
                      <Text className="text-[10px] text-slate-400 mt-1">{new Date(item.timestamp).toLocaleTimeString()}</Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div className="p-8 text-center">
            <Empty description="No notifications" />
          </div>
        )}
        <div className="p-3 flex justify-between items-center border-t border-slate-100">
          <Button type="link" size="small" className="text-gov-green font-bold text-xs uppercase tracking-widest">
            View All Alerts
          </Button>
          <Button 
            type="text" 
            size="small" 
            className="text-slate-400 font-bold text-[10px] uppercase tracking-widest"
            onClick={() => notifications.forEach(n => markAsRead(n.id))}
          >
            Mark all as read
          </Button>
        </div>
      </div>
    )
  };

  const languageMenu = {
    items: languages.map(lang => ({
      key: lang.key,
      label: (
        <div className="flex items-center justify-between min-w-[120px] py-1">
          <Text className={i18n.language === lang.key ? 'text-gov-green font-bold' : 'text-slate-600'}>
            {lang.label}
          </Text>
          {i18n.language === lang.key && <CheckOutlined className="text-gov-green text-xs" />}
        </div>
      )
    })),
    onClick: ({ key }: { key: string }) => changeLanguage(key)
  };

  return (
    <Layout className="min-h-screen bg-[#f0fdf4]">
      <Layout className="bg-transparent">
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed} 
          className="gov-sidebar shadow-2xl !bg-[#064e3b]"
          width={260}
        >
          <div className="p-6 flex flex-col items-center justify-center border-b border-white/10 mb-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-3 shadow-lg border border-white/10 backdrop-blur-md">
              <Title level={2} className="m-0 serif text-gov-gold" style={{ color: '#D4B106' }}>R</Title>
            </div>
            {!collapsed && (
              <div className="text-center">
                <Title level={5} className="serif" style={{ color: 'white', margin: 0, letterSpacing: '0.05em' }}>
                  {t('indore_municipal')}
                </Title>
                <Text className="text-[10px] text-white/50 font-bold uppercase tracking-[0.2em]">
                  {t('command_center')}
                </Text>
              </div>
            )}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            className="bg-transparent border-none px-2"
            style={{ 
              backgroundColor: 'transparent',
            }}
          />
          {!collapsed && (
            <div className="absolute bottom-8 left-0 w-full px-6 space-y-4">
              <SessionTimer role={userRole} />
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <Text className="text-[10px] text-white/40 block mb-2 uppercase tracking-widest">{t('digital_india')}</Text>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gov-gold rounded-full animate-pulse" />
                  <Text className="text-[10px] text-white/80 font-bold">{t('secure_portal')}</Text>
                </div>
              </div>
            </div>
          )}
        </Sider>
        <Layout className="bg-transparent">
          <Header className="gov-header h-20 px-8 flex justify-between items-center !bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-4">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="text-slate-400 hover:text-gov-green"
              />
              <div className="h-8 w-[1px] bg-slate-200 mx-2" />
              <div className="flex flex-col">
                <Title level={4} className="m-0 font-bold text-slate-800 serif">
                  {t('public_service_crm')}
                </Title>
                <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Indore North Zone | Municipal Corporation
                </Text>
              </div>
            </div>
            <Space size="large">
              
              <Antd.Segmented
                options={[
                  { label: t('officer') || 'Officer', value: 'officer' },
                  { label: t('citizen') || 'Citizen', value: 'citizen' },
                ]}
                value={userRole}
                onChange={(val: any) => handleRoleChange(val)}
                className="bg-slate-100 p-1 rounded-xl font-bold text-[10px] uppercase tracking-widest"
              />

              <Dropdown menu={languageMenu} trigger={['click']} placement="bottomRight">
                <Button 
                  type="text" 
                  icon={<GlobalOutlined />} 
                  className="text-slate-400 hover:text-gov-green hover:bg-slate-50 rounded-xl flex items-center gap-2 px-3"
                >
                  <span className="text-xs font-bold uppercase tracking-widest hidden lg:inline">
                    {languages.find(l => l.key === i18n.language)?.label || t('language')}
                  </span>
                </Button>
              </Dropdown>

              <div className="hidden md:flex flex-col items-end mr-4">
                <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('current_session')}</Text>
                <Text className="text-xs font-bold text-slate-600">{userRole === 'officer' ? '#IND-7721' : '#CIT-9901'}</Text>
              </div>
              
              <Dropdown menu={notificationMenu} trigger={['click']} placement="bottomRight">
                <Badge count={notifications.filter(n => !n.read).length} offset={[-2, 2]}>
                  <Button 
                    type="text" 
                    icon={<BellOutlined />} 
                    className="text-xl text-slate-400 hover:text-gov-green hover:bg-slate-50 rounded-xl w-12 h-12 flex items-center justify-center" 
                  />
                </Badge>
              </Dropdown>
              
              <div className="h-10 w-[1px] bg-slate-200 mx-2" />
              <Space className="cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gov-green flex items-center justify-center text-white font-bold shadow-md">
                  {userRole === 'officer' ? 'OI' : 'CI'}
                </div>
                <div className="hidden sm:flex flex-col">
                  <Text strong className="text-slate-700 leading-none">{userRole === 'officer' ? 'Officer Indore' : 'Citizen Indore'}</Text>
                  <Text className="text-[10px] text-slate-400">{userRole === 'officer' ? t('zone_administrator') : 'Verified Resident'}</Text>
                </div>
              </Space>
            </Space>
          </Header>
          <Content className="m-0 p-8 overflow-auto">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
