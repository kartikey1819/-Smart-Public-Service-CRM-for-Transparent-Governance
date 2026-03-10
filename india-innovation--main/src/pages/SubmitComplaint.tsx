import React, { useState } from 'react';
import * as Antd from 'antd';
import { 
  InboxOutlined, 
  SendOutlined, 
  RobotOutlined, 
  CheckCircleOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  WhatsAppOutlined
} from '@ant-design/icons';
import { complaintService } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

const { Form, Input, Select, Button, Upload, Card, Typography, Space, Modal, Alert, Row, Col, Tag, Steps } = Antd as any;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const SubmitComplaint: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState<{ category: string; priority: string; department: string } | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  const { refreshData, addNotification } = useAppContext();
  const { t } = useTranslation();
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [waMessages, setWaMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: "Namaste! Welcome to Municipal Command Center. How can I help you today?", isUser: false }
  ]);
  const [waInput, setWaInput] = useState('');

  const handleWaSend = () => {
    if (!waInput.trim()) return;
    const userMsg = waInput;
    setWaMessages(prev => [...prev, { text: userMsg, isUser: true }]);
    setWaInput('');
    
    setTimeout(() => {
      setWaMessages(prev => [...prev, { text: "Grievance CRM006 created successfully! Our team is on it.", isUser: false }]);
    }, 1000);
  };

  const onValuesChange = (changedValues: any) => {
    if (changedValues.description && changedValues.description.length > 10) {
      const desc = changedValues.description.toLowerCase();
      let category = t('general');
      let priority = 'Medium';
      let department = 'Nagar Nigam';

      if (desc.includes('water') || desc.includes('pani') || desc.includes('leak')) {
        category = t('water_supply');
        priority = 'High';
        department = 'Jal Vibhag';
      } else if (desc.includes('road') || desc.includes('pothole') || desc.includes('sadak')) {
        category = t('road');
        priority = 'Medium';
        department = 'PWD';
      } else if (desc.includes('light') || desc.includes('bijli') || desc.includes('electricity')) {
        category = t('electricity');
        priority = 'Low';
        department = 'Electricity Board';
      } else if (desc.includes('garbage') || desc.includes('kachra') || desc.includes('clean')) {
        category = t('sanitation');
        priority = 'Medium';
        department = 'Swachh Bharat Cell';
      }

      setAiPreview({ category, priority, department });
    } else if (changedValues.description === '') {
      setAiPreview(null);
    }
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      let imageUrl = null;
      if (fileList.length > 0 && fileList[0].originFileObj) {
        imageUrl = await getBase64(fileList[0].originFileObj);
      }

      const data = {
        ...values,
        category: aiPreview?.category || t('general'),
        priority: aiPreview?.priority || 'Medium',
        imageUrl
      };
      const result = await complaintService.submitComplaint(data);
      const finalComplaint = result.complaint;
      
      // Add real notification
      addNotification({
        title: t('new_grievance_registered'),
        message: `${t('grievance')} #${result.id} ${t('logged_and_routed')}`,
        type: 'success'
      });

      Modal.success({
        title: t('complaint_registered'),
        icon: null,
        content: (
          <div className="text-center py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              <CheckCircleOutlined className="text-6xl text-emerald-500 mb-4" />
            </motion.div>
            <Title level={3} className="m-0">{finalComplaint.id}</Title>
            <Text type="secondary" className="block mt-2">{t('complaint_registered_ai')}</Text>
            <div className="mt-6 p-4 bg-slate-50 rounded-xl text-left">
              <div className="flex justify-between mb-2">
                <Text type="secondary">{t('status')}:</Text>
                <Tag color="processing">{t(finalComplaint.status.toLowerCase().replace(' ', '_'))}</Tag>
              </div>
              <div className="flex justify-between mb-2">
                <Text type="secondary">{t('category')}:</Text>
                <Tag color="blue">{finalComplaint.category.toUpperCase()}</Tag>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">{t('priority')}:</Text>
                <Tag color={finalComplaint.priority === 'High' ? 'red' : 'orange'}>{t(finalComplaint.priority.toLowerCase())}</Tag>
              </div>
            </div>
          </div>
        ),
        okText: t('back_to_dashboard'),
        onOk: () => {
          form.resetFields();
          setAiPreview(null);
          setFileList([]);
          refreshData();
        },
      });
    } catch (error) {
      console.error('Error submitting complaint:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-5xl mx-auto"
    >
      <div className="mb-10 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-gov-gold rounded-full" />
          <Text className="text-[10px] font-bold text-gov-green uppercase tracking-[0.2em]">{t('citizen_intake')}</Text>
        </div>
        <Title level={2} className="m-0 font-bold tracking-tight text-slate-800 serif">{t('lodge_grievance')}</Title>
        <Text className="text-slate-400 text-sm">{t('official_portal')}</Text>
      </div>
      
      <Row gutter={[40, 40]}>
        <Col xs={24} lg={15}>
          <Card className="shadow-sm border-none overflow-visible rounded-2xl">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              onValuesChange={onValuesChange}
              initialValues={{ ward: 'W1' }}
              requiredMark={false}
            >
              <div className="space-y-8">
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gov-green/5 text-gov-green flex items-center justify-center font-bold text-sm shadow-inner border border-gov-green/10">01</div>
                    <Title level={4} className="m-0 text-slate-700">{t('description')}</Title>
                  </div>
                  <Form.Item
                    name="description"
                    label={<Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{t('description')}</Text>}
                    rules={[{ required: true, message: t('description_required') }]}
                  >
                    <TextArea
                      rows={6}
                      className="rounded-2xl border-slate-200 focus:border-gov-green focus:shadow-none p-4 text-slate-700"
                      placeholder={t('description_placeholder')}
                    />
                  </Form.Item>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gov-green/5 text-gov-green flex items-center justify-center font-bold text-sm shadow-inner border border-gov-green/10">02</div>
                    <Title level={4} className="m-0 text-slate-700">{t('location_verification')}</Title>
                  </div>
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item
                        name="ward"
                        label={<Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{t('ward')}</Text>}
                        rules={[{ required: true }]}
                      >
                        <Select
                          className="h-12 rounded-xl"
                          options={[
                            { value: 'W1', label: `${t('ward')} 1 - ${t('north_zone')}` },
                            { value: 'W2', label: `${t('ward')} 2 - ${t('east_zone')}` },
                            { value: 'W3', label: `${t('ward')} 3 - ${t('central_zone')}` },
                            { value: 'W4', label: `${t('ward')} 4 - ${t('west_zone')}` },
                            { value: 'W5', label: `${t('ward')} 5 - ${t('south_zone')}` },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="gali"
                        label={<Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{t('gali')}</Text>}
                        rules={[{ required: true, message: t('gali_required') }]}
                      >
                        <Input prefix={<EnvironmentOutlined className="text-slate-300" />} className="h-12 rounded-xl" placeholder={t('gali_placeholder')} />
                      </Form.Item>
                    </Col>
                  </Row>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gov-green/5 text-gov-green flex items-center justify-center font-bold text-sm shadow-inner border border-gov-green/10">03</div>
                    <Title level={4} className="m-0 text-slate-700">{t('visual_evidence')}</Title>
                  </div>
                  <Form.Item>
                    <Dragger 
                      maxCount={1} 
                      beforeUpload={() => false} 
                      fileList={fileList}
                      onChange={({ fileList }) => setFileList(fileList)}
                      className="bg-slate-50 border-slate-200 rounded-3xl p-10 group hover:border-gov-green transition-all duration-300 hover:bg-white"
                    >
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined className="text-gov-green/20 group-hover:text-gov-green transition-colors text-5xl" />
                      </p>
                      <p className="ant-upload-text font-bold text-slate-700 text-lg">{t('upload_text')}</p>
                      <p className="ant-upload-hint text-xs text-slate-400 max-w-xs mx-auto">{t('upload_hint')}</p>
                    </Dragger>
                  </Form.Item>
                </section>

                <div className="pt-6 space-y-4">
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SendOutlined />}
                    loading={loading}
                    block
                    size="large"
                    className="h-14 text-base font-bold rounded-2xl bg-gov-maroon border-none shadow-xl shadow-gov-maroon/20 hover:!bg-gov-maroon/90"
                  >
                    {t('submit')}
                  </Button>
                  <Button
                    icon={<WhatsAppOutlined />}
                    block
                    size="large"
                    className="h-14 text-base font-bold rounded-2xl border-emerald-500 text-emerald-600 hover:!text-emerald-700 hover:!border-emerald-600"
                    onClick={() => setShowWhatsApp(true)}
                  >
                    {t('whatsapp_submit')}
                  </Button>
                </div>
              </div>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <div className="sticky top-8 space-y-8">
            <AnimatePresence mode="wait">
              {aiPreview ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card
                    className="shadow-xl border-none bg-gov-green text-white overflow-hidden relative rounded-2xl"
                  >
                    <div className="absolute -right-8 -top-8 opacity-5">
                      <RobotOutlined style={{ fontSize: '180px' }} />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                          <RobotOutlined className="text-2xl text-gov-gold" />
                        </div>
                        <div>
                          <Text className="text-white font-bold text-lg block leading-none">{t('ai_smart_triage')}</Text>
                          <Text className="text-white/40 text-[10px] uppercase tracking-widest font-bold">{t('automated_routing')}</Text>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-white/5 p-5 rounded-2xl backdrop-blur-md border border-white/10">
                          <div className="flex justify-between items-center mb-4">
                            <Text className="text-white/40 text-[10px] uppercase tracking-widest font-bold">{t('classification')}</Text>
                            <Tag color="blue" className="m-0 border-none bg-gov-navy text-white rounded-full px-4 py-0.5 font-bold text-[10px]">{aiPreview.category.toUpperCase()}</Tag>
                          </div>
                          <div className="flex justify-between items-center">
                            <Text className="text-white/40 text-[10px] uppercase tracking-widest font-bold">{t('priority_level')}</Text>
                            <Tag color={aiPreview.priority === 'High' ? 'red' : 'orange'} className="m-0 border-none rounded-full px-4 py-0.5 font-bold text-[10px]">
                              {t(aiPreview.priority.toLowerCase()).toUpperCase()}
                            </Tag>
                          </div>
                        </div>

                        <div>
                          <Text className="text-white/40 text-[10px] uppercase tracking-widest font-bold block mb-3">{t('routing_to_department')}</Text>
                          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                              <FileTextOutlined className="text-xl text-gov-gold" />
                            </div>
                            <div>
                              <Text className="text-white font-bold block">{aiPreview.department}</Text>
                              <Text className="text-white/40 text-[10px]">{t('zonal_field_unit')}</Text>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 text-white/60 text-xs bg-white/5 p-4 rounded-xl border border-white/5">
                          <InfoCircleOutlined className="mt-1 text-gov-gold" />
                          <p className="m-0 leading-relaxed">{t('ai_analysis_hint')}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Card className="shadow-sm border-dashed border-slate-200 bg-slate-50/50 text-center py-16 rounded-2xl">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <RobotOutlined className="text-4xl text-slate-200" />
                    </div>
                    <Title level={5} className="text-slate-400 font-bold mb-2">{t('ai_triage_inactive')}</Title>
                    <Text type="secondary" className="text-xs px-12 block leading-relaxed">
                      {t('ai_triage_inactive_hint')}
                    </Text>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <Card className="shadow-sm border-none bg-gov-green text-white rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
              <div className="relative z-10">
                <Title level={5} className="text-white mb-6 flex items-center gap-2 serif">
                  <div className="w-1 h-4 bg-gov-gold rounded-full" />
                  {t('process_lifecycle')}
                </Title>
                <Steps
                  direction="vertical"
                  size="small"
                  current={0}
                  className="custom-steps-white"
                  items={[
                    { title: <span className="text-white text-sm font-bold">{t('registration')}</span>, description: <span className="text-white/40 text-xs">{t('registration_desc')}</span> },
                    { title: <span className="text-white/40 text-sm font-bold">{t('ai_routing')}</span>, description: <span className="text-white/20 text-xs">{t('ai_routing_desc')}</span> },
                    { title: <span className="text-white/40 text-sm font-bold">{t('resolution')}</span>, description: <span className="text-white/20 text-xs">{t('resolution_desc')}</span> },
                  ]}
                />
              </div>
            </Card>
          </div>
        </Col>
      </Row>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <WhatsAppOutlined className="text-emerald-500 text-xl" />
            <Text strong>WhatsApp Municipal Assistant</Text>
          </div>
        }
        open={showWhatsApp}
        onCancel={() => setShowWhatsApp(false)}
        footer={null}
        width={400}
        styles={{ body: { padding: 0 } }}
        className="whatsapp-modal"
      >
        <div className="bg-[#e5ddd5] h-[450px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {waMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl shadow-sm ${msg.isUser ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                  <Text className="text-sm">{msg.text}</Text>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-[#f0f0f0] flex gap-2">
            <Input 
              value={waInput} 
              onChange={e => setWaInput(e.target.value)} 
              onPressEnter={handleWaSend}
              placeholder="Type in Hindi or English..." 
              className="rounded-full border-none"
            />
            <Button 
              type="primary" 
              shape="circle" 
              icon={<SendOutlined />} 
              onClick={handleWaSend}
              className="bg-[#128c7e] border-none"
            />
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default SubmitComplaint;
