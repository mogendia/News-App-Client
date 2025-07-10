import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NewsService } from '../../services/News.service';

@Component({
  selector: 'app-breaking-news-ticker',
  imports: [CommonModule],
  templateUrl: './breaking-news-ticker.html',
  styleUrl: './breaking-news-ticker.scss'
})
export class BreakingNewsTickerComponent implements OnInit {
  newsTitles: string[] = [];

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.newsService.getNews().subscribe(data => {
      this.newsTitles = data.map(n => n.title);
    });
  }
}
