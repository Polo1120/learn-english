import { supabase } from '../lib/supabase';
import type {
    GameSession,
    GameSessionExpanded,
    SessionScore,
    GameSessionCreate,
    SessionScoreCreate,
} from '../types';


function generateSessionCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export const sessionService = {
    async createSession(
        gameId: string,
        title: string,
        durationHours: number = 24,
        maxAttempts?: number
    ): Promise<GameSession> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            let sessionId = generateSessionCode();
            let isUnique = false;
            let attempts = 0;
            while (!isUnique && attempts < 10) {
                const { data } = await supabase
                    .from('game_sessions')
                    .select('id')
                    .eq('session_id', sessionId)
                    .single();

                if (!data) {
                    isUnique = true;
                } else {
                    sessionId = generateSessionCode();
                    attempts++;
                }
            }

            if (!isUnique) {
                throw new Error('Failed to generate unique session code');
            }

            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + durationHours);

            const sessionData: GameSessionCreate = {
                session_id: sessionId,
                game_id: gameId,
                creator_id: user.id,
                title,
                is_active: true,
                expires_at: expiresAt.toISOString(),
                max_attempts: maxAttempts,
            };

            const { data, error } = await supabase
                .from('game_sessions')
                .insert(sessionData)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating session:', error);
            throw error;
        }
    },

    async getSessionByCode(sessionId: string): Promise<GameSessionExpanded | null> {
        try {
            const { data: session, error } = await supabase
                .from('game_sessions')
                .select('*')
                .eq('session_id', sessionId)
                .single();

            if (error) throw error;
            if (!session) return null;

            const { data: game } = await supabase
                .from('games')
                .select('*')
                .eq('id', session.game_id)
                .single();

            return {
                ...session,
                expand: {
                    game: game || undefined,
                },
            };
        } catch (error) {
            console.error('Error fetching session:', error);
            return null;
        }
    },

    isSessionActive(session: GameSession): boolean {
        if (!session.is_active) {
            return false;
        }

        if (session.expires_at) {
            const expirationDate = new Date(session.expires_at);
            const now = new Date();
            return now < expirationDate;
        }

        return true;
    },

    async getUserAttemptCount(sessionId: string, nickname: string): Promise<number> {
        try {
            const { data: session } = await supabase
                .from('game_sessions')
                .select('id')
                .eq('session_id', sessionId)
                .single();

            if (!session) return 0;

            const { data: scores } = await supabase
                .from('session_scores')
                .select('id')
                .eq('session_id', session.id)
                .eq('nickname', nickname);

            return scores?.length || 0;
        } catch (error) {
            console.error('Error getting user attempt count:', error);
            return 0;
        }
    },

    async submitScore(
        sessionId: string,
        nickname: string,
        score: number,
        timeTaken?: number
    ): Promise<SessionScore> {
        try {
            const { data: session, error: sessionError } = await supabase
                .from('game_sessions')
                .select('*')
                .eq('session_id', sessionId)
                .single();

            if (sessionError) throw sessionError;
            if (!session) throw new Error('Session not found');

            if (!this.isSessionActive(session)) {
                throw new Error('Session is not active or has expired');
            }

            const { data: existing } = await supabase
                .from('session_scores')
                .select('*')
                .eq('session_id', session.id)
                .eq('nickname', nickname)
                .single();

            if (existing) {
                if (session.max_attempts && session.max_attempts <= 1) {
                    throw new Error(`Has alcanzado el límite de ${session.max_attempts} intento(s) para esta sesión`);
                }
                const isBetterScore = score > existing.score;
                const isSameScoreFasterTime = score === existing.score &&
                    timeTaken && existing.time_taken &&
                    timeTaken < existing.time_taken;

                if (isBetterScore || isSameScoreFasterTime) {
                    const { data, error } = await supabase
                        .from('session_scores')
                        .update({
                            score,
                            completed_at: new Date().toISOString(),
                            time_taken: timeTaken,
                        })
                        .eq('id', existing.id)
                        .select()
                        .single();

                    if (error) throw error;
                    return data;
                } else {
                    throw new Error('No superaste tu puntuación anterior');
                }
            }

            const scoreData: SessionScoreCreate = {
                session_id: session.id,
                nickname: nickname.trim(),
                score,
                completed_at: new Date().toISOString(),
                time_taken: timeTaken,
            };

            const { data, error } = await supabase
                .from('session_scores')
                .insert(scoreData)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error submitting score:', error);
            throw error;
        }
    },

    async getLeaderboard(sessionId: string): Promise<SessionScore[]> {
        try {
            const { data: session } = await supabase
                .from('game_sessions')
                .select('id')
                .eq('session_id', sessionId)
                .single();

            if (!session) return [];

            const { data, error } = await supabase
                .from('session_scores')
                .select('*')
                .eq('session_id', session.id)
                .order('score', { ascending: false })
                .order('time_taken', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            return [];
        }
    },

    subscribeToLeaderboard(sessionId: string, callback: (score: SessionScore) => void) {
        const channel = supabase
            .channel(`leaderboard_${sessionId}`)
            .on('postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'session_scores',
                    filter: `session_id=eq.${sessionId}`
                },
                (payload) => {
                    if (payload.new) {
                        callback(payload.new as SessionScore);
                    }
                }
            )
            .subscribe();

        return async () => {
            await supabase.removeChannel(channel);
        };
    },

    async deactivateSession(sessionId: string): Promise<boolean> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const { data: session } = await supabase
                .from('game_sessions')
                .select('*')
                .eq('session_id', sessionId)
                .single();

            if (!session) throw new Error('Session not found');

            if (session.creator_id !== user.id) {
                throw new Error('Only the creator can deactivate this session');
            }

            const { error } = await supabase
                .from('game_sessions')
                .update({ is_active: false })
                .eq('id', session.id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deactivating session:', error);
            return false;
        }
    },

    async getUserSessions(): Promise<GameSessionExpanded[]> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const { data: sessions, error } = await supabase
                .from('game_sessions')
                .select('*')
                .eq('creator_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (!sessions) return [];

            const sessionsWithGames = await Promise.all(
                sessions.map(async (session) => {
                    const { data: game } = await supabase
                        .from('games')
                        .select('*')
                        .eq('id', session.game_id)
                        .single();

                    return {
                        ...session,
                        expand: {
                            game: game || undefined,
                        },
                    };
                })
            );

            return sessionsWithGames;
        } catch (error) {
            console.error('Error fetching user sessions:', error);
            return [];
        }
    },
};
