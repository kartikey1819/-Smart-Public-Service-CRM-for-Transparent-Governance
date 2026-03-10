import React, { useState } from 'react';
import * as Antd from 'antd';
import { 
  SearchOutlined, 
  HistoryOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  SyncOutlined,
  ArrowRightOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Complaint } from '../types';

const { Input, Button, Card, Typography, Space, Steps, Tag, Empty, Row, Col } = Antd as any;
const { Title, Text } = Typography;

const TraceGrievance: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const [result, setResult] = useState<Complaint | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const { findComplaintById } = useAppContext();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!searchId.trim()) return;
    const found = findComplaintById(searchId.trim());
    setResult(found || null);
    setHasSearched(true);
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Assigned': return 1;
      case 'In Progress': return 2;
      case 'Resolved': return 3;
      default: return 0;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gov-green/5 rounded-full border border-gov-green/10 mb-2">
          <HistoryOutlined className="text-gov-green" />
          <Text className="text-[10px] font-bold text-gov-green uppercase tracking-[0.2em]">Public Audit Portal</Text>
        </div>
        <Title level={1} className="m-0 font-black text-slate-800 tracking-tight serif">
          Trace Your Grievance
        </Title>
        <Text className="text-slate-500 text-lg block max-w-xl mx-auto">
          Enter your unique Grievance ID (e.g., IND-2024-001) to track real-time resolution progress and field updates.
        </Text>
      </div>

      <Card className="shadow-2xl border-none rounded-[40px] p-4 bg-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gov-green/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row gap-4">
          <Input 
            size="large"
            placeholder="Enter Grievance ID (e.g. IND-2024-001)" 
            className="h-16 rounded-3xl border-slate-200 focus:border-gov-green focus:shadow-none text-lg px-8 flex-1"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined className="text-slate-300 mr-2" />}
          />
          <Button 
            type="primary" 
            size="large" 
            className="h-16 px-12 rounded-3xl bg-gov-green border-none shadow-xl shadow-gov-green/20 font-bold text-lg"
            onClick={handleSearch}
          >
            Track Now
          </Button>
        </div>
      </Card>

      <AnimatePresence mode="wait">
        {hasSearched && result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <Card className="shadow-sm border-none rounded-3xl overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gov-green rounded-2xl flex items-center justify-center shadow-lg shadow-gov-green/10">
                    <HistoryOutlined className="text-3xl text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <Title level={3} className="m-0 font-black text-slate-800 serif">{result.id}</Title>
                      <Tag color="volcano" className="m-0 rounded-full border-none px-3 font-bold text-[10px] uppercase tracking-widest">{result.category}</Tag>
                    </div>
                    <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">Registered on {new Date(result.lastUpdated).toLocaleDateString()}</Text>
                  </div>
                </div>
                <Button 
                  icon={<ArrowRightOutlined />} 
                  className="rounded-xl h-12 px-8 border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:text-gov-green hover:border-gov-green"
                  onClick={() => navigate(`/complaint/${result.id}`)}
                >
                  Full Case Details
                </Button>
              </div>

              <div className="p-8 bg-slate-50/50">
                <Title level={5} className="mb-8 text-slate-400 uppercase tracking-widest text-[10px] font-black">Current Resolution Lifecycle</Title>
                <Steps
                  current={getStatusStep(result.status)}
                  className="custom-steps"
                  items={[
                    { title: <Text strong className="text-xs">Registered</Text>, description: <Text className="text-[10px] text-slate-400">Grievance logged</Text> },
                    { title: <Text strong className="text-xs">Assigned</Text>, description: <Text className="text-[10px] text-slate-400">Zonal unit assigned</Text> },
                    { title: <Text strong className="text-xs">In Progress</Text>, description: <Text className="text-[10px] text-slate-400">Field work started</Text> },
                    { title: <Text strong className="text-xs">Resolved</Text>, description: <Text className="text-[10px] text-slate-400">Final verification</Text> },
                  ]}
                />
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <Text className="text-[9px] text-slate-400 font-black uppercase tracking-widest block mb-1">Current Status</Text>
                  <Text strong className="text-gov-green">{result.status}</Text>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <Text className="text-[9px] text-slate-400 font-black uppercase tracking-widest block mb-1">Priority Level</Text>
                  <Text strong className="text-gov-green">{result.priority}</Text>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <Text className="text-[9px] text-slate-400 font-black uppercase tracking-widest block mb-1">Assigned Ward</Text>
                  <Text strong className="text-gov-green">Ward {result.ward}</Text>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : hasSearched ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12"
          >
            <Card className="shadow-sm border-dashed border-slate-200 bg-slate-50/50 text-center py-16 rounded-[40px]">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <InfoCircleOutlined className="text-5xl text-slate-200" />
              </div>
              <Title level={4} className="text-slate-400 font-bold mb-2 serif">Grievance Not Found</Title>
              <Text type="secondary" className="text-sm px-12 block leading-relaxed max-w-md mx-auto">
                We couldn't find any record matching ID <Text strong className="text-slate-600">"{searchId}"</Text>. Please verify the ID from your acknowledgement receipt and try again.
              </Text>
              <Button 
                type="link" 
                className="mt-6 text-gov-green font-bold uppercase tracking-widest text-xs"
                onClick={() => setSearchId('')}
              >
                Clear Search
              </Button>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default TraceGrievance;
