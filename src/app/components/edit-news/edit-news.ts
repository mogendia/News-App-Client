import { Component, NgModule, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NewsService } from '../../services/News.service';
import { CommonModule } from '@angular/common';
import { AdSidebar } from "../ad-sidebar/ad-sidebar";

@Component({
  selector: 'app-edit-news',
  imports: [CommonModule,
    ReactiveFormsModule, AdSidebar],
  templateUrl: './edit-news.html',
  styleUrl: './edit-news.scss'
})
export class EditNewsComponent implements OnInit {
  form!: FormGroup;
  newsId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private newsService: NewsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.newsId = +this.route.snapshot.paramMap.get('id')!;
    this.newsService.getNewsById(this.newsId).subscribe(news => {
      this.form = this.fb.group({
        title: [news.title],
        content: [news.content],
        imageUrl: [news.imageUrl]
      });
    });
  }

  updateNews() {
    this.newsService.updateNews(this.newsId, this.form.value).subscribe(() => {
      alert("تم التعديل بنجاح");
      this.router.navigate(['/']);
    });
  }
}
