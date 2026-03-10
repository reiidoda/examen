import { Component, HostListener, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnDestroy {
  isLoggedIn = false;
  isScrolled = false;
  isLanding = false;
  private isBrowser = false;
  private readonly defaultDescription =
    'Examen is an open-source reflective journaling and examination of conscience platform with AI-assisted insights, habit tracking, and analytics.';
  private readonly publicBaseUrl: string;
  private subscriptions = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.publicBaseUrl = this.resolvePublicBaseUrl();
    this.isScrolled = this.isBrowser ? window.scrollY > 16 : false;

    this.subscriptions.add(
      this.authService.currentUser$.subscribe(user => {
        this.isLoggedIn = !!user;
      })
    );

    this.subscriptions.add(
      this.router.events
        .pipe(
          filter(event => event instanceof NavigationEnd),
          map(() => {
            let child = this.route.firstChild;
            while (child?.firstChild) {
              child = child.firstChild;
            }
            const snapshot = child?.snapshot;
            const pageTitle = snapshot?.title;
            const description = snapshot?.data['description'] as string | undefined;
            const indexable = (snapshot?.data['indexable'] as boolean | undefined) ?? false;
            return { pageTitle, description, indexable };
          })
        )
        .subscribe(({ pageTitle, description, indexable }) => {
          const baseUrl = this.router.url.split('#')[0].split('?')[0];
          this.isLanding = baseUrl === '/' || baseUrl === '';
          if (pageTitle) {
            this.title.setTitle(`${pageTitle} | Examen Platform`);
          } else {
            this.title.setTitle('Examen Platform');
          }
          this.applySeoMetadata(baseUrl, pageTitle, description, indexable);
        })
    );
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.isBrowser) {
      return;
    }
    this.isScrolled = window.scrollY > 16;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private applySeoMetadata(
    path: string,
    pageTitle: string | undefined,
    description: string | undefined,
    indexable: boolean
  ): void {
    const fullTitle = pageTitle ? `${pageTitle} | Examen Platform` : 'Examen Platform';
    const fullDescription = description?.trim() || this.defaultDescription;
    const absoluteUrl = `${this.publicBaseUrl}${path === '/' ? '' : path}`;
    const robots = indexable ? 'index,follow' : 'noindex,nofollow';

    this.meta.updateTag({ name: 'description', content: fullDescription });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: fullDescription });
    this.meta.updateTag({ property: 'og:url', content: absoluteUrl });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: fullDescription });
    this.meta.updateTag({ name: 'robots', content: robots });

    let canonical = this.document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      this.document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', absoluteUrl);
  }

  private resolvePublicBaseUrl(): string {
    if (this.isBrowser) {
      return window.location.origin.replace(/\/+$/, '');
    }
    const fromEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } })
      .process?.env?.['APP_PUBLIC_URL'];
    return (fromEnv || 'https://github.com/reiidoda/examen').replace(/\/+$/, '');
  }
}
