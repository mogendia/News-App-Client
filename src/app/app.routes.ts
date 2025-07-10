import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { EditNewsComponent } from './components/edit-news/edit-news';
import { NewsDetailsComponent } from './components/news-details/news-details';
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'edit/:id', component: EditNewsComponent },
  { path: 'news/:id', component: NewsDetailsComponent },
  { path: '**', redirectTo: '' }
];
