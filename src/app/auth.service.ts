import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, map, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://visionrx.azurewebsites.net/CSOrderingDashboard/api/CSDashboard';
  private userDetails: any = null;
  dashboardDataUrl = 'https://visionrx.azurewebsites.net/CSOrderingDashboard/api/CSDashboard/Dashboard';
 private filefinderUrl = 'https://vrxfilefinder.azurewebsites.net/Filefinder/';
 
  private headers = new HttpHeaders({
    'Authorization': 'Basic VlJYQ1NEQkFQUDpWUlgoNWQ4QHBw',
    'Content-Type': 'application/json'
  });

    private headerss = new HttpHeaders({
    'Authorization': 'Basic YWRtaW46cGFzc3dvcmQ=',
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient, private router: Router) {}
  
    getFilefinderInfo(payload: {
    Customer_code: string;
    OCI_NO: string;
    POHD_SOURCE_REF: string;
  }): Observable<{ File_path: string; POPR_FILE_NAME: string }> {
    return this.http.post<{ File_path: string; POPR_FILE_NAME: string }>(
      this.filefinderUrl,
      payload,
      {responseType: 'json' as 'json'}
      
     
    );
  }
 // auth.service.ts
login(username: string, password: string): Observable<boolean> {
  const payload = { userid: username, userpassword: password };
  const options = { headers: this.headers };

  return this.http.post<any>(`${this.baseUrl}/LoginCredential`, payload, options).pipe(
    map(response => {
      const valid = response && response.id != null;
      if (valid) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userDetails', JSON.stringify(response));
        this.userDetails = response;
      }
      return valid;
    }),
    catchError(err => {
      console.error('Login error', err);
      return of(false);
    })
  );
}


  getCustomerList(): Observable<any[]> {
    const options = { headers: this.headers };
    const customerUrl = `${this.baseUrl}/LoadCustomer`;
    return this.http.get<any[]>(customerUrl, options);
  }


  logout(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userDetails');
    this.userDetails = null;
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  getUsername(): string {
    if (!this.userDetails) {
      const stored = localStorage.getItem('userDetails');
      this.userDetails = stored ? JSON.parse(stored) : null;
    }
    return this.userDetails?.userid || '';
  }

  getStoredUserDetails(): any {
    if (!this.userDetails) {
      const stored = localStorage.getItem('userDetails');
      this.userDetails = stored ? JSON.parse(stored) : null;
    }
    return this.userDetails;
  }
  getDashboardData(payload: any): Observable<any> {
    const options = { headers: this.headers };
    return this.http.post<any>(this.dashboardDataUrl, payload, options);
  }
  getNonReflectedOrders(payload: any): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}/NONReflectedOrders`, payload, { headers: this.headers });
  }
  searchOrder(payload: { cust_code: string; order_number: string }): Observable<any> {
  const url = `${this.baseUrl}/SearchOrder`;
  return this.http.post<any>(url, payload, { headers: this.headers });
}
// getCustomerCodesByDateRange(payload: { startDate: string; endDate: string }) {
//   return this.http.post<any[]>('http://localhost:3000/get_customer_codes_by_date_range', payload, {headers: this.headerss});
// }

}
