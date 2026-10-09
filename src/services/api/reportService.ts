import { MedicalReport } from '../../types';
import { getStoredPatients } from '../storageService';

export const reportService = {
  // GET /reports
  getAllReports: async (): Promise<MedicalReport[]> => {
    const patients = getStoredPatients();
    const reports: MedicalReport[] = [];
    patients.forEach((p) => {
      if (p.reports && p.reports.length > 0) {
        reports.push(...p.reports);
      }
    });
    return reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  // GET /reports/:id
  getReportById: async (id: string): Promise<MedicalReport | undefined> => {
    const reports = await reportService.getAllReports();
    return reports.find((r) => r.id === id);
  },
};
