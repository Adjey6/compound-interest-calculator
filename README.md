# Calculadora de Interés Compuesto Avanzada con Análisis IA ✨

Este proyecto es una **calculadora interactiva de interés compuesto** que te permite visualizar el crecimiento de tus inversiones en fondos indexados a lo largo del tiempo. Va un paso más allá al integrar una funcionalidad de **Inteligencia Artificial (IA) impulsada por Gemini**, que te ofrece análisis y perspectivas personalizadas sobre tu estrategia de inversión. Además, ahora puedes simular **aportaciones adicionales únicas** en meses específicos para ver su impacto.

-----

## 🚀 Características Destacadas

  * **Simulación de Interés Compuesto:** Calcula el crecimiento de tu capital en función de la inversión inicial, aportaciones mensuales, rentabilidad anual y horizonte temporal.
  * **Aportaciones Adicionales Únicas:** Añade cantidades extra de forma puntual en meses y años específicos para observar cómo aceleran tu crecimiento.
  * **Visualización Clara:**
      * **Gráfico de Proyección:** Un gráfico de líneas intuitivo que muestra la evolución de tu capital año a año.
      * **Tabla de Detalle Mensual:** Una tabla exhaustiva con el desglose mes a mes del capital al inicio, aportaciones (mensual y adicional), intereses generados y capital final.
  * **Análisis de Inversión con IA (Gemini API) ✨:**
      * Haz preguntas sobre tu plan de inversión y recibe respuestas generadas por un modelo de lenguaje avanzado.
      * Obtén perspectivas sobre la viabilidad de tus objetivos o el impacto de tus parámetros de inversión.

-----

## 🛠️ Tecnologías Utilizadas

  * **React:** Para construir la interfaz de usuario interactiva y dinámica.
  * **recharts:** Para la creación de gráficos de datos atractivos y responsivos.
  * **Tailwind CSS:** Para un diseño rápido, moderno y completamente responsivo.
  * **Google Gemini API:** Para la funcionalidad de análisis y asistencia mediante inteligencia artificial.

-----

## 💡 ¿Cómo funciona?

1.  **Introduce tus Parámetros:** Rellena los campos de "Inversión Inicial", "Aportación Mensual", "Rentabilidad Anual (%)" y "Horizonte Temporal (Años)".
2.  **Añade Aportaciones Adicionales:** Si lo deseas, especifica un año, un mes y una cantidad extra para añadirla a tu inversión. Puedes añadir múltiples aportaciones adicionales.
3.  **Visualiza los Resultados:** Observa cómo el gráfico y la tabla de proyección se actualizan en tiempo real para mostrar el poder del interés compuesto.
4.  **Consulta a la IA:** En la sección "Análisis de Inversión y Aportaciones Adicionales", escribe una pregunta sobre tu plan (ej. "¿Es este un buen plan para la jubilación?", "¿Qué tan realista es mi objetivo de 500.000€?") y haz clic en "Preguntar a Gemini ✨" para obtener una respuesta inteligente.

-----

## 🚀 Puesta en Marcha (Desarrollo Local)

Si quieres ejecutar este proyecto en tu máquina local:

1.  **Clona el repositorio:**

    ```bash
    git clone https://github.com/TU_USUARIO/calculadora-interes-compuesto.git
    cd calculadora-interes-compuesto
    ```

    *(Reemplaza `TU_USUARIO` y `calculadora-interes-compuesto` con los datos de tu repositorio real si lo subes a GitHub.)*

2.  **Instala las dependencias:**

    ```bash
    npm install
    # o
    yarn install
    ```

3.  **Configura tu API Key de Gemini:**

      * Necesitarás una API Key para la [Google Gemini API](https://www.google.com/search?q=https://ai.google.dev/gemini-api/docs/get-started/web).
      * Crea un archivo `.env` en la raíz del proyecto y añade tu clave:
        ```
        VITE_GEMINI_API_KEY=TU_API_KEY_AQUI
        ```
        *(Nota: El código del "Immersive Document" que te proporcioné no necesita una clave explícitamente en el código ya que se inyecta en ese entorno. Para desarrollo local, sí la necesitarás).*

4.  **Inicia la aplicación:**

    ```bash
    npm run dev
    # o
    yarn dev
    ```

    La aplicación se abrirá en tu navegador en `http://localhost:5173` (o un puerto similar).

-----

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas\! Si tienes ideas para mejorar, añadir nuevas características o corregir errores, no dudes en abrir un *issue* o enviar un *pull request*.

-----

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo `LICENSE` para más detalles.

-----

¡Espero que esta calculadora te ayude a visualizar y planificar tus metas financieras\! Si tienes alguna pregunta o sugerencia, no dudes en compartirla.
