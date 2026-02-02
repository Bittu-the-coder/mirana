'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Difficulty, PuzzleCategory } from '@/lib/types';
import { ArrowLeft, ImagePlus, Loader2, Puzzle, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

export default function CreatePuzzlePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: PuzzleCategory.RIDDLE,
    difficulty: Difficulty.MEDIUM,
    content: '',
    solution: '',
    hints: [''],
    imageUrl: '',
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      // Create form data for upload
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('fileName', `puzzle_${Date.now()}_${file.name}`);

      // Upload to ImageKit via your backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: uploadData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setFormData({ ...formData, imageUrl: data.url });
      toast.success('Image uploaded!');
    } catch (error) {
      toast.error('Failed to upload image. Make sure ImageKit is configured in .env');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, imageUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to create puzzles');
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const puzzle = await api.createPuzzle({
        ...formData,
        hints: formData.hints.filter(h => h.trim()),
      });
      toast.success('Puzzle created!');
      router.push(`/puzzles/${puzzle._id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create puzzle');
    } finally {
      setLoading(false);
    }
  };

  const updateHint = (index: number, value: string) => {
    const newHints = [...formData.hints];
    newHints[index] = value;
    setFormData({ ...formData, hints: newHints });
  };

  const addHint = () => {
    if (formData.hints.length < 3) {
      setFormData({ ...formData, hints: [...formData.hints, ''] });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Puzzle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-4">You need to login to create puzzles</p>
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/puzzles">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Puzzles
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Puzzle className="h-6 w-6 text-primary" />
              Create a Puzzle
            </CardTitle>
            <CardDescription>
              Share your creativity with the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Give your puzzle a catchy title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Short Description</label>
                <Input
                  placeholder="Brief description of the puzzle"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              {/* Category and Difficulty */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select
                    className="w-full h-10 rounded-md border bg-background px-3 py-2 text-sm"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as PuzzleCategory })}
                  >
                    <option value={PuzzleCategory.RIDDLE}>Riddle</option>
                    <option value={PuzzleCategory.LOGIC}>Logic</option>
                    <option value={PuzzleCategory.MATH}>Math</option>
                    <option value={PuzzleCategory.WORD}>Word</option>
                    <option value={PuzzleCategory.VISUAL}>Visual</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <select
                    className="w-full h-10 rounded-md border bg-background px-3 py-2 text-sm"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
                  >
                    <option value={Difficulty.EASY}>Easy</option>
                    <option value={Difficulty.MEDIUM}>Medium</option>
                    <option value={Difficulty.HARD}>Hard</option>
                    <option value={Difficulty.EXPERT}>Expert</option>
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Puzzle Image (optional)</label>
                <div className="border-2 border-dashed rounded-lg p-4">
                  {formData.imageUrl ? (
                    <div className="relative">
                      <Image
                        src={formData.imageUrl}
                        alt="Puzzle image"
                        width={400}
                        height={300}
                        className="rounded-lg mx-auto max-h-[200px] object-contain"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="puzzle-image"
                      />
                      <label
                        htmlFor="puzzle-image"
                        className="cursor-pointer block p-6 hover:bg-muted rounded-lg transition-colors"
                      >
                        {uploading ? (
                          <Loader2 className="h-12 w-12 mx-auto mb-2 text-muted-foreground animate-spin" />
                        ) : (
                          <ImagePlus className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        )}
                        <p className="text-sm text-muted-foreground">
                          {uploading ? 'Uploading...' : 'Click to upload an image'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Max 5MB, will be saved to ImageKit
                        </p>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Puzzle Content */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Puzzle Content</label>
                <Textarea
                  placeholder="Write your puzzle here. Be clear and engaging!"
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </div>

              {/* Solution */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Solution</label>
                <Input
                  placeholder="The correct answer"
                  value={formData.solution}
                  onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Solution is hidden from solvers until they get it right
                </p>
              </div>

              {/* Hints */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Hints (optional)</label>
                {formData.hints.map((hint, index) => (
                  <Input
                    key={index}
                    placeholder={`Hint ${index + 1}`}
                    value={hint}
                    onChange={(e) => updateHint(index, e.target.value)}
                  />
                ))}
                {formData.hints.length < 3 && (
                  <Button type="button" variant="outline" size="sm" onClick={addHint}>
                    Add Hint
                  </Button>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading || uploading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Puzzle'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
