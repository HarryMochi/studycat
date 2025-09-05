
'use server';
/**
 * @fileOverview Generates a visual aid for a specific course step.
 *
 * - generateVisualAid - A function that creates an image to explain a concept.
 * - GenerateVisualAidInput - The input type for the function.
 * - GenerateVisualAidOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVisualAidInputSchema = z.object({
  topic: z.string().describe('The main topic of the course.'),
  stepTitle: z.string().describe('The title of the course step.'),
  stepContent: z.string().describe('The detailed content of the step to be visualized.'),
});
export type GenerateVisualAidInput = z.infer<typeof GenerateVisualAidInputSchema>;

const GenerateVisualAidOutputSchema = z.object({
  imageDataUri: z.string().describe("A data URI of the generated image. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateVisualAidOutput = z.infer<typeof GenerateVisualAidOutputSchema>;

export async function generateVisualAid(input: GenerateVisualAidInput): Promise<GenerateVisualAidOutput> {
  return generateVisualAidFlow(input);
}

const generateVisualAidFlow = ai.defineFlow(
  {
    name: 'generateVisualAidFlow',
    inputSchema: GenerateVisualAidInputSchema,
    outputSchema: GenerateVisualAidOutputSchema,
  },
  async ({topic, stepTitle, stepContent}) => {
    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `Create a simple, clean, and modern infographic or a clear diagram to visually explain a concept from an online course.
        
        Course Topic: "${topic}"
        Lesson Title: "${stepTitle}"

        Content to visualize:
        ---
        ${stepContent}
        ---
        
        Style guidelines:
        - Use a flat design style with a limited, cohesive color palette.
        - Ensure text is minimal but legible.
        - Focus on clarity and making the concept easy to understand at a glance.
        - Do not include any branding, logos, or watermarks.
        - Generate the image with a 16:9 aspect ratio.`,
    });
    
    if (!media || !media.url) {
        throw new Error('Image generation failed to return a data URI.');
    }

    return { imageDataUri: media.url };
  }
);
