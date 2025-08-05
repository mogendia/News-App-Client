import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageUrlService {
  private apiBaseUrl = 'https://compass.runasp.net';

  getFullImageUrl(imagePath: string): string {
    if (!imagePath) return 'favicon.ico';

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    if (imagePath.startsWith('/assets')) {
      return imagePath;
    }

    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

    return `${this.apiBaseUrl}${normalizedPath}`;
  }

  handleImageError(event: any): void {
    console.error('Image failed to load:', event.target.src);
    event.target.src = 'favicon.ico';
  }
}
