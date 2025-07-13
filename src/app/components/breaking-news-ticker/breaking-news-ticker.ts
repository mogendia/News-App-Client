import { BreakingNewsService } from './../../services/breaking-news.service';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from './../../services/auth.service';

@Component({
 selector: 'app-breaking-news-ticker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './breaking-news-ticker.html',
  styleUrl: './breaking-news-ticker.scss'
})
export class BreakingNewsTickerComponent implements OnInit {
  newsList: any[] = [];
  authService = inject(AuthService);

  constructor(private newsService: BreakingNewsService) {}

ngOnInit(): void {
  this.newsService.getBreakingNews().subscribe(data => {
    this.newsList = data; // كل خبر فيه title + content
  });
}
}
