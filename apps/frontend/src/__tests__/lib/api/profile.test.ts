/**
 * Unit tests for Profile API client
 *
 * These tests validate the profile API client functions
 */

import { profileApi, STYLE_OPTIONS, OCCASION_OPTIONS, STYLE_LABELS, OCCASION_LABELS, Profile, StyleOption, OccasionOption } from '@/lib/api/profile';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

describe('Profile API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Constants', () => {
    test('STYLE_OPTIONS should have all 7 style options', () => {
      expect(STYLE_OPTIONS).toHaveLength(7);
      expect(STYLE_OPTIONS).toContain('casual');
      expect(STYLE_OPTIONS).toContain('formal');
      expect(STYLE_OPTIONS).toContain('minimalist');
      expect(STYLE_OPTIONS).toContain('bohemian');
      expect(STYLE_OPTIONS).toContain('streetwear');
      expect(STYLE_OPTIONS).toContain('preppy');
      expect(STYLE_OPTIONS).toContain('athletic');
    });

    test('OCCASION_OPTIONS should have all 5 occasion options', () => {
      expect(OCCASION_OPTIONS).toHaveLength(5);
      expect(OCCASION_OPTIONS).toContain('work');
      expect(OCCASION_OPTIONS).toContain('date');
      expect(OCCASION_OPTIONS).toContain('casual');
      expect(OCCASION_OPTIONS).toContain('events/formal');
      expect(OCCASION_OPTIONS).toContain('athletic');
    });

    test('STYLE_LABELS should have labels for all styles', () => {
      expect(Object.keys(STYLE_LABELS)).toHaveLength(7);
      expect(STYLE_LABELS.casual).toBe('Casual');
      expect(STYLE_LABELS.formal).toBe('Formal');
      expect(STYLE_LABELS.minimalist).toBe('Minimalist');
      expect(STYLE_LABELS.bohemian).toBe('Bohemian');
      expect(STYLE_LABELS.streetwear).toBe('Streetwear');
      expect(STYLE_LABELS.preppy).toBe('Preppy');
      expect(STYLE_LABELS.athletic).toBe('Athletic');
    });

    test('OCCASION_LABELS should have labels for all occasions', () => {
      expect(Object.keys(OCCASION_LABELS)).toHaveLength(5);
      expect(OCCASION_LABELS.work).toBe('Work');
      expect(OCCASION_LABELS.date).toBe('Date');
      expect(OCCASION_LABELS.casual).toBe('Casual');
      expect(OCCASION_LABELS['events/formal']).toBe('Events/Formal');
      expect(OCCASION_LABELS.athletic).toBe('Athletic');
    });
  });

  describe('getProfile', () => {
    test('should fetch profile successfully', async () => {
      const mockProfile: Profile = {
        id: 'profile-123',
        userId: 'user-123',
        height: 175,
        weight: 70.5,
        primaryStyle: 'casual',
        secondaryStyle: 'minimalist',
        occasions: ['work', 'casual'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfile,
      });

      const result = await profileApi.getProfile();

      expect(mockFetch).toHaveBeenCalledWith('/api/profile/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockProfile);
    });

    test('should handle 404 error when profile not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Profile not found' }),
      });

      await expect(profileApi.getProfile()).rejects.toThrow('Profile not found');
    });

    test('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(profileApi.getProfile()).rejects.toThrow('Network error');
    });

    test('should handle API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Unauthorized' }),
      });

      await expect(profileApi.getProfile()).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateProfile', () => {
    test('should update profile successfully with all fields', async () => {
      const mockProfile: Profile = {
        id: 'profile-123',
        userId: 'user-123',
        height: 180,
        weight: 75.0,
        primaryStyle: 'formal',
        secondaryStyle: 'preppy',
        occasions: ['work', 'events/formal'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfile,
      });

      const updateData = {
        height: 180,
        weight: 75.0,
        primary_style: 'formal' as StyleOption,
        secondary_style: 'preppy' as StyleOption,
        occasions: ['work', 'events/formal'] as OccasionOption[],
      };

      const result = await profileApi.updateProfile(updateData);

      expect(mockFetch).toHaveBeenCalledWith('/api/profile/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      expect(result).toEqual(mockProfile);
    });

    test('should update profile with partial data', async () => {
      const mockProfile: Profile = {
        id: 'profile-123',
        userId: 'user-123',
        height: 170,
        weight: 68.0,
        primaryStyle: 'athletic',
        secondaryStyle: undefined,
        occasions: ['athletic'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfile,
      });

      const updateData = {
        height: 170,
        weight: 68.0,
      };

      const result = await profileApi.updateProfile(updateData);

      expect(result).toEqual(mockProfile);
    });

    test('should create new profile when it does not exist', async () => {
      const newProfile: Profile = {
        id: 'new-profile-123',
        userId: 'user-123',
        height: 165,
        weight: 60.0,
        primaryStyle: 'bohemian',
        secondaryStyle: undefined,
        occasions: ['date', 'casual'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => newProfile,
      });

      const updateData = {
        height: 165,
        weight: 60.0,
        primary_style: 'bohemian' as StyleOption,
        occasions: ['date', 'casual'] as OccasionOption[],
      };

      const result = await profileApi.updateProfile(updateData);

      expect(result.id).toBe('new-profile-123');
      expect(result.height).toBe(165);
    });

    test('should handle validation error from server', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Height must be between 100 and 250' }),
      });

      const updateData = {
        height: 300, // Invalid
      };

      await expect(profileApi.updateProfile(updateData)).rejects.toThrow(
        'Height must be between 100 and 250'
      );
    });

    test('should handle secondary_style validation error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          detail: 'primary_style must be set if secondary_style is provided',
        }),
      });

      const updateData = {
        secondary_style: 'minimalist' as StyleOption,
      };

      await expect(profileApi.updateProfile(updateData)).rejects.toThrow(
        'primary_style must be set if secondary_style is provided'
      );
    });

    test('should handle user not found error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'User not found' }),
      });

      await expect(profileApi.updateProfile({})).rejects.toThrow('User not found');
    });

    test('should handle network error during update', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network connection failed'));

      await expect(profileApi.updateProfile({})).rejects.toThrow(
        'Network connection failed'
      );
    });

    test('should serialize occasions array correctly', async () => {
      const mockProfile: Profile = {
        id: 'profile-123',
        userId: 'user-123',
        height: 175,
        weight: 70.0,
        primaryStyle: 'casual',
        secondaryStyle: undefined,
        occasions: ['work', 'date', 'casual', 'events/formal', 'athletic'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfile,
      });

      const updateData = {
        occasions: ['work', 'date', 'casual', 'events/formal', 'athletic'] as OccasionOption[],
      };

      await profileApi.updateProfile(updateData);

      const fetchCall = mockFetch.mock.calls[0];
      const bodyArg = fetchCall[1]?.body;
      const parsedBody = JSON.parse(bodyArg);
      expect(parsedBody.occasions).toEqual(['work', 'date', 'casual', 'events/formal', 'athletic']);
    });
  });

  describe('TypeScript Types', () => {
    test('StyleOption should accept valid values', () => {
      const validStyles: StyleOption[] = [
        'casual',
        'formal',
        'minimalist',
        'bohemian',
        'streetwear',
        'preppy',
        'athletic',
      ];

      validStyles.forEach((style) => {
        expect(STYLE_OPTIONS).toContain(style);
      });
    });

    test('OccasionOption should accept valid values', () => {
      const validOccasions: OccasionOption[] = [
        'work',
        'date',
        'casual',
        'events/formal',
        'athletic',
      ];

      validOccasions.forEach((occasion) => {
        expect(OCCASION_OPTIONS).toContain(occasion);
      });
    });

    test('Profile type should have all required fields', () => {
      const profile: Profile = {
        id: 'test-id',
        userId: 'user-id',
        height: 170,
        weight: 70.0,
        primaryStyle: 'casual',
        secondaryStyle: 'minimalist',
        occasions: ['work'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      expect(profile.id).toBeDefined();
      expect(profile.userId).toBeDefined();
      expect(profile.createdAt).toBeDefined();
      expect(profile.updatedAt).toBeDefined();
    });
  });
});
