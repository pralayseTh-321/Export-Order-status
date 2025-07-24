import { Component, OnInit, HostListener } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  dropdownItems: string[] = [];
  filteredItems: string[] = [];
  searchText = '';
  isDropdownOpen = false;
  selectedCustomerCode: string = '';
  showAccordion = false;
  accordionExpanded = false;
  selectedCustomerData: any = null;
  displayData = false;
  dateRangeInput: string = '';
  startDate: string = '';
  endDate: string = '';
  showCustomerError = false;
  showFromDateError = false;
  showToDateError = false;
  isLoading = false;
  today: string = new Date().toISOString().split('T')[0];
  showAlert = false;
  alertMessage = '';
  sampleOrderData: any[] = [];
  nonReflectedRawData: any[] = [];
  uniqueEntryDates: string[] = [];
  selectedEntryDate: string = 'ALL';
 downloadingXmlRows = new Set<string>();
  // Optional: Map known status codes to badge styles
  statusBadgeMap: { [code: string]: string } = {
    '0': 'bg-secondary text-white',         // General pending
    '1': 'bg-dark text-white',            // Waiting
    '2': 'bg-info text-dark',               // In progress
    '3': 'bg-primary text-white',           // Under review
    '4': 'bg-warning text-dark',              // Hold / On hold
    '5': 'bg-light text-dark',              // Not started / unknown
    '6': 'bg-success text-white',           // Completed / approved
    '7': 'bg-warning text-dark',            // Batch processing / queued
    '8': 'bg-danger text-white',            // Rejected / error
    '9': 'bg-info text-white',              // Dispatched
    'W': 'bg-warning text-dark',            // Waiting
    'E': 'bg-danger text-white',            // Error
    'S': 'bg-success text-white'            // Success / Shipped
  };
  

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadCustomerList();
  }

  loadCustomerList(): void {
    const userDetails = this.authService.getStoredUserDetails();
    if (!userDetails) return;
    this.authService.getCustomerList().subscribe((response: any[]) => {
      const filtered = response.filter(item => {
        const code = item.cust_code?.toUpperCase() || '';
        if (code.startsWith('EX') && userDetails.india === '0') return false;
        if (code.startsWith('CAN') && userDetails.canada === '0') return false;
        if (code.startsWith('AMR') && userDetails.usa === '0') return false;
        if (code.startsWith('DB') && userDetails.dubai === '0') return false;
        return true;
      });
      this.dropdownItems = filtered.map(item => item.cust_code);
      this.filteredItems = [...this.dropdownItems];
    });
  }

  filterDropdown() {
    const text = this.searchText.toLowerCase();
    this.filteredItems = this.dropdownItems.filter(item => item.toLowerCase().includes(text));
  }

  selectItem(item: string) {
    this.searchText = item;
    this.selectedCustomerCode = item;
    this.isDropdownOpen = false;
    this.dateRangeInput = '';
    this.startDate = '';
    this.endDate = '';
  }

  showValidationAlert(message: string) {
    this.alertMessage = message;
    this.showAlert = true;
    setTimeout(() => this.showAlert = false, 3000);
  }

  closeAlert() {
    this.showAlert = false;
  }

  searchData() {
    if (!this.selectedCustomerCode) return this.showValidationAlert('Please select a customer.');
    if (!this.startDate) return this.showValidationAlert('From date is required.');
    if (!this.endDate) return this.showValidationAlert('To date is required.');

    const payload = {
      cust_code: this.selectedCustomerCode,
      from_date: this.startDate,
      to_date: this.endDate
    };

    this.isLoading = true;

    this.authService.getDashboardData(payload).subscribe({
      next: (response) => {
        this.selectedCustomerData = {
          dispatchCount: response.webservice_ordercount,
          pendingCount: response.webax_ordercount,
          cancelCount: response.non_reflectedordercount
        };
        this.displayData = true;
        this.showAccordion = false;
        this.accordionExpanded = false;
      },
      error: () => this.showValidationAlert('Something went wrong.'),
      complete: () => this.isLoading = false
    });
  }

  toggleAccordion() {
    if (!this.selectedCustomerCode || !this.startDate || !this.endDate) {
      this.showValidationAlert('Select customer and valid date range first.');
      return;
    }
  
    const payload = {
      cust_code: this.selectedCustomerCode,
      from_date: this.startDate + ' 00:00:00',
      to_date: this.endDate + ' 23:59:59'
    };
  
    this.isLoading = true;
  
    this.authService.getNonReflectedOrders(payload).subscribe({
      next: (response) => {
        this.nonReflectedRawData = response;
  
        // Extract distinct dates
        const dateSet = new Set(
          response.map(item => item.entry_date.split(' ')[0])
        );
        this.uniqueEntryDates = ['ALL', ...Array.from(dateSet)];
        this.selectedEntryDate = 'ALL';
  
        this.applyDateFilter();
  
        this.showAccordion = true;
        this.accordionExpanded = true;
      },
      error: () => this.showValidationAlert('Failed to load non-reflected orders.'),
      complete: () => this.isLoading = false
    });
  }
 applyDateFilter() {
  if (!this.selectedEntryDate || this.selectedEntryDate === 'ALL') {
    this.sampleOrderData = this.nonReflectedRawData.map(item => ({
      orderNo: item.order_number,
      statusCode: item.status_code,
      statusDesc: item.status_desc,
      entryDate: item.entry_date // ⬅ added
    }));
  } else {
    this.sampleOrderData = this.nonReflectedRawData
      .filter(item => item.entry_date.startsWith(this.selectedEntryDate))
      .map(item => ({
        orderNo: item.order_number,
        statusCode: item.status_code,
        statusDesc: item.status_desc,
        entryDate: item.entry_date // ⬅ added
      }));
  }
}

