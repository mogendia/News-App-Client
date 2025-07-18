import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageUrlService {
  private apiBaseUrl = 'https://compass.runasp.net';

  getFullImageUrl(imagePath: string): string {
    if (!imagePath) return '/assets/images/default-news.jpg';

    // إذا كان المسار يبدأ بـ http أو https، فهو مسار كامل
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // إذا كان المسار يبدأ بـ /assets، فهو مسار محلي
    if (imagePath.startsWith('/assets')) {
      return imagePath;
    }

    // تأكد من أن المسار يبدأ بـ / إذا لم يكن كذلك
    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

    // وإلا، نفترض أنه مسار نسبي من الباك إند
    return `${this.apiBaseUrl}${normalizedPath}`;
  }

  handleImageError(event: any): void {
    console.error('Image failed to load:', event.target.src);
    event.target.src = '/assets/images/default-news.jpg';
  }
}
