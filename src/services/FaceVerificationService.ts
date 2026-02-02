import { mockDB, User } from "./mockDatabase";

export interface VerificationResult {
    isClean: boolean;
    confidence: number;
    flaggedAgainst?: User; // The existing user this new photo matches with
    message: string;
}

export const FaceVerificationService = {
    /**
     * Simulates generating a unique face embedding from an image.
     * In a real app, this would send the image to an AI service (AWS Rekognition, Face++, etc.)
     */
    generateEmbedding: async (file: File): Promise<string> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock embedding ID based on file size and name to allow repeatable "matches" in testing
                const mockEmbedding = `face_emb_${file.size}_${file.name.substring(0, 3)}`;
                resolve(mockEmbedding);
            }, 1000);
        });
    },

    /**
     * Converts a File to a Base64 string for local storage.
     */
    fileToBase64: (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    },

    /**
     * Checks if the uploaded face matches any existing registered players.
     * @param file The new photo being uploaded
     * @param currentUserId The ID of the user uploading the photo
     */
    checkForDuplicates: async (file: File, currentUserId: string): Promise<VerificationResult> => {
        // simulate network delay
        await new Promise(r => setTimeout(r, 1500));

        const users = mockDB.getUsers();

        // Mock Assessment Logic:
        // If the file name contains "duplicate", we simulate a high-confidence match against another player.
        // Otherwise, we assume it's clean.

        const isSimulatedDuplicate = file.name.toLowerCase().includes('duplicate') || file.name.toLowerCase().includes('copy');

        if (isSimulatedDuplicate) {
            // Find a random other user to flag against (that isn't me)
            const otherUser = users.find(u => u.id !== currentUserId && u.fullName !== 'Admin');

            if (otherUser) {
                return {
                    isClean: false,
                    confidence: 96.5,
                    flaggedAgainst: otherUser,
                    message: `High similarity (96.5%) detected with existing player: ${otherUser.fullName}`
                };
            }
        }

        return {
            isClean: true,
            confidence: 0,
            message: "No duplicate records found. Face verification passed."
        };
    },

    /**
     * Verifies a match-day selfie against the stored profile photo.
     */
    verifyMatchDaySelfie: async (selfieFile: File, user: User): Promise<VerificationResult> => {
        await new Promise(r => setTimeout(r, 1000));

        if (!user.faceEmbeddingUrl) {
            return {
                isClean: false,
                confidence: 0,
                message: "No registered face data found for this player. Please update profile."
            };
        }

        // Simulating match logic
        // If file name has "fail", it fails.
        if (selfieFile.name.toLowerCase().includes('fail')) {
            return {
                isClean: false,
                confidence: 45.2,
                message: "Face mismatch! Identity could not be verified."
            };
        }

        return {
            isClean: true,
            confidence: 98.9,
            message: "Identity Verified Successfully."
        };
    }
};
