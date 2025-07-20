import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./components/navbar/navbar";
import { BreakingNewsTickerComponent } from "./components/breaking-news-ticker/breaking-news-ticker";
import { Footer } from "./components/footer/footer";
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './services/auth.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, BreakingNewsTickerComponent, Footer,HttpClientModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected title = 'News App';
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Initialize admin state when app starts
    this.authService.initializeAuthState();
  }
}
