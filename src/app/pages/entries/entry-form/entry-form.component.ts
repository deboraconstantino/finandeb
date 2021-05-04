import { CategoryService } from './../../categories/shared/category.service';
import { EntryService } from './../shared/entry.service';
import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Entry } from '../shared/entry.model';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import toastr from 'toastr';
import { Category } from '../../categories/shared/category.model';

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class EntryFormComponent implements OnInit, AfterContentChecked {
  currentAction: string;
  entryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm = false;
  entry: Entry = new Entry();
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
    private entryService: EntryService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildEntryForm();
    this.loadEntry();
    this.loadCategories();
  }

  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  submitForm(): void {
    this.submittingForm = true;

    if (this.currentAction === 'new') {
      this.createEntry();
    } else {
      this.updateEntry();
    }
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

  private setCurrentAction(): void {
    if (this.activatedRoute.snapshot.url[0].path === 'new') {
      this.currentAction = 'new';
    } else {
      this.currentAction = 'edit';
    }
  }

  private buildEntryForm(): void {
    this.entryForm = this.formBuilder.group({
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

  private loadEntry(): void {
    if (this.currentAction === 'edit') {
      this.activatedRoute.paramMap.pipe(
        switchMap(params => this.entryService.getById(+params.get('id')))
      )
      .subscribe(
        entry => {
          this.entry = entry;
          this.entryForm.patchValue(this.entry);
        },
        error => alert('Erro ao alterar lançamento: ' + error)
      );
    }
  }

  private setPageTitle(): void {
    if (this.currentAction === 'new') {
      this.pageTitle = 'Cadastro de Novo Lançamento';
    } else {
      const entryName = this.entry.name || '';
      this.pageTitle = 'Editando lançamento: ' + entryName;
    }
  }

  private createEntry(): void {
    const entry: Entry = Entry.fromJson(this.entryForm.value);

    this.entryService.create(entry)
      .subscribe(
        entryResponse => this.actionsForSuccess(entryResponse),
        error => this.actionsForError(error)
      );
  }

  private updateEntry(): void {
    const entry: Entry = Entry.fromJson(this.entryForm.value);

    this.entryService.update(entry)
      .subscribe(
        entryResponse => this.actionsForSuccess(entryResponse),
        error => this.actionsForError(error)
      );
  }

  private actionsForSuccess(entry: Entry): void {
    toastr.success('Solicitação processada com sucesso!');

    // redirect/reload component page
    this.router.navigateByUrl('entries', {skipLocationChange: true}).then(
      () => this.router.navigate(['entries', entry.id, 'edit'])
    );
  }

  private actionsForError(error: any): void {
    toastr.error('Erro ao processar solicitação!');

    this.submittingForm = false;

    if (error.status === 422) {
      this.serverErrorMessages = JSON.parse(error._body).errors;
    } else {
      this.serverErrorMessages = ['Falha na comunicação com o servidor. Por favor, tente novamente mais tarde.'];
    }
  }

  private loadCategories(): void {
    this.categoryService.getAll().subscribe(
      categories => this.categories = categories
    );
  }
}
