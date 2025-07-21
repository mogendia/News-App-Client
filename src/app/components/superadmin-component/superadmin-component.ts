import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LiveService } from '../../services/Live.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-superadmin',
  imports: [CommonModule,FormsModule],
  templateUrl: './superadmin-component.html',
  styleUrl: './superadmin-component.scss'
})
export class SuperadminComponent implements OnInit, OnDestroy {
  streamTitle: string = '';
  isLive: boolean = false;
  userCount: number = 0;
  messages: { user: string; message: string }[] = [];
  chatMessage: string = '';
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private stream: MediaStream | null = null;
  private subscriptions: Subscription = new Subscription();

  constructor(private liveService: LiveService) {}

  ngOnInit() {
    this.liveService.startConnection();

    this.subscriptions.add(
      this.liveService.isLive$.subscribe(isLive => {
        this.isLive = isLive;
      })
    );

    this.subscriptions.add(
      this.liveService.streamTitle$.subscribe(title => {
        this.streamTitle = title;
      })
    );

    this.subscriptions.add(
      this.liveService.userCount$.subscribe(count => {
        this.userCount = count;
      })
    );

    this.subscriptions.add(
      this.liveService.message$.subscribe(msg => {
        this.messages.push(msg);
      })
    );

    this.subscriptions.add(
      this.liveService.answerReceived$.subscribe(async ({ viewerId, sdp }) => {
        const pc = this.peerConnections.get(viewerId);
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp }));
        }
      })
    );

    this.subscriptions.add(
      this.liveService.candidateReceived$.subscribe(async ({ fromId, candidate }) => {
        const pc = this.peerConnections.get(fromId);
        if (pc) {
          await pc.addIceCandidate(new RTCIceCandidate(JSON.parse(candidate)));
        }
      })
    );

    this.subscriptions.add(
      this.liveService.streamStarted$.subscribe(() => {
        if (!this.isLive) {
          this.startBroadcast();
        }
      })
    );
  }

async startBroadcast() {
  try {
    this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const videoElement = document.querySelector('video') as HTMLVideoElement;
    videoElement.srcObject = this.stream;

    this.liveService.startLive(this.streamTitle || 'Live Stream');

    // Handle new viewer connections
    this.subscriptions.add(
      this.liveService.userCount$.subscribe(async count => {
        if (count > this.userCount && this.isLive) {
          await this.liveService.sendViewerId();
          // Place the snippet here
          this.liveService.connection.on('ReceiveViewerId', async (viewerId: string) => {
            console.log('Received viewerId:', viewerId);
            const pc = new RTCPeerConnection(this.liveService.rtcConfiguration);
            this.peerConnections.set(viewerId, pc);

            this.stream!.getTracks().forEach(track => pc.addTrack(track, this.stream!));

            pc.onicecandidate = (event) => {
              if (event.candidate) {
                this.liveService.sendCandidate(viewerId, JSON.stringify(event.candidate));
              }
            };

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            if (offer.sdp) {
              console.log('Sending offer to viewer:', viewerId);
              this.liveService.sendOffer(viewerId, offer.sdp);
            } else {
              console.error('Offer SDP is undefined');
            }
          });
        }
        this.userCount = count; // Update userCount to prevent repeated triggers
      })
    );
  } catch (err) {
    console.error('Error starting broadcast:', err);
  }
}
  stopBroadcast() {
    this.stream?.getTracks().forEach(track => track.stop());
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();
    this.liveService.stopLive();
    this.stream = null;
  }

  sendMessage() {
    if (this.chatMessage.trim()) {
      this.liveService.sendMessage('Superadmin', this.chatMessage);
      this.chatMessage = '';
    }
  }


  ngOnDestroy() {
    this.stopBroadcast();
    this.liveService.stopConnection();
    this.subscriptions.unsubscribe();
  }
}
