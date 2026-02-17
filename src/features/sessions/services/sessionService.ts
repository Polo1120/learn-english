import { supabase } from '../../../shared/lib/supabase';
import type {
    GameSession,
    GameSessionExpanded,
    SessionScore,
    GameSessionCreate,
    SessionScoreCreate,
} from '../../../shared/types';


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

            const { data: score } = await supabase
                .from('session_scores')
                .select('attempts')
                .eq('session_id', session.id)
                .eq('nickname', nickname)
                .maybeSingle();

            return score?.attempts || 0;
        } catch (error) {
            console.error('Error getting user attempt count:', error);
            return 0;
        }
    },

    async submitScore(
        sessionId: string,
        nickname: string,
        score: number,
        timeTaken?: number,
        userId?: string
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
                const currentAttempts = existing.attempts || 1;

                if (session.max_attempts && currentAttempts >= session.max_attempts) {
                    throw new Error(`You have reached the limit of ${session.max_attempts} attempt(s) for this session`);
                }

                // Increment attempts regardless of score improvement
                const nextAttempts = currentAttempts + 1;

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
                            attempts: nextAttempts
                        })
                        .eq('id', existing.id)
                        .select()
                        .single();

                    if (error) throw error;
                    return data;
                } else {
                    // Update attempts count even if score didn't improve
                    const { error } = await supabase
                        .from('session_scores')
                        .update({
                            attempts: nextAttempts
                        })
                        .eq('id', existing.id);

                    if (error) throw error;

                    throw new Error('You did not beat your previous score');
                }
            }

            const scoreData: SessionScoreCreate = {
                session_id: session.id,
                user_id: userId,
                nickname: nickname.trim(),
                score,
                completed_at: new Date().toISOString(),
                time_taken: timeTaken,
                attempts: 1
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

    async getUserSessions(): Promise<(GameSessionExpanded & { studentCount: number })[]> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const { data: sessions, error } = await supabase
                .from('game_sessions')
                .select('*, scores:session_scores(count)')
                .eq('creator_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (!sessions) return [];

            const sessionsWithGames = await Promise.all(
                sessions.map(async (session: any) => {
                    const { data: game } = await supabase
                        .from('games')
                        .select('*')
                        .eq('id', session.game_id)
                        .single();

                    return {
                        ...session,
                        studentCount: session.scores?.[0]?.count || 0,
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

    async getUserScores(userId: string): Promise<(SessionScore & { session: any })[]> {
        try {
            const { data: scores, error } = await supabase
                .from('session_scores')
                .select('*, session:game_sessions(*, game:games(*))')
                .eq('user_id', userId)
                .order('completed_at', { ascending: false });

            if (error) throw error;
            return (scores || []) as (SessionScore & { session: any })[];
        } catch (error) {
            console.error('Error fetching user scores:', error);
            return [];
        }
    },

    subscribeToAllUserSessions(callback: (payload: any) => void) {
        const channel = supabase
            .channel('all_sessions_scores')
            .on('postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'session_scores'
                },
                callback
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },
};
