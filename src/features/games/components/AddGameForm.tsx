import { useState, useEffect, useRef } from 'react';
import { useContent } from '../../../context/ContentContext';
import { gamesService } from '../services/gamesService';
import type { GameType, Flashcard, Question, WordGuess } from '../../../shared/types';
import { Plus, Trash2, Save, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ConfirmationModal } from '../../../shared/components/ConfirmationModal';

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

    const [cards, setCards] = useState<Omit<Flashcard, 'id'>[]>([{ front: '', back: '', imageUrl: '' }]);
    const [questions, setQuestions] = useState<Omit<Question, 'id'>[]>([
        { text: '', options: ['', '', '', ''], correctAnswer: 0 }
    ]);
    const [words, setWords] = useState<Omit<WordGuess, 'id'>[]>([{ word: '', hint: '', imageUrl: '' }]);

    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isSubmittingRef = useRef(false);

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
                } else if ((game.type === 'quiz' || game.type === 'maze_game') && game.content.questions) {
                    setQuestions(game.content.questions);
                } else if (game.type === 'word_image') {
                    if (game.content.words) setWords(game.content.words);
                }
            }
        } catch (error) {
            console.error('Error loading game:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCard = () => {
        setCards([...cards, { front: '', back: '', imageUrl: '' }]);
    };

    const handleRemoveCard = (index: number) => {
        setCards(cards.filter((_, i) => i !== index));
    };

    const handleCardChange = (index: number, field: keyof Omit<Flashcard, 'id'>, value: string) => {
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
        setWords([...words, { word: '', hint: '', imageUrl: '' }]);
    };

    const handleRemoveWord = (index: number) => {
        setWords(words.filter((_, i) => i !== index));
    };

    const handleWordChange = (index: number, field: keyof Omit<WordGuess, 'id'>, value: string) => {
        const newWords = [...words];
        newWords[index][field] = value;
        setWords(newWords);
    };

    const handleFileUpload = async (index: number, file: File, itemType: 'flashcard' | 'word_image') => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `game-images/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('games')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('games')
                .getPublicUrl(filePath);

            if (itemType === 'flashcard') {
                handleCardChange(index, 'imageUrl', publicUrl);
            } else {
                handleWordChange(index, 'imageUrl', publicUrl);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmittingRef.current) return;

        isSubmittingRef.current = true;
        setIsSubmitting(true);
        console.log('Starting game submission...');

        const gameData = {
            title,
            description,
            type,
            content: type === 'flashcard'
                ? { cards: cards }
                : (type === 'quiz' || type === 'maze_game')
                    ? { questions: questions }
                    : { words: words }
        };

        try {
            if (gameId) {
                console.log('Updating game:', gameId);
                await updateGame(gameId, gameData as any);
                setFeedbackModal({
                    isOpen: true,
                    title: 'Success!',
                    message: 'Game updated successfully!',
                    variant: 'success',
                    shouldRedirect: true
                });
            } else {
                console.log('Creating new game');
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
        } finally {
            isSubmittingRef.current = false;
            setIsSubmitting(false);
            console.log('Submission finished');
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading game details...</div>;
    }

    return (
        <div className="card">
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
                    <option value="word_image">Word Image</option>
                    <option value="maze_game">Word Wanderer (Maze)</option>
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
                {type === 'flashcard' ? 'Flashcards' : (type === 'quiz' || type === 'maze_game') ? 'Questions' : 'Words'}
            </h3>

            {type === 'flashcard' ? (
                <div className="flex flex-col gap-8">
                    {cards.map((card, index) => (
                        <div key={index} className="flex flex-col bg-slate-50 dark:bg-[#1A2230] p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="font-bold text-slate-700 dark:text-slate-300">Flashcard {index + 1}</h4>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveCard(index)}
                                    className="text-red-500 hover:text-red-600 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                                    disabled={cards.length === 1}
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="form-group">
                                        <label className="label text-sm">Front (English)</label>
                                        <input
                                            type="text"
                                            value={card.front}
                                            onChange={(e) => handleCardChange(index, 'front', e.target.value)}
                                            className="input"
                                            required
                                            placeholder="e.g. House"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label text-sm">Back (Translation)</label>
                                        <input
                                            type="text"
                                            value={card.back}
                                            onChange={(e) => handleCardChange(index, 'back', e.target.value)}
                                            className="input"
                                            required
                                            placeholder="e.g. Casa"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 transition-colors hover:border-primary/50 group bg-white dark:bg-[#12161f]">
                                    {card.imageUrl ? (
                                        <div className="relative group w-full aspect-video rounded-lg overflow-hidden">
                                            <img src={card.imageUrl} alt="Flashcard" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-lg font-bold text-sm shadow-xl">
                                                    Change Image
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(index, e.target.files[0], 'flashcard')}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center text-slate-400 group-hover:text-primary transition-colors py-4">
                                            <ImageIcon size={48} className="mb-2" />
                                            <span className="text-sm font-bold">Upload Image</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => e.target.files?.[0] && handleFileUpload(index, e.target.files[0], 'flashcard')}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddCard} className="btn btn-outline self-start">
                        <Plus size={16} /> Add Card
                    </button>
                </div>
            ) : (type === 'quiz' || type === 'maze_game') ? (
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
                <div className="grid grid-cols-1 gap-6">
                    {words.map((word, index) => (
                        <div key={index} className="flex flex-col bg-slate-50 dark:bg-[#1A2230] p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="font-bold text-slate-700 dark:text-slate-300">Word {index + 1}</h4>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveWord(index)}
                                    className="text-red-500 hover:text-red-600 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                                    disabled={words.length === 1}
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="form-group">
                                        <label className="label text-sm">Word (English)</label>
                                        <input
                                            type="text"
                                            value={word.word}
                                            onChange={(e) => handleWordChange(index, 'word', e.target.value)}
                                            className="input"
                                            required
                                            placeholder="e.g. Apple"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label text-sm">Hint</label>
                                        <input
                                            type="text"
                                            value={word.hint}
                                            onChange={(e) => handleWordChange(index, 'hint', e.target.value)}
                                            className="input"
                                            required
                                            placeholder="e.g. A red fruit"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 transition-colors hover:border-primary/50 group bg-white dark:bg-[#12161f]">
                                    {word.imageUrl ? (
                                        <div className="relative group w-full aspect-video rounded-lg overflow-hidden">
                                            <img src={word.imageUrl} alt="Word" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-lg font-bold text-sm shadow-xl">
                                                    Change Image
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(index, e.target.files[0], 'word_image')}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center text-slate-400 group-hover:text-primary transition-colors py-4">
                                            <ImageIcon size={48} className="mb-2" />
                                            <span className="text-sm font-bold">Upload Image</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => e.target.files?.[0] && handleFileUpload(index, e.target.files[0], 'word_image')}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddWord} className="btn btn-outline self-start">
                        <Plus size={16} /> Add Word
                    </button>
                </div>
            )}

            <div className="mt-8 flex justify-end">
                <button
                    type="button"
                    onClick={(e) => handleSubmit(e)}
                    disabled={isSubmitting}
                    className="btn btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <span className="animate-spin mr-2">⏳</span> Saving...
                        </>
                    ) : (
                        <>
                            <Save size={20} /> {gameId ? 'Update Game' : 'Save Game'}
                        </>
                    )}
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
        </div>
    );
};
