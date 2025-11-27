import React, { useState, useEffect } from 'react';
import { getStudents, getUnpaidSessionsByStudent, saveSession } from '../services/storage';
import { Student, ClassSession } from '../types';
import { generateBillingMessage } from '../services/geminiService';
import { DollarSign, Send, CheckSquare, Loader2 } from 'lucide-react';

const Billing: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [unpaidSessions, setUnpaidSessions] = useState<ClassSession[]>([]);
  const [aiMessage, setAiMessage] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    const loadedStudents = getStudents();
    setStudents(loadedStudents);
    if (loadedStudents.length > 0) {
      setSelectedStudentId(loadedStudents[0].id);
    }
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      setUnpaidSessions(getUnpaidSessionsByStudent(selectedStudentId));
      setAiMessage('');
    }
  }, [selectedStudentId]);

  const totalAmount = unpaidSessions.reduce((sum, s) => sum + s.cost, 0);
  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const handleGenerateMessage = async () => {
    if (!selectedStudent || unpaidSessions.length === 0) return;
    setLoadingAi(true);
    const msg = await generateBillingMessage(selectedStudent, unpaidSessions, totalAmount);
    setAiMessage(msg);
    setLoadingAi(false);
  };

  const markAsPaid = () => {
    if (!confirm(`Marcar R$ ${totalAmount.toFixed(2)} como pagos?`)) return;
    
    unpaidSessions.forEach(s => {
      saveSession({ ...s, paid: true });
    });
    
    // Refresh
    setUnpaidSessions(getUnpaidSessionsByStudent(selectedStudentId));
    setAiMessage('');
    alert('Aulas marcadas como pagas!');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Controle de Cobrança</h2>

      {students.length === 0 ? (
        <p className="text-gray-500">Cadastre alunos primeiro.</p>
      ) : (
        <>
          {/* Student Selector */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o Aluno</label>
            <select 
              value={selectedStudentId} 
              onChange={e => setSelectedStudentId(e.target.value)}
              className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-brand-500 outline-none"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Unpaid Sessions List */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-end mb-4 border-b pb-4">
              <div>
                <h3 className="text-gray-500 text-sm">A receber de {selectedStudent?.name}</h3>
                <p className="text-3xl font-bold text-gray-900 mt-1">R$ {totalAmount.toFixed(2)}</p>
                <p className="text-sm text-gray-400 mt-1">{unpaidSessions.length} aula(s) pendente(s)</p>
              </div>
              <button 
                onClick={markAsPaid}
                disabled={unpaidSessions.length === 0}
                className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-200 disabled:opacity-50 flex items-center gap-2"
              >
                <CheckSquare className="w-4 h-4" />
                Marcar Pago
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {unpaidSessions.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Tudo certo! Nenhuma pendência.</p>
              ) : (
                unpaidSessions.map(session => (
                  <div key={session.id} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded">
                    <div>
                      <span className="font-medium text-gray-800">{new Date(session.date).toLocaleDateString('pt-BR')}</span>
                      <span className="text-gray-500 ml-2">({session.durationMinutes} min)</span>
                    </div>
                    <span className="font-bold text-brand-600">R$ {session.cost.toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Action */}
          {unpaidSessions.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded">IA</span>
                <h3 className="font-semibold text-indigo-900">Assistente de Cobrança</h3>
              </div>
              
              {!aiMessage ? (
                <button 
                  onClick={handleGenerateMessage}
                  disabled={loadingAi}
                  className="w-full bg-white border border-indigo-200 text-indigo-700 py-3 rounded-lg hover:bg-indigo-50 font-medium shadow-sm flex items-center justify-center gap-2"
                >
                  {loadingAi ? <Loader2 className="w-5 h-5 animate-spin" /> : <DollarSign className="w-5 h-5" />}
                  Gerar Mensagem de Cobrança
                </button>
              ) : (
                <div className="space-y-3">
                  <textarea 
                    value={aiMessage} 
                    onChange={(e) => setAiMessage(e.target.value)}
                    className="w-full p-3 rounded-lg border-indigo-200 focus:ring-indigo-500 text-sm h-32"
                  />
                  <div className="flex gap-2">
                     <button 
                        onClick={() => {
                            navigator.clipboard.writeText(aiMessage);
                            alert("Copiado!");
                        }}
                        className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium"
                      >
                        Copiar Texto
                      </button>
                      <a 
                        href={`https://wa.me/?text=${encodeURIComponent(aiMessage)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Abrir WhatsApp
                      </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Billing;