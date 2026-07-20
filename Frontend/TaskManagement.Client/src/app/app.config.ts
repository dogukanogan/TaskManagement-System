import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { 
  LucideAngularModule, 
  CheckSquare, AlertCircle, Mail, Lock, Eye, EyeOff, Check, RefreshCw, ArrowRight, User, 
  LayoutDashboard, FolderOpen, BarChart2, Paperclip, MessageSquare, CalendarDays, 
  Settings, Sun, Moon, PanelLeft, LogOut, Home, ChevronRight, Search, Plus, Bell, 
  Target, Activity, Flame, CheckCircle2, List, Clock 
} from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor])),
    importProvidersFrom(LucideAngularModule.pick({ 
      CheckSquare, AlertCircle, Mail, Lock, Eye, EyeOff, Check, RefreshCw, ArrowRight, User, 
      LayoutDashboard, FolderOpen, BarChart2, Paperclip, MessageSquare, CalendarDays, 
      Settings, Sun, Moon, PanelLeft, LogOut, Home, ChevronRight, Search, Plus, Bell, 
      Target, Activity, Flame, CheckCircle2, List, Clock 
    }))
  ]
};
