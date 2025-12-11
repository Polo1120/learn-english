import { AddGameForm } from '../components/AddGameForm';

export const AdminPage = () => {
    return (
        <div>
            <h1 className="page-title">Create New Content</h1>
            <p className="mb-8 text-slate-500">
                Add new flashcard decks or quizzes to the platform.
            </p>
            <AddGameForm />
        </div>
    );
};
