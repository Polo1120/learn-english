import { useState, useEffect } from 'react';
import { profileService } from '../../profile/services/profileService';
import { assignmentService } from '../services/assignmentService';
import type { Profile } from '../../../shared/types';
import { X, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface AssignGameModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameId: string;
    gameTitle: string;
}

export const AssignGameModal = ({ isOpen, onClose, gameId, gameTitle }: AssignGameModalProps) => {
    const { user } = useAuth();
    const [students, setStudents] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchStudents();
            setFeedback(null);
            setSelectedStudent(null);
            setSearchTerm('');
        }
    }, [isOpen]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const data = await profileService.getStudents();
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedStudent || !user) return;

        try {
            setAssigning(true);
            await assignmentService.assignGame({
                student_id: selectedStudent,
                game_id: gameId,
                teacher_id: user.id
            });
            setFeedback({ type: 'success', message: 'Game assigned successfully!' });
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Error assigning game:', error);
            setFeedback({ type: 'error', message: 'Failed to assign game. It might already be assigned.' });
        } finally {
            setAssigning(false);
        }
    };

    const filteredStudents = students.filter(student =>
        student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-white/10">
                <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Assign Game</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Assigning <span className="font-bold text-primary">{gameTitle}</span> to:
                    </p>

                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10 w-full"
                        />
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2 mb-6 pr-1">
                        {loading ? (
                            <div className="text-center py-4 text-slate-500">Loading students...</div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="text-center py-4 text-slate-500">No students found.</div>
                        ) : (
                            filteredStudents.map(student => (
                                <button
                                    key={student.id}
                                    onClick={() => setSelectedStudent(student.id)}
                                    className={`w-full flex items-center p-3 rounded-xl transition-all ${selectedStudent === student.id
                                        ? 'bg-primary/10 border-primary border'
                                        : 'bg-slate-50 dark:bg-white/5 border border-transparent hover:bg-slate-100 dark:hover:bg-white/10'
                                        }`}
                                >
                                    <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mr-3 font-bold text-slate-600 dark:text-slate-300">
                                        {student.full_name?.[0] || student.email[0].toUpperCase()}
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-slate-900 dark:text-white">
                                            {student.full_name || 'Unknown'}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            {student.email}
                                        </div>
                                    </div>
                                    {selectedStudent === student.id && (
                                        <CheckCircle className="ml-auto text-primary" size={20} />
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    {feedback && (
                        <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-sm ${feedback.type === 'success'
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                            {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            {feedback.message}
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <button onClick={onClose} className="btn btn-ghost">Cancel</button>
                        <button
                            onClick={handleAssign}
                            disabled={!selectedStudent || assigning}
                            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {assigning ? 'Assigning...' : 'Assign Game'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
