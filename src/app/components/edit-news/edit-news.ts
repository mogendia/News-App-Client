import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NewsService } from '../../services/News.service';
import { CommonModule } from '@angular/common';
import { AdSidebar } from "../ad-sidebar/ad-sidebar";
import { ImageUrlService } from '../../services/image-service';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-edit-news',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AdSidebar],
  templateUrl: './edit-news.html',
  styleUrls: ['./edit-news.scss']
})
export class EditNewsComponent implements OnInit {
  form!: FormGroup;
  newsId: number | null = null;
  isEditMode = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private newsService: NewsService,
    private router: Router,
    public imageUrlService: ImageUrlService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.handleEditMode();
  }

  private initForm(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      imageUrl: [''],
      sectionId: [1, Validators.required],
      isImportant: [false],
      isHomePage: [false]
    });
  }

  private handleEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.newsId = +id;
      this.newsService.getNewsById(this.newsId).subscribe(news => {
        this.form.patchValue({
          title: news.title,
          content: news.content,
          imageUrl: news.imageUrl,
          sectionId: news.sectionId,
          isImportant: news.isImportant,
          isHomePage: news.isHomePage
        });
        this.imagePreview = news.imageUrl;

      });
    }
  }

onFileSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}
saveNews(): void {
  console.log("🚀 saveNews() triggered");

if (this.form.invalid) {
  console.log("🛑 Form is invalid", this.form.value);
  return;
}

  const formData = new FormData();
  formData.append('title', this.form.get('title')?.value);
  formData.append('content', this.form.get('content')?.value);
  formData.append('sectionId', this.form.get('sectionId')?.value);
  formData.append('isImportant', this.form.get('isImportant')?.value ? 'true' : 'false');
  formData.append('isHomePage', this.form.get('isHomePage')?.value ? 'true' : 'false');

  // إذا كان هناك ملف صورة جديد تم اختياره
  if (this.selectedFile) {
    formData.append('image', this.selectedFile);
  }
  // إذا كان هناك مسار صورة موجود (من قبل) ولم يتم تغييره
  else if (this.imagePreview) {
    formData.append('imageUrl', this.form.get('imageUrl')?.value);
  }

  const onSuccess = () => {
    alert(this.isEditMode ? 'تم التعديل بنجاح' : 'تم إنشاء الخبر بنجاح');
    window.dispatchEvent(new Event('breakingNewsUpdated'));
    this.router.navigate(['/']);
  };

  if (this.isEditMode && this.newsId) {
  this.newsService.updateNewsWithFile(this.newsId, formData).subscribe({
    next: onSuccess,
    error: (error) => {
      console.error('خطأ في تحديث الخبر:', error);
      alert('حدث خطأ أثناء تحديث الخبر');
    }
  });
} else {
  this.newsService.createNewsWithFile(formData).subscribe({
    next: onSuccess,
    error: (error) => {
      console.error('خطأ في إنشاء الخبر:', error);
      alert('حدث خطأ أثناء إنشاء الخبر');
    }
  });
}
}
}
