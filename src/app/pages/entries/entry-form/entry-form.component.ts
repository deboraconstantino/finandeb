import { CategoryService } from './../../categories/shared/category.service';
import { EntryService } from './../shared/entry.service';
import { Component, OnInit, Injector } from '@angular/core';
import { Validators } from '@angular/forms';
import { Entry } from '../shared/entry.model';
import { Category } from '../../categories/shared/category.model';
import { BaseResourceFormComponent } from 'src/app/shared/components/base-resource-form/base-resource-form.component';

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class EntryFormComponent extends BaseResourceFormComponent<Entry> implements OnInit {
  categories: Array<Category>;

  imaskConfig = {
    mask: Number,
    scale: 2,
    thousandSeparator: '',
    padFractionalZeros: true,
    normalizeZeros: true,
    radiz: ','
  };

  constructor(
    protected entryService: EntryService,
    protected categoryService: CategoryService,
    protected injector: Injector
  ) {
    super(injector, new Entry(), entryService, Entry.fromJson);
  }

  ngOnInit(): void {
    this.loadCategories();
    super.ngOnInit();
  }

  get typeOptions(): Array<any> {
    return Object.entries(Entry.types).map(
      ([value, text]) => {
        return {
          text: text,
          value: value
        };
      }
    );
  }

  protected buildResourceForm(): void {
    this.resourceForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null],
      type: ['expense', [Validators.required]],
      amount: [null, [Validators.required]],
      date: [null, [Validators.required]],
      paid: [true, [Validators.required]],
      categoryId: [null, [Validators.required]],
    });
  }

  private loadCategories(): void {
    this.categoryService.getAll().subscribe(
      categories => this.categories = categories
    );
  }

  protected creationPageTitle(): string {
    return 'Cadastro de Novo Lançamento';
  }

  protected editionPageTitle(): string {
    const entryName = this.resource.name || '';
    return 'Editando lançamento: ' + entryName;
  }
}
