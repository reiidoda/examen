import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterLink, RouterLinkActive, NavigationEnd, ActivatedRoute } from '@angular/router';
import { LocalStorageService } from './core/services/local-storage.service';
import { AuthService } from './core/services/auth.service';
import { Title } from '@angular/platform-browser';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  isLoggedIn = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storage: LocalStorageService,
    private authService: AuthService,
    private title: Title
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });

    // set document title from route data.title when available
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
        if (pageTitle) {
          this.title.setTitle(`${pageTitle} | Examen Platform`);
        } else {
          this.title.setTitle('Examen Platform');
        }
      });
  }

  logout() {
    this.storage.clear();
    this.router.navigate(['/auth/login']);
  }
}
