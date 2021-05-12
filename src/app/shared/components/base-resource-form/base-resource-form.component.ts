import { BaseResourceService } from 'src/app/shared/services/base-resource.service';
import { BaseResourceModel } from 'src/app/shared/models/base-resource.model';
import { OnInit, AfterContentChecked, Injector, Directive } from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import toastr from 'toastr';

@Directive()
export abstract class BaseResourceFormComponent<T extends BaseResourceModel> implements OnInit, AfterContentChecked {
  currentAction: string;
  resourceForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm = false;

  protected activatedRoute: ActivatedRoute;
  protected router: Router;
  protected formBuilder: FormBuilder;

  constructor(
    protected injector: Injector,
    public resource: T, // new Category()
    protected resourceService: BaseResourceService<T>,
    protected jsonDataToResourceFn: (jsonData) => T
  ) {
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.router = this.injector.get(Router);
    this.formBuilder = this.injector.get(FormBuilder);
   }

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildResourceForm();
    this.loadResource();
  }

  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  submitForm(): void {
    this.submittingForm = true;

    if (this.currentAction === 'new') {
      this.createResource();
    } else {
      this.updateResource();
    }
  }

  protected setCurrentAction(): void {
    if (this.activatedRoute.snapshot.url[0].path === 'new') {
      this.currentAction = 'new';
    } else {
      this.currentAction = 'edit';
    }
  }

  protected loadResource(): void {
    if (this.currentAction === 'edit') {
      this.activatedRoute.paramMap.pipe(
        switchMap(params => this.resourceService.getById(+params.get('id')))
      )
      .subscribe(
        resource => {
          this.resource = resource;
          this.resourceForm.patchValue(this.resource);
        },
        error => alert('Erro ao alterar recurso: ' + error)
      );
    }
  }

  private setPageTitle(): void {
    if (this.currentAction === 'new') {
      this.pageTitle = this.creationPageTitle();
    } else {
      this.pageTitle = this.editionPageTitle();
    }
  }

  protected creationPageTitle(): string{
    return 'Novo';
  }

  protected editionPageTitle(): string{
    return 'Edição';
  }

  protected createResource(): void {
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);

    this.resourceService.create(resource)
      .subscribe(
        resourceCategory => this.actionsForSuccess(resourceCategory),
        error => this.actionsForError(error)
      );
  }

  protected updateResource(): void {
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);

    this.resourceService.update(resource)
      .subscribe(
        resourceResponse => this.actionsForSuccess(resourceResponse),
        error => this.actionsForError(error)
      );
  }

  protected actionsForSuccess(resource: T): void {
    toastr.success('Solicitação processada com sucesso!');

    const baseComponentPath: string = this.activatedRoute.snapshot.parent.url[0].path;

    // redirect/reload component page
    this.router.navigateByUrl(baseComponentPath, {skipLocationChange: true}).then(
      () => this.router.navigate([baseComponentPath, resource.id, 'edit'])
    );
  }

  protected actionsForError(error: any): void {
    toastr.error('Erro ao processar solicitação!');

    this.submittingForm = false;

    if (error.status === 422) {
      this.serverErrorMessages = JSON.parse(error._body).errors;
    } else {
      this.serverErrorMessages = ['Falha na comunicação com o servidor. Por favor, tente novamente mais tarde.'];
    }
  }

  protected abstract buildResourceForm(): void;
}
