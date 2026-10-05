import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import axios from 'axios';
import { message } from 'antd';
import { API_BASE_URL } from "../../../config/env";

const SubjectSetup = ({ onSubjectCreated }) => {
    const [subjectData, setSubjectData] = useState({
        name: '',
        code: '',
        semester: '',
        creditHours: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSubjectData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                `${API_BASE_URL}/subjects`,
                subjectData,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            message.success('Subject created successfully!');
            onSubjectCreated(response.data);
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to create subject');
        }
    };

    return (
        <div className="min-h-screen p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
            <div className="max-w-md p-8 mx-auto border shadow-2xl bg-white/5 backdrop-blur-xl rounded-3xl border-white/10">
                <h2 className="mb-6 text-2xl font-bold text-center text-transparent bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text">
                    Setup Your Subject
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-blue-200">
                            Subject Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={subjectData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 text-white border rounded-lg bg-white/5 border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Mathematics"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-blue-200">
                            Subject Code
                        </label>
                        <input
                            type="text"
                            name="code"
                            value={subjectData.code}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 text-white border rounded-lg bg-white/5 border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. MATH101"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-blue-200">
                            Semester
                        </label>
                        <input
                            type="text"
                            name="semester"
                            value={subjectData.semester}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 text-white border rounded-lg bg-white/5 border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Fall 2024"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-blue-200">
                            Credit Hours
                        </label>
                        <input
                            type="number"
                            name="creditHours"
                            value={subjectData.creditHours}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 text-white border rounded-lg bg-white/5 border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. 3"
                            min="1"
                            max="6"
                        />
                    </div>
                    <button
                        type="submit"
                        className="flex items-center justify-center w-full gap-2 px-6 py-3 text-white transition-all bg-gradient-to-r from-blue-600 to-purple-500 rounded-xl hover:shadow-blue-glow"
                    >
                        <Plus className="w-5 h-5" />
                        Create Subject
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SubjectSetup;