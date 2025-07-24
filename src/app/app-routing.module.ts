import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthguardGuard } from './authguard.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { StatusComponent } from './status/status.component';
import { CustListDetailsComponent } from './cust-list-details/cust-list-details.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // ✅ First go to login

  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthguardGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'status', component: StatusComponent },
      {path:'allcust', component: CustListDetailsComponent}
    ]
  },

  { path: '**', redirectTo: 'login' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
