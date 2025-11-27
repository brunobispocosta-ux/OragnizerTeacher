import { Student, ClassSession, SessionStatus } from '../types';

const KEYS = {
  STUDENTS: 'profbanca_students',
  SESSIONS: 'profbanca_sessions',
};

// --- Students ---

export const getStudents = (): Student[] => {
  const data = localStorage.getItem(KEYS.STUDENTS);
  return data ? JSON.parse(data) : [];
};

export const saveStudent = (student: Student): void => {
  const students = getStudents();
  const existingIndex = students.findIndex((s) => s.id === student.id);
  
  if (existingIndex >= 0) {
    students[existingIndex] = student;
  } else {
    students.push(student);
  }
  
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
};

export const deleteStudent = (id: string): void => {
  const students = getStudents().filter((s) => s.id !== id);
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
};

export const getStudentById = (id: string): Student | undefined => {
  return getStudents().find((s) => s.id === id);
};

// --- Sessions ---

export const getSessions = (): ClassSession[] => {
  const data = localStorage.getItem(KEYS.SESSIONS);
  return data ? JSON.parse(data) : [];
};

export const saveSession = (session: ClassSession): void => {
  const sessions = getSessions();
  const existingIndex = sessions.findIndex((s) => s.id === session.id);
  
  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.push(session);
  }
  
  localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
};

export const deleteSession = (id: string): void => {
  const sessions = getSessions().filter((s) => s.id !== id);
  localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
};

// --- Helpers ---

export const getSessionsByDate = (dateStr: string): ClassSession[] => {
  // dateStr should be YYYY-MM-DD
  return getSessions().filter(s => s.date === dateStr && s.status !== SessionStatus.CANCELLED);
};

export const getUnpaidSessionsByStudent = (studentId: string): ClassSession[] => {
  return getSessions().filter(s => s.studentId === studentId && s.status === SessionStatus.COMPLETED && !s.paid);
};
