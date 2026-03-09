import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  PLATFORM_ID,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements AfterViewInit, OnDestroy {
  heroHeadline = 'Examen. Clarity, daily.';
  heroHeadlineChars = Array.from(this.heroHeadline);
  typedCount = 0;

  @ViewChildren('reveal') revealItems!: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('heroSection') heroSection?: ElementRef<HTMLElement>;
  @ViewChild('heroVisual') heroVisual?: ElementRef<HTMLElement>;

  private observer?: IntersectionObserver;
  private isBrowser: boolean;
  private scrollTicking = false;
  private typingStarted = false;
  private typingIndex = 0;
  private typingTimeout?: ReturnType<typeof setTimeout>;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.typedCount = this.isBrowser ? 0 : this.heroHeadlineChars.length;
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            if (this.heroSection?.nativeElement === entry.target) {
              this.startTyping();
            }
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    this.revealItems.forEach(item => this.observer?.observe(item.nativeElement));
    this.updateParallax();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.isBrowser || !this.heroVisual || this.scrollTicking) {
      return;
    }

    this.scrollTicking = true;
    window.requestAnimationFrame(() => {
      this.updateParallax();
      this.scrollTicking = false;
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!this.isBrowser) {
      return;
    }
    this.updateParallax();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  private startTyping(): void {
    if (!this.isBrowser || this.typingStarted) {
      return;
    }
    this.typingStarted = true;
    this.typedCount = 0;
    this.typingIndex = 0;
    this.typeNextChar();
  }

  private typeNextChar(): void {
    if (this.typingIndex >= this.heroHeadlineChars.length) {
      return;
    }

    this.typingIndex += 1;
    this.typedCount = this.typingIndex;

    const progress = this.typingIndex / this.heroHeadlineChars.length;
    const delay = Math.round(110 + 60 * Math.sin(progress * Math.PI));
    this.typingTimeout = setTimeout(() => this.typeNextChar(), delay);
  }

  private updateParallax(): void {
    if (!this.heroVisual) {
      return;
    }

    const element = this.heroVisual.nativeElement;
    const rect = element.getBoundingClientRect();
    const viewHeight = window.innerHeight || 0;
    const progress = Math.min(Math.max((viewHeight - rect.top) / (viewHeight + rect.height), 0), 1);
    const offset = (0.5 - progress) * 24;

    element.style.setProperty('--parallax-offset', `${offset.toFixed(2)}px`);
  }
}
