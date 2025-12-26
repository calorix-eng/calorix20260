import { GoogleGenAI, Type } from "@google/genai";
import { Food, Micronutrient, MealSuggestion, UserProfile, Recipe, Workout } from '../types';

// A chave da API DEVE ser obtida exclusivamente da variável de ambiente `process.env.API_KEY`.
const GEMINI_API_KEY = process.env.API_KEY;

if (!GEMINI_API_KEY) {
    console.warn("A variável de ambiente API_KEY não foi definida. Os recursos de IA não funcionarão.");
}

// A chave deve ser passada como um parâmetro nomeado.
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const micronutrientProperties: Record<Micronutrient, { type: Type, description: string }> = {
    'Vitamina C': { type: Type.NUMBER, description: 'Vitamina C em mg' },
    'Cálcio': { type: Type.NUMBER, description: 'Cálcio em mg' },
    'Ferro': { type: Type.NUMBER, description: 'Ferro em mg' },
    'Vitamina D': { type: Type.NUMBER, description: 'Vitamina D em mcg' },
    'Vitamina A': { type: Type.NUMBER, description: 'Vitamina A em mcg' },
    'Potássio': { type: Type.NUMBER, description: 'Potássio em mg' },
    'Magnésio': { type: Type.NUMBER, description: 'Magnésio em mg' },
};


const foodSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "O nome do item alimentar/ingrediente." },
        calories: { type: Type.NUMBER, description: "Calorias estimadas para a porção do ingrediente." },
        protein: { type: Type.NUMBER, description: "Proteína estimada em gramas." },
        carbs: { type: Type.NUMBER, description: "Carboidratos estimados em gramas." },
        fat: { type: Type.NUMBER, description: "Gordura estimada em gramas." },
        servingSize: { type: Type.STRING, description: "O tamanho da porção do ingrediente, ex: '1 xícara' ou '100g'."},
        micronutrients: {
            type: Type.OBJECT,
            properties: micronutrientProperties,
            description: "Valores estimados de micronutrientes para a porção, nas unidades corretas (mg ou mcg). Omita qualquer um que não seja aplicável ou desconhecido."
        }
    },
    required: ["name", "calories", "protein", "carbs", "fat", "servingSize"],
};

const foodArraySchema = {
    type: Type.ARRAY,
    items: foodSchema
};

const mealSuggestionSchema = {
    type: Type.OBJECT,
    properties: {
        mealCategory: { type: Type.STRING, description: "A categoria de refeição sugerida (ex: 'Almoço', 'Jantar')." },
        food: foodSchema,
        reasoning: { type: Type.STRING, description: "Uma breve explicação do porquê esta refeição é uma boa sugestão." },
    },
    required: ["mealCategory", "food", "reasoning"]
};

const mealSuggestionsArraySchema = {
    type: Type.ARRAY,
    items: mealSuggestionSchema
};

const recipeSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "O nome da receita." },
        description: { type: Type.STRING, description: "Uma descrição curta e apetitosa da receita." },
        category: { type: Type.STRING, description: "A categoria da receita, ex: 'Café da Manhã', 'Almoço', 'Jantar', 'Lanche'." },
        timeInMinutes: { type: Type.NUMBER, description: "O tempo total de preparo em minutos." },
        ingredients: { type: Type.ARRAY, items: foodSchema, description: "Uma lista detalhada de ingredientes, cada um com suas informações nutricionais." },
        instructions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Uma lista de passos para o modo de preparo." },
        totalCalories: { type: Type.NUMBER, description: "O total de calorias da receita inteira." },
        totalProtein: { type: Type.NUMBER, description: "O total de proteína em gramas." },
        totalCarbs: { type: Type.NUMBER, description: "O total de carboidratos em gramas." },
        totalFat: { type: Type.NUMBER, description: "O total de gordura em gramas." },
        imagePrompt: { type: Type.STRING, description: "Uma descrição concisa em inglês para uma busca de imagem (ex: 'healthy chicken salad bowl')." },
    },
    required: ["name", "description", "category", "timeInMinutes", "ingredients", "instructions", "totalCalories", "totalProtein", "totalCarbs", "totalFat", "imagePrompt"]
};

