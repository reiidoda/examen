import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JournalEntry, JournalService } from '../../../core/services/journal.service';
import { MotionDirective } from '../../motion/motion.directive';

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [CommonModule, FormsModule, MotionDirective],
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss']
})
export class JournalComponent implements OnInit {
  content = '';
  loading = false;
  error = '';
  entries: JournalEntry[] = [];

  constructor(private journalService: JournalService) {}

  ngOnInit(): void {
    this.loadEntries();
  }

  loadEntries(): void {
    this.journalService.getRecent().subscribe({
      next: res => (this.entries = res),
      error: () => (this.error = 'Failed to load journal entries')
    });
  }

  save(): void {
    if (!this.content.trim()) return;
    this.loading = true;
    this.error = '';
    this.journalService.create({ content: this.content }).subscribe({
      next: entry => {
        this.entries = [entry, ...this.entries].slice(0, 20);
        this.content = '';
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not save entry';
        this.loading = false;
      }
    });
  }
}
