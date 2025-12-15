import { useParams } from 'react-router-dom';
import { AddGameForm } from '../components/AddGameForm';

export const AdminPage = () => {
    const { id } = useParams();
    return (
        <div>
            <h1 className="page-title">{id ? 'Edit Content' : 'Create New Content'}</h1>
            <p className="mb-8 text-slate-500">
                {id ? 'Update existing flashcard decks or quizzes.' : 'Add new flashcard decks or quizzes to the platform.'}
            </p>
            <AddGameForm gameId={id} />
        </div>
    );
};
