document.addEventListener('DOMContentLoaded', () => {
    const historicalFigures = [
        'Albert Einstein', 'Marie Curie', 'Nikola Tesla', 'Leonardo da Vinci',
        'Cleopatra', 'Julius Caesar', 'Genghis Khan', 'William Shakespeare',
        'Jane Austen', 'Vincent van Gogh', 'Blackbeard the Pirate', 'Amelia Earhart',
        'Sun Tzu', 'Ada Lovelace', 'H.P. Lovecraft'
    ];

    const figureSelect1 = document.getElementById('figure-select-1');
    const figureSelect2 = document.getElementById('figure-select-2');
    const form = document.getElementById('hot-take-form');
    const resultContainer = document.getElementById('result-container');
    const resultText = document.getElementById('result-text');
    const generateBtn = document.getElementById('generate-btn');
    const themeToggle = document.getElementById('theme-toggle');

    // Theme switcher logic
    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('light-mode');
    });

    // Populate dropdowns
    historicalFigures.forEach(figure => {
        const option1 = document.createElement('option');
        option1.value = figure;
        option1.textContent = figure;
        figureSelect1.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = figure;
        option2.textContent = figure;
        figureSelect2.appendChild(option2);
    });

    // Reusable AI call function
    async function getAiResponse(systemPrompt, userContent) {
        const apiKey = 'your_key'; // Your API Key
        const apiUrl = 'https://api.aimlapi.com/v1/chat/completions';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'grok-4-0709',
                messages: [
                    { role: 'system', content: systemPrompt.trim() },
                    { role: 'user', content: userContent }
                ]
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
        }
        const data = await response.json();
        return data.choices[0].message.content;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const figure1 = figureSelect1.value;
        const figure2 = figureSelect2.value;
        const topic = document.getElementById('topic-input').value.trim();

        if (!topic) {
            alert('Please enter a topic.');
            return;
        }
        if (figure1 === figure2) {
            alert('Please select two different historical figures for a debate.');
            return;
        }

        generateBtn.disabled = true;
        resultContainer.classList.add('hidden');

        try {
            // SOLO HOT TAKE
            if (!figure2) {
                generateBtn.textContent = 'Generating Hot Take...';
                const prompt = `You are ${figure1}. Provide a short, witty "hot take" on the topic of "${topic}". Your response must be in your voice and style, and under 280 characters.`;
                const take = await getAiResponse(prompt, topic);
                resultText.innerHTML = `<p><strong>${figure1}:</strong> ${take}</p>`;
            } 
            // HISTORICAL DEBATE
            else {
                generateBtn.textContent = 'Generating Debate...';
                // Action Chain Step 1: Get the first hot take
                const prompt1 = `You are ${figure1}. Provide a short, witty "hot take" on the topic of "${topic}". Your response must be in your voice and style, and under 280 characters.`;
                const take1 = await getAiResponse(prompt1, topic);

                // Action Chain Step 2: Get the rebuttal
                const prompt2 = `You are ${figure2}. Your opponent, ${figure1}, just said this about "${topic}": "${take1}". Write a short, witty rebuttal from your perspective. Your response must be in your voice and style, and under 280 characters.`;
                const take2 = await getAiResponse(prompt2, `Your response to ${figure1}'s take.`);

                // Display the debate
                resultText.innerHTML = `
                    <h3>A Heated Debate on: ${topic}</h3>
                    <p><strong>${figure1}:</strong> ${take1}</p>
                    <p><strong>${figure2}:</strong> ${take2}</p>
                `;
            }

        } catch (error) {
            console.error('Error during AI generation:', error);
            resultText.textContent = 'Sorry, something went wrong. Please check the console for details.';
        }
        
        resultContainer.classList.remove('hidden');
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate';
    });
});