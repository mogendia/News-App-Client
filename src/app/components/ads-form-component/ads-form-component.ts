import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdsService } from './../../services/ads.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ads-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './ads-form-component.html',
  styleUrls: ['./ads-form-component.scss']
})
export class AdsFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  adId: number | null = null;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private adsService: AdsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['']
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.adId = +id;
      this.adsService.getAdById(this.adId).subscribe(ad => {
        this.form.patchValue({
          title: ad.title,
          description: ad.description
        });
        this.previewUrl = ad.mediaUrl;
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  save(): void {
    if (this.form.invalid) return;

    const formData = new FormData();
    formData.append('title', this.form.get('title')?.value);
    formData.append('description', this.form.get('description')?.value);
    if (this.selectedFile) {
      formData.append('media', this.selectedFile);
    }

    const callback = () => {
      alert(this.isEditMode ? 'تم تعديل الإعلان' : 'تم إضافة الإعلان');
      this.router.navigate(['/']);
    };

    if (this.isEditMode && this.adId) {
      this.adsService.updateAd(this.adId, formData).subscribe(callback);
    } else {
      this.adsService.createAd(formData).subscribe(callback);
    }
  }
}

