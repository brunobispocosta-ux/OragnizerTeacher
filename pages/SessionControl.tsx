import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessions, getStudentById, saveSession } from '../services/storage';
import { ClassSession, SessionStatus } from '../types';
import { suggestLessonPlan } from '../services/geminiService';
import { StopCircle, Save, Lightbulb, Loader2, ArrowLeft } from 'lucide-react';

const SessionControl: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<ClassSession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [notes, setNotes] = useState('');
  
  // AI Suggestion State
  const [suggestion, setSuggestion] = useState('');
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const allSessions = getSessions();
    const current = allSessions.find(s => s.id === id);
    if (current) {
      setSession(current);
      setNotes(current.notes || '');
      
      // If it was already in progress/started, calculate elapsed time logic could be added here
      // For this simplified version, we assume timer starts when component mounts if status is IN_PROGRESS
      // Or user clicks start.
      if (current.status === SessionStatus.IN_PROGRESS) {
        setIsActive(true);
        // In a real app, calculate diff from startTime to now.
        // Here we just restart a counter or load saved duration if we had one.
        // Simplified:
        const startTime = new Date(current.startTime || Date.now()).getTime();
        const now = Date.now();
        setElapsedSeconds(Math.floor((now - startTime) / 1000));
      }
    }
  }, [id]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const handleStart = () => {
    if (!session) return;
    const now = new Date().toISOString();
    const updated: ClassSession = { ...session, status: SessionStatus.IN_PROGRESS, startTime: now };
    saveSession(updated);
    setSession(updated);
    setIsActive(true);
  };

  const handleStop = () => {
    setIsActive(false);
  };

  const handleFinish = () => {
    if (!session) return;
    const student = getStudentById(session.studentId);
    if (!student) return;

    const durationMinutes = Math.ceil(elapsedSeconds / 60);
    const cost = (durationMinutes / 60) * student.hourlyRate;

    const updated: ClassSession = {
      ...session,
      status: SessionStatus.COMPLETED,
      endTime: new Date().toISOString(),
      durationMinutes,
      cost,
      notes
    };
    
    saveSession(updated);
    navigate('/');
  };

  const handleGetSuggestion = async () => {
    if (!session) return;
    const student = getStudentById(session.studentId);
    if (!student) return;
    
    setLoadingSuggestion(true);
    // Fetch last session for context if possible, for now just pass empty or current notes
    const plan = await suggestLessonPlan(student, "Aula anterior (sem dados)");
    setSuggestion(plan);
    setLoadingSuggestion(false);
  };

  if (!session) return <div className="p-4">Carregando...</div>;
  const student = getStudentById(session.studentId);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/')} className="text-gray-500 flex items-center gap-1 text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-800">Aula com {student?.name}</h2>
        <p className="text-brand-600 text-sm font-semibold uppercase tracking-wide">{student?.subject}</p>
      </div>

      <div className="flex flex-col items-center justify-center py-8 bg-white rounded-full w-64 h-64 mx-auto shadow-lg border-4 border-brand-100">
        <div className="text-5xl font-mono font-bold text-gray-800 tracking-wider">
          {formatTime(elapsedSeconds)}
        </div>
        <div className="text-gray-400 text-sm mt-2">
            {isActive ? 'Em andamento' : 'Pausado'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {!isActive && session.status === SessionStatus.SCHEDULED ? (
           <button onClick={handleStart} className="col-span-2 bg-brand-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-700 shadow-lg">
             Iniciar Aula
           </button>
        ) : isActive ? (
            <button onClick={handleStop} className="col-span-2 bg-red-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-600 shadow-lg flex justify-center items-center gap-2">
                <StopCircle className="w-6 h-6" /> Pausar
            </button>
        ) : (
            <>
                <button onClick={() => setIsActive(true)} className="bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700">
                    Retomar
                </button>
                <button onClick={handleFinish} className="bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 flex justify-center items-center gap-2">
                    <Save className="w-5 h-5" /> Finalizar
                </button>
            </>
        )}
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div>
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Anotações da Aula</label>
                <button 
                    onClick={handleGetSuggestion}
                    disabled={loadingSuggestion}
                    className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded"
                >
                    {loadingSuggestion ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lightbulb className="w-3 h-3" />}
                    Sugestão de Atividade
                </button>
            </div>
            {suggestion && (
                <div className="bg-indigo-50 p-3 rounded-lg text-sm text-indigo-800 mb-3 border border-indigo-100">
                    <strong>Sugestão da IA:</strong> <br/>
                    {suggestion}
                    <button onClick={() => setNotes(prev => prev + '\n' + suggestion)} className="block mt-2 text-xs underline">Adicionar às notas</button>
                </div>
            )}
            <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)}
                placeholder="O que foi ensinado hoje?"
                className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-brand-500 outline-none"
            />
        </div>
      </div>
    </div>
  );
};

export default SessionControl;