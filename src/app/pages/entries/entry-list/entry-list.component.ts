import { BaseResourceListComponent } from './../../../shared/components/base-resource-list/base-resource-list/base-resource-list.component';
import { EntryService } from './../shared/entry.service';
import { Component } from '@angular/core';
import { Entry } from '../shared/entry.model';

@Component({
  selector: 'app-entry-list',
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.css']
})
export class EntryListComponent extends BaseResourceListComponent<Entry> {

  constructor(protected entryService: EntryService) {
    super(entryService);
  }
}
