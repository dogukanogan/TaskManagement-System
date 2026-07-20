import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser$ = this.authService.currentUser$;
  
  isDarkTheme = false;
  isSidebarCollapsed = false;
  unreadCount = 2; // Demo unread count

  navItems = [
    { path: '/', icon: 'layout-dashboard', label: 'Dashboard' },
    { path: '/tasks', icon: 'check-square', label: 'Görevler' },
    { path: '/categories', icon: 'folder-open', label: 'Kategoriler' },
    { path: '/statistics', icon: 'bar-chart-2', label: 'İstatistikler' },
    { path: '/attachments', icon: 'paperclip', label: 'Ekler' },
    { path: '/comments', icon: 'message-square', label: 'Yorumlar' },
    { path: '/calendar', icon: 'calendar-days', label: 'Takvim' }
  ];

  ngOnInit() {
    // Check global html class for dark mode to sync state
    this.isDarkTheme = document.documentElement.classList.contains('dark');
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    if (this.isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
