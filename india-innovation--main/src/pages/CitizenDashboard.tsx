import React, { useState } from 'react';
import * as Antd from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  ArrowRightOutlined,
  UserOutlined,
  EnvironmentOutlined,
  RobotOutlined,
  MailOutlined,
  PhoneOutlined,
  StarOutlined,
  UndoOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { complaintService } from '../services/api';

const { Row, Col, Card, Statistic, Table, Tag, Button, Space, Typography, Empty, Image, Avatar, Rate, Input, Modal, message, Tooltip } = Antd as any;
const { Title, Text } = Typography;

const CitizenDashboard: React.FC = () => {
  const { complaints, loading, refreshData } = useAppContext();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [selectedOfficer, setSelectedOfficer] = useState<any>(null);
  const [isOfficerModalVisible, setIsOfficerModalVisible] = useState(false);
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
  const [feedbackComplaintId, setFeedbackComplaintId] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  const showOfficerDetails = (officer: any) => {
    setSelectedOfficer(officer);
    setIsOfficerModalVisible(true);
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackComplaintId) return;
    try {
      await complaintService.submitFeedback(feedbackComplaintId, feedbackRating, feedbackComment);
      message.success('Feedback submitted successfully');
      setIsFeedbackModalVisible(false);
      setFeedbackComment('');
      setFeedbackRating(5);
      refreshData();
    } catch (error) {
      message.error('Failed to submit feedback');
    }
  };

  const handleReopen = async (id: string) => {
    try {
      await complaintService.reopenComplaint(id);
      message.success('Complaint reopened successfully');
      refreshData();
    } catch (error) {
      message.error('Failed to reopen complaint');
    }
  };

  // In a real app, we would filter by the logged-in user's ID
  // For this demo, we'll just show all complaints but styled as a personal portal
  const myComplaints = complaints;

  const stats = {
    total: myComplaints.length,
    resolved: myComplaints.filter(c => c.status === 'Resolved').length,
    pending: myComplaints.filter(c => c.status !== 'Resolved').length,
  };

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
            <Text className="text-[10px] font-bold text-gov-green uppercase tracking-[0.2em]">{t('citizen_portal') || 'Citizen Service Portal'}</Text>
          </div>
          <Title level={2} className="m-0 font-bold tracking-tight text-slate-800 serif">{t('my_grievances') || 'My Grievances'}</Title>
          <Text className="text-slate-400 text-sm">{t('citizen_dashboard_desc') || 'Track and manage your submitted municipal complaints'}</Text>
        </div>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => navigate('/submit')}
            className="rounded-xl h-11 px-6 bg-gov-maroon border-none shadow-lg shadow-gov-maroon/20 font-bold"
          >
            {t('lodge_new_grievance') || 'Lodge New Grievance'}
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm border-none rounded-2xl overflow-hidden bg-white">
            <Statistic 
              title={<Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('total_submitted') || 'Total Submitted'}</Text>}
              value={stats.total}
              prefix={<SearchOutlined className="text-gov-navy opacity-20 mr-2" />}
              valueStyle={{ fontWeight: 800, color: '#002140' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm border-none rounded-2xl overflow-hidden bg-white">
            <Statistic 
              title={<Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('resolved') || 'Resolved'}</Text>}
              value={stats.resolved}
              prefix={<CheckCircleOutlined className="text-gov-green opacity-20 mr-2" />}
              valueStyle={{ fontWeight: 800, color: '#138808' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm border-none rounded-2xl overflow-hidden bg-white">
            <Statistic 
              title={<Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('pending_action') || 'Pending Action'}</Text>}
              value={stats.pending}
              prefix={<ClockCircleOutlined className="text-gov-gold opacity-20 mr-2" />}
              valueStyle={{ fontWeight: 800, color: '#D4B106' }}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title={
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-gov-green rounded-full" />
            <Text className="font-bold text-slate-700">{t('grievance_history') || 'Grievance History'}</Text>
          </div>
        }
        className="shadow-sm border-none rounded-2xl overflow-hidden"
      >
        <Table 
          dataSource={myComplaints}
          loading={loading}
          pagination={{ pageSize: 5 }}
          rowKey="id"
          className="modern-table"
          columns={[
            {
              title: t('grievance_id') || 'Grievance ID',
              dataIndex: 'id',
              key: 'id',
              render: (id) => <Text strong className="text-gov-navy">{id}</Text>
            },
            {
              title: t('category') || 'Category',
              dataIndex: 'category',
              key: 'category',
              render: (cat) => <Tag color="blue" className="rounded-full border-none px-3 font-bold text-[10px] uppercase">{cat}</Tag>
            },
            {
              title: t('status') || 'Status',
              dataIndex: 'status',
              key: 'status',
              render: (status) => (
                <Tag color={status === 'Resolved' ? 'success' : 'processing'} className="rounded-full border-none px-3 font-bold text-[10px] uppercase">
                  {status}
                </Tag>
              )
            },
            {
              title: 'Assigned Officer',
              dataIndex: 'assignedOfficer',
              key: 'assignedOfficer',
              render: (officer, record) => officer ? (
                <div 
                  className="flex items-center gap-3 p-2 bg-emerald-50/50 rounded-xl border border-emerald-100/50 cursor-pointer hover:bg-emerald-100 hover:border-emerald-200 transition-all group"
                  onClick={(e) => {
                    e.stopPropagation();
                    showOfficerDetails(officer);
                  }}
                >
                  <Avatar size="small" icon={<UserOutlined />} className="bg-emerald-100 text-emerald-600 border border-emerald-200 group-hover:bg-emerald-200" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Text className="text-xs font-bold text-slate-700 group-hover:text-emerald-700">{officer.name}</Text>
                      {officer.assignedBy === 'AI' && (
                        <Tag color="purple" className="m-0 text-[8px] px-1 py-0 font-black uppercase tracking-widest border-none bg-purple-100 text-purple-600">
                          AI
                        </Tag>
                      )}
                    </div>
                    <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{officer.department}</Text>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-300 italic p-2">
                  <ClockCircleOutlined className="text-xs" />
                  <Text className="text-[10px] text-slate-300">Assignment Pending</Text>
                </div>
              )
            },
            {
              title: 'Evidence',
              key: 'evidence',
              render: (_, record) => (
                <Space size="small">
                  <Image 
                    src={record.imageUrl || `https://picsum.photos/seed/${record.id}_before/100/100`} 
                    width={40} 
                    className="rounded-lg shadow-sm"
                    alt="Before"
                  />
                  {record.afterImageUrl && (
                    <Image 
                      src={record.afterImageUrl} 
                      width={40} 
                      className="rounded-lg shadow-sm border-2 border-emerald-500"
                      alt="After"
                    />
                  )}
                </Space>
              )
            },
            {
              title: t('last_updated') || 'Last Updated',
              dataIndex: 'lastUpdated',
              key: 'lastUpdated',
              render: (date) => <Text className="text-slate-400 text-xs">{new Date(date).toLocaleDateString()}</Text>
            },
            {
              title: '',
              key: 'action',
              render: (_, record) => (
                <Space>
                  {record.status === 'Resolved' && (
                    <>
                      {!record.feedback ? (
                        <Button 
                          type="primary" 
                          size="small"
                          icon={<StarOutlined />} 
                          onClick={() => {
                            setFeedbackComplaintId(record.id);
                            setIsFeedbackModalVisible(true);
                          }}
                          className="bg-gov-gold border-none text-[10px] font-bold h-7"
                        >
                          Feedback
                        </Button>
                      ) : (
                        <Tooltip title="Feedback Submitted">
                          <Tag color="success" className="m-0 text-[8px] font-bold">Feedback Done</Tag>
                        </Tooltip>
                      )}
                      <Button 
                        type="default" 
                        size="small"
                        icon={<UndoOutlined />} 
                        onClick={() => handleReopen(record.id)}
                        className="border-slate-200 text-slate-500 text-[10px] font-bold h-7"
                      >
                        Reopen
                      </Button>
                    </>
                  )}
                  <Button 
                    type="text" 
                    icon={<ArrowRightOutlined />} 
                    onClick={() => navigate(`/complaint/${record.id}`)}
                    className="text-gov-green hover:bg-gov-green/5 rounded-lg"
                  />
                </Space>
              )
            }
          ]}
          locale={{
            emptyText: <Empty description={t('no_grievances_found') || 'No grievances found'} />
          }}
        />
      </Card>

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

      {/* Feedback Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <StarOutlined className="text-gov-gold" />
            <Text className="font-bold text-slate-700">Share Your Feedback</Text>
          </div>
        }
        open={isFeedbackModalVisible}
        onCancel={() => setIsFeedbackModalVisible(false)}
        onOk={handleFeedbackSubmit}
        okText="Submit Feedback"
        cancelText="Cancel"
        okButtonProps={{ className: 'bg-gov-green border-none h-10 rounded-xl font-bold' }}
        cancelButtonProps={{ className: 'rounded-xl h-10' }}
        centered
      >
        <div className="py-4 space-y-6">
          <div className="text-center">
            <Text className="text-slate-400 text-xs block mb-3 uppercase tracking-widest font-bold">How would you rate the resolution?</Text>
            <Rate 
              value={feedbackRating} 
              onChange={setFeedbackRating} 
              className="text-3xl text-gov-gold"
            />
          </div>
          <div className="space-y-2">
            <Text className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Additional Comments</Text>
            <Input.TextArea 
              rows={4} 
              placeholder="Tell us about your experience..." 
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              className="rounded-xl border-slate-200 focus:border-gov-green focus:ring-1 focus:ring-gov-green/20"
            />
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default CitizenDashboard;
