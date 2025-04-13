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
  sender: string;
  content_id: number;
  content: string;
  time?: number;
}
