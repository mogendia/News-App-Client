import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import signalR from '@microsoft/signalr';

@Component({
  selector: 'app-admin-control',
  imports: [CommonModule,FormsModule],
  templateUrl: './admin-control.html',
  styleUrl: './admin-control.scss'
})
export class AdminControl implements OnInit {
  private hubConnection!: signalR.HubConnection;
  streamTitle: string = '';
  message: string = '';
  messages: { user: string, message: string }[] = [];

  ngOnInit(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7072/liveHub') // ✅ عدل حسب عنوان السيرفر
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => console.log('📡 SignalR Connected'))
      .catch(err => console.error('❌ SignalR Error:', err));

    this.hubConnection.on('ReceiveMessage', (user, msg) => {
      this.messages.push({ user, message: msg });
    });
  }

  startLive(): void {
    if (!this.streamTitle.trim()) {
      alert('يرجى إدخال عنوان للبث');
      return;
    }
    // إرسال رسالة بداية البث (إن أردت)
    this.hubConnection.invoke('SendMessage', 'Admin', `📺 بدء البث: ${this.streamTitle}`);
  }

  sendMessage(): void {
    if (this.message.trim()) {
      this.hubConnection.invoke('SendMessage', 'Admin', this.message)
        .catch(err => console.error('❌ إرسال الرسالة فشل', err));
      this.message = '';
    }
  }
}
