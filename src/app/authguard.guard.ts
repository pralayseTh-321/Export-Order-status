import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree,Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthguardGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
  
}
