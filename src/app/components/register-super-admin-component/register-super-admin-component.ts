import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-register-super-admin-component',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register-super-admin-component.html',
  styleUrl: './register-super-admin-component.scss'
})
export class RegisterSuperAdminComponent {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  register(): void {
    if (this.registerForm.valid) {
      this.authService.registerSuperAdmin(this.registerForm.value).subscribe({
        next: () => {
          alert('تم إنشاء حساب السوبر مشرف بنجاح');
          this.router.navigate(['/admins']);
        },
        error: (error) => {
          console.error('Error registering superadmin:', error);
          alert('حدث خطأ أثناء إنشاء الحساب');
        }
      });
    }
  }
}
