import { fetchData, postData } from "./api";

export interface User {
  id: string;
  name: string;
  email?: string;
}

export interface NewUser {
  name: string;
  email: string;
}

/**
 * Service for handling user-related operations
 */
export class UserService {
  /**
   * Get a user by ID
   */
  async getUser(userId: string): Promise<User> {
    return fetchData<User>(`/users/${userId}`);
  }

  /**
   * Create a new user
   */
  async createUser(userData: NewUser): Promise<User> {
    return postData<NewUser, User>("/users", userData);
  }
}
