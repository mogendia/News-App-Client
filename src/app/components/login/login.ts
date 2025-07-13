import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  standalone: true,
  imports: [FormsModule]
})
export class LoginComponent {
  email = '';
  password = '';

  authService = inject(AuthService);

  login() {
    const credentials = { email: this.email, password: this.password };
    this.authService.login(credentials).subscribe();
  }
}
