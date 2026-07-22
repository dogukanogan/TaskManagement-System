import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { TaskListComponent } from './features/tasks/task-list/task-list.component';
import { TaskFormComponent } from './features/tasks/task-form/task-form.component';
import { TaskDetailComponent } from './features/tasks/task-detail/task-detail.component';
import { authGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { SettingsComponent } from './features/settings/settings.component';

export const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
    { path: 'tasks', component: TaskListComponent, canActivate: [authGuard] },
    { path: 'tasks/new', component: TaskFormComponent, canActivate: [authGuard] },
    { path: 'tasks/edit/:id', component: TaskFormComponent, canActivate: [authGuard] },
    { path: 'tasks/:id', component: TaskDetailComponent, canActivate: [authGuard] }
];