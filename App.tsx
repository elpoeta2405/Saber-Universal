import React, { useState, useCallback, useEffect } from 'react';
import TopicSelector from './components/TopicSelector';
import Quiz from './components/Quiz';
import Results from './components/Results';
import ApiKeySetup from './components/ApiKeySetup';
import { Topic, QuizSet } from './types';
import { TOTAL_QUESTIONS_PER_TOPIC } from './constants';

type GameState = 'api_key_setup' |'selecting_topic' | 'in_quiz' | 'results';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('api_key_setup');
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [finalScore, setFinalScore] = useState(0);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [completedQuizData, setCompletedQuizData] = useState<QuizSet[] | null>(null);

    useEffect(() => {
        const storedKey = localStorage.getItem('gemini_api_key');
        if (storedKey) {
            setApiKey(storedKey);
            setGameState('selecting_topic');
        } else {
            setGameState('api_key_setup');
        }
    }, []);

    const handleKeySubmit = useCallback((key: string) => {
        localStorage.setItem('gemini_api_key', key);
        setApiKey(key);
        setGameState('selecting_topic');
    }, []);

    const handleTopicSelect = useCallback((topic: Topic) => {
        setSelectedTopic(topic);
        setGameState('in_quiz');
    }, []);

    const handleQuizFinish = useCallback((score: number, quizData: QuizSet[]) => {
        setFinalScore(score);
        setCompletedQuizData(quizData);
        setGameState('results');
    }, []);

    const handleRestart = useCallback(() => {
        setSelectedTopic(null);
        setFinalScore(0);
        setCompletedQuizData(null);
        setGameState('selecting_topic');
    }, []);

    const handleApiKeyInvalid = useCallback(() => {
        localStorage.removeItem('gemini_api_key');
        setApiKey(null);
        setGameState('api_key_setup');
    }, []);

    const renderContent = () => {
        switch (gameState) {
            case 'in_quiz':
                return selectedTopic && apiKey && <Quiz topic={selectedTopic} apiKey={apiKey} onFinish={handleQuizFinish} onBack={handleRestart} onApiKeyInvalid={handleApiKeyInvalid} />;
            case 'results':
                return <Results score={finalScore} totalQuestions={TOTAL_QUESTIONS_PER_TOPIC} onRestart={handleRestart} quizData={completedQuizData} />;
            case 'selecting_topic':
                 return <TopicSelector onSelectTopic={handleTopicSelect} />;
            case 'api_key_setup':
            default:
                return <ApiKeySetup onKeySubmit={handleKeySubmit} />;
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
            <div className="w-full max-w-2xl mx-auto" key={gameState}>
                {renderContent()}
            </div>
        </main>
    );
};

export default App;