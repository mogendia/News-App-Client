import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LiveService {
  private connectionUrl = 'https://compass.runasp.net/liveHub';
  private hubConnection!: signalR.HubConnection;
  private streamTitleSubject = new BehaviorSubject<string>('');
  streamTitle$ = this.streamTitleSubject.asObservable();
  private isLiveSubject = new BehaviorSubject<boolean>(false);
  isLive$ = this.isLiveSubject.asObservable();
  private streamStartedSource = new Subject<string>();
  streamStarted$ = this.streamStartedSource.asObservable();
  private messageSource = new Subject<{ user: string; message: string }>();
  message$ = this.messageSource.asObservable();
  private userCountSource = new Subject<number>();
  userCount$ = this.userCountSource.asObservable();
  private answerSource = new Subject<{ viewerId: string; sdp: string }>();
  answerReceived$ = this.answerSource.asObservable();
  private candidateFromAdminSource = new Subject<string>();
  candidateReceivedFromAdmin$ = this.candidateFromAdminSource.asObservable();
  private candidateFromViewerSource = new Subject<{ fromId: string; candidate: string }>();
  candidateReceived$ = this.candidateFromViewerSource.asObservable();
  private viewerId: string = '';

  // STUN/TURN server configuration
  public readonly rtcConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      // Add TURN server here if needed, e.g., { urls: 'turn:your-turn-server.com:3478', username: 'user', credential: 'password' }
    ]
  };

  constructor() {
    // Constructor will not build the connection here.
    // The connection will be built and started in startConnection().
  }

  // Method to start the SignalR connection
  startConnection(): void {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      console.log('SignalR connection already active.');
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.connectionUrl)
      .withAutomaticReconnect()
      .build();

    // Event handlers for connection status
    this.hubConnection.onreconnecting((error) => {
      console.warn('SignalR reconnecting:', error);
      this.isLiveSubject.next(false); // Reset live status during reconnection
    });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR reconnected');
      // For viewers, re-sending viewerId might be necessary to re-establish WebRTC
      // For admins, they might need to re-send offers to existing viewers
      // This is handled in component logic based on user type.
    });

    this.hubConnection.onclose((error) => {
      console.error('SignalR connection closed:', error);
      this.isLiveSubject.next(false);
    });

    // Register hub event listeners
    this.hubConnection.on('ReceiveViewerId', (id: string) => {
      this.viewerId = id;
      console.log('Received viewerId:', this.viewerId);
    });

    this.hubConnection.on('OnLiveStarted', (title: string) => {
      console.log('Received OnLiveStarted with title:', title);
      this.streamStartedSource.next(title);
      this.streamTitleSubject.next(title);
      this.isLiveSubject.next(true);
    });

    this.hubConnection.on('OnLiveEnded', () => {
      console.log('Received OnLiveEnded');
      this.streamTitleSubject.next('');
      this.isLiveSubject.next(false);
    });

    this.hubConnection.on('ReceiveMessage', (user: string, message: string) => {
      this.messageSource.next({ user, message });
    });

    this.hubConnection.on('UserCountChanged', (count: number) => {
      console.log('UserCountChanged:', count);
      this.userCountSource.next(count);
    });

    this.hubConnection.on('AnswerFromViewer', (viewerId: string, sdp: string) => {
      console.log('Received AnswerFromViewer from', viewerId);
      this.answerSource.next({ viewerId, sdp });
    });

    this.hubConnection.on('CandidateFromViewer', (fromId: string, candidate: string) => {
      console.log('Received CandidateFromViewer from', fromId);
      this.candidateFromViewerSource.next({ fromId, candidate });
    });

    this.hubConnection.on('CandidateFromAdmin', (candidate: string) => {
      console.log('Received CandidateFromAdmin');
      this.candidateFromAdminSource.next(candidate);
    });

    // Start the connection
    this.hubConnection.start()
      .then(() => {
        console.log('✅ SignalR Connected to', this.connectionUrl);
        // Initial check for live status after connection is established
        this.hubConnection.invoke('IsLive').then(isLive => {
          this.isLiveSubject.next(isLive);
          console.log('Initial IsLive status:', isLive);
        }).catch(err => console.error('Error checking initial live status:', err));
      })
      .catch(err => {
        console.error('Error starting SignalR connection:', err);
        this.isLiveSubject.next(false);
      });
  }

  get connection(): signalR.HubConnection {
    return this.hubConnection;
  }

  // Method to stop the connection
  stopConnection(): void {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.stop()
        .then(() => console.log('SignalR connection stopped'))
        .catch(err => console.error('Error stopping SignalR connection:', err));
    }
  }

  // Ensure connection is active before invoking hub methods
  public ensureConnection(): Promise<void> {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return Promise.resolve();
    }
    return this.hubConnection.start()
      .then(() => console.log('SignalR connection re-established for invoke'))
      .catch(err => {
        console.error('Error re-establishing SignalR connection for invoke:', err);
        throw err;
      });
  }

  async sendMessage(user: string, message: string): Promise<void> {
    try {
      await this.ensureConnection();
      await this.hubConnection.invoke('SendMessage', user, message);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  }

  async startLive(title: string): Promise<void> {
    try {
      await this.ensureConnection();
      await this.hubConnection.invoke('StartLive', title);
      this.streamTitleSubject.next(title);
      this.isLiveSubject.next(true);
    } catch (err) {
      console.error('Error starting live:', err);
    }
  }

  async stopLive(): Promise<void> {
    try {
      await this.ensureConnection();
      await this.hubConnection.invoke('StopLive'); // Assuming a StopLive method in Hub
      this.streamTitleSubject.next('');
      this.isLiveSubject.next(false);
    } catch (err) {
      console.error('Error stopping live:', err);
    }
  }

  async sendOffer(viewerId: string, sdp: string): Promise<void> {
    try {
      await this.ensureConnection();
      await this.hubConnection.invoke('SendOfferToViewer', viewerId, sdp);
    } catch (err) {
      console.error('Error sending offer:', err);
    }
  }

  async sendCandidate(viewerId: string, candidate: string): Promise<void> {
    try {
      await this.ensureConnection();
      await this.hubConnection.invoke('SendCandidateToViewer', viewerId, candidate);
    } catch (err) {
      console.error('Error sending candidate:', err);
    }
  }

  async sendViewerId(): Promise<void> {
    try {
      await this.ensureConnection();
      await this.hubConnection.invoke('GetViewerId');
    } catch (err) {
      console.error('Error sending viewerId:', err);
    }
  }

  // This method should be called by the viewer to send their answer to the admin
  async sendAnswerToAdmin(sdp: string): Promise<void> {
    try {
      await this.ensureConnection();
      // Corrected: Call the method that the hub expects for viewer answers
      await this.hubConnection.invoke('SendAnswerToAdmin', sdp);
    } catch (err) {
      console.error('Error sending answer to admin:', err);
    }
  }

  async sendCandidateToAdmin(candidate: string): Promise<void> {
    try {
      await this.ensureConnection();
      await this.hubConnection.invoke('SendCandidateToAdmin', candidate);
    } catch (err) {
      console.error('Error sending candidate to admin:', err);
    }
  }
}
