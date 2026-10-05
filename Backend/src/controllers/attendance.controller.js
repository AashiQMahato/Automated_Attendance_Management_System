import { Attendance } from '../models/attendance.model.js';
import { StudentSubject } from '../models/studentSubject.model.js';
import { Subject } from '../models/subject.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import { apiError } from '../utils/errorHandler.js';
import { recognizeFaces } from '../services/faceService.js';

export const getStudentAttendance = asyncHandler(async (req, res) => {
    try {
      const attendance = await Attendance.find({
        'students.student': req.user._id
      }).populate('subject', 'name');
      res.status(200).json(attendance);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// Mark attendance for a class
export const markAttendance = async (req, res) => {
    try {
        const { subjectId, students, date } = req.body;

        if (!subjectId || !students || students.length === 0) {
            return res.status(400).json({ message: 'Invalid attendance data' });
        }

        // One session per subject per day. (Compare the whole day: stored
        // dates include a time, so an exact-midnight match never fires.)
        const day = date ? new Date(date) : new Date();
        const dayStart = new Date(day);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);
        const existingAttendance = await Attendance.findOne({
            subject: subjectId,
            date: { $gte: dayStart, $lte: dayEnd }
        });

        if (existingAttendance) {
            return res.status(400).json({ message: 'Attendance already marked for this date' });
        }

        const attendance = new Attendance({
            subject: subjectId,
            students: students.map(s => ({
                student: s.student,
                status: s.status,
                confidence: s.confidence || null
            })),
            teacher: req.user._id,
            date: date || new Date()
        });

        await attendance.save();

        // Update StudentSubject attendance records
        const bulkOps = students.map(student => ({
            updateOne: {
                filter: {
                    student: student.student,
                    subject: subjectId
                },
                update: {
                    $inc: {
                        totalClasses: 1,
                        attendedClasses: student.status === 'present' ? 1 : 0
                    }
                },
                upsert: true
            }
        }));

        await StudentSubject.bulkWrite(bulkOps);

        res.status(201).json(attendance);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Recognize students in a class photo via the face service.
export const recognizeAttendancePhoto = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new apiError(400, 'Please attach a class photo');
    }
    const result = await recognizeFaces(req.file);
    res.status(200).json(result);
});

// Get attendance by subject
export const getAttendanceBySubject = asyncHandler(async (req, res) => {
    const { subjectId } = req.params;

    
    // Verify the subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
  
    // Find all attendance records for this subject
    const attendanceRecords = await Attendance.find({ 
      subject: subjectId 
    }).sort({ date: -1 });
  
    res.status(200).json({
      success: true,
      data: attendanceRecords
    });
  });



// Update attendance record
export const updateAttendance = async (req, res) => {
    try {
        const { attendanceId } = req.params;
        const { students } = req.body;

        const attendance = await Attendance.findById(attendanceId);
        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        // Update attendance
        attendance.students = students;
        await attendance.save();

        // Update StudentSubject records
        const bulkOps = students.map(student => ({
            updateOne: {
                filter: {
                    student: student.student,
                    subject: attendance.subject
                },
                update: {
                    $inc: {
                        attendedClasses: student.status === 'present' ? 1 : -1
                    }
                }
            }
        }));

        await StudentSubject.bulkWrite(bulkOps);

        res.status(200).json(attendance);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete attendance record
export const deleteAttendance = async (req, res) => {
    try {
        const { attendanceId } = req.params;
        const attendance = await Attendance.findById(attendanceId);
        
        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        // Update StudentSubject records
        const bulkOps = attendance.students.map(student => ({
            updateOne: {
                filter: {
                    student: student.student,
                    subject: attendance.subject
                },
                update: {
                    $inc: {
                        totalClasses: -1,
                        attendedClasses: student.status === 'present' ? -1 : 0
                    }
                }
            }
        }));

        await StudentSubject.bulkWrite(bulkOps);
        await Attendance.findByIdAndDelete(attendanceId);

        res.status(200).json({ message: 'Attendance record deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
