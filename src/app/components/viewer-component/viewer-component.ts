import { Component, OnDestroy, OnInit } from '@angular/core';
import { LiveService } from '../../services/Live.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-viewer-component',
  imports: [CommonModule,FormsModule],
  templateUrl: './viewer-component.html',
  styleUrl: './viewer-component.scss'
})
export class ViewerComponent implements OnInit, OnDestroy {
  streamTitle: string = '';
  isLive: boolean = false;
  messages: { user: string; message: string }[] = [];
  chatMessage: string = '';
  private peerConnection: RTCPeerConnection | null = null;
  private subscriptions: Subscription = new Subscription();

  constructor(private liveService: LiveService) {}

  ngOnInit() {
    this.liveService.startConnection();

 this.subscriptions.add(
  this.liveService.isLive$.subscribe(isLive => {
    console.log('isLive updated:', isLive);
    this.isLive = isLive;
    if (isLive) {
      this.startWatching();
    }
  })
);
    this.subscriptions.add(
      this.liveService.streamTitle$.subscribe(title => {
        this.streamTitle = title;
      })
    );

    this.subscriptions.add(
      this.liveService.message$.subscribe(msg => {
        this.messages.push(msg);
      })
    );
    this.checkLiveStatus(); // Initial check
  setInterval(() => this.checkLiveStatus(), 5000);
  }
  async checkLiveStatus() {
  try {
    await this.liveService.ensureConnection();
    const isLive = await this.liveService.connection.invoke('IsLive');
    console.log('IsLive check:', isLive);
    this.isLive = isLive;
    if (isLive) {
      this.startWatching();
    }
  } catch (err) {
    console.error('Error checking live status:', err);
  }
}

  async startWatching() {
    try {
      this.peerConnection = new RTCPeerConnection(this.liveService.rtcConfiguration);
      console.log('Requesting viewerId');
      await this.liveService.sendViewerId();
      this.liveService.connection.on('ReceiveOffer', async (sdp: string) => {
        console.log('Received offer SDP:', sdp);
        if (this.peerConnection) {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp }));
          const answer = await this.peerConnection.createAnswer();
          await this.peerConnection.setLocalDescription(answer);
          if (answer.sdp) {
            this.liveService.sendAnswerToAdmin(answer.sdp);
          } else {
            console.error('Answer SDP is undefined');
          }

          this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
              this.liveService.sendCandidateToAdmin(JSON.stringify(event.candidate));
            }
          };

          this.peerConnection.ontrack = (event) => {
            const videoElement = document.querySelector('video') as HTMLVideoElement;
            videoElement.srcObject = event.streams[0];
          };
        }
      });

      this.subscriptions.add(
        this.liveService.candidateReceivedFromAdmin$.subscribe(async candidate => {
          if (this.peerConnection) {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(JSON.parse(candidate)));
          }
        })
      );

      await this.liveService.sendViewerId();
    } catch (err) {
      console.error('Error starting viewer:', err);
    }
  }

  sendMessage() {
    if (this.chatMessage.trim()) {
      this.liveService.sendMessage('Viewer', this.chatMessage);
      this.chatMessage = '';
    }
  }

  ngOnDestroy() {
    this.peerConnection?.close();
    this.peerConnection = null;
    this.liveService.stopConnection();
    this.subscriptions.unsubscribe();
  }
}
