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
import { Title } from '@angular/platform-browser';
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
  private subscriptions = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private title: Title,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
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
            return child?.snapshot.data['title'] as string | undefined;
          })
        )
        .subscribe(pageTitle => {
          const baseUrl = this.router.url.split('#')[0].split('?')[0];
          this.isLanding = baseUrl === '/' || baseUrl === '';
          if (pageTitle) {
            this.title.setTitle(`${pageTitle} | Examen Platform`);
          } else {
            this.title.setTitle('Examen Platform');
          }
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
}
