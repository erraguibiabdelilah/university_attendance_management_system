import { Component, inject, input, output, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IconService, IconDirective } from '@ant-design/icons-angular';
import {
  BellOutline, SettingOutline, GiftOutline, MessageOutline, PhoneOutline,
  CheckCircleOutline, LogoutOutline, EditOutline, UserOutline, ProfileOutline,
  WalletOutline, QuestionCircleOutline, LockOutline, CommentOutline,
  UnorderedListOutline, ArrowRightOutline, GithubOutline, WarningOutline
} from '@ant-design/icons-angular/icons';
import { NgbDropdownModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { User } from '../../../../../shared/models/user';
import { NotificationService, AbsenceNotification } from '../../../../../shared/services/notification.service';

@Component({
  selector: 'app-nav-right',
  imports: [CommonModule, IconDirective, RouterModule, NgScrollbarModule, NgbNavModule, NgbDropdownModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent implements OnInit {
  private iconService = inject(IconService);
  private notificationService = inject(NotificationService);
  private route = inject(Router);

  styleSelectorToggle = input<boolean>();
  Customize = output();
  windowWidth: number;
  screenFull: boolean = true;
  user: User = new User();

  notifications: AbsenceNotification[] = [];

  constructor() {
    this.windowWidth = window.innerWidth;
    this.iconService.addIcon(
      ...[CheckCircleOutline, GiftOutline, MessageOutline, SettingOutline, PhoneOutline,
        LogoutOutline, UserOutline, EditOutline, ProfileOutline, QuestionCircleOutline,
        LockOutline, CommentOutline, UnorderedListOutline, ArrowRightOutline,
        BellOutline, GithubOutline, WalletOutline, WarningOutline]
    );
  }

  profile = [
    { icon: 'edit', title: 'Edit Profile' },
    { icon: 'user', title: 'View Profile' },
    { icon: 'profile', title: 'Social Profile' },
    { icon: 'wallet', title: 'Billing' },
    { icon: 'logout', title: 'Logout' }
  ];

  setting = [
    { icon: 'question-circle', title: 'Support' },
    { icon: 'user', title: 'Account Settings' },
    { icon: 'lock', title: 'Privacy Center' },
    { icon: 'comment', title: 'Feedback' },
    { icon: 'unordered-list', title: 'History' }
  ];

  ngOnInit() {
    this.loadUser();
    this.loadNotifications();
  }

  loadUser() {
    const raw = localStorage.getItem('user');
    if (raw) this.user = JSON.parse(raw);
  }

  loadNotifications() {
    this.notificationService.getAbsenceNotifications().subscribe((data) => {
      this.notifications = data;
    });
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.route.navigate(['/login']);
  }
}
