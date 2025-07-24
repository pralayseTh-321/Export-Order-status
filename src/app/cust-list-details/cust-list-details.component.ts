import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-cust-list-details',
  templateUrl: './cust-list-details.component.html',
  styleUrls: ['./cust-list-details.component.scss']
})
export class CustListDetailsComponent implements OnInit {
  startDate: string = '';
  endDate: string = '';
  today: string = new Date().toISOString().split('T')[0];

  dropdownItems: string[] = []; // Filtered customer codes

  showFromDateError: boolean = false;
  showToDateError: boolean = false;

  userDetails: any;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userDetails = this.authService.getStoredUserDetails();
    if (this.userDetails) {
      this.loadCustomerList();
    }
  }

  loadCustomerList(): void {
    if (!this.userDetails) return;

    // Case 1: Only India = 1
    const { india, usa } = this.userDetails;

    if (india === '1' && usa === '0') {
      this.dropdownItems = ['EX/0000376', 'EX/0000203'];
      return;
    }

    // Case 2: India = 1 and USA = 1
    if (india === '1' && usa === '1') {
      this.authService.getCustomerList().subscribe((response: any[]) => {
        const filtered = response.filter(item =>
          (item.cust_code?.toUpperCase() || '').startsWith('AMR')
        );

        const amrCodes = filtered.map(item => item.cust_code);
        const hardcoded = ['EX/0000185'];
        this.dropdownItems = [...amrCodes, ...hardcoded];
      });
    }

    // You can extend further if needed
  }

  searchData(): void {
    this.showFromDateError = !this.startDate;
    this.showToDateError = !this.endDate;

    if (this.showFromDateError || this.showToDateError) return;

    const payload = {
      customerCodes: this.dropdownItems,
      startDate: this.startDate,
      endDate: this.endDate
    };

    console.log('Search Payload:', payload);

    // Call your API here if needed
    // this.fetchData(payload);
  }
}
