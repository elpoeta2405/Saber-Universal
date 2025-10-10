import React from 'react';
import { Topic } from '../types';
import { TOPICS, TOPIC_DETAILS } from '../constants';

interface TopicSelectorProps {
    onSelectTopic: (topic: Topic) => void;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({ onSelectTopic }) => {
    return (
        <div className="text-center animate-slide-in-bottom" style={{ perspective: '1000px' }}>
            <h1 className="text-4xl md:text-6xl font-bold mb-2 text-gradient text-shadow-custom">Saber Universal</h1>
            <p className="text-lg text-slate-200 mb-8 text-shadow-custom">Elige un tema y pon a prueba tu conocimiento.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {TOPICS.map((topic) => {
                    const details = TOPIC_DETAILS[topic];
                    return (
                        <button
                            key={topic}
                            onClick={() => onSelectTopic(topic)}
                            className={`p-6 rounded-2xl shadow-lg flex items-center justify-start space-x-4 text-left transition-all duration-300 transform-gpu hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-opacity-75 bg-slate-900/20 backdrop-blur-md border ${details.borderColor} focus:ring-violet-400/50`}
                            style={{ transformStyle: 'preserve-3d' }}
                            onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left - rect.width / 2;
                                const y = e.clientY - rect.top - rect.height / 2;
                                e.currentTarget.style.transform = `rotateY(${x / 20}deg) rotateX(${-y / 20}deg) scale(1.05)`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
                            }}
                        >
                            <span className="text-4xl">{details.icon}</span>
                            <span className={`text-xl font-semibold ${details.textColor.replace('text-','text-slate-')}`}>{topic}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default TopicSelector;