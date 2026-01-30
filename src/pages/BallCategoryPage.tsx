import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MatchHistoryPage from './MatchHistoryPage';

const BallCategoryPage: React.FC = () => {
    const { ballType } = useParams<{ ballType: string }>();
    const navigate = useNavigate();

    // Redirect to main matches if 'all' is selected
    if (ballType === 'all') {
        return <MatchHistoryPage onNavigate={(path) => navigate(path)} />;
    }

    // We reuse the MatchHistoryPage logic but pass the ballType filter
    // This is a wrapper that ensures the page reacts to the ballType URL param

    return (
        <div key={ballType}>
            <MatchHistoryPage
                onNavigate={(path) => navigate(path)}
                initialFilters={{ ballType }}
            />
        </div>
    );
};

export default BallCategoryPage;
