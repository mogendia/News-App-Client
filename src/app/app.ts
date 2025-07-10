import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./components/navbar/navbar";
import { BreakingNewsTickerComponent } from "./components/breaking-news-ticker/breaking-news-ticker";
import { Footer } from "./components/footer/footer";
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, BreakingNewsTickerComponent, Footer,HttpClientModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'News App';
}
