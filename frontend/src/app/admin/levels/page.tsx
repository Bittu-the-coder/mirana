'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth-context';
import { GameType } from '@/lib/types';
import {
    ArrowLeft,
    Edit,
    Loader2,
    Plus,
    RefreshCw,
    Search,
    Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface GameLevel {
  _id: string;
  gameType: string;
  level: number;
  difficulty: string;
  letters?: string[];
  words?: string[];
  hint?: string;
  word?: string;
  question?: string;
  options?: (string | number)[];
  answer?: number | string;
  isActive: boolean;
}

const gameTypes = [
  { value: GameType.WORD_CHAIN, label: 'Word Connect' },
  { value: GameType.DAILY_MYSTERY_WORD, label: 'Daily Mystery Word' },
  { value: GameType.PATTERN_SPOTTER, label: 'Pattern Spotter' },
  { value: GameType.RIDDLE_ARENA, label: 'Riddle Arena' },
  { value: GameType.SPEED_MATH_DUEL, label: 'Speed Math Duel' },
  { value: GameType.MEMORY_MATCH_BATTLE, label: 'Memory Match Battle' },
  { value: GameType.MEMORY_PATH, label: 'Memory Path' },
  { value: GameType.COLOR_MEMORY, label: 'Color Memory' },
  { value: GameType.NUMBER_PYRAMID, label: 'Number Pyramid' },
  { value: GameType.SLIDING_PUZZLE, label: 'Sliding Puzzle' },
  { value: GameType.CHESS, label: 'Chess' },
  { value: GameType.LUDO, label: 'Ludo' },
];

const difficulties = ['easy', 'medium', 'hard', 'expert'];

export default function AdminLevelsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedGameType, setSelectedGameType] = useState<string>(GameType.WORD_CHAIN);
  const [levels, setLevels] = useState<GameLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingLevel, setEditingLevel] = useState<GameLevel | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    level: 1,
    difficulty: 'medium',
    letters: '',
    words: '',
    hint: '',
    word: '',
    question: '',
    options: '',
    answer: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchLevels();
  }, [user, router, selectedGameType]);

  const fetchLevels = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/games/levels/${selectedGameType}?limit=100`);
      const data = await response.json();
      setLevels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch levels:', error);
      toast.error('Failed to fetch levels');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this level?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/games/levels/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success('Level deleted');
        fetchLevels();
      } else {
        toast.error('Failed to delete level');
      }
    } catch (error) {
      toast.error('Failed to delete level');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const levelData: any = {
      gameType: selectedGameType,
      level: formData.level,
      difficulty: formData.difficulty,
    };

    // Add game-specific fields
    if (selectedGameType === GameType.WORD_CHAIN) {
      levelData.letters = formData.letters.split(',').map(l => l.trim().toUpperCase());
      levelData.words = formData.words.split(',').map(w => w.trim().toUpperCase());
      levelData.hint = formData.hint;
    } else if (selectedGameType === GameType.DAILY_MYSTERY_WORD) {
      levelData.word = formData.word.toUpperCase();
    } else if (selectedGameType === GameType.RIDDLE_ARENA) {
      levelData.question = formData.question;
      levelData.options = formData.options.split(',').map(o => o.trim());
      levelData.answer = parseInt(formData.answer);
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingLevel
        ? `${API_URL}/games/levels/${editingLevel._id}`
        : `${API_URL}/games/levels`;

      const response = await fetch(url, {
        method: editingLevel ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(levelData),
      });

      if (response.ok) {
        toast.success(editingLevel ? 'Level updated' : 'Level created');
        setShowAddDialog(false);
        setEditingLevel(null);
        resetForm();
        fetchLevels();
      } else {
        toast.error('Failed to save level');
      }
    } catch (error) {
      toast.error('Failed to save level');
    }
  };

  const resetForm = () => {
    setFormData({
      level: levels.length + 1,
      difficulty: 'medium',
      letters: '',
      words: '',
      hint: '',
      word: '',
      question: '',
      options: '',
      answer: '',
    });
  };

  const openEditDialog = (level: GameLevel) => {
    setEditingLevel(level);
    setFormData({
      level: level.level,
      difficulty: level.difficulty,
      letters: level.letters?.join(', ') || '',
      words: level.words?.join(', ') || '',
      hint: level.hint || '',
      word: level.word || '',
      question: level.question || '',
      options: level.options?.join(', ') || '',
      answer: level.answer?.toString() || '',
    });
    setShowAddDialog(true);
  };

  const filteredLevels = levels.filter(level => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      level.level.toString().includes(query) ||
      level.difficulty.includes(query) ||
      level.hint?.toLowerCase().includes(query) ||
      level.word?.toLowerCase().includes(query) ||
      level.question?.toLowerCase().includes(query)
    );
  });

  const renderLevelPreview = (level: GameLevel) => {
    switch (selectedGameType) {
      case GameType.WORD_CHAIN:
        return (
          <div>
            <p className="text-sm font-medium">{level.letters?.join(' ')}</p>
            <p className="text-xs text-muted-foreground mt-1">{level.words?.length || 0} words</p>
            {level.hint && <p className="text-xs italic text-muted-foreground">Hint: {level.hint}</p>}
          </div>
        );
      case GameType.DAILY_MYSTERY_WORD:
        return <p className="font-mono text-lg">{level.word}</p>;
      case GameType.RIDDLE_ARENA:
        return (
          <div>
            <p className="text-sm">{level.question?.substring(0, 50)}...</p>
            <p className="text-xs text-muted-foreground mt-1">{level.options?.length || 0} options</p>
          </div>
        );
      default:
        return <p className="text-sm text-muted-foreground">Level {level.level}</p>;
    }
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">Game Levels Management</h1>
          <p className="text-muted-foreground">
            View, edit, and create game levels for all games
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label>Game Type</Label>
                <Select value={selectedGameType} onValueChange={setSelectedGameType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {gameTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search levels..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <Button variant="outline" onClick={fetchLevels}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Dialog open={showAddDialog} onOpenChange={(open) => {
                  setShowAddDialog(open);
                  if (!open) {
                    setEditingLevel(null);
                    resetForm();
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button onClick={() => resetForm()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Level
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{editingLevel ? 'Edit Level' : 'Add New Level'}</DialogTitle>
                      <DialogDescription>
                        {editingLevel ? 'Update the level details' : 'Create a new level for ' + gameTypes.find(g => g.value === selectedGameType)?.label}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Level Number</Label>
                          <Input
                            type="number"
                            value={formData.level}
                            onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                            min={1}
                          />
                        </div>
                        <div>
                          <Label>Difficulty</Label>
                          <Select value={formData.difficulty} onValueChange={(v) => setFormData({ ...formData, difficulty: v })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {difficulties.map(d => (
                                <SelectItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Game-specific fields */}
                      {selectedGameType === GameType.WORD_CHAIN && (
                        <>
                          <div>
                            <Label>Letters (comma-separated)</Label>
                            <Input
                              value={formData.letters}
                              onChange={(e) => setFormData({ ...formData, letters: e.target.value })}
                              placeholder="D, O, G"
                            />
                          </div>
                          <div>
                            <Label>Words (comma-separated)</Label>
                            <Input
                              value={formData.words}
                              onChange={(e) => setFormData({ ...formData, words: e.target.value })}
                              placeholder="DOG, GOD, DO, GO"
                            />
                          </div>
                          <div>
                            <Label>Hint</Label>
                            <Input
                              value={formData.hint}
                              onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
                              placeholder="Man's best friend"
                            />
                          </div>
                        </>
                      )}

                      {selectedGameType === GameType.DAILY_MYSTERY_WORD && (
                        <div>
                          <Label>Word (5 letters)</Label>
                          <Input
                            value={formData.word}
                            onChange={(e) => setFormData({ ...formData, word: e.target.value.toUpperCase() })}
                            maxLength={5}
                            placeholder="BRAIN"
                          />
                        </div>
                      )}

                      {selectedGameType === GameType.RIDDLE_ARENA && (
                        <>
                          <div>
                            <Label>Question</Label>
                            <Textarea
                              value={formData.question}
                              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                              placeholder="What has hands but can't clap?"
                            />
                          </div>
                          <div>
                            <Label>Options (comma-separated)</Label>
                            <Input
                              value={formData.options}
                              onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                              placeholder="Clock, Gloves, Robot, Statue"
                            />
                          </div>
                          <div>
                            <Label>Correct Answer Index (0-based)</Label>
                            <Input
                              type="number"
                              value={formData.answer}
                              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                              min={0}
                              max={3}
                              placeholder="0"
                            />
                          </div>
                        </>
                      )}

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingLevel ? 'Update' : 'Create'} Level
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Levels List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {gameTypes.find(g => g.value === selectedGameType)?.label} Levels
              </span>
              <Badge variant="secondary">{filteredLevels.length} levels</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredLevels.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No levels found for this game type.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredLevels.map((level) => (
                  <div
                    key={level._id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="min-w-[60px] justify-center">
                        #{level.level}
                      </Badge>
                      <Badge
                        variant={
                          level.difficulty === 'easy' ? 'default' :
                          level.difficulty === 'medium' ? 'secondary' :
                          level.difficulty === 'hard' ? 'destructive' : 'outline'
                        }
                      >
                        {level.difficulty}
                      </Badge>
                      <div className="flex-1">
                        {renderLevelPreview(level)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(level)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(level._id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
