import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { getStudents, saveStudent, deleteStudent } from '../services/storage';
import { Plus, Trash2, Edit2, User, Phone, BookOpen } from 'lucide-react';

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    setStudents(getStudents());
  }, []);

  const resetForm = () => {
    setName('');
    setSubject('');
    setHourlyRate('');
    setPhone('');
    setEditingId(null);
  };

  const handleOpenModal = (student?: Student) => {
    if (student) {
      setEditingId(student.id);
      setName(student.name);
      setSubject(student.subject);
      setHourlyRate(student.hourlyRate.toString());
      setPhone(student.phone);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newStudent: Student = {
      id: editingId || crypto.randomUUID(),
      name,
      subject,
      hourlyRate: parseFloat(hourlyRate) || 0,
      phone,
    };
    saveStudent(newStudent);
    setStudents(getStudents());
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este aluno?')) {
      deleteStudent(id);
      setStudents(getStudents());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Meus Alunos</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg shadow hover:bg-brand-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Novo Aluno</span>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {students.map(student => (
          <div key={student.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                 <div className="bg-brand-100 p-2 rounded-full">
                    <User className="w-5 h-5 text-brand-600" />
                 </div>
                 <div>
                    <h3 className="font-bold text-lg">{student.name}</h3>
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> {student.subject}
                    </p>
                 </div>
              </div>
              <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-bold">
                R$ {student.hourlyRate}/h
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between border-t pt-3">
                <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {student.phone || 'Sem telefone'}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(student)} className="text-gray-400 hover:text-brand-600">
                        <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(student.id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
          </div>
        ))}
        {students.length === 0 && (
            <p className="text-gray-400 col-span-full text-center py-8">Nenhum aluno cadastrado. Adicione um para começar!</p>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Editar Aluno' : 'Novo Aluno'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Ex: João Silva" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Matéria</label>
                <input required type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Ex: Matemática" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Valor Hora (R$)</label>
                    <input required type="number" step="0.50" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="50.00" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="(11) 99999-9999" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;