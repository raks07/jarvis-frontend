import { getUsers, getUsersByRole, getUserById, createUser, updateUser, deleteUser } from '@/services/users.service';
import { nestJsApi } from '@/services/api';

// Mock the nestJsApi
jest.mock('@/services/api', () => ({
  nestJsApi: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Users Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should call nestJsApi.get with correct endpoint', async () => {
      // Mock the API response
      const mockUsers = [{ id: '1', username: 'test' }];
      (nestJsApi.get as jest.Mock).mockResolvedValueOnce({ data: mockUsers });

      // Call the function
      const result = await getUsers();

      // Assert the API was called correctly
      expect(nestJsApi.get).toHaveBeenCalledWith('/users');
      expect(result.data).toEqual(mockUsers);
    });
  });

  describe('getUsersByRole', () => {
    it('should call nestJsApi.get with correct endpoint and role parameter', async () => {
      // Mock the API response
      const mockUsers = [{ id: '1', username: 'test', role: 'admin' }];
      (nestJsApi.get as jest.Mock).mockResolvedValueOnce({ data: mockUsers });

      // Call the function
      const result = await getUsersByRole('admin');

      // Assert the API was called correctly
      expect(nestJsApi.get).toHaveBeenCalledWith('/users/role/admin');
      expect(result.data).toEqual(mockUsers);
    });
  });

  describe('getUserById', () => {
    it('should call nestJsApi.get with correct endpoint and ID', async () => {
      // Mock the API response
      const mockUser = { id: '1', username: 'test' };
      (nestJsApi.get as jest.Mock).mockResolvedValueOnce({ data: mockUser });

      // Call the function
      const result = await getUserById('1');

      // Assert the API was called correctly
      expect(nestJsApi.get).toHaveBeenCalledWith('/users/1');
      expect(result.data).toEqual(mockUser);
    });
  });

  describe('createUser', () => {
    it('should call nestJsApi.post with correct endpoint and data', async () => {
      // Mock the API response
      const mockUserData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'admin' as const,
      };
      const mockCreatedUser = {
        id: '1',
        ...mockUserData,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };
      (nestJsApi.post as jest.Mock).mockResolvedValueOnce({ data: mockCreatedUser });

      // Call the function
      const result = await createUser(mockUserData);

      // Assert the API was called correctly
      expect(nestJsApi.post).toHaveBeenCalledWith('/users', mockUserData);
      expect(result.data).toEqual(mockCreatedUser);
    });
  });

  describe('updateUser', () => {
    it('should call nestJsApi.patch with correct endpoint and filtered data', async () => {
      // Mock the API response
      const mockUpdateData = {
        username: 'updateduser',
        email: 'updated@example.com',
        password: '', // Empty password should be filtered out
        role: 'editor' as const,
        id: '1', // Should be filtered out
        createdAt: '2023-01-01T00:00:00.000Z', // Should be filtered out
        updatedAt: '2023-01-01T00:00:00.000Z', // Should be filtered out
      };
      const mockUpdatedUser = {
        id: '1',
        username: 'updateduser',
        email: 'updated@example.com',
        role: 'editor',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
      };
      (nestJsApi.patch as jest.Mock).mockResolvedValueOnce({ data: mockUpdatedUser });

      // Call the function
      const result = await updateUser('1', mockUpdateData);

      // Assert the API was called correctly with filtered data
      expect(nestJsApi.patch).toHaveBeenCalledWith('/users/1', {
        username: 'updateduser',
        email: 'updated@example.com',
        role: 'editor',
        // id, createdAt, updatedAt, and empty password should be filtered out
      });
      expect(result.data).toEqual(mockUpdatedUser);
    });

    it('should filter out null and undefined values', async () => {
      // Mock the API response
      const mockUpdateData = {
        username: 'updateduser',
        email: null,
        password: undefined,
        role: 'editor' as const,
      };
      const mockUpdatedUser = {
        id: '1',
        username: 'updateduser',
        email: 'test@example.com', // Unchanged
        role: 'editor',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
      };
      (nestJsApi.patch as jest.Mock).mockResolvedValueOnce({ data: mockUpdatedUser });

      // Call the function
      const result = await updateUser('1', mockUpdateData);

      // Assert the API was called correctly with filtered data
      expect(nestJsApi.patch).toHaveBeenCalledWith('/users/1', {
        username: 'updateduser',
        role: 'editor',
        // null and undefined values should be filtered out
      });
      expect(result.data).toEqual(mockUpdatedUser);
    });
  });

  describe('deleteUser', () => {
    it('should call nestJsApi.delete with correct endpoint and ID', async () => {
      // Mock the API response
      (nestJsApi.delete as jest.Mock).mockResolvedValueOnce({ data: {} });

      // Call the function
      const result = await deleteUser('1');

      // Assert the API was called correctly
      expect(nestJsApi.delete).toHaveBeenCalledWith('/users/1');
      expect(result.data).toEqual({});
    });
  });
});
