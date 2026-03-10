import React, { useState } from 'react';
import * as Antd from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  PlusOutlined,
  EyeOutlined,
  UserOutlined,
  ArrowRightOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  FileProtectOutlined,
  ThunderboltOutlined,
  AlertOutlined,
  MailOutlined,
  PhoneOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Complaint } from '../types';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { dashboardService, complaintService } from '../services/api';

const { Row, Col, Card, Statistic, Table, Tag, Button, Space, Typography, Tooltip, Badge, Avatar } = Antd as any;
const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const { complaints, stats, loading, refreshData } = useAppContext();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [alerts, setAlerts] = React.useState<any[]>([]);

  React.useEffect(() => {
    dashboardService.getAlerts().then(setAlerts);
  }, []);

  const [selectedOfficer, setSelectedOfficer] = useState<any>(null);
  const [isOfficerModalVisible, setIsOfficerModalVisible] = useState(false);

  const showOfficerDetails = (officer: any) => {
    setSelectedOfficer(officer);
    setIsOfficerModalVisible(true);
  };

  const getSLAInfo = (deadline: string) => {
    const now = new Date();
    const target = new Date(deadline);
    const diff = target.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const isCritical = hours < 2;
    const isOverdue = diff < 0;

    if (isOverdue) return { text: t('overdue'), color: 'red', icon: <AlertOutlined /> };
    return { 
      text: `⏰ ${hours}:${minutes < 10 ? '0' : ''}${minutes}`, 
      color: isCritical ? 'red' : 'green',
      icon: <ClockCircleOutlined />
    };
  };

  const columns = [
    {
      title: t('officer_id'),
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => <Text className="font-mono font-bold text-gov-maroon">{text}</Text>,
    },
    {
      title: t('sla_deadline'),
      dataIndex: 'slaDeadline',
      key: 'slaDeadline',
      render: (deadline: string, record: Complaint) => {
        if (record.status === 'Resolved') return <Tag color="success">{t('resolved')}</Tag>;
        const sla = getSLAInfo(deadline);
        return (
          <Tag color={sla.color} className="font-bold">
            {sla.text}
          </Tag>
        );
      }
    },
    {
      title: t('category'),
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="volcano" className="rounded-full border-none px-3 font-bold text-[10px] uppercase tracking-wider">
          {category}
        </Tag>
      ),
    },
    {
      title: t('ward'),
      dataIndex: 'ward',
      key: 'ward',
      render: (ward: number) => <Text strong className="text-slate-600">Ward {ward}</Text>,
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        let icon = <ClockCircleOutlined />;
        
        if (status === 'Resolved') {
          color = 'success';
          icon = <CheckCircleOutlined />;
        } else if (status === 'In Progress') {
          color = 'processing';
          icon = <SyncOutlined spin />;
        } else if (status === 'Pending') {
          color = 'warning';
          icon = <ExclamationCircleOutlined />;
        }
        
        return (
          <Tag icon={icon} color={color} className="rounded-full px-3 font-bold text-[10px] uppercase tracking-wider">
            {t(status.toLowerCase().replace(' ', '_'))}
          </Tag>
        );
      },
    },
    {
      title: t('priority'),
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const colors: Record<string, string> = { High: 'red', Medium: 'orange', Low: 'green' };
        return (
          <Badge status={colors[priority] as any} text={<Text className="text-xs font-bold text-slate-500">{t(priority.toLowerCase())}</Text>} />
        );
      },
    },
    {
      title: 'Assigned Officer',
      dataIndex: 'assignedOfficer',
      key: 'assignedOfficer',
      render: (officer: any) => officer ? (
        <div 
          className="flex items-center gap-3 p-1.5 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-all group"
          onClick={(e) => {
            e.stopPropagation();
            showOfficerDetails(officer);
          }}
        >
          <Avatar size="small" icon={<UserOutlined />} className="bg-emerald-100 text-emerald-600 border border-emerald-200 group-hover:bg-emerald-200" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Text strong className="text-xs text-slate-700 group-hover:text-emerald-700">{officer.name}</Text>
              {officer.assignedBy === 'AI' && (
                <Tag color="purple" className="m-0 text-[8px] px-1 py-0 font-black uppercase tracking-widest border-none bg-purple-100 text-purple-600">
                  AI
                </Tag>
              )}
            </div>
            <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{officer.department}</Text>
          </div>
        </div>
      ) : (
        <Text className="text-[10px] text-slate-300 italic">Unassigned</Text>
      )
    },
    {
      title: t('actions'),
      key: 'actions',
      render: (_: any, record: Complaint) => (
        <Button 
          type="text" 
          icon={<EyeOutlined />} 
          className="text-emerald-700 hover:bg-emerald-50 rounded-lg font-bold text-xs uppercase tracking-widest"
          onClick={() => navigate(`/complaint/${record.id}`)}
        >
          {t('view_details')}
        </Button>
      ),
    },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      {/* Crisis Alert Banner */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg animate-pulse cursor-pointer border border-emerald-400/30"
          onClick={() => navigate('/dashboard?filter=' + alerts[0].filter)}
        >
          <div className="flex items-center gap-3">
            <AlertOutlined className="text-2xl text-emerald-100" />
            <Text className="text-white font-black text-lg uppercase tracking-wider">{alerts[0].message}</Text>
          </div>
          <Button ghost className="border-white text-white font-bold rounded-xl hover:bg-white hover:text-emerald-600">
            {t('view_details')}
          </Button>
        </motion.div>
      )}

      {/* Official Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-3xl shadow-sm border border-emerald-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="flex items-start gap-6 relative z-10">
          <div className="w-20 h-20 bg-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20 border-2 border-emerald-400/30">
            <SafetyCertificateOutlined className="text-4xl text-emerald-300" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-1">
              <Tag color="gold" className="m-0 rounded-md border-none px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] bg-gov-gold text-emerald-900">
                Official Command
              </Tag>
              <div className="h-1 w-1 bg-slate-300 rounded-full" />
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Operations</Text>
            </div>
            <Title level={2} className="m-0 font-black text-emerald-900 tracking-tight serif">
              {t('officer_command_center') || 'Officer Command Center'} <span className="text-emerald-900/40 font-light">|</span> {t('dashboard')}
            </Title>
            <Text className="text-slate-500 font-medium max-w-md mt-1">
              {t('official_portal')}
            </Text>
          </div>
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex flex-col items-end px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100">
            <Text className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Last Sync</Text>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <Text className="text-sm font-bold text-emerald-700">{new Date().toLocaleTimeString()}</Text>
            </div>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large" 
            className="h-14 px-8 shadow-xl shadow-emerald-900/20 bg-emerald-700 border-none hover:!bg-emerald-800"
            onClick={() => navigate('/submit')}
          >
            {t('lodge_grievance')}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <Row gutter={[24, 24]}>
        {[
          { title: t('total_complaints'), value: stats?.totalComplaints || 0, icon: <FileProtectOutlined />, color: 'gov-maroon', trend: '+12% from last week' },
          { title: t('pending_complaints'), value: stats?.pendingComplaints || 0, icon: <ClockCircleOutlined />, color: 'gov-saffron', trend: `${t('overdue')}: ${stats?.overdueCount || 0}` },
          { title: t('in_progress_complaints'), value: stats?.inProgressComplaints || 0, icon: <SyncOutlined />, color: 'gov-green', trend: 'Avg. Speed: 4.2h' },
          { title: t('resolved_complaints'), value: stats?.resolvedComplaints || 0, icon: <CheckCircleOutlined />, color: 'gov-green', trend: '94% Satisfaction Rate' },
        ].map((stat, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-gov-maroon/20 transition-all duration-300 rounded-3xl overflow-hidden relative group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-gov-maroon transition-transform group-hover:scale-110`}>
                    {React.cloneElement(stat.icon as React.ReactElement, { className: 'text-2xl' })}
                  </div>
                  <Tag color="gold" className="m-0 rounded-full border-none px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-gov-gold/10 text-gov-gold">
                    Live
                  </Tag>
                </div>
                <Statistic 
                  title={<Text className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{stat.title}</Text>} 
                  value={stat.value} 
                  valueStyle={{ color: '#138808', fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}
                />
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{stat.trend}</Text>
                </div>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gov-maroon/5 rounded-full blur-2xl group-hover:bg-gov-maroon/10 transition-colors" />
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        {/* Main Feed */}
        <Col xs={24} xl={16}>
          <Card 
            title={
              <div className="flex items-center justify-between w-full py-2">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-gov-green rounded-full" />
                  <Title level={4} className="m-0 font-bold text-slate-800 tracking-tight serif">
                    {t('grievance_command_center') || 'Grievance Command Center'}
                  </Title>
                </div>
                <Space>
                  <Button icon={<SyncOutlined />} onClick={refreshData} className="rounded-xl border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest">
                    {t('refresh')}
                  </Button>
                  <Button type="primary" ghost className="rounded-xl border-gov-green text-gov-green font-bold text-xs uppercase tracking-widest">
                    Export PDF
                  </Button>
                </Space>
              </div>
            }
            className="shadow-sm border-none rounded-3xl overflow-hidden"
          >
            <Table 
              columns={columns} 
              dataSource={complaints} 
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 6, className: 'px-6' }}
              className="gov-table"
              locale={{ emptyText: t('no_complaints_found') }}
            />
          </Card>
        </Col>

        {/* Side Panel */}
        <Col xs={24} xl={8} className="space-y-6">
          {/* Daily Briefing */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <ThunderboltOutlined className="text-gov-gold" />
                <Text className="font-bold text-slate-700 uppercase tracking-widest text-xs">{t('daily_briefing') || 'Daily Briefing'}</Text>
              </div>
            }
            className="shadow-sm border-none rounded-3xl bg-gov-maroon text-white overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
            <div className="space-y-6 relative z-10">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <AlertOutlined className="text-gov-gold" />
                  <Text className="text-white font-bold text-sm">Critical Alert: Ward 7</Text>
                </div>
                <Text className="text-white/60 text-xs">
                  Abnormal spike in 'Street Light' complaints detected in the last 2 hours.
                </Text>
              </div>
              
              <div className="space-y-4">
                <Text className="text-[10px] text-white/40 font-black uppercase tracking-widest block">Zonal Performance</Text>
                {[
                  { label: t('north_zone'), value: 92, color: 'emerald-400' },
                  { label: t('east_zone'), value: 78, color: 'gov-gold' },
                  { label: t('west_zone'), value: 85, color: 'blue-400' },
                ].map((zone, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <Text className="text-white/80 font-medium">{zone.label}</Text>
                      <Text className="text-white font-bold">{zone.value}%</Text>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${zone.value}%` }}
                        className={`h-full`}
                        style={{ backgroundColor: zone.color === 'emerald-400' ? '#34d399' : zone.color === 'blue-400' ? '#60a5fa' : '#FFD700' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <Button block className="h-12 rounded-xl bg-white/10 border-white/20 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/20">
                View Detailed Report
              </Button>
            </div>
          </Card>

          {/* Ward Heatmap Placeholder */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <EnvironmentOutlined className="text-gov-maroon" />
                <Text className="font-bold text-slate-700 uppercase tracking-widest text-xs">{t('zonal_distribution') || 'Zonal Distribution'}</Text>
              </div>
            }
            className="shadow-sm border-none rounded-3xl overflow-hidden"
          >
            <div className="space-y-4">
              <div className="h-48 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-dashed border-slate-200">
                <div className="w-full h-full p-4 flex flex-col justify-end gap-2">
                  <div className="flex justify-between items-end gap-1 h-full">
                    {[40, 70, 45, 90, 65, 30, 85, 50].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        className="flex-1 bg-gov-maroon/20 rounded-t-md relative group"
                      >
                        <div className="absolute inset-0 bg-gov-maroon opacity-0 group-hover:opacity-100 transition-opacity rounded-t-md" />
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                    <span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span><span>W6</span><span>W7</span><span>W8</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Text className="text-[9px] text-slate-400 font-bold uppercase block">Highest Volume</Text>
                  <Text className="text-sm font-black text-gov-maroon">Ward 4 (92)</Text>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Text className="text-[9px] text-slate-400 font-bold uppercase block">Fastest Resolution</Text>
                  <Text className="text-sm font-black text-gov-maroon">Ward 2 (1.2h)</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      {/* Officer Detail Modal */}
      <Antd.Modal
        title={null}
        open={isOfficerModalVisible}
        onCancel={() => setIsOfficerModalVisible(false)}
        footer={null}
        centered
        width={400}
        styles={{ body: { padding: 0 } }}
        className="officer-detail-modal"
      >
        {selectedOfficer && (
          <div className="overflow-hidden rounded-3xl">
            <div className="bg-emerald-700 p-8 text-center relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
              <Avatar size={80} icon={<UserOutlined />} className="bg-white text-emerald-700 border-4 border-emerald-600/30 mb-4 shadow-xl" />
              <Title level={4} className="text-white m-0 tracking-tight">{selectedOfficer.name}</Title>
              <Text className="text-emerald-100/60 font-bold uppercase tracking-[0.2em] text-[10px]">{selectedOfficer.department}</Text>
            </div>
            <div className="p-8 space-y-6 bg-white">
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                    <MailOutlined className="text-slate-400" />
                  </div>
                  <div className="flex flex-col">
                    <Text className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Email Address</Text>
                    <Text className="text-sm text-slate-700 font-bold">{selectedOfficer.email}</Text>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                    <PhoneOutlined className="text-slate-400" />
                  </div>
                  <div className="flex flex-col">
                    <Text className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Contact Number</Text>
                    <Text className="text-sm text-slate-700 font-bold">{selectedOfficer.contact}</Text>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                    <EnvironmentOutlined className="text-slate-400" />
                  </div>
                  <div className="flex flex-col">
                    <Text className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Office Address</Text>
                    <Text className="text-sm text-slate-700 font-bold">{selectedOfficer.address}</Text>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                    <RobotOutlined className="text-slate-400" />
                  </div>
                  <div className="flex flex-col">
                    <Text className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Assignment Method</Text>
                    <Tag color={selectedOfficer.assignedBy === 'AI' ? 'purple' : 'blue'} className="m-0 w-fit font-bold uppercase text-[9px]">
                      {selectedOfficer.assignedBy} Assigned
                    </Tag>
                  </div>
                </div>
              </div>
              <Button 
                block 
                type="primary" 
                className="bg-emerald-600 border-none h-12 rounded-xl font-bold uppercase tracking-widest text-xs mt-4 shadow-lg shadow-emerald-900/10"
                onClick={() => setIsOfficerModalVisible(false)}
              >
                Close Profile
              </Button>
            </div>
          </div>
        )}
      </Antd.Modal>
    </div>
  );
};

export default Dashboard;
