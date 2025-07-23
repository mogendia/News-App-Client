import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { EditNewsComponent } from './components/edit-news/edit-news';
import { NewsDetailsComponent } from './components/news-details/news-details';
import { LoginComponent } from './components/login/login';
import { RegisterAdminComponent } from './components/register-admin/register-admin';
import { authGuard, superAdminGuard } from './services/auth.guard';
import { SectionNewsComponent } from './components/section-news-component/section-news-component';
import { SearchResultsComponent } from './components/search-results-component/search-results-component';
import { AdsFormComponent } from './components/ads-form-component/ads-form-component';
import { CreateSectionComponent } from './components/create-section-component/create-section-component';
import { EditSectionComponent } from './components/edit-section-component/edit-section-component';
import { PendingNewsComponent } from './components/pending-news-component/pending-news-component';
import { AdminsComponent } from './components/admins-component/admins-component';
import { RegisterSuperAdminComponent } from './components/register-super-admin-component/register-super-admin-component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'edit/new', component: EditNewsComponent, canActivate: [authGuard] }, // For creating news
  { path: 'edit/:id', component: EditNewsComponent, canActivate: [authGuard] }, // For editing news
  { path: 'news/:id', component: NewsDetailsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register-admin', component: RegisterAdminComponent, canActivate: [superAdminGuard] },
  { path: 'search', component: SearchResultsComponent },
  { path: 'ads/create', component: AdsFormComponent, canActivate: [superAdminGuard] },
  { path: 'ads/edit/:id', component: AdsFormComponent, canActivate: [superAdminGuard] },
  { path: 'sections/create', component: CreateSectionComponent, canActivate: [authGuard] },
  { path: 'sections/edit/:id', component: EditSectionComponent, canActivate: [authGuard] },
  { path: 'sections/:id', component: SectionNewsComponent },
  { path: 'pending-news', component: PendingNewsComponent, canActivate: [superAdminGuard] },
  { path: 'admins', component: AdminsComponent, canActivate: [superAdminGuard] },
  { path: 'register-admin', component: RegisterAdminComponent, canActivate: [superAdminGuard] },
  { path: 'register-superadmin', component: RegisterSuperAdminComponent, canActivate: [superAdminGuard] },


];
