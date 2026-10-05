import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAttendanceStore = create(persist(
  (set, get) => ({
    attendanceRecords: [],
    
    addAttendanceRecord: (recognitionResults, subjects, cloudinaryUrl) => {
      set(() => {
        const currentDate = new Date();
        const newRecord = {
          date: currentDate.toISOString().split('T')[0],
          timestamp: currentDate.toISOString(),
          subjects: subjects,
          cloudinaryUrl: cloudinaryUrl,
          students: recognitionResults.map(result => ({
            name: result.name,
            confidence: result.confidence,
            recognizedAt: currentDate.toISOString()
          }))
        };

        return {
          attendanceRecords: [newRecord]
        };
      });
    },

    getAttendanceByDate: (date) => {
      return get().attendanceRecords.filter(
        record => record.date === date
      );
    },

    clearAttendanceRecords: () => {
      set({ attendanceRecords: [] });
    }
  }),
  {
    name: 'attendance-storage',
   Storage: () => localStorage,
  }
));

export default useAttendanceStore;