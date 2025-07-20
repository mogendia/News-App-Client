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
  }

  async startWatching() {
    try {
      this.peerConnection = new RTCPeerConnection(this.liveService.rtcConfiguration);

      this.liveService.connection.on('ReceiveOffer', async (sdp: string) => {
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