const recipesArraySchema = {
    type: Type.ARRAY,
    items: recipeSchema,
};

const exercisesSchema = {
    type: Type.OBJECT,
    properties: {
        exercises: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
                description: "O nome de um exercício de musculação ou crossfit identificado na imagem."
            }
        }
    },
    required: ["exercises"]
};

const workoutExerciseSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        type: { type: Type.STRING, description: "Tipo: forca, cardio, core, flexibilidade" },
        sets: { type: Type.NUMBER },
        reps: { type: Type.STRING, description: "Ex: '12-15' ou '30s'" },
        rest_s: { type: Type.NUMBER, description: "Descanso em segundos, ex: 45" },
        image_prompt: { type: Type.STRING, description: "A highly descriptive, short English prompt to generate a flat vector illustration of the person performing the exercise. Focus on the action and posture. E.g., 'flat vector illustration of a person doing a squat, side view, white background'." }
    },
    required: ["name", "type", "sets", "reps", "rest_s", "image_prompt"]
};

const workoutSchema = {
    type: Type.OBJECT,
    properties: {
        duration_min: { type: Type.NUMBER },
        intensity: { type: Type.STRING },
        exercises: { type: Type.ARRAY, items: workoutExerciseSchema },
        calories_estimated: { type: Type.NUMBER }
    },
    required: ["duration_min", "intensity", "exercises", "calories_estimated"]
};


export const getNutritionFromImage = async (base64Image: string, mimeType: string): Promise<Food[]> => {
    try {
        const imagePart = {
            inlineData: {
                mimeType: mimeType,
                data: base64Image,
            },
        };

        const prompt = `Analise a comida nesta imagem. Identifique cada item alimentar e estime suas informações nutricionais completas (calorias, macronutrientes e os seguintes micronutrientes: ${Object.keys(micronutrientProperties).join(', ')}), nas unidades corretas (mg/mcg). Seja preciso. Omita itens não identificados.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, {text: prompt}] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: foodArraySchema,
            }
        });

        const jsonStr = response.text.trim();
        const parsedData = JSON.parse(jsonStr);

        return parsedData.map((item: any) => ({ ...item, id: crypto.randomUUID() }));
    } catch (error) {
        console.error("Error analyzing image with Gemini:", error);
        return [];
    }
};

export const getNutritionFromText = async (query: string): Promise<Food[]> => {
     try {
        const prompt = `Forneça as informações nutricionais completas (calorias, macronutrientes e os seguintes micronutrientes: ${Object.keys(micronutrientProperties).join(', ')}), nas unidades corretas (mg/mcg), para a consulta: "${query}". Liste todas as correspondências possíveis.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
             config: {
                responseMimeType: 'application/json',
                responseSchema: foodArraySchema,
            }
        });
        
        const jsonStr = response.text.trim();
        const parsedData = JSON.parse(jsonStr);

        return parsedData.map((item: any) => ({ ...item, id: crypto.randomUUID() }));
    } catch (error) {
        console.error("Error fetching nutrition from text with Gemini:", error);
        return [];
    }
};

