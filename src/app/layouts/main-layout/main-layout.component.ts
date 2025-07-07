import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  isExpanded = true;
  loggedInUserName = '';
  isProfilePopupOpen = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loggedInUserName = this.authService.getUsername(); 
    
  }

  toggleSidenav() {
    this.isExpanded = !this.isExpanded;
  }

  toggleProfilePopup() {
    this.isProfilePopupOpen = !this.isProfilePopupOpen;
  }

  logout() {
    this.authService.logout();
  }

  // 🛠️ Close popup if clicked outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-popup') && !target.closest('button')) {
      this.isProfilePopupOpen = false;
    }
  }
}
