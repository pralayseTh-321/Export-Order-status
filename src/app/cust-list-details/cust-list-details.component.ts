import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-cust-list-details',
  templateUrl: './cust-list-details.component.html',
  styleUrls: ['./cust-list-details.component.scss']
})
export class CustListDetailsComponent implements OnInit {
  from_date: string = '';
  to_date: string = '';
  searchResults: any[] = [];
  isLoading: boolean = false;
  sortColumn: string = '';
sortDirection: 'asc' | 'desc' = 'asc';
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

  this.authService.getCustomerList().subscribe((response: any[]) => {
    let filtered: any[] = [];

    // ✅ Show all codes if user is 'admin'
    if (this.userDetails.userid === 'admin') {
      filtered = response;
    } else {
      // ✅ Region-based filtering
      filtered = response.filter(item => {
        const code = item.cust_code?.toUpperCase() || '';
        if (code.startsWith('EX') && this.userDetails.india === '0') return false;
        if (code.startsWith('CAN') && this.userDetails.canada === '0') return false;
        if (code.startsWith('AMR') && this.userDetails.usa === '0') return false;
        if (code.startsWith('DB') && this.userDetails.dubai === '0') return false;
        return true;
      });

      // ✅ Special case: ganesh => only specific EX codes
      if (this.userDetails.userid === 'ganesh' && this.userDetails.india === '1') {
        const allowedGaneshCodes = ['EX/0000376', 'EX/0000203'];
        filtered = response.filter(item =>
          allowedGaneshCodes.includes(item.cust_code?.toUpperCase())
        );
      }

      // ✅ Special case: ranjit => all AMR + limited EX
      if (this.userDetails.userid === 'ranjit' && this.userDetails.india === '1' && this.userDetails.usa === '1') {
        const allowedRanjitEXCodes = ['EX/0000185'];
        filtered = response.filter(item => {
          const code = item.cust_code?.toUpperCase() || '';
          return code.startsWith('AMR') || allowedRanjitEXCodes.includes(code);
        });
      }
    }

    this.dropdownItems = filtered.map(item => item.cust_code);
  });
}



searchData(): void {
  this.showFromDateError = !this.from_date;
  this.showToDateError = !this.to_date;

  if (this.showFromDateError || this.showToDateError) return;

  const formattedFromDate = `${this.from_date} 00:00:00`;
  const formattedToDate = `${this.to_date} 23:59:59`;
  const custCodeString = this.dropdownItems.join(',');

  const payload = {
    cust_code: custCodeString,
    from_date: formattedFromDate,
    to_date: formattedToDate
  };

  console.log('Formatted Payload:', payload);
  this.isLoading = true;

  this.authService.getAllCustomersOrders(payload).subscribe({
    next: (res) => {
      this.searchResults = res || [];
      this.isLoading = false;
    },
    error: (err) => {
      console.error('❌ API Error:', err);
      this.searchResults = [];
      this.isLoading = false;
    }
  });
}
sortData(column: string): void {
  if (this.sortColumn === column) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }

  this.searchResults.sort((a, b) => {
    const valueA = a[column];
    const valueB = b[column];

    if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
}
downloadCSV(): void {
  if (!this.searchResults.length) return;

  const headers = ['Customer Code', 'Order Number', 'Entry Date', 'OCI Number', 'Status'];
  const rows = this.searchResults.map(item => [
    item.cust_code,
    item.order_number,
    item.entry_date,
    item.oci_no,
    item.status_desc
  ]);

  let csvContent = '';
  csvContent += headers.join(',') + '\n';
  rows.forEach(row => {
    csvContent += row.map(field => `"${field}"`).join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `CustomerOrders_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

}
