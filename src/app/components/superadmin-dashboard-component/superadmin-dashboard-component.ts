import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-superadmin-dashboard-component',
  imports: [],
  templateUrl: './superadmin-dashboard-component.html',
  styleUrl: './superadmin-dashboard-component.scss'
})
export class SuperadminDashboardComponent {
  constructor(private router: Router) {}

 navigateToLiveStream() {
    this.router.navigate(['/live/superadmin']);
  }
}
