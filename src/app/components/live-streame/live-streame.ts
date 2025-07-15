import { Component, OnInit } from '@angular/core';
import { LiveService } from './../../services/Live.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-live-stream',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live-streame.html',
  styleUrls: ['./live-streame.scss']
})
export class LiveStreamComponent implements OnInit {
  streamTitle: string | null = null;
  messages: { user: string, message: string }[] = [];
  userCount = 0;
  isLive = false;

  constructor(private liveService: LiveService) {}

  ngOnInit(): void {
    this.liveService.startConnection();

    this.liveService.streamTitle$.subscribe(title => this.streamTitle = title);
    this.liveService.isLive$.subscribe(live => this.isLive = live);
   this.liveService.message$.subscribe(msg => {
  this.messages.push(msg);
});
    this.liveService.userCount$.subscribe(count => this.userCount = count);
  }
}
