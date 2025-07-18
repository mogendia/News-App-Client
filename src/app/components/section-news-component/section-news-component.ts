import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NewsService } from '../../services/News.service';
import { RouterModule } from '@angular/router';
import { AdSidebar } from "../ad-sidebar/ad-sidebar";
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-section-news',
  standalone: true,
  imports: [CommonModule, RouterModule, AdSidebar],
  templateUrl: './section-news-component.html',
  styleUrls: ['./section-news-component.scss']
})
export class SectionNewsComponent implements OnInit {
  newsList: any[] = [];
  sectionId!: number;
  authService = inject(AuthService);


  constructor(private route: ActivatedRoute, private newsService: NewsService) {}


ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
    this.sectionId = +params.get('id')!;
    this.loadSectionNews(this.sectionId);
  });
}


loadSectionNews(id: number): void {
  this.newsService.getNewsBySection(id).subscribe({
    next: (news) => {
      this.newsList = news;
    },
    error: (err) => {
      console.error('فشل تحميل أخبار القسم', err);
    }
  });
}
deleteNews(id: number): void {
  if (confirm('هل أنت متأكد من حذف هذا الخبر؟')) {
    this.newsService.deleteNews(id).subscribe({
      next: () => {
        alert('تم حذف الخبر بنجاح');
        this.loadSectionNews(this.sectionId); // إعادة تحميل أخبار القسم
      },
      error: (error) => {
        console.error('فشل حذف الخبر:', error);
        alert('حدث خطأ أثناء حذف الخبر');
      }
    });
  }
}
  getImageUrl(imagePath: string): string {
  if (!imagePath) return '/assets/images/default-news.jpg';

  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/assets')) return imagePath;

  return `https://compass.runasp.net/${imagePath}`;
}

onImageError(event: any) {
  event.target.src = '/assets/images/default-news.jpg';
}
}
