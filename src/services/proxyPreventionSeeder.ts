import { mockDB } from './mockDatabase';

/**
 * Data Seeder for Proxy Prevention System
 * Creates sample verification history and proxy flags for testing
 */

export const seedProxyPreventionData = () => {
    console.log('Seeding proxy prevention data...');

    const users = mockDB.getUsers();

    if (users.length === 0) {
        console.log('No users found. Please create users first.');
        return;
    }

    // Seed verification history for first few users
    users.slice(0, Math.min(5, users.length)).forEach((user, index) => {
        // Mobile verification (all successful)
        mockDB.addVerificationHistory(
            user.id,
            'mobile',
            true,
            {
                verificationMethod: 'OTP',
                deviceInfo: 'Android 12'
            }
        );

        // Email verification (80% success rate)
        if (index % 5 !== 0) {
            mockDB.addVerificationHistory(
                user.id,
                'email',
                true,
                {
                    verificationMethod: 'Link',
                    deviceInfo: 'Chrome Browser'
                }
            );
        } else {
            mockDB.addVerificationHistory(
                user.id,
                'email',
                false,
                {
                    verificationMethod: 'Link',
                    deviceInfo: 'Chrome Browser'
                }
            );
        }

        // Identity verification (60% success rate)
        if (index % 3 !== 0) {
            mockDB.addVerificationHistory(
                user.id,
                'identity',
                true,
                {
                    verificationMethod: 'Document Upload',
                    documentType: 'Aadhaar Card'
                }
            );
        }

        // Add some proxy flags to certain users
        if (index === 1) {
            // User with low severity flag
            mockDB.addProxyFlag(
                user.id,
                'low',
                'Suspicious batting pattern',
                'organizer-1',
                undefined,
                {
                    type: 'system_detection',
                    description: 'Unusual scoring rate detected in recent match'
                }
            );
        }

        if (index === 2) {
            // User with medium severity flag
            mockDB.addProxyFlag(
                user.id,
                'medium',
                'Multiple accounts suspected',
                'organizer-1',
                undefined,
                {
                    type: 'witness',
                    description: 'Reported by team captain for using different name'
                }
            );
        }

        if (index === 3) {
            // User with high severity flag
            mockDB.addProxyFlag(
                user.id,
                'high',
                'Confirmed proxy player',
                'organizer-1',
                undefined,
                {
                    type: 'witness',
                    description: 'Multiple witnesses confirmed different person playing'
                }
            );

            // Add another flag
            mockDB.addProxyFlag(
                user.id,
                'critical',
                'Identity mismatch',
                'organizer-1',
                undefined,
                {
                    type: 'document',
                    description: 'Photo ID does not match player appearance'
                }
            );
        }
    });

    console.log('Proxy prevention data seeded successfully!');
    console.log('- Added verification history for users');
    console.log('- Added sample proxy flags');
    console.log('You can now test the Player Management dashboard');
};

// Auto-seed on import (can be disabled)
if (typeof window !== 'undefined') {
    // Only seed once
    const SEED_KEY = 'proxy_prevention_seeded';
    if (!localStorage.getItem(SEED_KEY)) {
        // Wait a bit for users to be loaded
        setTimeout(() => {
            const users = mockDB.getUsers();
            if (users.length > 0) {
                seedProxyPreventionData();
                localStorage.setItem(SEED_KEY, 'true');
            }
        }, 1000);
    }
}
