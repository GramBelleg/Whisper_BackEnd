import { HfInference } from "@huggingface/inference";
import { Mistral } from "@mistralai/mistralai";
import { inappropriateThreshold, whichModel } from "@config/apis.config";

const huggingFaceKey = process.env.HUGGINGFACE_API_KEY;
const hf = new HfInference(huggingFaceKey);
const mistralKey = process.env.COHERE_API_KEY;
const mistralClient = new Mistral({ apiKey: mistralKey });

const retryWithExponentialBackoff = async <T>(
    fn: () => Promise<T>,
    total_retries: number = 5,
    retries: number = 5
): Promise<T> => {
    try {
        return await fn();
    } catch (error: any) {
        if (error.statusCode === 429 && retries > 0) {
            const retryDelay = Math.pow(2, total_retries - retries) * 1000;
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            return retryWithExponentialBackoff(fn, retries - 1);
        }
        throw error;
    }
};

export const moderateTextMistral = async (text: string) => {
    const response = await retryWithExponentialBackoff(() =>
        mistralClient.classifiers.moderate({
            model: "mistral-moderation-latest",
            inputs: [text],
        })
    );
    if (
        !response ||
        !response.results ||
        !response.results[0] ||
        !response.results[0].categoryScores
    )
        return false;

    const categoryScores = response.results[0].categoryScores;
    const isInappropriate = Object.values(categoryScores).some(
        (value) => value > inappropriateThreshold
    );

    return isInappropriate;
};

export const moderateTextHuggingFace = async (text: string) => {
    const result = await retryWithExponentialBackoff(() =>
        hf.textClassification({
            model: "unitary/toxic-bert",
            inputs: text,
        })
    );
    const isInappropriate = result.some((label) => label.score > inappropriateThreshold);
    return isInappropriate;
};

export const moderateText = async (text: string) => {
    let modelResult;
    if (whichModel) {
        modelResult = await moderateTextHuggingFace(text);
    } else {
        modelResult = await moderateTextMistral(text);
    }
    return modelResult;
};
