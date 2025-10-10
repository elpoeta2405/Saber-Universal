import { GoogleGenAI, Type } from "@google/genai";
import { Topic, QuizSet, Question } from '../types';
import { SETS_PER_TOPIC, QUESTIONS_PER_SET, TOTAL_QUESTIONS_PER_TOPIC } from '../constants';

const getTopicContext = (topic: Topic): string => {
    switch (topic) {
        case Topic.BIODIVERSITY:
            return "Preguntas de nivel intermedio sobre ecología. Enfócate en interacciones específicas entre especies (simbiosis, parasitismo), biomas menos conocidos o conceptos como 'especie clave'. No solo '¿qué comen los leones?', sino '¿qué es un liquen?'.";
        case Topic.ZOOLOGY:
            return "Preguntas de nivel intermedio sobre zoología. Enfócate en comportamientos específicos, adaptaciones únicas o clasificaciones menos comunes que un aficionado a los animales podría conocer, pero que van más allá de lo básico. Ej: '¿Qué mamífero pone huevos?', en lugar de '¿Cuál es el animal más grande?'.";
        case Topic.HISTORY:
            return "Preguntas de nivel intermedio sobre historia. En lugar de solo preguntar por eventos principales, enfócate en las 'causas' o 'consecuencias' de esos eventos, o en figuras secundarias importantes. Por ejemplo, en lugar de '¿Quién descubrió América?', pregunta '¿Cuál de estos barcos NO acompañó a Colón en su primer viaje?'.";
        case Topic.RELIGION:
            return "Preguntas de nivel intermedio sobre religiones del mundo. Profundiza un poco más en conceptos, ramas o figuras que no son las más obvias. Por ejemplo, en lugar de preguntar '¿Cuál es el libro sagrado del Islam?', podrías preguntar '¿Qué significan los 'Cinco Pilares' del Islam?'.";
        case Topic.MYTHOLOGY:
            return "Preguntas de nivel intermedio sobre mitología. Ve más allá de los dioses olímpicos principales. Pregunta sobre titanes, héroes menos conocidos, o los detalles de un mito famoso. Por ejemplo, '¿Quién robó el fuego de los dioses para dárselo a los humanos en la mitología griega?'.";
        case Topic.BIBLE:
            return "Preguntas de nivel intermedio sobre La Biblia. En lugar de los eventos más famosos, pregunta sobre los jueces de Israel, los profetas menores o el significado de una parábola específica. Por ejemplo, '¿A qué tribu de Israel pertenecía el rey David?'.";
        case Topic.GEOGRAPHY:
            return "Preguntas de nivel intermedio sobre geografía. En lugar de capitales de países muy famosos, pregunta por accidentes geográficos específicos (el desierto de Gobi, el estrecho de Magallanes), o capitales de países menos mediáticos pero importantes.";
        case Topic.SCIENCE_TECH:
            return "Preguntas de nivel intermedio sobre ciencia y tecnología. No solo sobre el inventor, sino sobre el principio científico detrás de un invento, o sobre tecnologías que fueron precursoras de las actuales. Por ejemplo, '¿Qué ley de la termodinámica establece que la energía no se crea ni se destruye?'.";
        case Topic.ART_LITERATURE:
            return "Preguntas de nivel intermedio sobre arte y literatura. Pregunta sobre el movimiento artístico al que pertenece una obra, el nombre de un personaje secundario crucial en una novela famosa, o el significado de un simbolismo recurrente. Ej: '¿Qué movimiento artístico se asocia con Salvador Dalí?'.";
        case Topic.SPORTS:
            return "Preguntas de nivel intermedio sobre deportes. En lugar de '¿quién ganó el último mundial?', pregunta sobre récords específicos, terminología técnica (ej: '¿qué es un 'hat-trick' perfecto' en fútbol?) o sobre deportistas históricos que no sean los más mediáticos.";
        case Topic.MUSIC_CINEMA:
            return "Preguntas de nivel intermedio sobre música y cine. Pregunta sobre el director de una película de culto, el álbum conceptual de una banda famosa, o el nombre del compositor de una banda sonora icónica. Ir más allá de los ganadores del Oscar a 'Mejor Película'.";
        case Topic.GASTRONOMY:
            return "Preguntas de nivel intermedio sobre gastronomía. No solo '¿de dónde es la paella?', sino '¿cuál es el ingrediente principal del 'kimchi'?' o '¿qué tipo de queso se usa tradicionalmente en un tiramisú?'. Preguntas sobre técnicas culinarias o ingredientes específicos.";
        case Topic.VIDEO_GAMES:
            return "Preguntas de nivel intermedio sobre videojuegos. En lugar del protagonista, pregunta por un personaje secundario importante, el nombre del mundo o universo del juego, o un elemento de la 'lore' (historia profunda). Ej: '¿Cómo se llama la inteligencia artificial que acompaña al Master Chief en la saga Halo?'.";
        case Topic.AUTOMOTIVE:
            return "Preguntas de nivel intermedio sobre el mundo del motor. Pregunta sobre tipos de motores (V8, Boxer), circuitos de carreras famosos (Nürburgring, Le Mans) o diseñadores de coches legendarios. Ir más allá de las marcas más conocidas.";
        default:
            return "Cultura general de nivel intermedio.";
    }
};

export const generateQuiz = async (topic: Topic, apiKey: string): Promise<QuizSet[]> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
        Por favor, genera un cuestionario completo de cultura general sobre el tema "${topic}".
        Contexto del tema: ${getTopicContext(topic)}

        Es crucial que TODAS las preguntas estén estrictamente relacionadas con el tema de '${topic}' y el contexto proporcionado. No incluyas preguntas de otros temas.

        El nivel de dificultad debe ser "intermedio": no tan fácil como para ser obvio, pero tampoco tan oscuro que solo un experto lo sepa. Las preguntas deben desafiar a un entusiasta del tema, requiriendo un momento de reflexión.
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
        console.error("Error generando la imagen:", error);
        const errorMessage = error instanceof Error ? error.message : 'Un error desconocido ocurrió';
         if (errorMessage.includes('400')) {
             throw new Error('La clave de API no es válida o ha caducado. Por favor, verifica tu clave.');
        }
        if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            throw new Error('Se ha excedido la cuota de la API para generar imágenes. El juego continuará sin ellas.');
        }
        throw new Error(`No se pudo generar la imagen: ${errorMessage}`);
    }
};