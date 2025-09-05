

export interface Quiz {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface ExternalLink {
    title: string;
    url: string;
}

export interface Step {
  stepNumber: number;
  title: string;
  content?: string;
  quiz?: Quiz;
  funFact?: string;
  externalLinks?: ExternalLink[];
  completed: boolean;
}

export interface Course {
  id: string;
  userId: string;
  topic: string;
  depth: 15 | 30;
  outline: string;
  steps: Step[];
  notes: string;
  createdAt: string;
  // Fields for sharing
  sharedBy?: string; // Username of the person who shared it
  originalCourseId?: string;
}

export type CourseData = Omit<Course, 'id'>;


export interface UserProfile {
    id: string; // Firebase Auth UID
    email: string;
    username?: string;
    photoURL?: string | null;
    displayName?: string | null;
}

export interface ShareRequest {
    id: string;
    fromUsername: string;
    courseTopic: string;
    courseId: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: string;
}
