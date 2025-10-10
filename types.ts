export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  imagePrompt: string;
}

export type QuizSet = Question[];

export enum Topic {
  BIODIVERSITY = 'Biodiversidad y Ecología',
  ZOOLOGY = 'El Reino Animalia (Zoología)',
  HISTORY = 'Historia y Civilizaciones',
  RELIGION = 'Religiones del Mundo',
  MYTHOLOGY = 'Mitología Universal',
  BIBLE = 'La Biblia',
  GEOGRAPHY = 'Geografía Mundial',
  SCIENCE_TECH = 'Ciencia y Tecnología',
  ART_LITERATURE = 'Arte y Literatura',
  SPORTS = 'Deportes y Eventos',
  MUSIC_CINEMA = 'Música y Cine',
  GASTRONOMY = 'Gastronomía Mundial',
  VIDEO_GAMES = 'Videojuegos y Cultura Geek',
  AUTOMOTIVE = 'Automovilismo y Vehículos',
}