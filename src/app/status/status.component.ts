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

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadCustomerList();
  }

  loadCustomerList() {
    const userDetails = this.authService.getStoredUserDetails();
    this.authService.getCustomerList().subscribe(customers => {
      const filtered = customers.filter(item => {
        const code = item.cust_code?.toUpperCase() || '';
        if (code.startsWith('EX') && userDetails.india === '0') return false;
        if (code.startsWith('CAN') && userDetails.canada === '0') return false;
        if (code.startsWith('AMR') && userDetails.usa === '0') return false;
        return true;
      });
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
