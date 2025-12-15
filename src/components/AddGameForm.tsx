import { useState, useEffect } from 'react';
import { useContent } from '../context/ContentContext';
import { gamesService } from '../services/gamesService';
import type { GameType, Flashcard, Question, HangmanWord } from '../types';
import { Plus, Trash2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConfirmationModal } from './ConfirmationModal';

export const AddGameForm = ({ gameId }: { gameId?: string }) => {
    const { addGame, updateGame } = useContent();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<GameType>('flashcard');
    const [feedbackModal, setFeedbackModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        variant: 'success' | 'danger';
        shouldRedirect: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        variant: 'success', // Default
        shouldRedirect: false
    });

    const [cards, setCards] = useState<Omit<Flashcard, 'id'>[]>([{ front: '', back: '' }]);
    const [questions, setQuestions] = useState<Omit<Question, 'id'>[]>([
        { text: '', options: ['', '', '', ''], correctAnswer: 0 }
    ]);
    const [words, setWords] = useState<Omit<HangmanWord, 'id'>[]>([{ word: '', hint: '' }]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (gameId) {
            loadGame(gameId);
        }
    }, [gameId]);

    const loadGame = async (id: string) => {
        try {
            setLoading(true);
            const game = await gamesService.getOne(id);
            if (game) {
                setTitle(game.title);
                setDescription(game.description);
                setType(game.type);

                if (game.type === 'flashcard' && game.content.cards) {
                    setCards(game.content.cards);
                } else if (game.type === 'quiz' && game.content.questions) {
                    setQuestions(game.content.questions);
                } else if (game.type === 'hangman' && game.content.words) {
                    setWords(game.content.words);
                }
            }
        } catch (error) {
            console.error('Error loading game:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCard = () => {
        setCards([...cards, { front: '', back: '' }]);
    };

    const handleRemoveCard = (index: number) => {
        setCards(cards.filter((_, i) => i !== index));
    };

    const handleCardChange = (index: number, field: 'front' | 'back', value: string) => {
        const newCards = [...cards];
        newCards[index][field] = value;
        setCards(newCards);
    };

    const handleAddQuestion = () => {
        setQuestions([...questions, { text: '', options: ['', '', '', ''], correctAnswer: 0 }]);
    };

    const handleRemoveQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleQuestionChange = (index: number, field: string, value: any) => {
        const newQuestions = [...questions];
        if (field === 'text') {
            newQuestions[index].text = value;
        } else if (field === 'correctAnswer') {
            newQuestions[index].correctAnswer = parseInt(value);
        }
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const handleAddWord = () => {
        setWords([...words, { word: '', hint: '' }]);
    };

    const handleRemoveWord = (index: number) => {
        setWords(words.filter((_, i) => i !== index));
    };

    const handleWordChange = (index: number, field: 'word' | 'hint', value: string) => {
        const newWords = [...words];
        newWords[index][field] = value;
        setWords(newWords);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const gameData = {
            title,
            description,
            type,
            content: type === 'flashcard'
                ? { cards: cards }
                : type === 'quiz'
                    ? { questions: questions }
                    : { words: words }
        };

        try {
            if (gameId) {
                await updateGame(gameId, gameData as any);
                setFeedbackModal({
                    isOpen: true,
                    title: 'Success!',
                    message: 'Game updated successfully!',
                    variant: 'success',
                    shouldRedirect: true
                });
            } else {
                await addGame(gameData as any);
                setFeedbackModal({
                    isOpen: true,
                    title: 'Success!',
                    message: 'Game created successfully!',
                    variant: 'success',
                    shouldRedirect: true
                });
            }
            // navigate('/'); // Moved to modal close
        } catch (err) {
            console.error('Error saving game:', err);
            setFeedbackModal({
                isOpen: true,
                title: 'Error',
                message: 'Failed to save game. Please try again.',
                variant: 'danger',
                shouldRedirect: false
            });
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading game details...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="card">
            <div className="form-group">
                <label className="label" htmlFor="gameType">
                    Game Type
                </label>
                <select
                    id="gameType"
                    name="gameType"
                    value={type}
                    onChange={(e) => setType(e.target.value as GameType)}
                    className="select"
                >
                    <option value="flashcard">Flashcards</option>
                    <option value="quiz">Quiz</option>
                    <option value="hangman">Hangman</option>
                </select>
            </div>

            <div className="form-group">
                <label className="label" htmlFor="title">
                    Title
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input"
                    required
                    placeholder="e.g., Advanced Vocabulary"
                />
            </div>

            <div className="form-group">
                <label className="label" htmlFor="description">
                    Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="textarea"
                    required
                    placeholder="Briefly describe what this game teaches..."
                    rows={3}
                />
            </div>

            <hr className="my-8 border-0 border-t border-slate-200" />

            <h3 className="mb-6 text-xl font-semibold">
                {type === 'flashcard' ? 'Flashcards' : type === 'quiz' ? 'Questions' : 'Words'}
            </h3>

            {type === 'flashcard' ? (
                <div className="flex  flex-col gap-6">
                    {cards.map((card, index) => (
                        <div key={index} className="flex flex-col sm:flex-row bg-slate-50 dark:bg-[#1A2230] items-end gap-4 items-start p-4 rounded-xl">
                            <div className="flex-1">
                                <label className="label text-sm" htmlFor="front">Front (English)</label>
                                <input
                                    type="text"
                                    id="front"
                                    name="front"
                                    value={card.front}
                                    onChange={(e) => handleCardChange(index, 'front', e.target.value)}
                                    className="input"
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label className="label text-sm" htmlFor="back">Back (Translation/Meaning)</label>
                                <input
                                    type="text"
                                    id="back"
                                    name="back"
                                    value={card.back}
                                    onChange={(e) => handleCardChange(index, 'back', e.target.value)}
                                    className="input"
                                    required
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveCard(index)}
                                className="mb-3 text-red-600 hover:text-red-700"
                                disabled={cards.length === 1}
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddCard} className="btn btn-outline self-start">
                        <Plus size={16} /> Add Card
                    </button>
                </div>
            ) : type === 'quiz' ? (
                <div className="flex flex-col gap-8">
                    {questions.map((q, qIndex) => (
                        <div key={qIndex} className="p-6 bg-slate-50 dark:bg-[#1A2230] rounded-xl relative">
                            <button
                                type="button"
                                onClick={() => handleRemoveQuestion(qIndex)}
                                className="absolute top-4 right-4 text-red-600 hover:text-red-700"
                                disabled={questions.length === 1}
                            >
                                <Trash2 size={20} />
                            </button>

                            <div className="form-group">
                                <label className="label" htmlFor="questionText">Question Text</label>
                                <input
                                    type="text"
                                    id="questionText"
                                    name="questionText"
                                    value={q.text}
                                    onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                                    className="input"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {q.options.map((option, oIndex) => (
                                    <div key={oIndex}>
                                        <label className="label  text-sm" htmlFor={`option-${oIndex}`}>Option {oIndex + 1}</label>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                type="radio"
                                                name={`correct-${qIndex}`}
                                                checked={q.correctAnswer === oIndex}
                                                onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                                                className="w-4 h-4 text-indigo-500"
                                            />
                                            <input
                                                type="text"
                                                id={`option-${oIndex}`}
                                                name={`option-${oIndex}`}
                                                value={option}
                                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                className="input"
                                                required
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddQuestion} className="btn btn-outline self-start">
                        <Plus size={16} /> Add Question
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {words.map((word, index) => (
                        <div key={index} className="flex flex-col sm:flex-row gap-4 items-start p-4 bg-slate-50 dark:bg-[#1A2230] rounded-xl">
                            <div className="flex-1">
                                <label id={`word-${index}`} htmlFor="word" className="label text-sm">Word (English)</label>
                                <input
                                    type="text"
                                    id="word"
                                    name="word"
                                    value={word.word}
                                    onChange={(e) => handleWordChange(index, 'word', e.target.value)}
                                    className="input"
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label className="label text-sm" htmlFor="hint">Hint</label>
                                <input
                                    type="text"
                                    id="hint"
                                    name="hint"
                                    value={word.hint}
                                    onChange={(e) => handleWordChange(index, 'hint', e.target.value)}
                                    className="input"
                                    required
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveWord(index)}
                                className="mt-7 text-red-600 hover:text-red-700"
                                disabled={words.length === 1}
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddWord} className="btn btn-outline self-start">
                        <Plus size={16} /> Add Word
                    </button>
                </div>
            )}

            <div className="mt-8 flex justify-end">
                <button type="submit" className="btn btn-primary px-8 py-3 text-lg">
                    <Save size={20} /> {gameId ? 'Update Game' : 'Save Game'}
                </button>
            </div>
            <ConfirmationModal
                isOpen={feedbackModal.isOpen}
                onClose={() => {
                    setFeedbackModal({ ...feedbackModal, isOpen: false });
                    if (feedbackModal.shouldRedirect) {
                        navigate('/');
                    }
                }}
                onConfirm={() => {
                    setFeedbackModal({ ...feedbackModal, isOpen: false });
                    if (feedbackModal.shouldRedirect) {
                        navigate('/');
                    }
                }}
                title={feedbackModal.title}
                message={feedbackModal.message}
                confirmText={feedbackModal.variant === 'success' ? 'Great!' : 'Close'}
                variant={feedbackModal.variant}
                cancelText={feedbackModal.variant === 'success' ? '' : 'Close'}
            />
        </form>
    );
};
