import React, { useState } from 'react';

interface ApiKeySetupProps {
    onKeySubmit: (key: string) => void;
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onKeySubmit }) => {
    const [apiKey, setApiKey] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!apiKey.trim()) {
            setError('Por favor, introduce una clave de API.');
            return;
        }
        setError('');
        onKeySubmit(apiKey.trim());
    };

    return (
        <div className="text-center p-8 bg-black/20 backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col items-center border border-white/10 animate-slide-in-bottom">
            <h1 className="text-3xl font-bold mb-2 text-slate-100">Configuración Requerida</h1>
            <p className="text-slate-300 mb-6 max-w-md">
                Para generar cuestionarios dinámicos, esta aplicación necesita una clave de API de Google Gemini.
            </p>
            
            <form onSubmit={handleSubmit} className="w-full max-w-sm">
                <div className="mb-4">
                    <label htmlFor="apiKey" className="block text-slate-300 text-sm font-bold mb-2">
                        Tu Clave de API de Gemini
                    </label>
                    <input
                        id="apiKey"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Pega tu clave aquí"
                        className="w-full px-4 py-3 rounded-lg bg-slate-800/70 border-2 border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        aria-label="Clave de API de Gemini"
                    />
                </div>
                
                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                
                <button
                    type="submit"
                    className="w-full px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-lg text-white transition-all duration-300 transform hover:scale-105"
                >
                    Guardar y Continuar
                </button>
            </form>
            
            <p className="text-xs text-slate-400 mt-6 max-w-md">
                Tu clave de API se guardará únicamente en tu navegador y no se comparte con nadie.
                <br />
                ¿No tienes una clave? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline font-semibold">Obtén una en Google AI Studio</a>.
            </p>
        </div>
    );
};

export default ApiKeySetup;