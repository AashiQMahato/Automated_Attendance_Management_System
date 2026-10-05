// routes/assignment.routes.js
import { Router } from 'express';
import {
    createAssignment,
    getAssignments,
    getAssignmentById,
    updateAssignment,
    deleteAssignment,
    submitAssignment,
    gradeSubmission
} from '../controllers/assignment.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/fileUpload.middleware.js';
import { restrictTo } from '../middlewares/roleCheck.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

// Teacher routes
router
    .route('/')
    .post(
        restrictTo('Teacher'),
        upload.array('files', 5), // Changed from 'attachments' to 'files'
        createAssignment
    )
    .get(getAssignments); // Both teachers and students can view

router
    .route('/:id')
    .get(getAssignmentById)
    // The frontend sends PUT; PATCH kept for compatibility.
    .put(restrictTo('Teacher'), upload.array('files', 5), updateAssignment)
    .patch(restrictTo('Teacher'), upload.array('files', 5), updateAssignment)
    .delete(
        restrictTo('Teacher'),
        deleteAssignment
    );

// Student submission route
router.post(
    '/:id/submit',
    restrictTo('Student'),
    upload.array('files', 1), // Changed from upload.single to upload.array for consistency
    submitAssignment
);

// Grade submission route (no file upload needed)
router.patch(
    '/:id/submissions/:submissionId/grade',
    restrictTo('Teacher'),
    gradeSubmission
);

export default router;