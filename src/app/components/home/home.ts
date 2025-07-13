import { Component, OnInit, inject } from '@angular/core';
import { NewsService } from '../../services/News.service';
import { AdSidebar } from "../ad-sidebar/ad-sidebar";
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {CommonModule} from '@angular/common';
import { AuthService } from './../../services/auth.service';
@Component({
 selector: 'app-home',
  standalone: true,
  imports: [AdSidebar,
    ReactiveFormsModule, FormsModule, RouterModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})

export class HomeComponent implements OnInit {
  newsList: any[] = [];
  authService = inject(AuthService);
  breakingNewsText: string = '';

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
  this.loadNews();

  window.addEventListener('breakingNewsUpdated', () => {
    this.loadNews();
  });
}

loadNews(): void {
  this.newsService.getHomePageNews().subscribe(data => {
    this.newsList = data;
  });
}
  deleteNews(id: number): void {
    if (confirm('Are you sure you want to delete this news item?')) {
      this.newsService.deleteNews(id).subscribe(() => {
        this.loadNews(); // Reload the news list after deletion
      });
    }
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/default-news.jpg';
  }

 getFullImageUrl(imagePath: string): string {
    if (!imagePath) return '/assets/images/default-news.jpg';
    // إذا كان المسار يبدأ بـ http أو https، فهو مسار كامل
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    // إذا كان المسار يبدأ بـ /assets، فهو مسار محلي
    if (imagePath.startsWith('/assets')) {
        return imagePath;
    }
    // وإلا، نفترض أنه مسار نسبي من الباك إند
    return `https://localhost:7072/${imagePath}`;
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
