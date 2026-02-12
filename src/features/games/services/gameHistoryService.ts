import { supabase } from '../../../shared/lib/supabase';
import type { GameHistory, GameHistoryCreate } from '../../../shared/types';

export const gameHistoryService = {
    // Save a completed game to history
    async saveGameHistory(history: GameHistoryCreate): Promise<GameHistory> {
        const { data, error } = await supabase
            .from('game_history')
            .insert(history)
            .select()
            .single();

        if (error) throw error;
        return data as GameHistory;
    },

    // Get all game history for a student
    async getStudentHistory(studentId: string): Promise<GameHistory[]> {
        const { data, error } = await supabase
            .from('game_history')
            .select('*, game:games(*), assignment:assignments(*)')
            .eq('student_id', studentId)
            .order('completed_at', { ascending: false });

        if (error) throw error;
        return data as GameHistory[];
    },

    // Get history for a specific game
    async getGameHistory(gameId: string, studentId: string): Promise<GameHistory[]> {
        const { data, error } = await supabase
            .from('game_history')
            .select('*, game:games(*)')
            .eq('game_id', gameId)
            .eq('student_id', studentId)
            .order('completed_at', { ascending: false });

        if (error) throw error;
        return data as GameHistory[];
    },

    // Get history for a specific assignment
    async getAssignmentHistory(assignmentId: string): Promise<GameHistory[]> {
        const { data, error } = await supabase
            .from('game_history')
            .select('*, game:games(*)')
            .eq('assignment_id', assignmentId)
            .order('completed_at', { ascending: false });

        if (error) throw error;
        return data as GameHistory[];
    },

    // Get student statistics
    async getStudentStats(studentId: string): Promise<{
        totalGames: number;
        totalScore: number;
        averageScore: number;
        totalTime: number;
    }> {
        const { data, error } = await supabase
            .from('game_history')
            .select('score, max_score, time_seconds')
            .eq('student_id', studentId);

        if (error) throw error;

        const totalGames = data.length;
        const totalScore = data.reduce((sum, h) => sum + h.score, 0);
        const totalMaxScore = data.reduce((sum, h) => sum + h.max_score, 0);
        const averageScore = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
        const totalTime = data.reduce((sum, h) => sum + (h.time_seconds || 0), 0);

        return {
            totalGames,
            totalScore,
            averageScore: Math.round(averageScore),
            totalTime
        };
    }
};
