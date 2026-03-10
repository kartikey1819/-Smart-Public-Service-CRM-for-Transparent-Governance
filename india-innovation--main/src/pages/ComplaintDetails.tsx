import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as Antd from 'antd';
import {
  ArrowLeftOutlined,
  HistoryOutlined,
  FileImageOutlined,
  UserOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  MessageOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  GlobalOutlined,
  MailOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import { complaintService } from '../services/api';
import { Complaint } from '../types';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';

const {
  Card,
  Typography,
  Steps,
  Tag,
  Row,
  Col,
  Button,
  Space,
  Divider,
  Timeline,
  Rate,
  Empty,
  Spin,
  Image,
  Badge,
  Avatar,
} = Antd as any;
const { Title, Text, Paragraph } = Typography;

const ComplaintDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userRole } = useAppContext();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<{ insight: string; steps: string[]; estimatedTime: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      const data = await complaintService.getComplaintDetails(id);
      setComplaint(data);
      
      // Fetch AI Insight
      setAiLoading(true);
      const insight = await complaintService.getAiInsight(id);
      setAiInsight(insight);
    } catch (error) {
      console.error('Error fetching complaint details:', error);
    } finally {
      setLoading(false);
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const [isOfficerModalVisible, setIsOfficerModalVisible] = useState(false);

  const handleAppeal = async () => {
    if (!id) return;
    try {
      await complaintService.appealComplaint(id);
      Antd.message.success(t('appeal_resolution'));
      fetchDetails();
    } catch (error) {
      Antd.message.error('Appeal failed');
    }
  };

  const handlePhotoUpload = async (info: any) => {
    if (!id) return;
    const reader = new FileReader();
    reader.onload = async () => {
      setUploading(true);
      try {
        await complaintService.uploadAfterPhoto(id, reader.result as string);
        Antd.message.success(t('upload_after_photo'));
        fetchDetails();
      } catch (error) {
        Antd.message.error('Upload failed');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(info.file.originFileObj);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-center">
          <Spin size="large" />
          <Text className="block mt-4 text-slate-400">Retrieving command center data...</Text>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Empty description="Complaint not found in the system" />
      </div>
    );
  }

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Assigned': return 1;
      case 'In Progress': return 2;
      case 'Resolved': return 3;
      default: return 0;
    }
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'High') return 'volcano';
    if (priority === 'Medium') return 'orange';
    return 'green';
  };

  const getStatusColor = (status: string) => {
    if (status === 'Pending') return 'processing';
    if (status === 'Assigned') return 'warning';
    if (status === 'In Progress') return 'cyan';
    if (status === 'Resolved') return 'success';
    return 'default';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <Space size="middle">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/')}
            className="rounded-xl border-slate-200 hover:border-gov-green w-11 h-11 flex items-center justify-center"
          />
          <div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gov-gold rounded-full" />
                <Title level={3} className="m-0 font-bold text-slate-800 serif">{complaint.id}</Title>
              </div>
              <Tag color={getStatusColor(complaint.status)} className="rounded-full px-4 py-0.5 border-none font-bold text-[10px] uppercase tracking-widest">
                {complaint.status}
              </Tag>
              {complaint.isAppealed && <Tag color="error">{t('appeal')}</Tag>}
            </div>
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Registered: {new Date(complaint.lastUpdated).toLocaleString()}</Text>
          </div>
        </Space>
        <Space size="middle">
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => fetchDetails()}
            className="rounded-xl h-11 px-6 border-slate-200 font-medium hover:text-gov-green hover:border-gov-green"
          >
            {t('refresh_case')}
          </Button>
          {complaint.status === 'Resolved' && userRole === 'citizen' && (
            <Button 
              type="primary" 
              danger 
              className="rounded-xl h-11 px-8 font-bold shadow-lg shadow-red-500/20"
              onClick={handleAppeal}
            >
              {t('appeal')}
            </Button>
          )}
          {complaint.status === 'Resolved' && userRole === 'officer' && (
            <Button 
              type="primary" 
              danger 
              className="rounded-xl h-11 px-8 font-bold shadow-lg shadow-red-500/20"
              onClick={handleAppeal}
            >
              {t('reopen_case') || 'Reopen Case'}
            </Button>
          )}
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card className="shadow-sm border-none rounded-2xl overflow-visible mb-6">
            <div className="flex justify-between items-start mb-10">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Tag color={getPriorityColor(complaint.priority)} className="rounded-full border-none px-4 py-0.5 font-bold text-[10px] uppercase tracking-widest">
                    {complaint.priority} Priority
                  </Tag>
                  <div className="w-1 h-1 bg-slate-300 rounded-full" />
                  <Text className="text-slate-500 font-bold text-xs uppercase tracking-widest">{complaint.category}</Text>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <EnvironmentOutlined className="text-gov-green" />
                  </div>
                  <Text className="font-medium text-slate-600">{complaint.ward}, {complaint.gali}</Text>
                </div>
              </div>
              <div className="text-right p-4 bg-gov-green/5 rounded-2xl border border-gov-green/10">
                <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest block mb-1">Assigned Zonal Dept</Text>
                <Text strong className="text-gov-green text-sm">
                  {complaint.assignedOfficer?.department || 'General Administration'}
                </Text>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 relative mb-10 shadow-inner">
              <div className="absolute -top-4 -left-4 bg-gov-navy p-3 rounded-xl shadow-lg border border-white/10">
                <MessageOutlined className="text-gov-gold text-xl" />
              </div>
              <Paragraph className="text-xl text-slate-700 m-0 italic leading-relaxed font-medium">
                "{complaint.description}"
              </Paragraph>
            </div>

            <div className="flex items-center gap-2 mb-8">
              <div className="w-1 h-4 bg-gov-green rounded-full" />
              <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Resolution Lifecycle</Text>
            </div>
            
            <div className="py-6 px-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              <Steps
                current={getStatusStep(complaint.status)}
                labelPlacement="vertical"
                className="custom-steps-gov"
                items={[
                  { title: <span className="font-bold text-xs uppercase tracking-widest">Filed</span>, description: <Text className="text-[10px] font-medium">Citizen Intake</Text> },
                  { title: <span className="font-bold text-xs uppercase tracking-widest">Assigned</span>, description: <Text className="text-[10px] font-medium">Field Unit Alert</Text> },
                  { title: <span className="font-bold text-xs uppercase tracking-widest">In Progress</span>, description: <Text className="text-[10px] font-medium">On-site Work</Text> },
                  { title: <span className="font-bold text-xs uppercase tracking-widest">Resolved</span>, description: <Text className="text-[10px] font-medium">Case Closure</Text> },
                ]}
              />
            </div>
          </Card>

          <Card 
            title={
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-gov-green rounded-full" />
                <Text className="font-bold text-slate-700">{t('visual_audit_evidence')}</Text>
              </div>
            } 
            className="shadow-sm border-none rounded-2xl overflow-hidden"
          >
            <div className="mb-8">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">{t('before_after')}</Text>
              <Antd.Carousel arrows infinite={false} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="px-2">
                  <div className="rounded-xl overflow-hidden shadow-sm border border-slate-200 relative">
                    <Tag color="blue" className="absolute top-4 left-4 z-10 font-bold">{t('before')}</Tag>
                    <Image src={complaint.imageUrl || `https://picsum.photos/seed/${complaint.id}_before/1200/900`} className="w-full h-[400px] object-cover" alt="Before" referrerPolicy="no-referrer" />
                  </div>
                </div>
                {complaint.afterImageUrl && (
                  <div className="px-2">
                    <div className="rounded-xl overflow-hidden shadow-sm border border-slate-200 relative">
                      <Tag color="green" className="absolute top-4 left-4 z-10 font-bold">{t('after')}</Tag>
                      <Image src={complaint.afterImageUrl} className="w-full h-[400px] object-cover" alt="After" referrerPolicy="no-referrer" />
                    </div>
                  </div>
                )}
              </Antd.Carousel>
            </div>

            {complaint.status !== 'Resolved' && userRole === 'officer' && (
              <div className="mt-6 p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                <Antd.Upload
                  showUploadList={false}
                  customRequest={handlePhotoUpload}
                  accept="image/*"
                >
                  <Button icon={<FileImageOutlined />} loading={uploading} type="primary" className="h-12 px-8 rounded-xl font-bold">
                    {t('upload_after_photo')}
                  </Button>
                </Antd.Upload>
                <Text className="block mt-2 text-slate-400 text-xs">{t('upload_hint')}</Text>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {complaint.isAppealed && (
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-red-500 rounded-full" />
                  <Text className="font-bold text-slate-700">{t('appeal_resolution')}</Text>
                </div>
              } 
              className="shadow-sm border-none mb-6 rounded-2xl overflow-hidden bg-red-50"
            >
              <Timeline
                className="mt-6 px-2"
                items={complaint.appealTimeline.map((log, idx) => ({
                  children: (
                    <div className="pb-6">
                      <Text strong className="text-red-700 block text-sm mb-1">{log.status}</Text>
                      <div className="flex items-center gap-2">
                        <ClockCircleOutlined className="text-[10px] text-red-300" />
                        <Text className="text-red-400 text-[10px] font-bold uppercase tracking-widest">{new Date(log.date).toLocaleString()}</Text>
                      </div>
                    </div>
                  ),
                  color: 'red',
                }))}
              />
            </Card>
          )}

          <Card 
            title={
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-gov-green rounded-full" />
                <Text className="font-bold text-slate-700">Assigned Officer</Text>
              </div>
            } 
            className="shadow-sm border-none mb-6 rounded-2xl overflow-hidden"
          >
            {complaint.assignedOfficer ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-all group"
                    onClick={() => setIsOfficerModalVisible(true)}
                  >
                    <Avatar size={48} icon={<UserOutlined />} className="bg-gov-green/10 text-gov-green border border-gov-green/20 group-hover:bg-gov-green/20" />
                    <div>
                      <Text strong className="text-slate-700 block text-sm group-hover:text-gov-green">{complaint.assignedOfficer.name}</Text>
                      <Tag color={complaint.assignedOfficer.assignedBy === 'AI' ? 'purple' : 'blue'} className="m-0 text-[8px]">
                        {complaint.assignedOfficer.assignedBy === 'AI' ? <RobotOutlined className="mr-1" /> : null}
                        {complaint.assignedOfficer.assignedBy} Assigned
                      </Tag>
                    </div>
                  </div>
                </div>
                <Divider className="my-2 border-slate-100" />
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                      <GlobalOutlined className="text-slate-400 text-xs" />
                    </div>
                    <div className="flex flex-col">
                      <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">Department</Text>
                      <Text className="text-xs text-slate-600 font-medium">{complaint.assignedOfficer.department}</Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                      <MessageOutlined className="text-slate-400 text-xs" />
                    </div>
                    <div className="flex flex-col">
                      <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">Email Address</Text>
                      <Text className="text-xs text-slate-600 font-medium">{complaint.assignedOfficer.email}</Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                      <ThunderboltOutlined className="text-slate-400 text-xs" />
                    </div>
                    <div className="flex flex-col">
                      <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">Contact Number</Text>
                      <Text className="text-xs text-slate-600 font-medium">{complaint.assignedOfficer.contact}</Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                      <EnvironmentOutlined className="text-slate-400 text-xs" />
                    </div>
                    <div className="flex flex-col">
                      <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">Office Address</Text>
                      <Text className="text-xs text-slate-600 font-medium">{complaint.assignedOfficer.address}</Text>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <UserOutlined className="text-3xl text-slate-200 mb-2" />
                <Text className="block text-slate-400 text-xs">Officer assignment pending</Text>
              </div>
            )}
          </Card>

          <Card 
            title={
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-gov-green rounded-full" />
                <Text className="font-bold text-slate-700">Officer Action Log</Text>
              </div>
            } 
            className="shadow-sm border-none mb-6 rounded-2xl overflow-hidden"
          >
            {complaint.officerLog.length > 0 ? (
              <Timeline
                className="mt-6 px-2"
                items={complaint.officerLog.map((log, idx) => ({
                  children: (
                    <div className="pb-6">
                      <Text strong className="text-slate-700 block text-sm mb-1">{log.action}</Text>
                      <div className="flex items-center gap-2">
                        <ClockCircleOutlined className="text-[10px] text-slate-300" />
                        <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{new Date(log.date).toLocaleString()}</Text>
                      </div>
                    </div>
                  ),
                  color: idx === 0 ? '#003a8c' : '#d1d5db',
                }))}
              />
            ) : (
              <div className="py-12 text-center">
                <HistoryOutlined className="text-4xl text-slate-100 mb-4" />
                <Empty description={<Text className="text-slate-400 text-xs">No field actions recorded yet</Text>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            )}
          </Card>

          <Card 
            title={
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-gov-green rounded-full" />
                <Text className="font-bold text-slate-700">{t('citizen_satisfaction_audit')}</Text>
              </div>
            } 
            className="shadow-sm border-none rounded-2xl overflow-hidden mb-6"
          >
            {complaint.feedback ? (
              <div className="text-center py-8 bg-emerald-50/50 rounded-2xl border border-emerald-100 shadow-inner">
                <Rate disabled defaultValue={complaint.feedback.rating} className="text-3xl mb-6 text-emerald-500" />
                <Paragraph italic className="text-slate-600 px-6 text-sm leading-relaxed font-medium">
                  "{complaint.feedback.comment}"
                </Paragraph>
                <div className="flex items-center justify-center gap-2 mt-6">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <SafetyCertificateOutlined className="text-white text-xs" />
                  </div>
                  <Text className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{t('verified_resolution')}</Text>
                </div>
              </div>
            ) : complaint.status === 'Resolved' ? (
              <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <MessageOutlined className="text-2xl text-slate-200" />
                </div>
                <Text className="block mb-6 text-slate-400 text-xs px-8">{t('feedback_pending_desc')}</Text>
                <Button type="primary" ghost className="rounded-xl h-10 px-6 border-gov-green text-gov-green font-bold text-xs">{t('send_reminder')}</Button>
              </div>
            ) : (
              <div className="text-center py-12 opacity-40">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ThunderboltOutlined className="text-xl text-slate-200" />
                </div>
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('portal_locked')}</Text>
                <Text className="block text-[9px] mt-1">{t('opens_after_resolution')}</Text>
              </div>
            )}
          </Card>

          <Card 
            title={
              <div className="flex items-center gap-2">
                <RobotOutlined className="text-gov-green" />
                <Text className="font-bold text-slate-700 uppercase tracking-widest text-[10px]">{t('ai_smart_resolution')}</Text>
              </div>
            }
            className="shadow-sm border-none rounded-2xl overflow-hidden mb-6 bg-slate-50"
          >
            {aiLoading ? (
              <div className="py-8 text-center">
                <Spin size="small" />
                <Text className="block mt-2 text-[10px] text-slate-400 uppercase tracking-widest">{t('analyzing_case')}</Text>
              </div>
            ) : aiInsight ? (
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">{t('technical_insight')}</Text>
                  <Text className="text-xs text-slate-600 leading-relaxed">{aiInsight.insight}</Text>
                </div>
                <div>
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">{t('suggested_steps')}</Text>
                  <div className="space-y-2">
                    {aiInsight.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2 bg-white p-2 rounded-lg border border-slate-100">
                        <div className="w-4 h-4 rounded-full bg-gov-green/10 text-gov-green flex items-center justify-center text-[8px] font-bold mt-0.5">{i + 1}</div>
                        <Text className="text-[11px] text-slate-600">{step}</Text>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('est_resolution_time')}</Text>
                  <Tag color="blue" className="m-0 border-none rounded-full px-3 font-bold text-[10px]">{aiInsight.estimatedTime}</Tag>
                </div>
              </div>
            ) : (
              <Empty description={t('no_ai_insights')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>

            <div className="p-6 bg-gov-maroon text-white rounded-2xl shadow-xl border border-gov-maroon/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <ClockCircleOutlined className="text-gov-gold" />
                  <Text className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em]">{t('sla_deadline')}</Text>
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                  <Title level={2} className="m-0 text-white font-bold">24</Title>
                  <Text className="text-white/60 font-bold uppercase tracking-widest text-xs">{t('hours_remaining')}</Text>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '66%' }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                    className="h-full bg-gov-gold shadow-[0_0_10px_rgba(212,177,6,0.3)]" 
                  />
                </div>
                <Text className="text-[9px] text-white/30 mt-3 block font-bold uppercase tracking-widest">{t('compliance_target')}: 48{t('hours_total')}</Text>
              </div>
            </div>
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
        {complaint.assignedOfficer && (
          <div className="overflow-hidden rounded-3xl">
            <div className="bg-emerald-700 p-8 text-center relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
              <Avatar size={80} icon={<UserOutlined />} className="bg-white text-emerald-700 border-4 border-emerald-600/30 mb-4 shadow-xl" />
              <Title level={4} className="text-white m-0 tracking-tight">{complaint.assignedOfficer.name}</Title>
              <Text className="text-emerald-100/60 font-bold uppercase tracking-[0.2em] text-[10px]">{complaint.assignedOfficer.department}</Text>
            </div>
            <div className="p-8 space-y-6 bg-white">
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                    <MailOutlined className="text-slate-400" />
                  </div>
                  <div className="flex flex-col">
                    <Text className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Email Address</Text>
                    <Text className="text-sm text-slate-700 font-bold">{complaint.assignedOfficer.email}</Text>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                    <PhoneOutlined className="text-slate-400" />
                  </div>
                  <div className="flex flex-col">
                    <Text className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Contact Number</Text>
                    <Text className="text-sm text-slate-700 font-bold">{complaint.assignedOfficer.contact}</Text>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                    <EnvironmentOutlined className="text-slate-400" />
                  </div>
                  <div className="flex flex-col">
                    <Text className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Office Address</Text>
                    <Text className="text-sm text-slate-700 font-bold">{complaint.assignedOfficer.address}</Text>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                    <RobotOutlined className="text-slate-400" />
                  </div>
                  <div className="flex flex-col">
                    <Text className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Assignment Method</Text>
                    <Tag color={complaint.assignedOfficer.assignedBy === 'AI' ? 'purple' : 'blue'} className="m-0 w-fit font-bold uppercase text-[9px]">
                      {complaint.assignedOfficer.assignedBy} Assigned
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
    </motion.div>
  );
};

export default ComplaintDetails;
