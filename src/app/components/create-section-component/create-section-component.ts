import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SectionService } from '../../services/section-service';

@Component({
  selector: 'app-create-section-component',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-section-component.html',
  styleUrl: './create-section-component.scss'
})
export class CreateSectionComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder, private sectionService: SectionService, private router: Router) {
    this.form = this.fb.group({
      name: ['', Validators.required]
    });
  }

  createSection() {
    if (this.form.invalid) return;
    this.sectionService.createSection(this.form.value).subscribe({
      next: () => {
        alert('✅ تم إضافة القسم بنجاح');
        this.router.navigate(['/']);
      },
      error: () => {
        alert('❌ فشل في إضافة القسم');
      }
    });
  }
}
