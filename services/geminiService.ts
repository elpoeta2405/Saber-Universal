import { GoogleGenAI, Type } from "@google/genai";
import { Topic, QuizSet, Question } from '../types';
import { SETS_PER_TOPIC, QUESTIONS_PER_SET, TOTAL_QUESTIONS_PER_TOPIC } from '../constants';

const getTopicContext = (topic: Topic): string => {
    switch (topic) {
        case Topic.BIODIVERSITY:
            return "Preguntas de cultura general sobre ecología, animales y plantas famosos o curiosos, y conceptos ambientales básicos que todos deberían conocer. Ej: ¿Qué gas absorben las plantas?, ¿Cuál es el mamífero más grande?";
        case Topic.ZOOLOGY:
            return "Preguntas de cultura general sobre animales: récords (el más rápido, el más grande), animales icónicos, grupos de animales (mamíferos, insectos) y curiosidades que la mayoría de la gente podría saber. Evitar terminología científica compleja.";
        case Topic.HISTORY:
            return "Preguntas sobre eventos históricos mundiales muy conocidos, personajes famosos (reyes, inventores, líderes), y civilizaciones icónicas de una manera accesible. Enfocarse en hechos culturales populares, evitando fechas y datos demasiado específicos.";
        case Topic.RELIGION:
            return "Preguntas de conocimiento general sobre las principales religiones del mundo (Cristianismo, Islam, Judaísmo, Budismo, Hinduismo) y mitologías famosas (griega, romana). Enfocado en símbolos, figuras clave y festividades más conocidas, no en teología profunda.";
        case Topic.GEOGRAPHY:
            return "Preguntas de cultura general sobre geografía: capitales de países importantes, ríos y montañas famosos, banderas, y lugares icónicos que la gente reconoce (Torre Eiffel, Gran Muralla China, etc.).";
        case Topic.SCIENCE_TECH:
            return "Preguntas de cultura general sobre ciencia y tecnología: inventos que cambiaron el mundo (rueda, imprenta, internet), científicos famosos (Einstein, Newton, Curie), y conceptos básicos del cuerpo humano y del espacio.";
        case Topic.ART_LITERATURE:
            return "Preguntas de cultura general sobre arte y literatura: pintores y obras maestras famosas (Mona Lisa, El Grito), autores y libros clásicos conocidos mundialmente (Don Quijote, Romeo y Julieta), y movimientos artísticos básicos.";
        case Topic.SPORTS:
            return "Preguntas de cultura general sobre deportes: reglas básicas de deportes populares (fútbol, baloncesto), atletas legendarios (Michael Jordan, Pelé), y eventos mundiales importantes como los Juegos Olímpicos o la Copa del Mundo.";
        default:
            return "Cultura general.";
    }
};

export const generateQuiz = async (topic: Topic, apiKey: string): Promise<QuizSet[]> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
        Por favor, genera un cuestionario completo de cultura general sobre el tema "${topic}".
        Contexto del tema: ${getTopicContext(topic)}

        Es crucial que TODAS las preguntas estén estrictamente relacionadas con el tema de '${topic}' y el contexto proporcionado. No incluyas preguntas de otros temas.

        Las preguntas deben ser de conocimiento general, cosas que la mayoría de la gente podría saber o deducir, evitando la complejidad excesiva.
        Haz las preguntas y explicaciones concisas y atractivas, adecuadas para un formato de video corto y dinámico como TikTok.

        El cuestionario debe seguir esta estructura estrictamente:
        1. Debe contener exactamente ${TOTAL_QUESTIONS_PER_TOPIC} preguntas en total.
        2. Cada pregunta debe tener 4 opciones de respuesta, con solo una correcta.
        3. Para cada pregunta, proporciona una explicación breve y concisa (máximo 2-3 frases).
        4. Para cada pregunta, proporciona un "imagePrompt" que es una descripción corta y en inglés para generar una imagen relacionada (ej: "A colorful poison dart frog in the Amazon rainforest", "Ancient Sumerian ziggurat under a blue sky").

        Devuelve el resultado como un único array plano de objetos JSON, siguiendo el esquema proporcionado.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
                            correctAnswer: { type: Type.STRING },
                            explanation: { type: Type.STRING },
                            imagePrompt: { type: Type.STRING }
                        },
                        required: ["question", "options", "correctAnswer", "explanation", "imagePrompt"]
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const allQuestions = JSON.parse(jsonText) as Question[];

        let validatedQuestions = allQuestions;

        // If the AI generates too few questions, we can't proceed.
        if (validatedQuestions.length < TOTAL_QUESTIONS_PER_TOPIC) {
            throw new Error(`La IA generó solo ${validatedQuestions.length} preguntas, pero se necesitan ${TOTAL_QUESTIONS_PER_TOPIC}. Por favor, inténtalo de nuevo.`);
        }

        // If the AI generates too many, we just take the amount we need.
        if (validatedQuestions.length > TOTAL_QUESTIONS_PER_TOPIC) {
            console.warn(`La IA generó ${validatedQuestions.length} preguntas. Se usarán las primeras ${TOTAL_QUESTIONS_PER_TOPIC}.`);
            validatedQuestions = validatedQuestions.slice(0, TOTAL_QUESTIONS_PER_TOPIC);
        }
        
        // Chunk the flat array into the nested structure the app expects (QuizSet[])
        const quizData: QuizSet[] = [];
        for (let i = 0; i < validatedQuestions.length; i += QUESTIONS_PER_SET) {
            quizData.push(validatedQuestions.slice(i, i + QUESTIONS_PER_SET));
        }

        // Final validation on the chunked data
        if (quizData.length !== SETS_PER_TOPIC || quizData.some(set => set.length !== QUESTIONS_PER_SET)) {
            throw new Error("Error interno al procesar los datos del cuestionario.");
        }

        return quizData;

    } catch (error) {
        console.error("Error generando el cuestionario:", error);
         if (error instanceof SyntaxError) {
            throw new Error("La respuesta de la IA no era un JSON válido. Por favor, inténtalo de nuevo.");
        }
        const errorMessage = error instanceof Error ? error.message : 'Un error desconocido ocurrió';
        if (errorMessage.includes('400')) {
             throw new Error('La clave de API no es válida o ha caducado. Por favor, verifica tu clave.');
        }
        if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            throw new Error('Se ha excedido la cuota de la API para generar preguntas. Por favor, inténtalo de nuevo más tarde.');
        }
        throw new Error(`No se pudo generar el cuestionario: ${errorMessage}`);
    }
};

export const generateImage = async (prompt: string, apiKey: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '16:9',
            },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("La IA no generó ninguna imagen.");
        }

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return base64ImageBytes;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Un error desconocido ocurrió';
        if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            // This is a handled, expected error. Don't log as an error.
            // Throw a specific code for the UI to handle.
            throw new Error('QUOTA_EXCEEDED');
        }
        
        // For any other unexpected error, log it and create a user-friendly message.
        console.error("Error generando la imagen:", error);
        if (errorMessage.includes('400')) {
             throw new Error('La clave de API no es válida o ha caducado. Por favor, verifica tu clave.');
        }
        throw new Error(`No se pudo generar la imagen: ${errorMessage}`);
    }
};