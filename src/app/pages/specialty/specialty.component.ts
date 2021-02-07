// ANGULAR
import {FormBuilder, FormGroup} from '@angular/forms';
import {Component, Inject, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
// ANGULAR MATERIAL
import {MatDialog} from '@angular/material/dialog';
// RXJS
import {filter, map, tap} from 'rxjs/operators';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
// NGRX
import {State} from '../../reducers/index';
import * as hospitalActions from './store/specialty.actions';
import {Action, ActionsSubject, Store} from '@ngrx/store';
// SERVICES
import {SpecialtyService} from './store/services/specialty.service';
// COMPONENTS
import {AlertComponent} from '../../shared/modules/alert/alert.component';
// OTHERS
import {ROUTE_TRANSITION} from '../../app.animation';
import {AppConfig} from '../../shared/models/app-config.model';
import {HospitalFilter} from './store/models/specialty-filter.model';
import {ActionButtonComponent} from '../../shared/components/action-button.component';

const initFilter: HospitalFilter = {
  name: '',
  page: 0,
  size: 50,
  sort: ''
};

@Component({
  templateUrl: './specialty.component.html',
  animations: [...ROUTE_TRANSITION],
  host: {'[@routeTransition]': ''},
  encapsulation: ViewEncapsulation.None
})

export class SpecialtyComponent implements OnInit, OnDestroy {

  // AG-GRID CONFIG
  private gridApi;
  private gridColumnApi;
  public columnDefs;
  public autoGroupColumnDef;
  public rowSelection;
  public rowGroupPanelShow;
  public pivotPanelShow;
  public paginationPageSize;
  public paginationNumberFormatter;
  public defaultColDef;
  public context;
  public frameworkComponents;

  // FILTER SUBS
  filter: HospitalFilter;
  isLoadingFilter = new BehaviorSubject<boolean>(false);

  // OTHERS
  sidenavOpen$: Observable<boolean>;
  filterOpen$: Observable<boolean>;
  actionSubs: Subscription[] = [];
  filterForm: FormGroup;

  subs: Subscription;

  constructor(public dialog: MatDialog,
              private store: Store<State>,
              private actions: ActionsSubject,
              private formBuilder: FormBuilder,
              private mappingService: SpecialtyService,
              @Inject('config') private config: AppConfig) {

    // FILTER FORM CONFIG
    this.filterForm = this.formBuilder.group({
      name: null
    });

    // AG-GRID CONFIG
    this.columnDefs = [
      {headerName: 'Id', field: 'id'},
      {headerName: 'Name', field: 'name'},
      {headerName: 'Description', field: 'description'},
      {headerName: 'Doctor', field: 'doctor', valueGetter: p => p?.data?.doctor?.firstName + '-' + p?.data?.doctor?.lastName},
      {headerName: 'Icon', field: 'icon'},
      {headerName: 'createdBy', field: 'createdBy'},
      {headerName: 'createdDate', field: 'createdDate'},
      {headerName: 'lastModifiedBy', field: 'lastModifiedBy'},
      {headerName: 'lastModifiedDate', field: 'lastModifiedDate'},
      {headerName: 'Actions', cellRenderer: 'editButtonComponent', pinned: 'right'}
    ];

    this.context = {componentParent: this};
    this.frameworkComponents = {
      editButtonComponent: ActionButtonComponent
    };

    this.defaultColDef = {
      editable: false,
      enableRowGroup: true,
      suppressSizeToFit: true,
      enablePivot: true,
      enableValue: true,
      sortable: true,
      resizable: true
    };

  }

  ngOnInit(): void {

    // SUBS
    this.sidenavOpen$ = this.store.select(s => s.appSpecialty.sidenavOpen);
    this.filterOpen$ = this.store.select(s => s.appSpecialty.filterOpen);

    // SET FILTER SUBS
    this.actionSubs.push(this.actions.pipe(
      filter(s => s.type === hospitalActions.HospitalActionTypes.SetFilter),
      map((s: any) => s.payload.filter),
      tap((filter: HospitalFilter) => {
        this.filter = Object.assign({}, filter);
        this.isLoadingFilter.next(false);
        this.subs = this.mappingService.list(filter).subscribe(data => this.gridApi.setRowData(data.body));
      })
    ).subscribe());

    // ADD UPDATE DELETE HOSPITAL SUCCESS
    this.actionSubs.push(this.actions.pipe(
      filter(s =>
        s.type === hospitalActions.HospitalActionTypes.AddSuccess ||
        s.type === hospitalActions.HospitalActionTypes.UpdateSuccess ||
        s.type === hospitalActions.HospitalActionTypes.DeleteSuccess
      ),
      tap(() => {
        this.store.dispatch(new hospitalActions.CloseSidenav());
        this.store.dispatch(new hospitalActions.SetFilter({filter: initFilter}));
      })
    ).subscribe());

  }

  ngOnDestroy(): void {
    this.subs?.unsubscribe();
    this.actionSubs.forEach(subs => subs.unsubscribe());
  }

  actionButtonRowTable(event): void {
    if (event.type === 'edit') {
      this.store.dispatch(new hospitalActions.GetHospitalAction({id: event.row.id}));
      this.store.dispatch(new hospitalActions.OpenSidenav({addStatus: 'edit'}));
    }
    if (event.type === 'delete') {
      const dialogRef = this.dialog.open(AlertComponent, {
        data: {
          title: 'Delete Confirmation!',
          type: 'warning',
          message: 'Would you like to remove ? ' + event.row.id
        }
      });
      dialogRef.afterClosed().subscribe(res => {
        res === true ? this.store.dispatch(new hospitalActions.DeleteAction({id: event.row.id})) : '';
      });
    }
  }

  onGridReady(params): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    params.api.sizeColumnsToFit();
    this.store.dispatch(new hospitalActions.SetFilter({filter: initFilter}));
  }

  onApply(): void {
    this.isLoadingFilter.next(true);
    this.store.dispatch(new hospitalActions.SetFilter({
      filter: {
        ...this.filter,
        name: this.filterForm.value.name
      }
    }));
  }

  onAdd(): void {
    this.store.dispatch(new hospitalActions.OpenSidenav({addStatus: 'new'}));
  }

  onReset(): void {
    this.store.dispatch(new hospitalActions.CloseFilter());
    this.store.dispatch(new hospitalActions.SetFilter({filter: initFilter}));
  }

  clickOnFilter(hiddenFilter): void {
    if (hiddenFilter) {
      this.store.dispatch(new hospitalActions.OpenFilter());
    } else {
      this.store.dispatch(new hospitalActions.CloseFilter());
    }
  }

}
