import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NewsService } from '../../services/News.service';
import { CommonModule } from '@angular/common';
import { AdSidebar } from "../ad-sidebar/ad-sidebar";

@Component({
  selector: 'app-news-details',
  imports: [CommonModule, AdSidebar],
  templateUrl: './news-details.html',
  styleUrl: './news-details.scss'
})
export class NewsDetailsComponent implements OnInit {
  news: any;

  constructor(private route: ActivatedRoute, private newsService: NewsService) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.newsService.getNewsById(id).subscribe(data => {
      this.news = data;
    });
  }
}
