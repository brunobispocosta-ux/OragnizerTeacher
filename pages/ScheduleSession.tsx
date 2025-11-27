import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudents, saveSession } from '../services/storage';
import { Student, SessionStatus } from '../types';

const ScheduleSession: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const s = getStudents();
    setStudents(s);
    if (s.length > 0) setStudentId(s[0].id);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
        alert("Adicione um aluno primeiro!");
        navigate('/students');
        return;
    }

    saveSession({
      id: crypto.randomUUID(),
      studentId,
      date,
      durationMinutes: 0,
      status: SessionStatus.SCHEDULED,
      notes,
      cost: 0,
      paid: false
    });
    
    navigate('/');
  };

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold text-gray-800">Agendar Visita</h2>
       <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Aluno</label>
            <select 
                value={studentId} 
                onChange={e => setStudentId(e.target.value)}
                className="w-full mt-1 p-3 border rounded-lg bg-white"
            >
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data</label>
            <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                className="w-full mt-1 p-3 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Observações (Opcional)</label>
            <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)}
                className="w-full mt-1 p-3 border rounded-lg h-24 resize-none"
                placeholder="Ex: Trazer livro de história"
            />
          </div>
          <div className="flex gap-3 pt-4">
             <button type="button" onClick={() => navigate('/')} className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
             <button type="submit" className="flex-1 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium">Agendar</button>
          </div>
       </form>
    </div>
  );
};

export default ScheduleSession;