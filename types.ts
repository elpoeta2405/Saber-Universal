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
  RELIGION = 'Religiones y Mitología',
  GEOGRAPHY = 'Geografía Mundial',
  SCIENCE_TECH = 'Ciencia y Tecnología',
  ART_LITERATURE = 'Arte y Literatura',
  SPORTS = 'Deportes y Eventos',
}
