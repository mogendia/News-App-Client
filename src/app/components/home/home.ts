import { Component, OnInit } from '@angular/core';
import { NewsService } from '../../services/News.service';
import { AdSidebar } from "../ad-sidebar/ad-sidebar";
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [AdSidebar,
    ReactiveFormsModule,RouterModule,CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit {
  newsList: any[] = [];

  constructor(private newsService: NewsService) {}


  ngOnInit(): void {
  this.newsService.getNews().subscribe(data => {
    this.newsList = data; // عرض الكل
  });
}
}
