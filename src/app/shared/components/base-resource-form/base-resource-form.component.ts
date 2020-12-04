import { OnInit,AfterContentChecked, Injector } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { BaseResourceModel } from "../../models/base-resource.model";
import { BaseResourceService } from "../../services/base-resource.service";

import { switchMap } from "rxjs/operators";

import toastr from "toastr";
import { THIS_EXPR, ThrowStmt } from '@angular/compiler/src/output/output_ast';


export abstract class BaseResouceFormComponent<T extends BaseResourceModel> implements OnInit, AfterContentChecked {

  currencyAction: string;
  resourceForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[]=null;
  submittingForm: boolean=false;
  

  protected route: ActivatedRoute;
  protected router: Router;
  protected formBuilder: FormBuilder;
    
  constructor(
    protected injector: Injector,
    public resource: T,
    protected resourceService: BaseResourceService<T>,
    protected jsonDataToResourceFn: (jsonData) => T
  ) { 
    this.route = this.injector.get(ActivatedRoute);
    this.router = this.injector.get(Router);
    this.formBuilder = this.injector.get(FormBuilder);
  }

  ngOnInit(): void {
    this.setCurrentAction();
    this.loadResource();
    this.buildResourceForm();
  }

  ngAfterContentChecked(){
    this.setPageTitle();
  }

  submitForm(){
    this.submittingForm = true;
    
    if(this.currencyAction == "new")
      this.createResource();
    else
      this.updateResource();
  }

  protected setCurrentAction(){
    if(this.route.snapshot.url[0].path=="new")
      this.currencyAction ="new";
    else
      this.currencyAction = "edit";
  }

  protected loadResource(){
    if(this.currencyAction=="edit"){
      this.route.paramMap.pipe(
        switchMap(params => this.resourceService.getById(+params.get("id"))),
      ).subscribe(
        (resource)=>{
          this.resource = resource;
          this.resourceForm.patchValue(resource);//binds loadd data data to resourceForm
        },(error) => alert('Ocorreu um erro no servidor!')
      )
    }
  }

  protected setPageTitle(){
    if(this.currencyAction=="new")
      this.pageTitle = this.creationPageTitle();
    else{
      this.pageTitle = this.editionPageTitle();
    }
   }
    
  protected editionPageTitle() : string {
        return "Edição";
  }

  protected creationPageTitle() : string {
        return "Novo";
  }

  protected createResource(){
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);
    
    this.resourceService.create(resource)
    .subscribe(
      resource  => this.actionsForSuccess(this.resource),
      error => this.actionsForError(error)
    );
  }

  protected updateResource(){
    const resource: this.jsonDataToResourceFn(this.resourceForm.value);

    this.resourceService.update(this.resource)
        .subscribe(
            resource   => this.actionsForSuccess(resource),
          error => this.actionsForError(error)
        );
  }

  protected actionsForSuccess(resource: T){
    toastr.success("Soclicitação Processada com Sucesso!");
    const baseComponentPath: string = this.route.snapshot.parent.url[0].path;
    
    //redirect/reload componentpage
    this.router.navigateByUrl(baseComponentPath, {skipLocationChange:true}).then(
      () => this.router.navigate([baseComponentPath, resource.id, "edit"])
    );
  }

  protected actionsForError(error){
    toastr.error("Ocorreu um erro ao processar a sua solicitação! ");
    this.submittingForm = false;
    console.log(error);

    if(error.status == 422 ) // erro que retorna do servidor
    {
      this.serverErrorMessages = JSON.parse(error._body).errors;
    }else{
      this.serverErrorMessages = ["Falha na comunicação com o servidor, tente mais tarde!"];
    }
  }

  protected abstract buildResourceForm():void;

}
