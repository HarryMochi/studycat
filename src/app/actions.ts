'use server';

import { generateFullCourse, type GenerateFullCourseInput, type GenerateFullCourseOutput } from '@/ai/flows/generate-full-course';
import { askStepQuestion, type AskStepQuestionInput, type AskStepQuestionOutput } from '@/ai/flows/ask-step-question';
import { assistWithNotes, type AssistWithNotesInput, type AssistWithNotesOutput } from '@/ai/flows/assist-with-notes';
import { updateUserProfile as updateUserProfileInDb, shareCourseWithUser as shareCourseWithUserInDb, acceptShareRequest as acceptShareRequestInDb, declineShareRequest as declineShareRequestInDb, getShareRequests as getShareRequestsFromDb, getUserProfile } from '@/lib/firestore';
import type { UserProfile } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function generateCourseAction(input: GenerateFullCourseInput): Promise<GenerateFullCourseOutput> {
    try {
        const result = await generateFullCourse(input);
        if (!result.course || result.course.length === 0) {
            throw new Error("The AI failed to generate a course for this topic. Please try a different topic.");
        }
        return result;
    } catch (error) {
        console.error("Error in generateCourseAction:", error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("An unknown error occurred while generating the course.");
    }
}

export async function askQuestionAction(input: AskStepQuestionInput): Promise<AskStepQuestionOutput> {
    try {
        return await askStepQuestion(input);
    } catch (error) {
        console.error("Error in askQuestionAction:", error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("An unknown error occurred while getting the answer.");
    }
}

export async function assistWithNotesAction(input: AssistWithNotesInput): Promise<AssistWithNotesOutput> {
    try {
        return await assistWithNotes(input);
    } catch (error) {
        console.error("Error in assistWithNotesAction:", error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("An unknown error occurred while assisting with notes.");
    }
}

// --- Profile and Sharing Actions ---

export async function updateUserProfileAction(userId: string, updates: Partial<UserProfile>) {
    try {
        const result = await updateUserProfileInDb(userId, updates);
        if(result.success) {
            revalidatePath('/learn');
        }
        return result;
    } catch (error) {
        console.error("Error in updateUserProfileAction:", error);
        return { success: false, message: error instanceof Error ? error.message : "An unknown server error occurred." };
    }
}


export async function shareCourseAction(fromUserId: string, toUsername: string, courseId: string) {
    try {
        const fromUserProfile = await getUserProfile(fromUserId);
        if (!fromUserProfile) {
            return { success: false, message: "Could not find your profile to share." };
        }
        return await shareCourseWithUserInDb(fromUserProfile, toUsername, courseId);
    } catch (error) {
        console.error("Error in shareCourseAction:", error);
        return { success: false, message: error instanceof Error ? error.message : "An unknown server error occurred." };
    }
}

export async function getShareRequestsAction(userId: string) {
    try {
        return await getShareRequestsFromDb(userId);
    } catch (error) {
        console.error("Error in getShareRequestsAction:", error);
        return [];
    }
}

export async function acceptShareRequestAction(userId: string, requestId: string) {
    try {
        await acceptShareRequestInDb(userId, requestId);
        revalidatePath('/learn');
        return { success: true, message: "Course accepted!" };
    } catch (error) {
        console.error("Error in acceptShareRequestAction:", error);
        return { success: false, message: error instanceof Error ? error.message : "Failed to accept course." };
    }
}

export async function declineShareRequestAction(userId: string, requestId: string) {
    try {
        await declineShareRequestInDb(userId, requestId);
        return { success: true, message: "Course declined." };
    } catch (error) {
        console.error("Error in declineShareRequestAction:", error);
        return { success: false, message: "Failed to decline course." };
    }
}
