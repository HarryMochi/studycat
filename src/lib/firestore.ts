import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, orderBy, runTransaction, getDoc, serverTimestamp } from 'firebase/firestore';
import type { Course, CourseData, ShareRequest, UserProfile } from './types';

// --- User Profile Functions ---

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  if (userDoc.exists()) {
    return { id: userDoc.id, ...userDoc.data() } as UserProfile;
  }
  return null;
}

export async function createUserProfile(userId: string, data: { email: string, photoURL?: string | null }): Promise<void> {
    const userDocRef = doc(db, 'users', userId);
    await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
            transaction.set(userDocRef, {
                email: data.email,
                photoURL: data.photoURL || null,
            });
        }
    });
}


// --- Course Functions ---

// Create
export async function addCourse(courseData: CourseData): Promise<string> {
  const docRef = await addDoc(coursesCollection, {
    ...courseData,
    notes: courseData.notes ?? "" // Ensure notes field exists
  });
  return docRef.id;
}

// Read
const coursesCollection = collection(db, 'courses');
export async function getCoursesForUser(userId: string): Promise<Course[]> {
  const q = query(coursesCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
}

// Update
export async function updateCourse(courseId: string, updates: Partial<CourseData>): Promise<void> {
  const courseDoc = doc(db, 'courses', courseId);
  await updateDoc(courseDoc, updates);
}

// Delete
export async function deleteCourse(courseId: string): Promise<void> {
  const courseDoc = doc(db, 'courses', courseId);
  await deleteDoc(courseDoc);
}


// --- Sharing Functions ---

export async function shareCourseWithUser(fromUserId: string, toUserId: string, courseId: string): Promise<{success: boolean; message: string}> {
    if (fromUserId === toUserId) {
        return { success: false, message: "You cannot share a course with yourself." };
    }

    const fromUser = await getUserProfile(fromUserId);
    if (!fromUser) {
        return { success: false, message: "Could not find your user profile." };
    }
    
    const recipientProfile = await getUserProfile(toUserId);
    if (!recipientProfile) {
        return { success: false, message: `User with ID "${toUserId}" not found.` };
    }
    
    const shareRequestRef = collection(db, 'users', toUserId, 'shareRequests');
    
    const courseDocRef = doc(db, 'courses', courseId);
    const courseDoc = await getDoc(courseDocRef);
    if (!courseDoc.exists()) {
        return { success: false, message: "Course not found." };
    }

    await addDoc(shareRequestRef, {
        fromUser: {
            id: fromUser.id,
            email: fromUser.email,
        },
        courseId: courseId,
        courseTopic: courseDoc.data().topic,
        status: 'pending',
        createdAt: serverTimestamp(),
    });

    return { success: true, message: `Course shared with ${recipientProfile.email}!` };
}

export async function getShareRequests(userId: string): Promise<ShareRequest[]> {
    const shareRequestRef = collection(db, 'users', userId, 'shareRequests');
    const q = query(shareRequestRef, where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShareRequest));
}

export async function acceptShareRequest(userId: string, requestId: string): Promise<string> {
    const requestDocRef = doc(db, 'users', userId, 'shareRequests', requestId);
    
    return await runTransaction(db, async (transaction) => {
        const requestDoc = await transaction.get(requestDocRef);
        if (!requestDoc.exists() || requestDoc.data().status !== 'pending') {
            throw new Error("Share request not found or already handled.");
        }

        const requestData = requestDoc.data() as Omit<ShareRequest, 'id'>;
        
        const originalCourseRef = doc(db, 'courses', requestData.courseId);
        const originalCourseDoc = await transaction.get(originalCourseRef);
        
        if (!originalCourseDoc.exists()) {
            throw new Error("The original course no longer exists.");
        }
        
        const originalCourseData = originalCourseDoc.data() as CourseData;

        // Create a copy of the course for the new user
        const newCourseData: CourseData = {
            ...originalCourseData,
            userId: userId, // Assign to the new user
            createdAt: new Date().toISOString(),
            sharedBy: requestData.fromUser,
            originalCourseId: requestData.courseId,
            notes: "", // Start with fresh notes
        };
        
        const newCourseRef = await addDoc(coursesCollection, newCourseData);

        // Update the request status to 'accepted'
        transaction.update(requestDocRef, { status: 'accepted' });
        
        return newCourseRef.id;
    });
}

export async function declineShareRequest(userId: string, requestId: string): Promise<void> {
    const requestDocRef = doc(db, 'users', userId, 'shareRequests', requestId);
    await updateDoc(requestDocRef, { status: 'declined' });
}
