import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Component, AfterViewInit, inject } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SectionService } from '../../services/section-service';
import { filter } from 'rxjs';

declare var bootstrap: any;

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent implements AfterViewInit {
  public authService = inject(AuthService);
  public router = inject(Router);
  public sectionService = inject(SectionService);

  searchTerm: string = '';
  sectionList: any[] = [];

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.loadSections();
    });
  }

  ngOnInit() {
    this.loadSections();
  }

  ngAfterViewInit() {
    const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
    if (typeof bootstrap !== 'undefined') {
      [...dropdownElementList].map(dropdownToggleEl => new bootstrap.Dropdown(dropdownToggleEl));
    }
  }

  loadSections(): void {
    this.sectionService.getSections().subscribe({
      next: (sections) => {
        this.sectionList = sections;
      },
      error: (err) => {
        console.error('فشل تحميل الأقسام:', err);
      }
    });
  }

  searchNews() {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/search'], { queryParams: { query: this.searchTerm } });
    }
  }

  goToSection(id: number): void {
    this.router.navigate(['/sections', id]);
  }

  editSection(id: number): void {
    this.router.navigate(['/sections/edit', id]);
  }

  deleteSection(id: number): void {
    if (confirm('هل أنت متأكد من حذف هذا القسم؟')) {
      this.sectionService.deleteSection(id).subscribe({
        next: () => {
          this.loadSections();
        },
        error: (err) => {
          console.error('فشل حذف القسم:', err);
          alert('حدث خطأ أثناء حذف القسم.');
        }
      });
    }
  }

  goToAddSection(): void {
    this.router.navigate(['/sections/create']);
  }
}
