import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LiveService } from '../../services/Live.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-live',
  templateUrl: './admin-live.html',
  styleUrls: ['./admin-live.scss'],
  imports: [FormsModule, CommonModule],
})
export class AdminLiveComponent implements OnInit, OnDestroy {
  @ViewChild('adminVideo', { static: true }) adminVideo!: ElementRef<HTMLVideoElement>;

  streamTitle: string = '';
  message: string = '';
  messages: { user: string, message: string }[] = [];

  localStream!: MediaStream;
  peerConnections: { [viewerId: string]: RTCPeerConnection } = {};

  constructor(private liveService: LiveService) {}

  ngOnInit(): void {
    this.liveService.startConnection();

    this.liveService.answerReceived$.subscribe(({ viewerId, sdp }) => {
      const pc = this.peerConnections[viewerId];
      if (pc) {
        const answerDesc = new RTCSessionDescription({ type: 'answer', sdp });
        pc.setRemoteDescription(answerDesc);
      }
    });

    this.liveService.candidateReceived$.subscribe(({ fromId, candidate }) => {
      const pc = this.peerConnections[fromId];
      if (pc) {
        pc.addIceCandidate(new RTCIceCandidate(JSON.parse(candidate)));
      }
    });

    this.liveService.message$.subscribe(msg => {
      this.messages.push(msg);
    });
  }

  async startLive(): Promise<void> {
    if (!this.streamTitle.trim()) {
      alert('يرجى إدخال عنوان للبث');
      return;
    }

    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.adminVideo.nativeElement.srcObject = this.localStream;
    await this.liveService.startLive(this.streamTitle);

    this.liveService.userCount$.subscribe(() => {
      // يمكن استخدامه لاحقًا لتتبع عدد المشاهدين
    });

 this.liveService.connection.on('ReceiveViewerId', async (viewerId: string) => {
  await this.createPeerConnection(viewerId);
});
  }

  async createPeerConnection(viewerId: string): Promise<void> {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });

    this.localStream.getTracks().forEach(track => {
      pc.addTrack(track, this.localStream);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.liveService.sendCandidate(viewerId, JSON.stringify(event.candidate));
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.peerConnections[viewerId] = pc;

    this.liveService.sendOffer(viewerId, offer.sdp!);
  }

  sendMessage(): void {
    if (this.message.trim()) {
      this.liveService.sendMessage('Admin', this.message);
      this.message = '';
    }
  }

  ngOnDestroy(): void {
    this.liveService.stopLive();
    Object.values(this.peerConnections).forEach(pc => pc.close());
  }
}
