import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Topic, QuizSet, Question } from '../types';
import { generateQuiz, generateImage } from '../services/geminiService';
import { TIMER_DURATION, TOPIC_DETAILS, QUESTIONS_PER_SET, TOTAL_QUESTIONS_PER_TOPIC } from '../constants';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import Timer from './Timer';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import VolumeUpIcon from './icons/VolumeUpIcon';
import CheckIcon from './icons/CheckIcon';
import XIcon from './icons/XIcon';
import QuestionMarkIcon from './icons/QuestionMarkIcon';
import BrainCircuitIcon from './icons/BrainCircuitIcon';

interface QuizProps {
    topic: Topic;
    apiKey: string;
    onFinish: (score: number) => void;
    onBack: () => void;
    onApiKeyInvalid: () => void;
}

type QuizView = 'loading' | 'error' | 'question' | 'explanation';

const Quiz: React.FC<QuizProps> = ({ topic, apiKey, onFinish, onBack, onApiKeyInvalid }) => {
    const [quizSets, setQuizSets] = useState<QuizSet[] | null>(null);
    const [currentSetIndex, setCurrentSetIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [view, setView] = useState<QuizView>('loading');
    const [error, setError] = useState<string | null>(null);
    const [currentImage, setCurrentImage] = useState<'loading' | 'failed' | string | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);

    const { speak, cancel, isSpeaking } = useTextToSpeech();
    
    const topicDetails = TOPIC_DETAILS[topic];

    useEffect(() => {
        const fetchQuiz = async () => {
            setView('loading');
            setError(null);
            try {
                const data = await generateQuiz(topic, apiKey);
                setQuizSets(data);
                setView('question');
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido.';
                if (errorMessage.includes('La clave de API no es válida')) {
                    onApiKeyInvalid();
                } else {
                    setError(errorMessage);
                    setView('error');
                }
            }
        };
        fetchQuiz();
        return () => {
            cancel(); // Stop any speech on component unmount
        };
    }, [topic, apiKey, cancel, onApiKeyInvalid]);

    const currentQuestion: Question | null = useMemo(() => {
        if (!quizSets) return null;
        return quizSets[currentSetIndex]?.[currentQuestionIndex] ?? null;
    }, [quizSets, currentSetIndex, currentQuestionIndex]);

    useEffect(() => {
        if (view === 'question' && currentQuestion) {
            setCurrentImage('loading');
            setImageError(null);
            generateImage(currentQuestion.imagePrompt, apiKey)
                .then(imageData => {
                    setCurrentImage(`data:image/jpeg;base64,${imageData}`);
                })
                .catch(err => {
                    console.error(`Failed to generate image for question:`, err.message);
                    setCurrentImage('failed');
                    setImageError(err.message);
                });
        }
    }, [view, currentQuestion, apiKey]);


    const moveToNextQuestion = useCallback(() => {
        cancel(); // Stop speaking when moving to the next question
        
        const totalAnswered = currentSetIndex * QUESTIONS_PER_SET + currentQuestionIndex + 1;
        
        if (totalAnswered >= TOTAL_QUESTIONS_PER_TOPIC) {
             onFinish(score);
             return;
        } 
        
        let nextQuestionIndex = currentQuestionIndex + 1;
        let nextSetIndex = currentSetIndex;

        if (nextQuestionIndex >= QUESTIONS_PER_SET) {
            nextQuestionIndex = 0;
            nextSetIndex += 1;
        }

        setIsAnswered(false);
        setSelectedAnswer(null);
        setCurrentImage(null);
        setImageError(null);
        setCurrentQuestionIndex(nextQuestionIndex);
        setCurrentSetIndex(nextSetIndex);
        setView('question');
        
    }, [currentQuestionIndex, currentSetIndex, score, onFinish, cancel]);

    const handleAnswerSelect = useCallback((answer: string) => {
        if (isAnswered) return;
        
        setIsAnswered(true);
        setSelectedAnswer(answer);

        if (answer === currentQuestion?.correctAnswer) {
            setScore(prev => prev + 1);
        }
        setView('explanation');

    }, [isAnswered, currentQuestion]);

    const handleTimeUp = useCallback(() => {
        if (isAnswered) return;
    
        setIsAnswered(true);
        setSelectedAnswer(null); // Mark that time ran out, no answer was selected
    
        // Stay on the question view to show the correct answer
        setTimeout(() => {
            setView('explanation');
        }, 3000); // Wait 3 seconds before showing the explanation
    }, [isAnswered]);


    const handleSpeak = useCallback(() => {
        if (isSpeaking) {
            cancel();
        } else if (currentQuestion?.explanation) {
            speak(currentQuestion.explanation);
        }
    }, [isSpeaking, currentQuestion, speak, cancel]);

    if (view === 'loading') {
        return (
            <div className="text-center p-8 bg-black/20 backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col items-center border border-white/10 animate-slide-in-right">
                <h2 className={`text-2xl font-bold ${topicDetails.textColor}`}>Generando tu desafío sobre {topic}...</h2>
                <p className="text-slate-300 mt-2 mb-8">Usando la magia de Gemini para crear preguntas únicas.</p>
                <div className="fancy-loader"></div>
            </div>
        );
    }

    if (view === 'error') {
        return (
            <div className="text-center text-red-400 p-8 bg-red-900/20 rounded-xl">
                <h2 className="text-2xl font-bold">¡Oh no! Algo salió mal</h2>
                <p className="mt-2">{error}</p>
                <button onClick={onBack} className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-white transition-colors">Volver</button>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
             <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-200">Cuestionario completado. Calculando resultados...</h2>
             </div>
        )
    }
    
    const totalQuestionNumber = currentSetIndex * QUESTIONS_PER_SET + currentQuestionIndex + 1;

    if (view === 'explanation') {
        const wasCorrect = selectedAnswer === currentQuestion.correctAnswer;
        const timeUp = selectedAnswer === null;
        const isLastQuestion = totalQuestionNumber >= TOTAL_QUESTIONS_PER_TOPIC;

        let title = '';
        if (timeUp) {
            title = '¡Se acabó el tiempo!';
        } else if (wasCorrect) {
            title = '¡Respuesta Correcta!';
        } else {
            title = 'Respuesta Incorrecta';
        }

        return (
             <div className="text-center p-6 md:p-8 bg-black/20 backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col items-center border border-white/10 animate-fade-in max-w-lg mx-auto">
                <h1 className="text-3xl font-bold mb-4 text-slate-100">{title}</h1>

                <div className="w-full aspect-video rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center mb-4 border border-slate-700">
                    {currentImage === 'loading' && (
                         <div className="flex flex-col items-center gap-2 text-slate-400">
                            <BrainCircuitIcon className="w-10 h-10 animate-pulse" />
                            <span className="text-sm">Generando imagen...</span>
                        </div>
                    )}
                    {currentImage === 'failed' && (
                        <div className="flex flex-col items-center gap-2 text-slate-500 p-4">
                            <QuestionMarkIcon className="w-10 h-10" />
                             <span className="text-sm text-center font-semibold">
                                {imageError && imageError.includes('cuota') 
                                    ? 'Límite de imágenes alcanzado' 
                                    : 'Error al cargar imagen'}
                            </span>
                             <span className="text-xs text-slate-600 text-center">
                                {imageError && imageError.includes('cuota') 
                                    ? 'Has excedido la cuota gratuita de la API.'
                                    : 'El cuestionario continuará.'}
                            </span>
                        </div>
                    )}
                    {currentImage && currentImage !== 'loading' && currentImage !== 'failed' && (
                         <img src={currentImage} alt={currentQuestion.imagePrompt} className="w-full h-full object-cover"/>
                    )}
                </div>
                
                <div className="w-full text-left mb-6">
                    <p className="font-bold text-lg text-indigo-300 mb-2 flex items-center gap-2">
                        Explicación
                        <button onClick={handleSpeak} className={`p-1 rounded-full ${isSpeaking ? 'text-indigo-400 animate-pulse' : 'text-slate-400 hover:text-white'}`}>
                            <VolumeUpIcon className="w-5 h-5"/>
                        </button>
                    </p>
                    <div className="text-slate-300 bg-black/20 p-3 rounded-md max-h-40 overflow-y-auto">
                        <p>{currentQuestion.explanation}</p>
                    </div>
                </div>

                <button onClick={moveToNextQuestion} className="w-full px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-lg text-white transition-all duration-300 transform hover:scale-105">
                    {isLastQuestion ? "Ver Resultados" : "Siguiente"}
                </button>
            </div>
        );
    }

    const getButtonClass = (option: string) => {
        const baseClasses = "p-4 rounded-lg text-left text-slate-200 font-semibold border-2 transition-all duration-300";

        // This is the specific state for "time is up"
        // isAnswered is true, view is 'question', and no answer was selected by user
        if (isAnswered && selectedAnswer === null) { 
            const isCorrect = option === currentQuestion?.correctAnswer;
            if (isCorrect) {
                // Highlight correct answer with a green color and a pulse animation
                return `${baseClasses} bg-emerald-600/90 border-emerald-400 animate-pulse`;
            } else {
                // Fade out other answers
                return `${baseClasses} bg-slate-800/60 border-slate-700 opacity-50 cursor-not-allowed`;
            }
        }
        
        // Default state when not answered yet
        return `${baseClasses} bg-slate-800/70 border-slate-700 hover:bg-slate-700/80 hover:border-slate-600`;
    };


    return (
        <div className="flex flex-col h-full animate-slide-in-right">
            <div className="flex justify-between items-center mb-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition-colors"><ChevronLeftIcon className="w-6 h-6 text-slate-300" /></button>
                <h2 className="text-lg font-bold text-slate-200 text-center">{topic}</h2>
                <div className="font-bold text-lg px-4 py-1 rounded-lg bg-slate-800/50 text-indigo-300 border border-slate-700">{score}pts</div>
            </div>

            <p className="text-center font-semibold text-slate-400 mb-2">Pregunta {totalQuestionNumber} / {TOTAL_QUESTIONS_PER_TOPIC}</p>

            <Timer duration={TIMER_DURATION} onTimeUp={handleTimeUp} isPaused={isAnswered} key={totalQuestionNumber} />
            
            <h3 className="text-xl md:text-2xl font-bold text-slate-100 text-center mb-6 min-h-[6rem] flex items-center justify-center">{currentQuestion.question}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option) => (
                    <button
                        key={option}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={isAnswered}
                        className={getButtonClass(option)}
                    >
                        <span>{option}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Quiz;