import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admins-component',
  imports: [CommonModule,RouterModule,ReactiveFormsModule,FormsModule],
  templateUrl: './admins-component.html',
  styleUrl: './admins-component.scss'
})
export class AdminsComponent implements OnInit {
  admins: any[] = [];
  adminForm: FormGroup;
  editForm: FormGroup;
  showEditModal = false;
  selectedAdminId: string | null = null;

  constructor(private authService: AuthService, private fb: FormBuilder) {
    this.adminForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.editForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.loadAdmins();
  }

  loadAdmins(): void {
    this.authService.getAdmins().subscribe({
      next: (data) => {
        this.admins = data;
        console.log('Admins loaded:', data);
      },
      error: (error) => {
        console.error('Error loading admins:', error);
        alert('حدث خطأ أثناء تحميل المشرفين');
      }
    });
  }

  addAdmin(): void {
    if (this.adminForm.valid) {
      this.authService.register(this.adminForm.value).subscribe({
        next: () => {
          alert('تم إضافة المشرف بنجاح');
          this.adminForm.reset();
          this.loadAdmins();
        },
        error: (error) => {
          console.error('Error adding admin:', error);
          alert('حدث خطأ أثناء إضافة المشرف');
        }
      });
    }
  }

  editAdmin(admin: any): void {
    this.selectedAdminId = admin.id;
    this.editForm.patchValue({ email: admin.email });
    this.showEditModal = true;
  }

  updateAdmin(): void {
    if (this.editForm.valid && this.selectedAdminId) {
      this.authService.updateAdmin(this.selectedAdminId, this.editForm.value).subscribe({
        next: () => {
          alert('تم تعديل المشرف بنجاح');
          this.closeEditModal();
          this.loadAdmins();
        },
        error: (error) => {
          console.error('Error updating admin:', error);
          alert('حدث خطأ أثناء تعديل المشرف');
        }
      });
    }
  }

  deleteAdmin(id: string): void {
    if (confirm('هل أنت متأكد من حذف هذا المشرف؟')) {
      this.authService.deleteAdmin(id).subscribe({
        next: () => {
          alert('تم حذف المشرف بنجاح');
          this.loadAdmins();
        },
        error: (error) => {
          console.error('Error deleting admin:', error);
          alert('حدث خطأ أثناء حذف المشرف');
        }
      });
    }
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedAdminId = null;
    this.editForm.reset();
  }
}
