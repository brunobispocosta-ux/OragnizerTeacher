import React from 'react';

export interface Student {
  id: string;
  name: string;
  subject: string;
  hourlyRate: number;
  phone: string;
  notes?: string;
}

export enum SessionStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface ClassSession {
  id: string;
  studentId: string;
  date: string; // ISO Date string YYYY-MM-DD
  startTime?: string; // ISO timestamp
  endTime?: string; // ISO timestamp
  durationMinutes: number;
  status: SessionStatus;
  notes: string;
  cost: number;
  paid: boolean;
}

export interface NavItem {
  label: string;
  path: string;
  icon: React.FC<any>;
}