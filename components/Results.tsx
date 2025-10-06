import React, { useState, useEffect, useCallback } from 'react';
import { QuizSet } from '../types';
import DownloadIcon from './icons/DownloadIcon';

declare const confetti: any;

interface ResultsProps {
    score: number;
    totalQuestions: number;
    onRestart: () => void;
    quizData: QuizSet[] | null;
}

const Results: React.FC<ResultsProps> = ({ score, totalQuestions, onRestart, quizData }) => {
    const [displayScore, setDisplayScore] = useState(0);
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    useEffect(() => {
        if (score === 0) {
            setDisplayScore(0);
            return;
        };
        const duration = 1000; // ms
        const stepTime = Math.max(1, Math.floor(duration / score));
        let currentScore = 0;
        const timer = setInterval(() => {
            currentScore += 1;
            if (currentScore >= score) {
                clearInterval(timer);
                setDisplayScore(score);
            } else {
                setDisplayScore(currentScore);
            }
        }, stepTime);
    
        return () => clearInterval(timer);
    }, [score]);
    
    useEffect(() => {
        if (typeof confetti !== 'undefined' && percentage >= 70) {
            setTimeout(() => {
                 confetti({
                    particleCount: 150,
                    spread: 90,
                    origin: { y: 0.6 },
                    colors: ['#8ec5fc', '#e0c3fc', '#6a82fb', '#a770ef', '#ffffff']
                });
            }, 500); // Small delay to let animations settle
        }
    }, [percentage]);

    const handleDownload = useCallback(() => {
        if (!quizData) return;

        const allQuestions = quizData.flat();
        let content = "Resumen del Cuestionario - Saber Universal\n\n";

        allQuestions.forEach((q, index) => {
            content += `Pregunta ${index + 1}: ${q.question}\n`;
            content += `Explicación: ${q.explanation}\n\n`;
        });

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'resumen-saber-universal.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [quizData]);
    
    const getFeedback = () => {
        if (percentage >= 90) return { title: '¡Maestro Universal!', message: 'Tu conocimiento es verdaderamente impresionante.', color: 'text-emerald-300' };
        if (percentage >= 70) return { title: '¡Excelente Trabajo!', message: 'Has demostrado un gran dominio del tema.', color: 'text-indigo-300' };
        if (percentage >= 50) return { title: '¡Buen Intento!', message: 'Sigue aprendiendo y alcanzarás la cima.', color: 'text-yellow-300' };
        return { title: 'Sigue Estudiando', message: 'Cada error es una oportunidad para aprender algo nuevo.', color: 'text-red-300' };
    };

    const feedback = getFeedback();

    const radius = 70;
    const stroke = 10;
    const normalizedRadius = radius - stroke;
    const circumference = normalizedRadius * 2 * Math.PI;
    const [progressOffset, setProgressOffset] = useState(circumference);
    
    useEffect(() => {
        // Trigger the animation after the component has mounted
        const offset = circumference - (percentage / 100) * circumference;
        setProgressOffset(offset);
    }, [percentage, circumference]);


    return (
        <div className="text-center p-8 bg-black/20 backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col items-center animate-slide-in-right border border-white/10">
            <h1 className="text-3xl font-bold mb-2 text-slate-100">Fin del Desafío</h1>
            <p className={`text-2xl font-bold mb-4 ${feedback.color}`}>{feedback.title}</p>
            <p className="text-slate-300 mb-6">{feedback.message}</p>
            
            <div className="relative my-4 w-44 h-44 flex items-center justify-center">
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    className="-rotate-90"
                >
                    <circle
                        className="text-slate-700/50"
                        stroke="currentColor"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    <circle
                        className="text-indigo-400"
                        stroke="currentColor"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset: progressOffset, strokeLinecap: 'round', transition: 'stroke-dashoffset 1.5s ease-out' }}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                </svg>
                 <div className="absolute flex flex-col items-center justify-center">
                     <span className="text-4xl font-bold text-slate-100">{displayScore}</span>
                     <span className="text-sm font-medium text-slate-400">de {totalQuestions}</span>
                </div>
            </div>
            <p className="text-xl font-semibold text-indigo-300 mb-8">{percentage}% Correcto</p>

            <div className="w-full max-w-xs space-y-4">
                 {quizData && (
                    <button
                        onClick={handleDownload}
                        className="w-full px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-base text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                       <DownloadIcon className="h-5 w-5" />
                       <span>Descargar Resumen</span>
                    </button>
                )}
                <button
                    onClick={onRestart}
                    className="w-full px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-lg text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 hover:shadow-indigo-400/50 hover:animate-[glow_2s_ease-in-out_infinite]"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0121.5 13.5M20 20l-1.5-1.5A9 9 0 002.5 10.5" />
                    </svg>
                    <span>Jugar de Nuevo</span>
                </button>
            </div>
        </div>
    );
};

export default Results;