import axios from 'axios';
import { Complaint, DashboardData } from '../types';

const api = axios.create({
  baseURL: '/api',
});

export const dashboardService = {
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await api.get('/dashboard');
    return response.data;
  },
  getLeaderboard: async (): Promise<any[]> => {
    const response = await api.get('/leaderboard');
    return response.data;
  },
  getAlerts: async (): Promise<any[]> => {
    const response = await api.get('/alerts');
    return response.data;
  },
};

export const complaintService = {
  submitComplaint: async (data: Partial<Complaint>): Promise<{ id: string; complaint: Complaint }> => {
    const response = await api.post('/complaints', data);
    return response.data;
  },
  getComplaintDetails: async (id: string): Promise<Complaint> => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },
  getAiInsight: async (id: string): Promise<{ insight: string; steps: string[]; estimatedTime: string }> => {
    const response = await api.get(`/complaints/${id}/ai-insight`);
    return response.data;
  },
  appealComplaint: async (id: string): Promise<void> => {
    await api.post(`/appeal/${id}`);
  },
  uploadAfterPhoto: async (id: string, afterImageUrl: string): Promise<void> => {
    await api.post(`/complaints/${id}/photo`, { afterImageUrl });
  },
  resolveComplaint: async (id: string): Promise<void> => {
    await api.post(`/complaints/${id}/resolve`);
  },
  assignAiOfficer: async (id: string): Promise<void> => {
    await api.post(`/complaints/${id}/assign-ai`);
  },
  submitFeedback: async (id: string, rating: number, comment: string): Promise<void> => {
    await api.post(`/complaints/${id}/feedback`, { rating, comment });
  },
  reopenComplaint: async (id: string): Promise<void> => {
    await api.post(`/complaints/${id}/reopen`);
  },
};
