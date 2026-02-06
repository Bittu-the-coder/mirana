import { MetadataRoute } from 'next';

const BASE_URL = 'https://mirana.bittuthecoder.me';

export default function sitemap(): MetadataRoute.Sitemap {
  // Static pages
  const staticPages = [
    '',
    '/games',
    '/multiplayer',
    '/puzzles',
    '/leaderboard',
    '/community',
    '/login',
    '/register',
  ];

  // Game pages
  const gamePages = [
    '/games/word-connect',
    '/games/sliding-puzzle',
    '/games/daily-mystery-word',
    '/games/number-pyramid',
    '/games/memory-path',
    '/games/pattern-spotter',
    '/games/color-memory',
    '/games/mental-math',
    '/games/multiplication-sprint',
  ];

  const allPages = [...staticPages, ...gamePages];

  return allPages.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : path.includes('/games/') ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path.includes('/games/') ? 0.9 : 0.7,
  }));
}