downloadCSV(): void {
  if (!this.sampleOrderData || this.sampleOrderData.length === 0) {
    alert("No data available to export.");
    return;
  }

  const headers = ['Order No', 'Status Description', 'Entry Date'];
  const rows = this.sampleOrderData.map(order =>
    [order.orderNo, order.statusDesc, order.entryDate]
  );

  const csvContent = [headers, ...rows]
    .map(e => e.map(val => `"${(val ?? '').toString().replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "non_reflected_orders.csv");
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

 downloadXmlRow(order: {
    orderNo: string;
    statusCode: string;
    statusDesc: string;
    entryDate: string;
  }) {
    const key = order.orderNo;
    const payload = {
      Customer_code: this.selectedCustomerCode,
      OCI_NO: '',
      POHD_SOURCE_REF: key
    };

    // Mark this row as loading
    this.downloadingXmlRows.add(key);

    this.authService.getFilefinderInfo(payload).pipe(
      finalize(() => {
        // Remove the loading flag when done (success or error)
        this.downloadingXmlRows.delete(key);
      })
    ).subscribe({
      next: (res) => {
        let info: { File_path: string; POPR_FILE_NAME: string };
        if (typeof res === 'string') {
          try {
            info = JSON.parse(res);
          } catch {
            return this.showValidationAlert('Invalid JSON from filefinder API');
          }
        } else {
          info = res;
        }

        const filename = info.POPR_FILE_NAME;
        if (!filename) {
          return this.showValidationAlert('No file name returned by server.');
        }

        const blobUrl =
          'https://gkbftpdiag289.blob.core.windows.net/filefinderapp/' +
          filename;

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      error: () => this.showValidationAlert('Failed to fetch XML location.')
    });
  }



  logout(): void {
    this.authService.logout();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.position-relative')) {
      this.isDropdownOpen = false;
    }
  }

  toggleExpandAccordion() {
    this.accordionExpanded = !this.accordionExpanded;
  }

  onCancelCountClick(event: MouseEvent) {
    event.stopPropagation();
    this.toggleAccordion();
  }

  getStatusBadgeClass(statusCode: string): string {
    return this.statusBadgeMap[statusCode] || 'bg-light text-dark';
  }
}
