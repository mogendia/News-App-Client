import { Component, inject, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdsService } from './../../services/ads.service';
import { AuthService } from './../../services/auth.service';

@Component({
  selector: 'app-ad-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ad-sidebar.html',
  styleUrl: './ad-sidebar.scss'
})
export class AdSidebar implements OnInit, AfterViewChecked {

@ViewChild('adVideo') adVideoRef!: ElementRef<HTMLVideoElement>;

  authService = inject(AuthService);
  adsService = inject(AdsService);
  private imageTimeoutSet: boolean = false;
  adsList: any[] = [];
  currentAd: any = null;
  currentAdIndex: number = 0;
  videoElement!: HTMLVideoElement;


  ngAfterViewChecked(): void {
  if (!this.currentAd) return;

  if (this.isImage(this.currentAd.mediaUrl)) {
    if (!this.imageTimeoutSet) {
      this.imageTimeoutSet = true;
      setTimeout(() => {
        this.imageTimeoutSet = false;
        this.nextAd();
      }, 5000); // 5 ثواني
    }
  }

  else if (this.isVideo(this.currentAd.mediaUrl)) {
    const videoEl = this.adVideoRef?.nativeElement;
    if (videoEl) {
      videoEl.muted = true;
      videoEl.autoplay = true;
      videoEl.playsInline = true;

      videoEl.play().catch(err => {
        console.warn('فشل تشغيل الفيديو تلقائيًا:', err);
        setTimeout(() => this.nextAd(), 20000);
      });

      videoEl.onended = () => {
        this.nextAd();
      };
    }
  }
}

  ngOnInit(): void {
    this.loadAds();
  }

  loadAds(): void {
    this.adsService.getAds().subscribe({
      next: (ads) => {
        this.adsList = ads;
        if (ads.length > 0) {
          this.startAdRotation();
        }
      },
      error: (error) => {
        console.error('Error loading ads:', error);
      }
    });
  }

  startAdRotation(): void {
  this.currentAd = this.adsList[this.currentAdIndex];
}

unmuteVideo(): void {
  const video = this.adVideoRef?.nativeElement;
  if (video) {
    video.muted = false;
    video.play().catch(err => {
      console.warn('فشل إعادة تشغيل الفيديو بالصوت:', err);
    });
  }
}

nextAd(): void {
  this.currentAdIndex = (this.currentAdIndex + 1) % this.adsList.length;
  this.startAdRotation();
}

  deleteAd(id: number): void {
    if (confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
      this.adsService.deleteAd(id).subscribe({
        next: () => {
          this.loadAds();
          alert('تم حذف الإعلان بنجاح');
        },
        error: (error) => {
          console.error('خطأ في حذف الإعلان:', error);
          alert('حدث خطأ في حذف الإعلان');
        }
      });
    }
  }

  goToAdd(): void {
    window.location.href = '/ads/create';
  }

  goToEdit(): void {
    if (this.currentAd?.id) {
      window.location.href = `/ads/edit/${this.currentAd.id}`;
    }
  }

  onImageError(event: any): void {
    event.target.src = '/assets/ads/default.png';
  }

  getFullImageUrl(url: string): string {
    if (!url) return '/assets/ads/default.png';
    return url.startsWith('http') ? url : `https://localhost:7072/${url}`;
  }

  isImage(url: string): boolean {
    return /\.(jpg|jpeg|png|gif)$/i.test(url);
  }

  isVideo(url: string): boolean {
    return /\.(mp4|webm|ogg)$/i.test(url);
  }
}
