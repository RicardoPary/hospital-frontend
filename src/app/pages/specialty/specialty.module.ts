// ANGULAR
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
// ANGULAR MATERIAL
import {CdkTableModule} from '@angular/cdk/table';
// AG-GRID
import {AgGridModule} from 'ag-grid-angular';
// Modules
import {SharedLibsModule} from '../../shared/shared-libs.module';
import {ScrollbarModule} from '../../core/scrollbar/scrollbar.module';
import {PageHeaderModule} from '../../core/page-header/page-header.module';
import {BreadcrumbsModule} from '../../core/breadcrumbs/breadcrumbs.module';
import {SharedMaterialModule} from '../../shared/shared-material.module';
import {ValidationModule} from '../../core/validated-input/validation.module';
import {SharedActionsTableModule} from '../../shared/shared-actions-table.module';
// COMPONENTS
import {AlertComponent} from '../../shared/modules/alert/alert.component';
// OTHERS
import {SpecialtyComponent} from './specialty.component';
import {SpecialtyFormComponent} from './specialty-form/specialty-form.component';
import {DoctorService} from '../doctor/store/services/doctor.service';
import {ActionButtonComponent} from '../../shared/components/action-button.component';

const routes: Routes = [
  {path: '', component: SpecialtyComponent}
];

@NgModule({
  imports: [
    SharedLibsModule,
    SharedMaterialModule,
    SharedActionsTableModule,
    ScrollbarModule,
    PageHeaderModule,
    BreadcrumbsModule,
    ValidationModule,
    CdkTableModule,
    RouterModule.forChild(routes),
    AgGridModule.withComponents([ActionButtonComponent])
  ],
  declarations: [
    SpecialtyComponent,
    SpecialtyFormComponent
  ],
  providers: [
    DoctorService
  ],
  entryComponents: [
    AlertComponent
  ]
})

export class SpecialtyModule {
}
