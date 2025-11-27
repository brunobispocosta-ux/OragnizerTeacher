import { GoogleGenAI } from "@google/genai";
import { Student, ClassSession } from '../types';

export const generateBillingMessage = async (
  student: Student,
  sessions: ClassSession[],
  totalAmount: number
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const sessionDetails = sessions.map(s => 
      `- ${new Date(s.date).toLocaleDateString('pt-BR')}: ${s.durationMinutes} min (R$ ${s.cost.toFixed(2)})`
    ).join('\n');

    const prompt = `
      Você é um assistente pessoal de um professor particular (banca).
      Escreva uma mensagem de cobrança amigável e profissional para enviar via WhatsApp para o responsável do aluno(a) ${student.name}.
      
      Detalhes das aulas a cobrar:
      ${sessionDetails}
      
      Valor Total: R$ ${totalAmount.toFixed(2)}
      
      A mensagem deve ser curta, educada, e listar as datas e o valor total. Não adicione placeholders, use apenas os dados fornecidos.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Erro ao gerar mensagem.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Não foi possível gerar a mensagem automática. Verifique sua chave de API.";
  }
};

export const suggestLessonPlan = async (student: Student, previousNote: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
          O aluno é ${student.name}, estuda ${student.subject}.
          A última aula teve a seguinte anotação: "${previousNote}".
          
          Sugira um plano de aula breve (3 tópicos) para a próxima aula, focando em reforço ou progressão do conteúdo.
          Formato: Lista simples.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text || "Sem sugestões no momento.";

    } catch (error) {
        console.error("Gemini Error", error);
        return "Erro ao conectar com a IA.";
    }
}