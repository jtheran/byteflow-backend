import iaClient from '../config/ia.config';
import qdrantClient from '../config/qdrant.config';
import config from '../config/config';

// Reutilizamos el generador de embeddings para la pregunta
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await iaClient.embeddings.create({
    model: config.ia.MODEL_EMBEDDING,
    input: text,
  });
  return response.data[0].embedding;
}

export const processRAGChat = async (userQuery: string): Promise<string> => {
  // 1. Convertir la duda del usuario en un vector conceptual
  const queryVector = await generateEmbedding(userQuery);

  // 2. Buscar en Qdrant los documentos con mayor similitud de coseno
  const searchResults = await qdrantClient.search(config.qdrant.COLLECTION_NAME, {
    vector: queryVector,
    limit: 5, // Traer los 5 fragmentos de información más relevantes
    with_payload: true
  });

  // 3. Consolidar los fragmentos encontrados en un bloque de contexto
  const contextBlock = searchResults
    .map(result => `- ${result.payload?.content}`)
    .join('\n');

  // 4. Armar el Prompt del Sistema inyectando el contexto recuperado (RAG)
  const systemPrompt = `
    Eres el asistente analítico de IA de la plataforma ByteFlow POS. 
    Tienes acceso exclusivo a un fragmento optimizado de la base de datos del sistema en tiempo real.
    
    CONTEXTO EXTRAÍDO DEL SISTEMA:
    ${contextBlock || 'No se encontró contexto relevante en la base de datos vectorial.'}
    
    Instrucciones: Responde a la pregunta del usuario utilizando estrictamente el contexto provisto de forma profesional, concisa y comercial. Si los datos no son suficientes, indícalo amablemente.
  `;

  // 5. Enviar la consulta enriquecida a OpenRouter
  const completion = await iaClient.chat.completions.create({
    model: config.ia.MODEL_CHAT,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userQuery }
    ]
  });

  return completion.choices[0].message.content || 'No se pudo generar una respuesta.';
};