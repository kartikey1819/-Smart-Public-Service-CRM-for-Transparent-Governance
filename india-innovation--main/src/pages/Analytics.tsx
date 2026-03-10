import React from 'react';
import * as Antd from 'antd';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { 
  InfoCircleOutlined, 
  RiseOutlined, 
  AlertOutlined, 
  DownloadOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  UserOutlined
} from '@ant-design/icons';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { dashboardService } from '../services/api';

const { Card, Row, Col, Typography, Alert, Space, Table, Tag, Button, Segmented } = Antd as any;
const { Title, Text } = Typography;

const Analytics: React.FC = () => {
  const { t } = useTranslation();
  const [leaderboard, setLeaderboard] = React.useState<any[]>([]);

  React.useEffect(() => {
    dashboardService.getLeaderboard().then(setLeaderboard);
  }, []);

  const resolutionTrendData = [
    { name: 'Mon', time: 5.2, target: 4.0 },
    { name: 'Tue', time: 4.8, target: 4.0 },
    { name: 'Wed', time: 6.1, target: 4.0 },
    { name: 'Thu', time: 4.2, target: 4.0 },
    { name: 'Fri', time: 3.9, target: 4.0 },
    { name: 'Sat', time: 4.5, target: 4.0 },
    { name: 'Sun', time: 3.8, target: 4.0 },
  ];

  const categoryData = [
    { name: 'Water', count: 45, color: '#FF9933' },
    { name: 'Road', count: 32, count_color: '#138808' },
    { name: 'Electricity', count: 28, color: '#800000' },
    { name: 'Sanitation', count: 56, color: '#002140' },
    { name: 'Others', count: 12, color: '#64748b' },
  ];

  const wardPerformance = [
    { ward: 'W1', resolved: 92, pending: 8, trend: 'up' },
    { ward: 'W2', resolved: 85, pending: 15, trend: 'down' },
    { ward: 'W3', resolved: 70, pending: 30, trend: 'down' },
    { ward: 'W4', resolved: 88, pending: 12, trend: 'up' },
    { ward: 'W5', resolved: 95, pending: 5, trend: 'up' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-gov-gold rounded-full" />
            <Text className="text-[10px] font-bold text-gov-green uppercase tracking-[0.2em]">{t('zonal_performance_metrics') || 'Zonal Performance Metrics'}</Text>
          </div>
          <Title level={2} className="m-0 font-bold tracking-tight text-slate-800 serif">{t('analytics')}</Title>
          <Text className="text-slate-400 text-sm">{t('official_audit_desc') || 'Official performance audit for Indore North Zone municipal operations'}</Text>
        </div>
        <Space size="middle">
          <Segmented
            options={['7 Days', '30 Days', '90 Days']}
            defaultValue="7 Days"
            className="bg-slate-100 p-1 rounded-xl font-medium"
          />
          <Button 
            icon={<DownloadOutlined />} 
            className="rounded-xl h-11 px-6 border-slate-200 hover:border-gov-green font-medium"
          >
            {t('export_audit') || 'Export Audit'}
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-gov-green rounded-full" />
                <Text className="font-bold text-slate-700">{t('leaderboard')}</Text>
              </div>
            }
            className="shadow-sm border-none rounded-2xl overflow-hidden"
          >
            <Table
              dataSource={leaderboard}
              pagination={false}
              rowKey="name"
              columns={[
                {
                  title: t('officer_id'),
                  dataIndex: 'name',
                  key: 'name',
                  render: (name, record) => (
                    <Space>
                      <Antd.Avatar icon={<UserOutlined />} className="bg-gov-maroon" />
                      <div>
                        <Text strong className="block">{name}</Text>
                        {record.badge && <Tag color="gold" className="text-[9px] font-bold uppercase">{record.badge}</Tag>}
                      </div>
                    </Space>
                  )
                },
                {
                  title: t('resolved_count'),
                  dataIndex: 'resolved',
                  key: 'resolved',
                  render: (resolved) => <Text strong className="text-gov-green">{resolved}</Text>
                },
                {
                  title: t('rating'),
                  dataIndex: 'rating',
                  key: 'rating',
                  render: (rating) => <Antd.Rate disabled defaultValue={rating} className="text-xs" />
                }
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-gov-green rounded-full" />
                <Text className="font-bold text-slate-700">{t('category_distribution') || 'Category Distribution'}</Text>
              </div>
            }
            className="shadow-sm border-none rounded-2xl overflow-hidden"
          >
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontWeight: 600, fontSize: 11 }} />
                  <RechartsTooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  />
                  <Bar dataKey="count" radius={[0, 12, 12, 0]} barSize={24}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#138808' : index === 1 ? '#10b981' : index === 2 ? '#d4b106' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={24}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-gov-green rounded-full" />
                <Text className="font-bold text-slate-700">{t('resolution_efficiency_trend') || 'Resolution Efficiency Trend'}</Text>
              </div>
            }
            className="shadow-sm border-none rounded-2xl overflow-hidden"
            extra={<Tag color="blue" className="rounded-full border-none px-4 py-1 text-[10px] font-bold uppercase tracking-widest">Avg: 4.6h</Tag>}
          >
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={resolutionTrendData}>
                  <defs>
                    <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#138808" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#138808" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="time"
                    name={t('resolution_time') || 'Resolution Time'}
                    stroke="#138808"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorTime)"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name={t('sla_target') || 'SLA Target'}
                    stroke="#d4b106"
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Card 
        title={
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-gov-green rounded-full" />
            <Text className="font-bold text-slate-700">{t('ward_performance_audit') || 'Ward Performance Audit'}</Text>
          </div>
        } 
        className="shadow-sm border-none rounded-2xl overflow-hidden"
        extra={<Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('zonal_ranking') || 'Zonal Ranking'}</Text>}
      >
        <Table
          dataSource={wardPerformance}
          pagination={false}
          rowKey="ward"
          className="modern-table"
          columns={[
            { 
              title: t('administrative_ward') || 'Administrative Ward', 
              dataIndex: 'ward', 
              key: 'ward',
              render: (text) => (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center font-bold text-slate-400 border border-slate-100">{text}</div>
                  <Text strong className="text-slate-700">Zone {text.replace('W', '')}</Text>
                </div>
              )
            },
            {
              title: t('resolution_rate') || 'Resolution Rate (SLA Compliance)',
              dataIndex: 'resolved',
              key: 'resolved',
              render: (val) => (
                <div className="flex items-center gap-6">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[240px]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${val}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full ${val > 90 ? 'bg-emerald-500' : val > 80 ? 'bg-gov-green' : 'bg-orange-500'}`}
                    />
                  </div>
                  <Text strong className="text-slate-600 text-xs">{val}%</Text>
                </div>
              ),
            },
            {
              title: t('performance_trend') || 'Performance Trend',
              dataIndex: 'trend',
              key: 'trend',
              render: (trend) => (
                <Tag color={trend === 'up' ? 'success' : 'error'} className="rounded-full border-none px-4 py-0.5 font-bold text-[10px] uppercase tracking-widest">
                  {trend === 'up' ? t('improving') || 'Improving' : t('declining') || 'Declining'}
                </Tag>
              )
            },
            {
              title: t('efficiency_status') || 'Efficiency Status',
              key: 'status',
              render: (_, record) => (
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${record.resolved > 90 ? 'bg-emerald-500' : record.resolved > 80 ? 'bg-gov-green' : 'bg-orange-500'}`} />
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {record.resolved > 90 ? t('optimal') || 'Optimal' : record.resolved > 80 ? t('stable') || 'Stable' : t('critical') || 'Critical'}
                  </Text>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </motion.div>
  );
};

export default Analytics;
