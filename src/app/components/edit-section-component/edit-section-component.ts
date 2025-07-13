import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SectionService } from '../../services/section-service';

@Component({
  selector: 'app-edit-section-component',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-section-component.html',
  styleUrl: './edit-section-component.scss'
})
export class EditSectionComponent implements OnInit {
  form: FormGroup;
  sectionId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private sectionService: SectionService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.sectionId = +this.route.snapshot.paramMap.get('id')!;
    this.sectionService.getSectionById(this.sectionId).subscribe({
      next: (section) => {
        this.form.patchValue({ name: section.name });
      },
      error: () => {
        alert('❌ فشل تحميل بيانات القسم');
        this.router.navigate(['/']);
      }
    });
  }

  updateSection() {
    if (this.form.invalid) return;
    this.sectionService.updateSection(this.sectionId, this.form.value).subscribe({
      next: () => {
        alert('✅ تم تعديل القسم بنجاح');
        this.router.navigate(['/']);
      },
      error: () => {
        alert('❌ فشل في تعديل القسم');
      }
    });
  }
}
