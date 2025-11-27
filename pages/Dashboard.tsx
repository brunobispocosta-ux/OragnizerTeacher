import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessionsByDate, getStudentById } from '../services/storage';
import { ClassSession, SessionStatus, Student } from '../types';
import { Play, CheckCircle, Clock, Plus } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const loadedSessions = getSessionsByDate(today);
    setSessions(loadedSessions);
  }, [today]);

  const getStudentName = (id: string) => {
    const s = getStudentById(id);
    return s ? s.name : 'Aluno Desconhecido';
  };

  const activeSession = sessions.find(s => s.status === SessionStatus.IN_PROGRESS);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Aulas de Hoje</h2>
        <button 
          onClick={() => navigate('/schedule')}
          className="bg-brand-600 text-white p-2 rounded-full shadow hover:bg-brand-700 transition"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="text-sm text-gray-500 mb-4">
        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </div>

      {activeSession ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm animate-pulse">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Aula em Andamento</h3>
          <p className="text-green-700 text-xl font-bold mb-4">{getStudentName(activeSession.studentId)}</p>
          <button 
            onClick={() => navigate(`/session/${activeSession.id}`)}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <Clock className="w-5 h-5" />
            Retornar ao Cronômetro
          </button>
        </div>
      ) : null}

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl shadow-sm">
            <p className="text-gray-400">Nenhuma aula agendada para hoje.</p>
            <button onClick={() => navigate('/schedule')} className="mt-4 text-brand-600 font-medium">Agendar Aula</button>
          </div>
        ) : (
          sessions.map(session => (
            <div key={session.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-lg text-gray-800">{getStudentName(session.studentId)}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium 
                      ${session.status === SessionStatus.COMPLETED ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>
                      {session.status === SessionStatus.COMPLETED ? 'Concluída' : 'Agendada'}
                    </span>
                    {session.durationMinutes > 0 && <span>• {session.durationMinutes} min</span>}
                </div>
              </div>

              {session.status === SessionStatus.SCHEDULED && !activeSession && (
                <button 
                  onClick={() => navigate(`/session/${session.id}`)}
                  className="bg-brand-600 text-white p-3 rounded-full hover:bg-brand-700 shadow-md transition-transform active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current" />
                </button>
              )}
              
              {session.status === SessionStatus.COMPLETED && (
                <div className="text-green-500">
                  <CheckCircle className="w-6 h-6" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;