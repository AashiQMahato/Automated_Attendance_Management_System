//assignment.controller.js
import asyncHandler from "../utils/asyncHandler.js";
import { apiError } from "../utils/errorHandler.js";
import { Assignment } from "../models/assignment.model.js";
import apiResponse from "../utils/apiResponse.js";
import { upload, uploadToCloudinary } from '../middlewares/fileUpload.middleware.js';

const createAssignment = async (req, res) => {
    try {
        if (!req.user) {
            throw new apiError(401, "User not authenticated");
        }

        if (req.user.role !== "Teacher") {
            throw new apiError(403, "Only teachers can create assignments");
        }

        const files = req.files;
        let attachments = [];

        if (files && files.length > 0) {
            const uploadPromises = files.map(file => 
                uploadToCloudinary(file.buffer)
            );
            
            const cloudinaryResponses = await Promise.all(uploadPromises);
            attachments = cloudinaryResponses.map(response => response.secure_url);
        }

        // 🔥 Ensure the teacher field is included
        const assignment = new Assignment({
            ...req.body,
            attachments,
            teacher: req.user._id // ✅ Assign teacher from authenticated user
        });

        await assignment.save();
        res.status(201).json(assignment);
    } catch (error) {
        console.error("Error in createAssignment:", error);
        res.status(400).json({ 
            success: false,
            message: "Error creating assignment",
            error: error.message 
        });
    }
};

const submitAssignment = async (req, res) => {
    try {
        const file = req.files?.[0];
        if (!file) {
            return res.status(400).json({ success: false, message: "Please attach a file to submit" });
        }

        // Upload to cloudinary
        const cloudinaryResponse = await uploadToCloudinary(file.buffer, 'submissions');
        
        // Update assignment with submission
        // Route is /:id/submit — this previously read req.params.assignmentId
        // (always undefined), so submissions were silently never saved.
        const assignment = await Assignment.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    submissions: {
                        student: req.user._id,
                        submissionUrl: cloudinaryResponse.secure_url,
                        submittedAt: new Date()
                    }
                }
            },
            { new: true }
        );

        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        res.status(200).json({
            success: true,
            data: assignment
        });
    } catch (error) {
        console.error("Error in submitAssignment:", error);
        res.status(400).json({
            success: false,
            message: "Error submitting assignment",
            error: error.message
        });
    }
};
// Get all assignments (with filters)
const getAssignments = asyncHandler(async (req, res) => {
    const { subject, search } = req.query;
    const query = {};

    // Add filters if provided
    if (subject) query.subject = subject;
    if (search) {
        query.title = { $regex: search, $options: 'i' };
    }

    // If user is a student, show all assignments
    // If user is a teacher, show only their assignments
    if (req.user.role === 'Teacher') {
        query.teacher = req.user._id;
    }

    const assignments = await Assignment.find(query)
        .populate('subject', 'name code')
        .populate('teacher', 'fullName')
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new apiResponse(200, "Assignments fetched successfully", assignments)
    );
});

// Get single assignment
const getAssignmentById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const assignment = await Assignment.findById(id)
        .populate('subject', 'name code')
        .populate('teacher', 'fullName')
        .populate('submissions.student', 'fullName');

    if (!assignment) {
        throw new apiError(404, "Assignment not found");
    }

    return res.status(200).json(
        new apiResponse(200, "Assignment fetched successfully", assignment)
    );
});

// Update assignment
const updateAssignment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, subject, dueDate } = req.body;

    const assignment = await Assignment.findById(id);

    if (!assignment) {
        throw new apiError(404, "Assignment not found");
    }

    // Verify teacher owns this assignment
    if (assignment.teacher.toString() !== req.user._id.toString()) {
        throw new apiError(403, "Unauthorized to update this assignment");
    }

    // Files are kept in memory by multer (no file.path), so upload them like createAssignment does.
    const uploaded = await Promise.all((req.files || []).map(file => uploadToCloudinary(file.buffer)));
    const newAttachments = uploaded.map(response => response.secure_url);
    const attachments = [...assignment.attachments, ...newAttachments];

    const updatedAssignment = await Assignment.findByIdAndUpdate(
        id,
        {
            $set: {
                title: title || assignment.title,
                description: description || assignment.description,
                subject: subject || assignment.subject,
                dueDate: dueDate || assignment.dueDate,
                attachments
            }
        },
        { new: true }
    ).populate('subject', 'name code');

    return res.status(200).json(
        new apiResponse(200, "Assignment updated successfully", updatedAssignment)
    );
});

// Delete assignment
const deleteAssignment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const assignment = await Assignment.findById(id);

    if (!assignment) {
        throw new apiError(404, "Assignment not found");
    }

    // Verify teacher owns this assignment
    if (assignment.teacher.toString() !== req.user._id.toString()) {
        throw new apiError(403, "Unauthorized to delete this assignment");
    }

    await Assignment.findByIdAndDelete(id);

    return res.status(200).json(
        new apiResponse(200, "Assignment deleted successfully", null)
    );
});

// Grade submission (for teachers)
const gradeSubmission = asyncHandler(async (req, res) => {
    const { id, submissionId } = req.params;
    const { grade, feedback } = req.body;

    if (grade === undefined || grade === null || grade === "" || Number(grade) < 0 || Number(grade) > 100) {
        throw new apiError(400, "Valid grade is required");
    }

    const assignment = await Assignment.findById(id);

    if (!assignment) {
        throw new apiError(404, "Assignment not found");
    }

    // Verify teacher owns this assignment
    if (assignment.teacher.toString() !== req.user._id.toString()) {
        throw new apiError(403, "Unauthorized to grade this assignment");
    }

    // Find and update submission
    const submission = assignment.submissions.id(submissionId);
    if (!submission) {
        throw new apiError(404, "Submission not found");
    }

    submission.grade = grade;
    submission.feedback = feedback;

    await assignment.save();

    return res.status(200).json(
        new apiResponse(200, "Submission graded successfully", assignment)
    );
});

export {
    createAssignment,
    getAssignments,
    getAssignmentById,
    updateAssignment,
    deleteAssignment,
    submitAssignment,
    gradeSubmission
};