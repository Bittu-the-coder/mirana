'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Comment, Puzzle as PuzzleType } from '@/lib/types';
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    Lightbulb,
    Loader2,
    MessageSquare,
    ThumbsUp,
    User,
    XCircle
} from 'lucide-react';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PuzzlePage({ params }: PageProps) {
  const { id } = use(params);
  const { user } = useAuth();
  const [puzzle, setPuzzle] = useState<PuzzleType | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [solution, setSolution] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [solved, setSolved] = useState(false);
  const [showHints, setShowHints] = useState<number[]>([]);
  const [newComment, setNewComment] = useState('');
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [puzzleData, commentsData] = await Promise.all([
          api.getPuzzle(id),
          api.getComments(id),
        ]);
        setPuzzle(puzzleData);
        setComments(commentsData);
      } catch (error) {
        toast.error('Failed to load puzzle');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmitSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solution.trim()) return;

    setSubmitting(true);
    try {
      const result = await api.solvePuzzle(id, solution);
      if (result.correct) {
        setSolved(true);
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        toast.success(`Correct! Solved in ${Math.floor(timeSpent / 60)}:${(timeSpent % 60).toString().padStart(2, '0')}`);
      } else {
        toast.error('Incorrect! Try again.');
      }
    } catch (error) {
      toast.error('Failed to submit solution');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      toast.error('Login to upvote');
      return;
    }
    try {
      const updated = await api.upvotePuzzle(id);
      setPuzzle(updated);
    } catch (error) {
      toast.error('Failed to upvote');
    }
  };

  const revealHint = (index: number) => {
    if (!showHints.includes(index)) {
      setShowHints([...showHints, index]);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      const comment = await api.createComment(id, newComment);
      setComments([comment, ...comments]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-bold mb-2">Puzzle Not Found</h2>
            <Button asChild className="mt-4">
              <Link href="/puzzles">Browse Puzzles</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/puzzles">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Puzzles
          </Link>
        </Button>

        {/* Puzzle Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge>{puzzle.category}</Badge>
                  <Badge variant="outline">{puzzle.difficulty}</Badge>
                </div>
                <CardTitle className="text-2xl">{puzzle.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <User className="h-4 w-4" />
                  by {puzzle.author?.username || 'Anonymous'}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUpvote}
                className={puzzle.upvotedBy?.includes(user?.id || '') ? 'text-primary' : ''}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                {puzzle.upvotes}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Puzzle Content */}
            <div className="p-6 bg-muted rounded-lg">
              <p className="text-lg whitespace-pre-wrap">{puzzle.content}</p>
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {puzzle.solvedCount} solved
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {puzzle.attemptCount} attempts
              </span>
            </div>

            {/* Hints */}
            {puzzle.hints && puzzle.hints.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Hints:</p>
                <div className="flex gap-2">
                  {puzzle.hints.map((hint, index) => (
                    <div key={index}>
                      {showHints.includes(index) ? (
                        <Badge variant="secondary" className="py-2">
                          <Lightbulb className="h-3 w-3 mr-1" />
                          {hint}
                        </Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revealHint(index)}
                        >
                          <Lightbulb className="h-4 w-4 mr-1" />
                          Hint {index + 1}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Solution Form */}
            {solved ? (
              <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-xl font-bold text-green-500">Solved!</h3>
                <p className="text-muted-foreground mt-2">
                  You cracked this puzzle! 🎉
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitSolution} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Answer</label>
                  <Input
                    placeholder="Enter your solution"
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting || !solution.trim()}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    'Submit Answer'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Comments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user && (
              <form onSubmit={handleAddComment} className="flex gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button type="submit" disabled={!newComment.trim()}>
                  Post
                </Button>
              </form>
            )}

            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment._id} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                        {comment.author?.username?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{comment.author?.username || 'Anonymous'}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm">{comment.content}</p>
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
