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

  // إعداد خوادم STUN/TURN
  public readonly rtcConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      // يمكن إضافة خادم TURN هنا إذا لزم الأمر
    ]
  };

 startConnection(): void {
  this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(this.connectionUrl)
    .withAutomaticReconnect()
    .build();
  this.hubConnection.start()
    .then(() => console.log('✅ SignalR Connected to', this.connectionUrl))
    .catch(err => console.error('Error starting SignalR connection:', err));

    // معالجة أحداث إعادة الاتصال
    this.hubConnection.onreconnecting((error) => {
      console.warn('SignalR reconnecting:', error);
      this.isLiveSubject.next(false); // إعادة تعيين حالة البث أثناء إعادة الاتصال
    });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR reconnected');
      this.sendViewerId(); // إعادة إرسال viewerId عند إعادة الاتصال
    });

    this.hubConnection.onclose((error) => {
      console.error('SignalR connection closed:', error);
      this.isLiveSubject.next(false);
    });

    // إعداد معالجات الأحداث
    this.hubConnection.on('ReceiveViewerId', (id: string) => {
      this.viewerId = id;
    });

this.hubConnection.on('OnLiveStarted', (title: string) => {
  console.log('Received OnLiveStarted with title:', title);
  this.streamStartedSource.next(title);
  this.streamTitleSubject.next(title);
  this.isLiveSubject.next(true);
});
    this.hubConnection.on('OnLiveEnded', () => {
      this.streamTitleSubject.next('');
      this.isLiveSubject.next(false);
    });

    this.hubConnection.on('ReceiveMessage', (user: string, message: string) => {
      this.messageSource.next({ user, message });
    });

    this.hubConnection.on('UserCountChanged', (count: number) => {
      this.userCountSource.next(count);
    });

    this.hubConnection.on('AnswerFromViewer', (viewerId: string, sdp: string) => {
      this.answerSource.next({ viewerId, sdp });
    });

    this.hubConnection.on('CandidateFromViewer', (fromId: string, candidate: string) => {
      this.candidateFromViewerSource.next({ fromId, candidate });
    });

    this.hubConnection.on('CandidateFromAdmin', (candidate: string) => {
      this.candidateFromAdminSource.next(candidate);
    });

    // بدء الاتصال
    this.hubConnection.start()
      .then(() => console.log('✅ SignalR Connected'))
      .catch(err => console.error('Error starting SignalR connection:', err));
  }

  get connection(): signalR.HubConnection {
    return this.hubConnection;
  }

  // دالة لإغلاق الاتصال
  stopConnection(): void {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.stop()
        .then(() => console.log('SignalR connection stopped'))
        .catch(err => console.error('Error stopping SignalR connection:', err));
    }
  }

  // التحقق من حالة الاتصال قبل الإرسال
  public ensureConnection(): Promise<void> {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return Promise.resolve();
    }
    return this.hubConnection.start()
      .then(() => console.log('SignalR connection re-established'))
      .catch(err => {
        console.error('Error re-establishing SignalR connection:', err);
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

  startLive(title: string): void {
    this.streamTitleSubject.next(title);
    this.isLiveSubject.next(true);
    this.hubConnection.invoke('StartLive', title)
      .catch(err => console.error('Error starting live:', err));
  }

  stopLive(): void {
    this.streamTitleSubject.next('');
    this.isLiveSubject.next(false);
    this.hubConnection.invoke('OnLiveEnded')
      .catch(err => console.error('Error stopping live:', err));
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

  async sendOfferToAdmin(sdp: string): Promise<void> {
    try {
      await this.ensureConnection();
      await this.hubConnection.invoke('SendOfferToAdmin', sdp);
    } catch (err) {
      console.error('Error sending offer to admin:', err);
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

  async sendAnswerToAdmin(sdp: string): Promise<void> {
    try {
      await this.ensureConnection();
      await this.hubConnection.invoke('ReceiveAnswerFromViewer', this.viewerId, sdp);
    } catch (err) {
      console.error('Error sending answer to admin:', err);
    }
  }
}