export const getNutritionFromBarcode = async (barcode: string): Promise<Food[]> => {
    try {
        const prompt = `Forneça as informações nutricionais completas (calorias, macronutrientes e os seguintes micronutrientes: ${Object.keys(micronutrientProperties).join(', ')}), nas unidades corretas (mg/mcg), para o produto com código de barras: "${barcode}". Retorne dados para uma única porção. Se não encontrar, retorne um array vazio.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: foodArraySchema,
            }
        });

        const jsonStr = response.text.trim();
        // Handle cases where AI might return a single object instead of an array
        const parsedData = JSON.parse(jsonStr);
        const dataArray = Array.isArray(parsedData) ? parsedData : [parsedData];

        return dataArray.map((item: any) => ({ ...item, id: crypto.randomUUID() }));
    } catch (error) {
        console.error("Error fetching nutrition from barcode with Gemini:", error);
        return [];
    }
};

export const getMealRecommendations = async (
    userProfile: UserProfile,
    consumed: { calories: number; protein: number; carbs: number; fat: number }
): Promise<MealSuggestion[]> => {
    try {
        const remaining = {
            calories: userProfile.goals.calories - consumed.calories,
            protein: userProfile.goals.protein - consumed.protein,
            carbs: userProfile.goals.carbs - consumed.carbs,
            fat: userProfile.goals.fat - consumed.fat,
        };

        const allergyInfo = (userProfile.hasAllergies && userProfile.allergies && userProfile.allergies.length > 0)
            ? `\nIMPORTANTE: O usuário tem as seguintes alergias: ${userProfile.allergies.join(', ')}. As sugestões NÃO DEVEM conter esses ingredientes ou seus derivados.`
            : '';

        const prompt = `
        Com base nas metas e no consumo diário de um usuário, sugira 3 refeições (para categorias como ${userProfile.mealCategories.map(c => c.name).join(', ')}) para ajudá-lo a atingir seus objetivos.
        Metas Diárias: ${userProfile.goals.calories} kcal, ${userProfile.goals.protein}g P, ${userProfile.goals.carbs}g C, ${userProfile.goals.fat}g F.
        Consumido Até Agora: ${consumed.calories} kcal, ${consumed.protein}g P, ${consumed.carbs}g C, ${consumed.fat}g F.
        Metas Restantes: ${remaining.calories} kcal, ${remaining.protein}g P, ${remaining.carbs}g C, ${remaining.fat}g F.
        
        Forneça sugestões que se encaixem bem nas metas restantes. Inclua uma breve justificativa para cada sugestão.${allergyInfo}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: mealSuggestionsArraySchema,
            }
        });

        const jsonStr = response.text.trim();
        const parsedData = JSON.parse(jsonStr);
        
        // Add a random ID to the nested food object
        return parsedData.map((suggestion: any) => ({
            ...suggestion,
            food: {
                ...suggestion.food,
                id: crypto.randomUUID()
            }
        }));

    } catch (error) {
        console.error("Error getting meal recommendations from Gemini:", error);
        return [];
    }
};

export const getRecipes = async (goal: 'gain' | 'lose' | 'maintain', preferences: string, userProfile: UserProfile): Promise<Recipe[]> => {
    const goalMap = {
        gain: 'ganhar massa muscular (hipertrofia)',
        lose: 'emagrecer (déficit calórico)',
        maintain: 'manter o peso de forma saudável'
    };
    const goalInPortuguese = goalMap[goal];
    
    const allergyInfo = (userProfile.hasAllergies && userProfile.allergies && userProfile.allergies.length > 0)
        ? `\nIMPORTANTE: O usuário é alérgico a ${userProfile.allergies.join(', ')}. As receitas NÃO DEVEM conter nenhum desses ingredientes ou seus derivados.`
        : '';
        
    try {
        const prompt = `
        Gere 5 receitas criativas, saudáveis e deliciosas para um usuário com o objetivo de ${goalInPortuguese}.
        ${preferences ? `Leve em consideração as seguintes preferências ou ingredientes do usuário: "${preferences}".` : ''}
        Para cada receita, forneça:
        1. Um nome criativo.
        2. Uma descrição curta e atraente.
        3. Uma categoria (ex: 'Café da Manhã', 'Almoço', 'Jantar', 'Lanche').
        4. O tempo total de preparo em minutos.
        5. A informação nutricional total (calorias, proteína, carboidratos, gordura).
        6. Uma lista detalhada de ingredientes, onde cada ingrediente tem seu próprio nome, porção e informações nutricionais completas (incluindo micronutrientes).
        7. O modo de preparo em uma lista de passos simples.
        8. Um prompt de imagem em inglês, curto e descritivo, para buscar uma foto da receita (ex: 'healthy chicken salad bowl with avocado').
        Seja preciso nos cálculos e variado nas sugestões.${allergyInfo}
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: recipesArraySchema,
            }
        });

        const jsonStr = response.text.trim();
        const parsedData = JSON.parse(jsonStr);

        // Add random UUIDs to each recipe and ingredient
        return parsedData.map((recipe: any) => ({
            ...recipe,
            id: crypto.randomUUID(),
            ingredients: recipe.ingredients.map((ingredient: any) => ({
                ...ingredient,
                id: crypto.randomUUID(),
            })),
        }));

    } catch (error) {
        console.error(`Error getting recipes for goal '${goal}' from Gemini:`, error);
        return [];
    }
};

export const getExercisesFromImage = async (base64Image: string, mimeType: string): Promise<string[]> => {
    try {
        const imagePart = {
            inlineData: {
                mimeType: mimeType,
                data: base64Image,
            },
        };

        const prompt = `Analise esta imagem em busca de exercícios de musculação ou crossfit. Identifique cada exercício visível. Retorne os nomes dos exercícios em uma estrutura JSON.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, {text: prompt}] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: exercisesSchema,
            }
        });

        const jsonStr = response.text.trim();
        const parsedData = JSON.parse(jsonStr);

        return parsedData.exercises || [];
    } catch (error) {
        console.error("Error identifying exercises from image:", error);
        return []; 
    }
};

