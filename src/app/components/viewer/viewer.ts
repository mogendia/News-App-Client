import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LiveService } from './../../services/Live.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-live-viewer',
  templateUrl: './viewer.html',
  styleUrls: ['./viewer.scss'],
  imports: [CommonModule],
})
export class LiveViewerComponent implements OnInit, OnDestroy {
    @ViewChild('viewerVideo', { static: true }) viewerVideo!: ElementRef<HTMLVideoElement>;
  userCount: number = 0;
  streamTitle: string = '';
  isLive: boolean = false;
  messages: { user: string, message: string }[] = [];
  peerConnection!: RTCPeerConnection;

  constructor(private liveService: LiveService) {}

  ngOnInit(): void {
    this.liveService.startConnection();
    this.liveService.userCount$.subscribe(count => {
      this.userCount = count;
    });

    this.liveService.streamTitle$.subscribe(title => this.streamTitle = title);
    this.liveService.isLive$.subscribe(live => {
      this.isLive = live;
      if (live) {
        this.setupConnection();
      }
    });

    this.liveService.message$.subscribe(msg => {
      this.messages.push(msg);
    });
  }

  async setupConnection(): Promise<void> {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });

    this.peerConnection.ontrack = (event) => {
      this.viewerVideo.nativeElement.srcObject = event.streams[0];
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.liveService.sendCandidateToAdmin(JSON.stringify(event.candidate));
      }
    };

    this.liveService.connection.on('SendOfferToViewer', async (sdp: string) => {
      const offerDesc = new RTCSessionDescription({ type: 'offer', sdp });
      await this.peerConnection.setRemoteDescription(offerDesc);

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      this.liveService.sendAnswerToAdmin(answer.sdp!);
    });

    this.liveService.candidateReceivedFromAdmin$.subscribe(candidate => {
      this.peerConnection.addIceCandidate(new RTCIceCandidate(JSON.parse(candidate)));
    });

    this.liveService.sendViewerId();
  }

  ngOnDestroy(): void {
    this.peerConnection?.close();
    this.liveService.stopLive();
  }
}
