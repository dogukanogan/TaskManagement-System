import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatButtonModule, MatDividerModule, MatIconModule, MatMenuModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationComponent {
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
