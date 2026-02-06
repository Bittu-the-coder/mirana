'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import {
    Gamepad2,
    Github,
    Home,
    LogOut,
    Menu,
    Puzzle,
    Star,
    Swords,
    Trophy,
    User,
    Users
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/games', label: 'Solo Games', icon: Gamepad2 },
  { href: '/multiplayer', label: 'Multiplayer', icon: Swords },
  { href: '/puzzles', label: 'Puzzles', icon: Puzzle },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/community', label: 'Community', icon: Users },
];

const mobileNavItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/games', label: 'Games', icon: Gamepad2 },
  { href: '/multiplayer', label: 'Battle', icon: Swords },
  { href: '/community', label: 'Community', icon: Users },
];

export function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => mobile && setOpen(false)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              isActive && 'bg-primary text-primary-foreground',
              !isActive && 'text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col border-r bg-card p-4">
        <Link href="/" className="flex items-center gap-3 px-4 py-4 mb-6">
          <Image src="/logo.png" alt="Mirana" width={40} height={40} className="rounded-lg" />
          <span className="text-xl font-bold">Mirana</span>
        </Link>

        <nav className="flex-1 space-y-1">
          <NavLinks />
        </nav>

        <div className="border-t pt-4 mt-4 space-y-2">
          {/* GitHub Star Button */}
          <a
            href="https://github.com/Bittu-the-coder/mirana"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Github className="h-5 w-5" />
            <span className="font-medium">Star on GitHub</span>
            <Star className="h-4 w-4 ml-auto text-amber-500" />
          </a>
        </div>

        <div className="border-t pt-4 mt-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 px-4 py-6">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{user.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.stats.totalScore} points
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Top Header with Profile */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 border-b bg-card z-50 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Mirana" width={32} height={32} className="rounded-lg" />
          <span className="font-bold">Mirana</span>
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <Link href="/profile">
              <Avatar className="h-9 w-9 border-2 border-primary">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Button size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] p-4 bg-card">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex items-center gap-3 mb-6 pt-2">
                <Image src="/logo.png" alt="Mirana" width={32} height={32} className="rounded-lg" />
                <span className="text-xl font-bold">Mirana</span>
              </div>
              <nav className="space-y-1">
                <NavLinks mobile />
              </nav>

              {/* GitHub Star Button - Mobile */}
              <div className="border-t pt-4 mt-4">
                <a
                  href="https://github.com/Bittu-the-coder/mirana"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <Github className="h-5 w-5" />
                  <span className="font-medium">Star on GitHub</span>
                  <Star className="h-4 w-4 ml-auto text-amber-500" />
                </a>
              </div>

              <div className="border-t pt-4 mt-4">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.stats.totalScore} points</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => { logout(); setOpen(false); }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button asChild className="w-full" onClick={() => setOpen(false)}>
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full" onClick={() => setOpen(false)}>
                      <Link href="/register">Register</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-card z-50">
        <div className="flex items-center justify-around py-2">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer for mobile header */}
      <div className="md:hidden h-14" />
    </>
  );
}
