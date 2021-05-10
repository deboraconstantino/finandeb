import { BaseResourceService } from 'src/app/shared/services/base-resource.service';
import { Component, OnInit } from '@angular/core';
import { BaseResourceModel } from 'src/app/shared/models/base-resource.model';

@Component({
  selector: 'app-base-resource-list',
  templateUrl: './base-resource-list.component.html',
  styleUrls: ['./base-resource-list.component.css']
})
export class BaseResourceListComponent<T extends BaseResourceModel> implements OnInit {
  resources: T[] = [];

  constructor(protected resourceService: BaseResourceService<T>) { }

  ngOnInit(): void {
    this.resourceService.getAll().subscribe(
      resource => this.resources = resource.sort((a, b) => b.id - a.id),
      error => alert('Erro ao carregar a lista de lançamentos: ' + error)
    );
  }

  deleteResource(resource: T): void {
    const mustDelete = confirm('Deseja realmente excluir este item?');

    if (mustDelete) {
      this.resourceService.delete(resource.id).subscribe(
        () => this.resources = this.resources.filter(element => element !== resource),
        error => alert('Erro ao tentar excluir: ' + error)
      );
    }
  }
}
