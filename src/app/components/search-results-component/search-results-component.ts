import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router,RouterModule } from '@angular/router';
import { NewsService } from '../../services/News.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { AdSidebar } from "../ad-sidebar/ad-sidebar";


@Component({
  selector: 'app-search-results',
  templateUrl: './search-results-component.html',
  imports: [CommonModule, AdSidebar,RouterModule],
})
export class SearchResultsComponent implements OnInit {
  searchResults: any[] = [];

  authService = inject(AuthService);
  newsService = inject(NewsService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const query = params['query'];
      if (query) {
        this.newsService.searchNews(query).subscribe((results) => {
          this.searchResults = results;
        });
      }
    });
  }

  deleteNews(id: number): void {
    if (confirm('هل أنت متأكد من حذف هذا الخبر؟')) {
      this.newsService.deleteNews(id).subscribe(() => {
        this.searchResults = this.searchResults.filter((n) => n.id !== id);
      });
    }
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '/assets/images/default-news.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `https://compass.runasp.net/${imagePath}`;
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/default-news.jpg';
  }
}
