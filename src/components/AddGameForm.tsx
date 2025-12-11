import { useState } from 'react';
import { useContent } from '../context/ContentContext';
import type { GameType, Flashcard, Question, HangmanWord } from '../types';
import { Plus, Trash2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AddGameForm = () => {
    const { addGame } = useContent();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<GameType>('flashcard');

    const [cards, setCards] = useState<Omit<Flashcard, 'id'>[]>([{ front: '', back: '' }]);
    const [questions, setQuestions] = useState<Omit<Question, 'id'>[]>([
        { text: '', options: ['', '', '', ''], correctAnswer: 0 }
    ]);
    const [words, setWords] = useState<Omit<HangmanWord, 'id'>[]>([{ word: '', hint: '' }]);

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

        const newGame = {
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
            await addGame(newGame as any);
            navigate('/');
        } catch (err) {
            console.error('Error creating game:', err);
            alert('Failed to create game. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card">
            <div className="form-group">
                <label className="label">Game Type</label>
                <select
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
                <label className="label">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input"
                    required
                    placeholder="e.g., Advanced Vocabulary"
                />
            </div>

            <div className="form-group">
                <label className="label">Description</label>
                <textarea
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
                <div className="flex flex-col gap-6">
                    {cards.map((card, index) => (
                        <div key={index} className="flex gap-4 items-start p-4 bg-slate-50 rounded-xl">
                            <div className="flex-1">
                                <label className="label text-sm">Front (English)</label>
                                <input
                                    type="text"
                                    value={card.front}
                                    onChange={(e) => handleCardChange(index, 'front', e.target.value)}
                                    className="input"
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label className="label text-sm">Back (Translation/Meaning)</label>
                                <input
                                    type="text"
                                    value={card.back}
                                    onChange={(e) => handleCardChange(index, 'back', e.target.value)}
                                    className="input"
                                    required
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveCard(index)}
                                className="mt-7 text-red-600 hover:text-red-700"
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
                        <div key={qIndex} className="p-6 bg-slate-50 rounded-xl relative">
                            <button
                                type="button"
                                onClick={() => handleRemoveQuestion(qIndex)}
                                className="absolute top-4 right-4 text-red-600 hover:text-red-700"
                                disabled={questions.length === 1}
                            >
                                <Trash2 size={20} />
                            </button>

                            <div className="form-group">
                                <label className="label">Question Text</label>
                                <input
                                    type="text"
                                    value={q.text}
                                    onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                                    className="input"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {q.options.map((option, oIndex) => (
                                    <div key={oIndex}>
                                        <label className="label text-sm">Option {oIndex + 1}</label>
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
                        <div key={index} className="flex gap-4 items-start p-4 bg-slate-50 rounded-xl">
                            <div className="flex-1">
                                <label className="label text-sm">Word (English)</label>
                                <input
                                    type="text"
                                    value={word.word}
                                    onChange={(e) => handleWordChange(index, 'word', e.target.value)}
                                    className="input"
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label className="label text-sm">Hint</label>
                                <input
                                    type="text"
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
                    <Save size={20} /> Save Game
                </button>
            </div>
        </form>
    );
};
