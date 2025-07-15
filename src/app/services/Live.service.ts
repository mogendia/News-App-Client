import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LiveService {
  private connectionUrl = 'https://localhost:7072/liveHub';
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

  startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.connectionUrl)
      .withAutomaticReconnect()
      .build();
    this.hubConnection.on('ReceiveViewerId', (id: string) => {
      this.viewerId = id;
    });
    this.hubConnection.on('OnLiveStarted', (title: string) => {
      this.streamStartedSource.next(title);
    });
    this.hubConnection.start().then(() => console.log('✅ SignalR Connected'));

    this.hubConnection.on('OnLiveStarted', (title: string) => {
      this.streamStartedSource.next(title);
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
  }

  get connection(): signalR.HubConnection {
    return this.hubConnection;
  }

  sendMessage(user: string, message: string): void {
    this.hubConnection.invoke('SendMessage', user, message);
  }

  startLive(title: string): void {
  this.streamTitleSubject.next(title);
  this.isLiveSubject.next(true);
  }

  stopLive(): void {
  this.streamTitleSubject.next('');
  this.isLiveSubject.next(false);
 }

  sendOffer(viewerId: string, sdp: string): void {
    this.hubConnection.invoke('SendOfferToViewer', viewerId, sdp);
  }

  sendCandidate(viewerId: string, candidate: string): void {
    this.hubConnection.invoke('SendCandidateToViewer', viewerId, candidate);
  }

  sendViewerId(): void {
    this.hubConnection.invoke('GetViewerId');
  }

  sendOfferToAdmin(sdp: string): void {
    this.hubConnection.invoke('SendOfferToAdmin', sdp);
  }

  sendCandidateToAdmin(candidate: string): void {
    this.hubConnection.invoke('SendCandidateToAdmin', candidate);
  }
  sendAnswerToAdmin(sdp: string): void {
  this.connection.invoke('ReceiveAnswerFromViewer', this.viewerId, sdp)
    .catch(err => console.error('Error sending answer to admin:', err));
}

}
