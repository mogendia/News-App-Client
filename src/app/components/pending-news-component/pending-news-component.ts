import { Component, OnInit } from '@angular/core';
import { NewsService } from '../../services/News.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pending-news-component',
  imports: [CommonModule],
  templateUrl: './pending-news-component.html',
  styleUrl: './pending-news-component.scss'
})
export class PendingNewsComponent implements OnInit {
  pendingNews: any[] = [];

  constructor(private newsService: NewsService, private authService: AuthService) {}

  ngOnInit(): void {
    if (this.authService.getIsSuperAdmin()) {
      this.loadPendingNews();
    }
  }

  loadPendingNews(): void {
    this.newsService.getPendingNews().subscribe({
      next: (data) => {
        this.pendingNews = data;
        console.log('Pending news loaded:', data);
      },
      error: (error) => {
        console.error('Error loading pending news:', error);
      }
    });
  }

  approveNews(id: number): void {
    this.newsService.approveNews(id).subscribe({
      next: () => {
        alert('تم الموافقة على الخبر');
        this.loadPendingNews();
      },
      error: (error) => {
        console.error('Error approving news:', error);
        alert('حدث خطأ أثناء الموافقة');
      }
    });
  }

  rejectNews(id: number): void {
    this.newsService.rejectNews(id).subscribe({
      next: () => {
        alert('تم رفض الخبر');
        this.loadPendingNews();
      },
      error: (error) => {
        console.error('Error rejecting news:', error);
        alert('حدث خطأ أثناء الرفض');
      }
    });
  }
}
