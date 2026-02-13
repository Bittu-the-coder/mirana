import { AuthResponse, Comment, Difficulty, GameScore, GameType, Puzzle, PuzzleCategory, User } from './types';

// Custom error classes for better error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network connection failed. Please check your internet connection.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed. Please login again.') {
    super(message, 401, 'AUTH_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

// Error message mapping for user-friendly messages
const ERROR_MESSAGES: Record<string, string> = {
  'Invalid credentials': 'Incorrect username or password. Please try again.',
  'User already exists': 'This username is already taken. Please choose another.',
  'User not found': 'Account not found. Please check your username.',
  'Invalid API Key': 'Server configuration error. Please try again later.',
  'Unauthorized': 'Your session has expired. Please login again.',
  'Network request failed': 'Unable to connect to server. Please check your internet.',
  'Failed to fetch': 'Network connection failed. Please check your internet connection.',
};

function getReadableError(error: string): string {
  return ERROR_MESSAGES[error] || error;
}

function parsePositiveIntEnv(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

class ApiClient {
  private token: string | null = null;
  private isOnline: boolean = true;
  private readonly apiBaseUrl: string;
  private readonly requestTimeoutMs: number;
  private readonly uploadTimeoutMs: number;
  private readonly maxRetries: number;

  constructor() {
    this.apiBaseUrl = this.resolveApiBaseUrl();
    this.requestTimeoutMs = parsePositiveIntEnv(process.env.NEXT_PUBLIC_API_TIMEOUT_MS, 30000);
    this.uploadTimeoutMs = parsePositiveIntEnv(process.env.NEXT_PUBLIC_UPLOAD_TIMEOUT_MS, 60000);
    this.maxRetries = parsePositiveIntEnv(process.env.NEXT_PUBLIC_API_RETRIES, 2);

    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');

      // Listen for online/offline events
      window.addEventListener('online', () => { this.isOnline = true; });
      window.addEventListener('offline', () => { this.isOnline = false; });
      this.isOnline = navigator.onLine;
    }
  }

  private resolveApiBaseUrl(): string {
    const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (configuredUrl) {
      return configuredUrl.replace(/\/$/, '');
    }

    if (typeof window !== 'undefined') {
      const isLocalhost =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocalhost) {
        return 'http://localhost:3001';
      }

      // Production fallback when env is not injected.
      return window.location.origin.replace(/\/$/, '');
    }

    return 'http://localhost:3001';
  }

  private getInternalApiKey(): string {
    const apiKey = process.env.NEXT_PUBLIC_INTERNAL_API_KEY?.trim() || '';

    if (!apiKey && typeof window !== 'undefined') {
      const isLocalhost =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (!isLocalhost) {
        throw new ApiError(
          'Missing NEXT_PUBLIC_INTERNAL_API_KEY in frontend production environment.',
          500,
          'ENV_MISSING',
        );
      }
    }

    return apiKey;
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries?: number
  ): Promise<T> {
    // Check if offline
    if (typeof window !== 'undefined' && !navigator.onLine) {
      throw new NetworkError('You are offline. Please check your internet connection.');
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'x-api-key': this.getInternalApiKey(),
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const method = (options.method || 'GET').toUpperCase();
    const isIdempotentMethod = ['GET', 'HEAD', 'OPTIONS'].includes(method);
    const retriesLeft = typeof retries === 'number'
      ? retries
      : (isIdempotentMethod ? this.maxRetries : 0);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.requestTimeoutMs);

      const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
        const errorMessage = getReadableError(errorData.message || 'An error occurred');

        // Handle specific status codes
        if (response.status === 401) {
          // Clear token on auth errors
          this.setToken(null);
          throw new AuthenticationError(errorMessage);
        }

        if (response.status === 400) {
          throw new ValidationError(errorMessage, errorData.errors);
        }

        if (response.status === 404) {
          throw new ApiError('The requested resource was not found.', 404, 'NOT_FOUND');
        }

        if (response.status === 429) {
          throw new ApiError('Too many requests. Please wait a moment.', 429, 'RATE_LIMITED');
        }

        if (response.status >= 500) {
          throw new ApiError('Server error. Please try again later.', response.status, 'SERVER_ERROR');
        }

        throw new ApiError(errorMessage, response.status);
      }

      // Handle empty responses
      const text = await response.text();
      if (!text) return {} as T;

      return JSON.parse(text);
    } catch (error) {
      // Handle abort/timeout
      if (error instanceof Error && error.name === 'AbortError') {
        if (retriesLeft > 0) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          return this.request<T>(endpoint, options, retriesLeft - 1);
        }
        throw new NetworkError('Request timed out. Please try again.');
      }

      // Handle network errors with retry
      if (error instanceof TypeError && error.message.includes('fetch')) {
        if (retriesLeft > 0) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          return this.request<T>(endpoint, options, retriesLeft - 1);
        }
        throw new NetworkError();
      }

      // Re-throw our custom errors
      if (error instanceof ApiError || error instanceof NetworkError) {
        throw error;
      }

      // Handle unexpected errors
      throw new ApiError(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        500
      );
    }
  }

  // Auth
  async register(data: { username: string; password: string }): Promise<AuthResponse> {
    if (!data.username || data.username.length < 3) {
      throw new ValidationError('Username must be at least 3 characters long.');
    }
    if (!data.password || data.password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long.');
    }

    const result = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(result.access_token);
    return result;
  }

  async login(data: { username: string; password: string }): Promise<AuthResponse> {
    if (!data.username || !data.password) {
      throw new ValidationError('Username and password are required.');
    }

    const result = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(result.access_token);
    return result;
  }

  logout() {
    this.setToken(null);
  }

  // Users
  async getMe(): Promise<User> {
    return this.request<User>('/users/me');
  }

  async getUser(id: string): Promise<User> {
    if (!id) throw new ValidationError('User ID is required.');
    return this.request<User>(`/users/${id}`);
  }

  async updateProfile(data: { avatar?: string; bio?: string }): Promise<User> {
    return this.request<User>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getOnlineFriends(): Promise<User[]> {
    return this.request<User[]>('/users/friends/online');
  }

  // Games - with enhanced error handling for score submission
  async submitScore(data: {
    gameType: GameType;
    score: number;
    level?: number;
    timeSpent?: number;
  }): Promise<GameScore> {
    if (!data.gameType) {
      throw new ValidationError('Game type is required.');
    }
    if (typeof data.score !== 'number' || data.score < 0) {
      throw new ValidationError('Valid score is required.');
    }

    try {
      return await this.request<GameScore>('/games/score', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      // For score submission, provide specific error context
      if (error instanceof NetworkError) {
        throw new NetworkError('Unable to save score. Please check your connection and try again.');
      }
      if (error instanceof AuthenticationError) {
        throw new AuthenticationError('Please login to save your score.');
      }
      throw error;
    }
  }

  async getMyScores(gameType?: GameType): Promise<GameScore[]> {
    const query = gameType ? `?gameType=${gameType}` : '';
    return this.request<GameScore[]>(`/games/scores${query}`);
  }

  async getLeaderboard(gameType: GameType, limit?: number): Promise<GameScore[]> {
    const query = limit ? `?limit=${limit}` : '';
    return this.request<GameScore[]>(`/games/leaderboard/${gameType}${query}`);
  }

  async getBestScore(gameType: GameType): Promise<{ bestScore: number }> {
    try {
      return await this.request<{ bestScore: number }>(`/games/best/${gameType}`);
    } catch (error) {
      // Return 0 if no score found or error
      if (error instanceof ApiError && error.statusCode === 404) {
        return { bestScore: 0 };
      }
      throw error;
    }
  }

  // Puzzles
  async getPuzzles(filters?: {
    category?: PuzzleCategory;
    difficulty?: Difficulty;
    page?: number;
    limit?: number;
  }): Promise<{ puzzles: Puzzle[]; total: number }> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ puzzles: Puzzle[]; total: number }>(`/puzzles${query}`);
  }

  async getPuzzle(id: string): Promise<Puzzle> {
    if (!id) throw new ValidationError('Puzzle ID is required.');
    return this.request<Puzzle>(`/puzzles/${id}`);
  }

  async createPuzzle(data: {
    title: string;
    description: string;
    category: PuzzleCategory;
    difficulty: Difficulty;
    content: string;
    solution: string;
    hints?: string[];
    imageUrl?: string;
  }): Promise<Puzzle> {
    if (!data.title || data.title.length < 3) {
      throw new ValidationError('Puzzle title must be at least 3 characters.');
    }
    if (!data.content) {
      throw new ValidationError('Puzzle content is required.');
    }
    if (!data.solution) {
      throw new ValidationError('Puzzle solution is required.');
    }

    return this.request<Puzzle>('/puzzles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async uploadImage(file: File, fileName?: string): Promise<{ url: string; fileId?: string }> {
    if (!file) {
      throw new ValidationError('Image file is required.');
    }
    if (!this.token) {
      throw new AuthenticationError('Please login to upload an image.');
    }

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('fileName', fileName || `upload_${Date.now()}`);

    const headers: HeadersInit = {
      'x-api-key': this.getInternalApiKey(),
      Authorization: `Bearer ${this.token}`,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.uploadTimeoutMs);

    try {
      const response = await fetch(`${this.apiBaseUrl}/upload`, {
        method: 'POST',
        headers,
        body: uploadData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        const errorMessage = getReadableError(errorData.message || 'Upload failed');

        if (response.status === 401) {
          throw new AuthenticationError(errorMessage);
        }

        throw new ApiError(errorMessage, response.status);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new NetworkError('Upload timed out. Please try again.');
      }

      if (error instanceof ApiError || error instanceof NetworkError) {
        throw error;
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Failed to upload image',
        500,
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async solvePuzzle(id: string, solution: string): Promise<{ correct: boolean }> {
    if (!id) throw new ValidationError('Puzzle ID is required.');
    if (!solution) throw new ValidationError('Solution is required.');

    return this.request<{ correct: boolean }>(`/puzzles/${id}/solve`, {
      method: 'POST',
      body: JSON.stringify({ solution }),
    });
  }

  async upvotePuzzle(id: string): Promise<Puzzle> {
    if (!id) throw new ValidationError('Puzzle ID is required.');
    return this.request<Puzzle>(`/puzzles/${id}/upvote`, {
      method: 'POST',
    });
  }

  // Comments
  async getComments(puzzleId: string): Promise<Comment[]> {
    if (!puzzleId) throw new ValidationError('Puzzle ID is required.');
    return this.request<Comment[]>(`/comments/puzzle/${puzzleId}`);
  }

  async createComment(puzzleId: string, content: string, parentCommentId?: string): Promise<Comment> {
    if (!puzzleId) throw new ValidationError('Puzzle ID is required.');
    if (!content || content.trim().length === 0) {
      throw new ValidationError('Comment content is required.');
    }

    return this.request<Comment>(`/comments/puzzle/${puzzleId}`, {
      method: 'POST',
      body: JSON.stringify({ content, parentCommentId }),
    });
  }

  async upvoteComment(commentId: string): Promise<Comment> {
    if (!commentId) throw new ValidationError('Comment ID is required.');
    return this.request<Comment>(`/comments/${commentId}/upvote`, {
      method: 'POST',
    });
  }

  // Leaderboard
  async getGlobalLeaderboard(limit?: number): Promise<User[]> {
    const query = limit ? `?limit=${limit}` : '';
    return this.request<User[]>(`/leaderboard/global${query}`);
  }

  async getGameLeaderboard(gameType: GameType, limit?: number): Promise<GameScore[]> {
    const query = limit ? `?limit=${limit}` : '';
    return this.request<GameScore[]>(`/leaderboard/game/${gameType}${query}`);
  }

  // Game Levels
  async getGameLevels(gameType: GameType, difficulty?: string, limit?: number): Promise<any[]> {
    const params = new URLSearchParams();
    if (difficulty) params.append('difficulty', difficulty);
    if (limit) params.append('limit', limit.toString());
    const query = params.toString() ? `?${params.toString()}` : '';

    try {
      return await this.request<any[]>(`/games/levels/${gameType}${query}`);
    } catch (error) {
      // Return empty array if levels not found
      if (error instanceof ApiError && error.statusCode === 404) {
        return [];
      }
      throw error;
    }
  }

  async getRandomLevels(gameType: GameType, count: number = 10, difficulty?: string): Promise<any[]> {
    const params = new URLSearchParams();
    params.append('count', count.toString());
    if (difficulty) params.append('difficulty', difficulty);

    try {
      return await this.request<any[]>(`/games/levels/${gameType}/random?${params.toString()}`);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        return [];
      }
      throw error;
    }
  }

  async getDailyWord(date?: string): Promise<any> {
    const query = date ? `?date=${date}` : '';
    return this.request<any>(`/games/levels/daily-word/today${query}`);
  }

  async getLevelCounts(): Promise<Record<string, number>> {
    try {
      return await this.request<Record<string, number>>('/games/levels/stats/counts');
    } catch (error) {
      // Return empty object on error
      return {};
    }
  }
}

export const api = new ApiClient();
