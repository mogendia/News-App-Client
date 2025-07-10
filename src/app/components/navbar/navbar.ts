import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent implements AfterViewInit {
  sections = ['قسم زايد1', 'قسم زايد2', 'جهاز المدينة', 'شركة المياه', 'شركة الكهرباء', 'البريد'];

  ngAfterViewInit() {
    // Initialize all dropdowns manually
    const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
    if (typeof bootstrap !== 'undefined') {
      const dropdownList = [...dropdownElementList].map(dropdownToggleEl => new bootstrap.Dropdown(dropdownToggleEl));
      console.log('Dropdowns initialized:', dropdownList.length);
    } else {
      console.error('Bootstrap JS is not loaded!');
    }
  }
}
