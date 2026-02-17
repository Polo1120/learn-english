import type { Game } from '../shared/types';

export const initialGames: Omit<Game, 'id'>[] = [
    {
        title: 'Basic Greetings',
        description: 'Learn common English greetings and farewells.',
        type: 'flashcard',
        content: {
            cards: [
                { front: 'Hello', back: 'Hola' },
                { front: 'Good morning', back: 'Buenos días' },
                { front: 'How are you?', back: '¿Cómo estás?' },
                { front: 'Goodbye', back: 'Adiós' },
                { front: 'See you later', back: 'Hasta luego' },
            ]
        }
    },
    {
        title: 'Colors Quiz',
        description: 'Test your knowledge of colors in English.',
        type: 'quiz',
        content: {
            questions: [
                {
                    text: 'What color is the sky?',
                    options: ['Red', 'Blue', 'Green', 'Yellow'],
                    correctAnswer: 1
                },
                {
                    text: 'What color is a banana?',
                    options: ['Purple', 'Yellow', 'Black', 'White'],
                    correctAnswer: 1
                },
                {
                    text: 'What color is an apple?',
                    options: ['Red', 'Blue', 'Orange', 'Gray'],
                    correctAnswer: 0
                }
            ]
        }
    },
    {
        title: 'Word Image Animals',
        description: 'Guess the animal names.',
        type: 'word_image',
        content: {
            words: [
                { word: 'ELEPHANT', hint: 'Has a long trunk' },
                { word: 'GIRAFFE', hint: 'Has a long neck' },
                { word: 'LION', hint: 'King of the jungle' },
                { word: 'PENGUIN', hint: 'Bird that cannot fly and loves ice' }
            ]
        }
    }
];
