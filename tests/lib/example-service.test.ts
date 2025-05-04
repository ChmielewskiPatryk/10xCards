import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the API module
vi.mock('@/lib/api', () => {
  return {
    fetchData: vi.fn(),
    postData: vi.fn()
  };
});

// Import after mocking
import { fetchData, postData } from '@/lib/api';
import { UserService } from '@/lib/user-service';

describe('UserService', () => {
  let userService: UserService;
  
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    userService = new UserService();
  });
  
  describe('getUser', () => {
    it('returns user data when fetch is successful', async () => {
      // Setup mock implementation
      const mockUser = { id: '123', name: 'Test User' };
      vi.mocked(fetchData).mockResolvedValue(mockUser);
      
      // Call the method
      const result = await userService.getUser('123');
      
      // Assertions
      expect(fetchData).toHaveBeenCalledWith('/users/123');
      expect(result).toEqual(mockUser);
    });
    
    it('throws an error when fetch fails', async () => {
      // Setup mock to reject
      vi.mocked(fetchData).mockRejectedValue(new Error('Network error'));
      
      // Call and expect error
      await expect(userService.getUser('123')).rejects.toThrow('Network error');
    });
  });
  
  describe('createUser', () => {
    it('posts user data and returns the created user', async () => {
      // Setup test data
      const userData = { name: 'New User', email: 'user@example.com' };
      const createdUser = { id: '456', ...userData };
      
      // Setup mock implementation
      vi.mocked(postData).mockResolvedValue(createdUser);
      
      // Call the method
      const result = await userService.createUser(userData);
      
      // Assertions
      expect(postData).toHaveBeenCalledWith('/users', userData);
      expect(result).toEqual(createdUser);
      
      // Snapshot assertion
      expect(result).toMatchInlineSnapshot(`
        {
          "email": "user@example.com",
          "id": "456",
          "name": "New User",
        }
      `);
    });
  });
}); 