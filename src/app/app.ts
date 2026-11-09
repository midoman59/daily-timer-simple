import { Component, inject, signal } from '@angular/core';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

/** Profondeur des écrans dans le parcours : (a) 0, (b) 1, (c) 2, (d) 3, (e) 4. */
export function screenDepth(url: string): number | null {
  const [path] = url.split(/[?#]/);
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'equipes') {
    return 0;
  }
  if (parts[0] !== 'equipe') {
    return null;
  }
  if (parts[1] === 'nouvelle') {
    return 1;
  }
  if (parts.length === 2) {
    return 2;
  }
  switch (parts[2]) {
    case 'modifier':
      return 1;
    case 'preparer':
      return 3;
    case 'daily':
      return 4;
    default:
      return null;
  }
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  /** Sens du dernier changement d'écran : l'écran entrant vient du côté d'où l'on arrive (design 5.6). */
  protected readonly direction = signal<'forward' | 'back' | 'none'>('none');

  private lastDepth: number | null = null;

  constructor() {
    inject(Router)
      .events.pipe(filter((event): event is NavigationStart => event instanceof NavigationStart))
      .subscribe((event) => {
        const depth = screenDepth(event.url);
        if (depth === null || this.lastDepth === null) {
          this.direction.set('none');
        } else {
          this.direction.set(depth > this.lastDepth ? 'forward' : depth < this.lastDepth ? 'back' : 'none');
        }
        this.lastDepth = depth;
      });
  }
}
