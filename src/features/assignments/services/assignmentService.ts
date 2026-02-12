import { supabase } from '../../../shared/lib/supabase';
import type { Assignment, AssignmentCreate } from '../../../shared/types';

export const assignmentService = {
    // Assign a game to a student
    async assignGame(assignment: AssignmentCreate): Promise<Assignment> {
        const { data, error } = await supabase
            .from('assignments')
            .insert(assignment)
            .select()
            .single();

        if (error) throw error;
        return data as Assignment;
    },

    // Get all assignments for a specific student
    async getStudentAssignments(studentId: string): Promise<Assignment[]> {
        const { data, error } = await supabase
            .from('assignments')
            .select('*, game:games(*)')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Assignment[];
    },

    // Get pending assignments for a student
    async getPendingAssignments(studentId: string): Promise<Assignment[]> {
        const { data, error } = await supabase
            .from('assignments')
            .select('*, game:games(*)')
            .eq('student_id', studentId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Assignment[];
    },

    // Mark an assignment as completed
    async markAsCompleted(assignmentId: string): Promise<Assignment> {
        const { data, error } = await supabase
            .from('assignments')
            .update({ status: 'completed' })
            .eq('id', assignmentId)
            .select()
            .single();

        if (error) throw error;
        return data as Assignment;
    }
};
