import { AuthResponse, Comment, Difficulty, GameScore, GameType, Puzzle, PuzzleCategory, User } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
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

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || 'An error occurred');
    }

    return response.json();
  }

  // Auth
  async register(data: { username: string; password: string }): Promise<AuthResponse> {
    const result = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(result.access_token);
    return result;
  }

  async login(data: { username: string; password: string }): Promise<AuthResponse> {
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

  // Games
  async submitScore(data: {
    gameType: GameType;
    score: number;
    level?: number;
    timeSpent?: number;
  }): Promise<GameScore> {
    return this.request<GameScore>('/games/score', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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
    return this.request<{ bestScore: number }>(`/games/best/${gameType}`);
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
  }): Promise<Puzzle> {
    return this.request<Puzzle>('/puzzles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async solvePuzzle(id: string, solution: string): Promise<{ correct: boolean }> {
    return this.request<{ correct: boolean }>(`/puzzles/${id}/solve`, {
      method: 'POST',
      body: JSON.stringify({ solution }),
    });
  }

  async upvotePuzzle(id: string): Promise<Puzzle> {
    return this.request<Puzzle>(`/puzzles/${id}/upvote`, {
      method: 'POST',
    });
  }

  // Comments
  async getComments(puzzleId: string): Promise<Comment[]> {
    return this.request<Comment[]>(`/comments/puzzle/${puzzleId}`);
  }

  async createComment(puzzleId: string, content: string, parentCommentId?: string): Promise<Comment> {
    return this.request<Comment>(`/comments/puzzle/${puzzleId}`, {
      method: 'POST',
      body: JSON.stringify({ content, parentCommentId }),
    });
  }

  async upvoteComment(commentId: string): Promise<Comment> {
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
    return this.request<any[]>(`/games/levels/${gameType}${query}`);
  }

  async getRandomLevels(gameType: GameType, count: number = 10, difficulty?: string): Promise<any[]> {
    const params = new URLSearchParams();
    params.append('count', count.toString());
    if (difficulty) params.append('difficulty', difficulty);
    return this.request<any[]>(`/games/levels/${gameType}/random?${params.toString()}`);
  }

  async getDailyWord(date?: string): Promise<any> {
    const query = date ? `?date=${date}` : '';
    return this.request<any>(`/games/levels/daily-word/today${query}`);
  }

  async getLevelCounts(): Promise<Record<string, number>> {
    return this.request<Record<string, number>>('/games/levels/stats/counts');
  }
}

export const api = new ApiClient();
