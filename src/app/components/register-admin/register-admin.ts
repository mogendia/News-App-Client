import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-admin',
  templateUrl: './register-admin.html',
  styleUrls: ['./register-admin.scss'],
  standalone: true,
  imports: [FormsModule]
})
export class RegisterAdminComponent {
  email = '';
  password = '';

  authService = inject(AuthService);

  register() {
    const credentials = { email: this.email, password: this.password };
    this.authService.register(credentials).subscribe({
      next: () => {
        alert('✅ تم تسجيل المسؤول بنجاح');
        this.email = '';
        this.password = '';
      },
      error: (err) => {
        console.error('Registration failed', err);
        alert('❌ فشل تسجيل المسؤول');
      }
    });
  }
}
