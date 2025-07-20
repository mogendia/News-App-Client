import { Component, OnInit, inject } from '@angular/core';
import { NewsService } from '../../services/News.service';
import { AdSidebar } from "../ad-sidebar/ad-sidebar";
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {CommonModule} from '@angular/common';
import { AuthService } from './../../services/auth.service';
import { LiveService } from '../../services/Live.service';
@Component({
 selector: 'app-home',
  standalone: true,
  imports: [AdSidebar,
    ReactiveFormsModule, FormsModule, RouterModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})

export class HomeComponent implements OnInit {
  isLive:Boolean = false;
  newsList: any[] = [];
  authService = inject(AuthService);
  breakingNewsText: string = '';

  constructor(private newsService: NewsService,
    private router: Router,
    private liveService: LiveService) {}

  ngOnInit(): void {
  this.loadNews();
  this.liveService.startConnection();
    this.liveService.isLive$.subscribe(isLive => {
      this.isLive = isLive;
    });
  window.addEventListener('breakingNewsUpdated', () => {
    this.loadNews();
  });
}
 navigateToLiveStream() {
    if (this.authService.isSuperAdmin()) {
      this.router.navigate(['/superadmin-dashboard']);
    } else {
      this.router.navigate(['/live/viewer']);
    }
  }
loadNews(): void {
  this.newsService.getHomePageNews().subscribe(data => {
    this.newsList = data;
  });
}
  deleteNews(id: number): void {
    if (confirm('Are you sure you want to delete this news item?')) {
      this.newsService.deleteNews(id).subscribe(() => {
        this.loadNews();
      });
    }
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/default-news.jpg';
  }

 getFullImageUrl(imagePath: string): string {
    if (!imagePath) return '/assets/images/default-news.jpg';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    if (imagePath.startsWith('/assets')) {
        return imagePath;
    }
    return `https://compass.runasp.net/${imagePath}`;
}

addBreakingNews(): void {
  if (this.breakingNewsText.trim()) {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('يجب تسجيل الدخول أولاً');
      return;
    }

    const formData = new FormData();
    formData.append('title', this.breakingNewsText);
    formData.append('content', 'هذا محتوى افتراضي للخبر العاجل');
    formData.append('sectionId', '1'); // غيّر ID حسب القسم اللي يمثل الأخبار العاجلة
    formData.append('isImportant', 'true');
    formData.append('isHomePage', 'false');

    this.newsService.addNews(formData).subscribe({
      next: () => {
        alert('تم إضافة الخبر العاجل بنجاح');
        this.breakingNewsText = '';
        this.loadNews();
        window.dispatchEvent(new Event('breakingNewsUpdated'));

      },
      error: (error) => {
        console.error('Error adding breaking news:', error);
        alert('حدث خطأ في إضافة الخبر العاجل');
      }
    });
  }
}

}
