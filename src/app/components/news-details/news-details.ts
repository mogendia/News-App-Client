import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NewsService } from '../../services/News.service';
import { CommonModule } from '@angular/common';
import { AdSidebar } from '../ad-sidebar/ad-sidebar';
import { ImageUrlService } from '../../services/image-service';

@Component({
  selector: 'app-news-details',
  standalone: true,
  imports: [CommonModule, AdSidebar],
  templateUrl: './news-details.html',
  styleUrl: './news-details.scss'
})
export class NewsDetailsComponent implements OnInit {
  news: any;

  constructor(
    private route: ActivatedRoute,
    private newsService: NewsService,
    private imageUrlService: ImageUrlService

  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadNews(id);
    });
  }

loadNews(id: number): void {
  this.newsService.getNewsById(id).subscribe(data => {
    this.news = data;
    console.log('Loaded news details:', this.news);
    console.log('Image URL:', this.news.imageUrl);
    this.imageUrlService.getFullImageUrl(this.news.imageUrl);
  });
}


  onImageError(event: any): void {
    event.target.src = '/assets/images/default-news.jpg';
  }

 getFullImageUrl(imagePath: string): string {
    return this.imageUrlService.getFullImageUrl(imagePath);
  }
}
