export type Form = {
  id: string; // User id
  name: string;
  description: string;
  questions: Question[];
  lastQuestion?: Question;
  sent: boolean;
};
export type Question = {
  id: string;
  question: string;
  type: "text" | "select" | "multi-select";
  options?: Option[];
  answer?: string;
  validators?: string[];
};
export type Option = {
  emoji: string;
  text: string;
};
export type Validator = (answer: string) => { message: string; valid: boolean };
