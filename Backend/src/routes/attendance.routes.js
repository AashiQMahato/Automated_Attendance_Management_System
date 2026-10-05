import express from 'express';
import {
    markAttendance,
    getAttendanceBySubject,
    updateAttendance,
    deleteAttendance,
    getStudentAttendance,
    recognizeAttendancePhoto
} from '../controllers/attendance.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/roleCheck.middleware.js';
import { imageUpload } from '../middlewares/fileUpload.middleware.js';

const router = express.Router();

// Recording and changing attendance is for teachers only.
router.route("/markattendance")
    .post(authenticateUser, restrictTo('Teacher'), markAttendance);

router.route("/recognize")
    .post(authenticateUser, restrictTo('Teacher'), imageUpload.single('file'), recognizeAttendancePhoto);

router.route("/subject/:subjectId")
    .get(authenticateUser, getAttendanceBySubject);

router.route("/update/:attendanceId")
    .put(authenticateUser, restrictTo('Teacher'), updateAttendance);

router.route("/delete/:attendanceId")
    .delete(authenticateUser, restrictTo('Teacher'), deleteAttendance);

router.route("/student")
    .get(authenticateUser, getStudentAttendance);

export default router;
