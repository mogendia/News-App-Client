import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-ad-sidebar',
  imports: [CommonModule],
  templateUrl: './ad-sidebar.html',
  styleUrl: './ad-sidebar.scss'
})
export class AdSidebar {
 ad = {
  image: 'assets/ads/test.png',
  title: 'عنوان الإعلان',
  content: 'وصف الإعلان'
};
}
