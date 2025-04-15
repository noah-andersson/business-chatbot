export interface ValidatorObject {
  message: (value: any) => string;
  validatorCallback: (value: any) => boolean;
}

export interface Question {
  question: (value: any) => string;
  answerType:
    | "text"
    | "input"
    | "boolean"
    | "select"
    | "file"
    | "number"
    | "csv"
    | any;
  identifier: string;
  answer?: string | boolean | number | any;
  answered?: boolean;
  options?: string[];
  fileSrc?: string;
  validator?: ValidatorObject;
}

export interface Message {
  id?: number;
  sender: string;
  type: string;
  label?: string;
  content: string;
  options?: { label: string, value: string }[];
  time?: number;
}

export interface Option {
  options: { label: string, value: string }[];
  onSelect: (option: string) => void;
  selected: string[];
}
