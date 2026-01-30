export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  stats: UserStats;
  friends?: string[];
  isOnline?: boolean;
  createdAt?: string;
}

export interface UserStats {
  gamesPlayed: number;
  puzzlesSolved: number;
  puzzlesCreated: number;
  totalScore: number;
  multiplayerWins: number;
  multiplayerGames: number;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export enum GameType {
  SLIDING_PUZZLE = 'sliding_puzzle',
  DAILY_MYSTERY_WORD = 'daily_mystery_word',
  NUMBER_PYRAMID = 'number_pyramid',
  MEMORY_PATH = 'memory_path',
  LETTER_MAZE = 'letter_maze',
  PATTERN_SPOTTER = 'pattern_spotter',
  COLOR_MEMORY = 'color_memory',
  BALANCE_PUZZLE = 'balance_puzzle',
  SPEED_MATH_DUEL = 'speed_math_duel',
  RIDDLE_ARENA = 'riddle_arena',
  MEMORY_MATCH_BATTLE = 'memory_match_battle',
  WORD_CHAIN = 'word_chain',
}

export interface GameScore {
  id: string;
  user: User;
  gameType: GameType;
  score: number;
  level: number;
  timeSpent: number;
  isMultiplayer: boolean;
  isWinner: boolean;
  createdAt: string;
}

export enum PuzzleCategory {
  RIDDLE = 'riddle',
  LOGIC = 'logic',
  MATH = 'math',
  WORD = 'word',
  VISUAL = 'visual',
}

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}

export interface Puzzle {
  _id: string;
  author: User;
  title: string;
  description: string;
  category: PuzzleCategory;
  difficulty: Difficulty;
  content: string;
  solution?: string;
  hints: string[];
  upvotes: number;
  upvotedBy: string[];
  solvedCount: number;
  attemptCount: number;
  createdAt: string;
}

export interface Comment {
  _id: string;
  puzzle: string;
  author: User;
  content: string;
  upvotes: number;
  upvotedBy: string[];
  parentComment?: string;
  createdAt: string;
}

export interface GameRoom {
  id: string;
  gameType: GameType;
  players: RoomPlayer[];
  status: 'waiting' | 'playing' | 'finished';
  currentRound: number;
  maxRounds: number;
  inviteCode?: string;
}

export interface RoomPlayer {
  id: string;
  username: string;
  socketId: string;
  score: number;
  ready: boolean;
}
