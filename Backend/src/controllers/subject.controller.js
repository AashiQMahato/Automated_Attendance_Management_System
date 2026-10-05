import { Subject } from "../models/subject.model.js";
import { StudentSubject } from "../models/studentSubject.model.js";
import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createSubject = asyncHandler(async (req, res) => {
  try {
    // Create the main subject
    const subject = new Subject({
      name: req.body.name,
      code: req.body.code,
      semester: req.body.semester,
      creditHours: req.body.creditHours,
      teacher: req.user._id
    });
    await subject.save();

    // Enroll the students of this subject's semester (new students of that
    // semester are enrolled at signup; see user.controller).
    const students = await User.find({ role: "Student", semester: subject.semester });

    await StudentSubject.insertMany(
      students.map(student => ({
        student: student._id,
        subject: subject._id,
        semester: req.body.semester
      }))
    );

    res.status(201).json(subject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export const getSubjects = asyncHandler(async (req, res) => {
  try {
    let subjects;
    
    if (req.user.role === 'Teacher') {
      // If teacher, get subjects they teach
      subjects = await Subject.find({ teacher: req.user._id }).populate('teacher', 'email');
    } else {
      // If student, get subjects they're enrolled in
      const studentSubjects = await StudentSubject.find({ student: req.user._id })
        .populate({
          path: 'subject',
          populate: {
            path: 'teacher',
            select: 'email'
          }
        });
      
      subjects = studentSubjects.map(ss => ss.subject);
    }

    // An empty list is a normal state (new teacher / student), not an error.
    // StudentSubject rows can outlive a deleted subject, so drop nulls.
    res.status(200).json({ success: true, data: (subjects || []).filter(Boolean) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const getSubjectById = asyncHandler(async (req, res) => {
  try {
    let response;
    
    if (req.user.role === 'Teacher') {
      // If teacher, just get the subject details
      const subject = await Subject.findOne({
        _id: req.params.id,
        teacher: req.user._id
      });

      if (!subject) {
        return res.status(404).json({ 
          success: false, 
          message: 'Subject not found' 
        });
      }

      response = subject;
    } else {
      // If student, get subject with attendance details
      const studentSubject = await StudentSubject.findOne({
        subject: req.params.id,
        student: req.user._id
      }).populate('subject');

      if (!studentSubject) {
        return res.status(404).json({ 
          success: false, 
          message: 'Subject not found for this student' 
        });
      }

      // Calculate attendance percentage
      const attendancePercentage = studentSubject.totalClasses === 0 
        ? 0 
        : ((studentSubject.attendedClasses / studentSubject.totalClasses) * 100).toFixed(2);

      response = {
        ...studentSubject.subject.toObject(),
        totalClasses: studentSubject.totalClasses,
        attendedClasses: studentSubject.attendedClasses,
        attendancePercentage: parseFloat(attendancePercentage)
      };
    }

    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching subject details',
      error: error.message 
    });
  }
});