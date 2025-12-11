// Base types for game content
export type GameType = 'flashcard' | 'quiz' | 'hangman';

export interface Flashcard {
    id?: string;
    front: string;
    back: string;
}

export interface Question {
    id?: string;
    text: string;
    options: string[];
    correctAnswer: number;
}

export interface HangmanWord {
    id?: string;
    word: string;
    hint: string;
}

export interface GameContent {
    cards?: Flashcard[];
    questions?: Question[];
    words?: HangmanWord[];
}

// Base Game interface
export interface Game {
    id: string;
    title: string;
    description: string;
    type: GameType;
    content: GameContent;
    user_id?: string;
    created_at?: string;
    updated_at?: string;
}

// Session types
export interface GameSession {
    id: string;
    session_id: string; // 8-char code
    game_id: string;
    creator_id: string;
    title: string;
    is_active: boolean;
    expires_at?: string;
    max_attempts?: number;
    created_at: string;
    updated_at: string;
}

export interface GameSessionExpanded extends GameSession {
    expand?: {
        game?: Game;
    };
}

export interface SessionScore {
    id: string;
    session_id: string;
    nickname: string;
    score: number;
    time_taken?: number;
    completed_at: string;
    created_at: string;
}

export interface GameSessionCreate {
    session_id: string;
    game_id: string;
    creator_id: string;
    title: string;
    is_active?: boolean;
    expires_at?: string;
    max_attempts?: number;
}

export interface SessionScoreCreate {
    session_id: string;
    nickname: string;
    score: number;
    time_taken?: number;
    completed_at?: string;
}

// Supabase Database types
export interface Database {
    public: {
        Tables: {
            games: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    description: string;
                    type: GameType;
                    content: GameContent;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    description: string;
                    type: GameType;
                    content: GameContent;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    title?: string;
                    description?: string;
                    type?: GameType;
                    content?: GameContent;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            game_sessions: {
                Row: GameSession;
                Insert: Omit<GameSession, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<GameSession, 'id' | 'created_at' | 'updated_at'>>;
            };
            session_scores: {
                Row: SessionScore;
                Insert: Omit<SessionScore, 'id' | 'created_at'>;
                Update: Partial<Omit<SessionScore, 'id' | 'created_at'>>;
            };
        };
    };
}

// User types
export interface User {
    id: string;
    email?: string;
    user_metadata?: {
        name?: string;
        avatar_url?: string;
    };
    created_at?: string;
}

// Auth types
export interface LoginCredentials {
    email: string;
    password: string;
}


