import { Component, OnInit, HostListener } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit {
  customerCodes: string[] = [];
  filteredCustomerCodes: string[] = [];
  selectedCustomerCode = '';
  orderNumber = '';
  searchText = '';
  isDropdownOpen = false;
  searchResult: any = null;
  showError = false;
  errorMessage = '';
  isLoading = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadCustomerList();
  }

 loadCustomerList(): void {
  const userDetails = this.authService.getStoredUserDetails();
  if (!userDetails) return;

  this.authService.getCustomerList().subscribe((response: any[]) => {
    let filtered = [];

    // If user is admin, show all codes without filtering
    if (userDetails.userid === 'admin') {
      filtered = response;
    } else {
      filtered = response.filter(item => {
        const code = item.cust_code?.toUpperCase() || '';

        // Region-based filtering
        if (code.startsWith('EX') && userDetails.india === '0') return false;
        if (code.startsWith('CAN') && userDetails.canada === '0') return false;
        if (code.startsWith('AMR') && userDetails.usa === '0') return false;
        if (code.startsWith('DB') && userDetails.dubai === '0') return false;

        return true;
      });

      // Special rule for user 'ganesh'
      if (userDetails.userid === 'ganesh' && userDetails.india === '1') {
        const allowedGaneshCodes = ['EX/0000376', 'EX/0000203'];
        filtered = response.filter(item =>
          allowedGaneshCodes.includes(item.cust_code?.toUpperCase())
        );
      }

      // Special rule for user 'ranjit'
      if (userDetails.userid === 'ranjit' && userDetails.india === '1' && userDetails.usa === '1') {
        const allowedRanjitEXCodes = ['EX/0000185'];
        filtered = response.filter(item => {
          const code = item.cust_code?.toUpperCase() || '';
          return code.startsWith('AMR') || allowedRanjitEXCodes.includes(code);
        });
      }
    }

    this.customerCodes = filtered.map(item => item.cust_code);
    this.filteredCustomerCodes = [...this.customerCodes];
  });
}


  filterDropdown() {
    const lowerText = this.searchText.toLowerCase();
    this.filteredCustomerCodes = this.customerCodes.filter(c =>
      c.toLowerCase().includes(lowerText)
    );
  }

  selectCustomer(code: string) {
    this.selectedCustomerCode = code;
    this.searchText = code;
    this.isDropdownOpen = false;
  }

  onSearch() {
    if (!this.selectedCustomerCode || !this.orderNumber) {
      this.showError = true;
      this.errorMessage = 'Please select customer and enter order number.';
      return;
    }

    this.isLoading = true;

    const payload = {
      cust_code: this.selectedCustomerCode,
      order_number: this.orderNumber
    };

    this.authService.searchOrder(payload).subscribe({
      next: res => {
        this.searchResult = res;
        this.showError = false;
      },
      error: () => {
        this.searchResult = null;
        this.showError = true;
        this.errorMessage = 'Order not found or API error.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.position-relative')) {
      this.isDropdownOpen = false;
    }
  }
}
