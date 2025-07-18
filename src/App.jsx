import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Componente principal de la aplicación
const App = () => {
  // Estados para los parámetros de entrada
  const [initialInvestment, setInitialInvestment] = useState(1000); // Inversión inicial
  const [monthlyContribution, setMonthlyContribution] = useState(100); // Aportación mensual
  const [annualReturn, setAnnualReturn] = useState(7); // Rentabilidad anual en porcentaje
  const [timeHorizon, setTimeHorizon] = useState(20); // Horizonte temporal en años

  // Estado para los datos de la proyección
  const [projectionData, setProjectionData] = useState([]);

  // Estados para la funcionalidad del LLM (Gemini API)
  const [userQuestion, setUserQuestion] = useState(''); // Pregunta del usuario al LLM
  const [llmResponse, setLlmResponse] = useState(''); // Respuesta del LLM
  const [isLoadingLlm, setIsLoadingLlm] = useState(false); // Estado de carga del LLM
  const [llmError, setLlmError] = useState(''); // Mensajes de error del LLM

  // Estados para aportaciones adicionales
  const [additionalContributions, setAdditionalContributions] = useState([]); // Array de aportaciones adicionales
  const [newAddContributionYear, setNewAddContributionYear] = useState(1); // Año para nueva aportación adicional
  const [newAddContributionMonth, setNewAddContributionMonth] = useState(1); // Mes para nueva aportación adicional
  const [newAddContributionAmount, setNewAddContributionAmount] = useState(0); // Cantidad para nueva aportación adicional

  // Función para calcular la proyección del interés compuesto
  const calculateProjection = () => {
    const data = [];
    let currentCapital = initialInvestment;
    const monthlyReturnRate = (annualReturn / 100) / 12; // Tasa de retorno mensual

    for (let year = 1; year <= timeHorizon; year++) {
      for (let month = 1; month <= 12; month++) {
        const capitalAtStartOfMonth = currentCapital;
        const regularContribution = monthlyContribution;

        // Buscar aportaciones adicionales para el mes y año actuales
        let totalAdditionalContributionThisMonth = 0;
        additionalContributions.forEach(ac => {
          if (ac.year === year && ac.month === month) {
            totalAdditionalContributionThisMonth += ac.amount;
          }
        });

        // Suma de la aportación regular y la adicional
        const totalContributionThisMonth = regularContribution + totalAdditionalContributionThisMonth;

        // Interés generado este mes
        // Se calcula sobre el capital actual más la aportación total del mes
        const interestGenerated = (capitalAtStartOfMonth + totalContributionThisMonth) * monthlyReturnRate;

        // Capital al final del mes
        currentCapital = capitalAtStartOfMonth + totalContributionThisMonth + interestGenerated;

        data.push({
          year: year,
          month: month,
          monthlyContribution: regularContribution, // Aportación mensual regular
          additionalContribution: totalAdditionalContributionThisMonth, // Aportación adicional de este mes
          capitalAtStartOfMonth: parseFloat(capitalAtStartOfMonth.toFixed(2)),
          interestGenerated: parseFloat(interestGenerated.toFixed(2)),
          capitalAtEndOfMonth: parseFloat(currentCapital.toFixed(2)),
          // Para el gráfico, etiquetamos cada 12 meses (final de año) o cada 6 meses para más detalle
          name: (month === 12 || month === 6) ? `Año ${year} / Mes ${month}` : `Mes ${month}`,
        });
      }
    }
    setProjectionData(data);
  };

  // Función para añadir una nueva aportación adicional
  const handleAddAdditionalContribution = () => {
    if (newAddContributionAmount > 0 && newAddContributionYear > 0 && newAddContributionMonth > 0 && newAddContributionMonth <= 12 && newAddContributionYear <= timeHorizon) {
      setAdditionalContributions(prev => [
        ...prev,
        {
          year: newAddContributionYear,
          month: newAddContributionMonth,
          amount: newAddContributionAmount
        }
      ]);
      // Resetear campos de entrada
      setNewAddContributionYear(1);
      setNewAddContributionMonth(1);
      setNewAddContributionAmount(0);
    } else {
      // Reemplazar alert() con un mensaje en la UI o un modal
      // alert('Por favor, introduce un año, mes y cantidad válidos para la aportación adicional.');
      setLlmError('Por favor, introduce un año, mes y cantidad válidos para la aportación adicional.');
      setTimeout(() => setLlmError(''), 5000); // Limpiar el mensaje de error después de 5 segundos
    }
  };

  // Función para eliminar una aportación adicional
  const handleDeleteAdditionalContribution = (index) => {
    setAdditionalContributions(prev => prev.filter((_, i) => i !== index));
  };

  // Función para llamar a la API de Gemini
  const handleAskGemini = async () => {
    setIsLoadingLlm(true);
    setLlmResponse('');
    setLlmError('');

    const finalCapital = projectionData.length > 0 ? projectionData[projectionData.length - 1].capitalAtEndOfMonth : initialInvestment;

    const prompt = `Eres un asistente financiero experto. Basado en los siguientes parámetros de inversión:
- Inversión Inicial: ${initialInvestment}€
- Aportación Mensual: ${monthlyContribution}€
- Aportaciones Adicionales: ${JSON.stringify(additionalContributions.map(ac => `Año ${ac.year} Mes ${ac.month}: ${ac.amount}€`))}
- Rentabilidad Anual: ${annualReturn}%
- Horizonte Temporal: ${timeHorizon} años
- Capital Final Proyectado: ${finalCapital.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}

Responde a la siguiente pregunta del usuario de forma concisa y útil, considerando los principios del interés compuesto y la inversión a largo plazo en fondos indexados. Si la pregunta es muy general, proporciona una perspectiva general sobre los parámetros dados.

Pregunta del usuario: '${userQuestion}'`;

    try {
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = ""; // La API key se proporciona automáticamente en el entorno de Canvas
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setLlmResponse(text);
      } else {
        setLlmError('No se pudo obtener una respuesta del modelo. Inténtalo de nuevo.');
        console.error('Unexpected LLM response structure:', result);
      }
    } catch (error) {
      setLlmError('Error al conectar con la API de Gemini. Por favor, inténtalo de nuevo.');
      console.error('Error calling Gemini API:', error);
    } finally {
      setIsLoadingLlm(false);
    }
  };


  // Ejecutar el cálculo cada vez que cambian los parámetros de entrada o las aportaciones adicionales
  useEffect(() => {
    calculateProjection();
  }, [initialInvestment, monthlyContribution, annualReturn, timeHorizon, additionalContributions]);

  // Filtrar datos para el gráfico (por ejemplo, mostrar solo el final de cada año)
  const chartData = useMemo(() => {
    // Para no sobrecargar el gráfico, mostramos los datos al final de cada año
    return projectionData.filter(item => item.month === 12);
  }, [projectionData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4 font-inter text-gray-800 flex flex-col items-center">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-2xl p-8 space-y-8">
        <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-8">
          Calculadora de Interés Compuesto
        </h1>

        {/* Sección de Parámetros de Entrada */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-indigo-50 p-6 rounded-lg shadow-inner">
          <div className="flex flex-col">
            <label htmlFor="initialInvestment" className="text-lg font-medium text-indigo-600 mb-2">
              Inversión Inicial (€)
            </label>
            <input
              type="number"
              id="initialInvestment"
              value={initialInvestment}
              onChange={(e) => setInitialInvestment(parseFloat(e.target.value))}
              className="p-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition duration-200"
              min="0"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="monthlyContribution" className="text-lg font-medium text-indigo-600 mb-2">
              Aportación Mensual (€)
            </label>
            <input
              type="number"
              id="monthlyContribution"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(parseFloat(e.target.value))}
              className="p-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition duration-200"
              min="0"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="annualReturn" className="text-lg font-medium text-indigo-600 mb-2">
              Rentabilidad Anual (%)
            </label>
            <input
              type="number"
              id="annualReturn"
              value={annualReturn}
              onChange={(e) => setAnnualReturn(parseFloat(e.target.value))}
              className="p-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition duration-200"
              min="0"
              step="0.1"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="timeHorizon" className="text-lg font-medium text-indigo-600 mb-2">
              Horizonte Temporal (Años)
            </label>
            <input
              type="number"
              id="timeHorizon"
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(parseInt(e.target.value))}
              className="p-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition duration-200"
              min="1"
            />
          </div>
        </div>

        {/* Sección de Gráfico */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center">
            Crecimiento de la Inversión (Fin de Año)
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="year"
                label={{ value: 'Año', position: 'insideBottom', offset: 0, fill: '#4a4a4a' }}
                tickFormatter={(value) => `Año ${value}`}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                label={{ value: 'Capital (€)', angle: -90, position: 'insideLeft', fill: '#4a4a4a' }}
                tickFormatter={(value) => `${value.toLocaleString('es-ES')}€`}
              />
              <Tooltip
                formatter={(value) => `${value.toLocaleString('es-ES')}€`}
                labelFormatter={(label) => `Año ${label}`}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line
                type="monotone"
                dataKey="capitalAtEndOfMonth"
                name="Capital al Final del Año"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sección de Análisis de Inversión con Gemini API y Aportaciones Adicionales */}
        <div className="bg-indigo-50 p-6 rounded-lg shadow-inner space-y-6">
          <h2 className="text-2xl font-bold text-indigo-700 text-center">
            Análisis de Inversión y Aportaciones Adicionales ✨
          </h2>

          {/* Aportaciones Adicionales Únicas */}
          <div className="bg-white p-5 rounded-lg shadow-md space-y-4">
            <h3 className="text-xl font-semibold text-indigo-600 mb-3">Aportaciones Adicionales Únicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label htmlFor="addContributionYear" className="text-sm font-medium text-gray-700 mb-1">Año</label>
                <input
                  type="number"
                  id="addContributionYear"
                  value={newAddContributionYear}
                  onChange={(e) => setNewAddContributionYear(parseInt(e.target.value))}
                  className="p-2 border border-indigo-200 rounded-md focus:ring-1 focus:ring-indigo-400 outline-none"
                  min="1"
                  max={timeHorizon}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="addContributionMonth" className="text-sm font-medium text-gray-700 mb-1">Mes</label>
                <input
                  type="number"
                  id="addContributionMonth"
                  value={newAddContributionMonth}
                  onChange={(e) => setNewAddContributionMonth(parseInt(e.target.value))}
                  className="p-2 border border-indigo-200 rounded-md focus:ring-1 focus:ring-indigo-400 outline-none"
                  min="1"
                  max="12"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="addContributionAmount" className="text-sm font-medium text-gray-700 mb-1">Cantidad (€)</label>
                <input
                  type="number"
                  id="addContributionAmount"
                  value={newAddContributionAmount}
                  onChange={(e) => setNewAddContributionAmount(parseFloat(e.target.value))}
                  className="p-2 border border-indigo-200 rounded-md focus:ring-1 focus:ring-indigo-400 outline-none"
                  min="0"
                  step="10"
                />
              </div>
            </div>
            <button
              onClick={handleAddAdditionalContribution}
              className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={newAddContributionAmount <= 0 || newAddContributionYear <= 0 || newAddContributionMonth <= 0 || newAddContributionMonth > 12 || newAddContributionYear > timeHorizon}
            >
              Añadir Aportación Adicional
            </button>

            {additionalContributions.length > 0 && (
              <div className="mt-4">
                <h4 className="text-md font-semibold text-gray-700 mb-2">Aportaciones Adicionales Añadidas:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {additionalContributions.map((ac, index) => (
                    <li key={index} className="flex justify-between items-center text-sm text-gray-800 bg-gray-50 p-2 rounded-md">
                      <span>Año {ac.year}, Mes {ac.month}: {ac.amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                      <button
                        onClick={() => handleDeleteAdditionalContribution(index)}
                        className="ml-2 text-red-600 hover:text-red-800 font-semibold"
                        title="Eliminar aportación"
                      >
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sección de Pregunta a Gemini */}
          <div className="bg-white p-5 rounded-lg shadow-md space-y-4">
            <h3 className="text-xl font-semibold text-indigo-600 mb-3">Pregunta a Gemini</h3>
            <p className="text-gray-700 text-center">
              Haz una pregunta sobre tu plan de inversión y obtén una perspectiva del modelo Gemini.
            </p>
            <textarea
              className="w-full p-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition duration-200 resize-y min-h-[100px]"
              placeholder="Ej: ¿Es este un buen plan para la jubilación? ¿Qué tan realista es mi objetivo de X cantidad con estos parámetros?"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
            ></textarea>
            <button
              onClick={handleAskGemini}
              disabled={isLoadingLlm || !userQuestion.trim()}
              className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingLlm ? 'Analizando...' : 'Preguntar a Gemini ✨'}
            </button>

            {llmError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {llmError}</span>
              </div>
            )}

            {llmResponse && (
              <div className="bg-gray-50 p-4 rounded-lg shadow-inner border border-indigo-200">
                <h3 className="text-lg font-semibold text-indigo-700 mb-2">Respuesta de Gemini:</h3>
                <p className="text-gray-800 whitespace-pre-wrap">{llmResponse}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sección de Tabla de Proyección */}
        <div className="bg-white p-6 rounded-lg shadow-lg overflow-x-auto">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center">
            Detalle de Proyección Mensual
          </h2>
          <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg">
                  Año
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Mes
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Aportación Mensual (€)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Aportación Adicional (€)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Capital al Inicio del Mes (€)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Interés Generado este Mes (€)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider rounded-tr-lg">
                  Capital al Final del Mes (€)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projectionData.map((data, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {data.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {data.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {data.monthlyContribution.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {data.additionalContribution.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {data.capitalAtStartOfMonth.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {data.interestGenerated.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    {data.capitalAtEndOfMonth.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default App;
