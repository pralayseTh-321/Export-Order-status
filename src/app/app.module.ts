import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // 🛠️ ADD THIS
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ServiceWorkerModule } from '@angular/service-worker'; // 🛠️ ADD THIS
import { environment } from 'src/environments/environment';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { StatusComponent } from './status/status.component';
import { CustListDetailsComponent } from './cust-list-details/cust-list-details.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    MainLayoutComponent,
    StatusComponent,
    CustListDetailsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production
    })  
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