export const getMotivationalMessage = async (userName: string, coach: { id: 'leo'; name: string }): Promise<string> => {
    try {
        const prompt = `Aja como um coach de fitness amigável e energético chamado ${coach.name}. Gere uma mensagem curta e encorajadora (2-3 frases) para um usuário chamado ${userName} que pode estar se sentindo desanimado. Seu tom deve ser de alta energia, focado em superação e ação. Use frases como "Vamos lá!". Não use markdown ou formatação.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error getting motivational message from Gemini:", error);
        // Fallback message
        return `Olá, ${userName}! Lembre-se de que cada jornada tem seus altos e baixos. O importante é não desistir. Um pequeno passo hoje pode fazer uma grande diferença amanhã. Estou aqui torcendo por você!`;
    }
};

export const generateWorkout = async (userProfile: UserProfile, equipment: string[], duration: number): Promise<Workout | null> => {
    try {
        const prompt = `Gere um treino de ${duration} minutos para um usuário com o objetivo de ${userProfile.goal} (Peso: ${userProfile.weight}kg, Idade: ${userProfile.age}).
        Nível de atividade atual: ${userProfile.activityLevel}.
        Equipamentos disponíveis: ${equipment.join(', ')}.
        O treino deve incluir exercícios com séries (sets), repetições (reps - ex: '12-15' ou '30s'), tempo de descanso em segundos (rest_s).
        IMPORTANTE: Para cada exercício, gere também um 'image_prompt' (descrição visual em inglês) para criar uma ilustração vetorial plana e clara da pessoa realizando o movimento. Ex: 'flat vector illustration of a person doing pushups, side view, white background'.
        Retorne um plano de treino completo.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: workoutSchema,
            }
        });

        const json = JSON.parse(response.text.trim());
        return {
            ...json,
            id: crypto.randomUUID(),
            date: new Date().toISOString().split('T')[0],
            exercises: json.exercises.map((e: any) => ({...e, id: crypto.randomUUID()}))
        };
    } catch (error) {
        console.error("Error generating workout:", error);
        return null;
    }
};

export const getWorkoutFromImage = async (base64Image: string, mimeType: string): Promise<Workout | null> => {
    try {
        const imagePart = {
            inlineData: {
                mimeType: mimeType,
                data: base64Image,
            },
        };

        const prompt = `Analise esta imagem em busca de informações de um treino de academia ou musculação. Pode ser uma foto de uma ficha de treino, uma lousa com exercícios ou uma lista escrita. 
        Identifique o nome de cada exercício, o número de séries, repetições e tempo de descanso se disponível.
        Retorne os dados estruturados conforme o esquema de Workout.
        Para cada exercício, gere também um 'image_prompt' curto em inglês focado no movimento.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, {text: prompt}] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: workoutSchema,
            }
        });

        const json = JSON.parse(response.text.trim());
        return {
            ...json,
            id: crypto.randomUUID(),
            date: new Date().toISOString().split('T')[0],
            exercises: json.exercises.map((e: any) => ({...e, id: crypto.randomUUID()}))
        };
    } catch (error) {
        console.error("Error analyzing workout image with Gemini:", error);
        return null;
    }
};