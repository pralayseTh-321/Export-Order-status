import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username = '';
  password = '';
  loginError = false;
  isLoading = false;
  showPassword: boolean = false;
  constructor(private authService: AuthService, private router: Router) {}

// login.component.ts
onLogin(): void {
  this.isLoading = true;
  this.authService.login(this.username, this.password)
    .subscribe(success => {
      this.isLoading = false;
      this.loginError = !success;
      if (success) {
        this.router.navigate(['/dashboard']);
      }
    });
}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
