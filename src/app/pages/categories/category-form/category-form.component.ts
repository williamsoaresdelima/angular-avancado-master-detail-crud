import { Component, OnInit,AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { Category } from "../shared/category.model";
import { CategoryService } from "../shared/category.service";

import { switchMap } from "rxjs/operators";

import toastr from "toastr";
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';


@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})

export class CategoryFormComponent implements OnInit, AfterContentChecked {

  currencyAction: string;
  categoryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[]=null;
  submittingForm: boolean=false;
  category: Category = new Category();

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.setCurrentAction();
    this.loadCategory();
    this.buildCategoryForm();
  }

  
  ngAfterContentChecked(){
    this.setPageTitle();
  }

  submitForm(){
    this.submittingForm = true;
    
    if(this.currencyAction == "new")
      this.createCategory();
    else
      this.updateCategory();
    //
  }


  // PRIVATE METHODS
  private setCurrentAction(){
    if(this.route.snapshot.url[0].path=="new")
      this.currencyAction ="new";
    else
      this.currencyAction = "edit";
  }

  private buildCategoryForm(){
    this.categoryForm=this.formBuilder.group({
      id : [null],
      name : [null,[Validators.required,Validators.minLength(2)]],
      description : [null]
    });
  }

  private loadCategory(){
    if(this.currencyAction=="edit"){


      this.route.paramMap.pipe(
        switchMap(params => this.categoryService.getById(+params.get("id"))),
        
      ).subscribe(
        (category)=>{
          this.category = category;
          this.categoryForm.patchValue(category);//binds loadd category data to CategoryForms
        },(error) => alert('Ocorreu um erro no servidor!')
      )
    }
  }

  private setPageTitle(){
    if(this.currencyAction=="new")
      this.pageTitle = 'Cadastro Nova Categoria';
    else{
      const categoryName = this.category.name || "";
      this.pageTitle = 'Editar Categoria: ' + categoryName;
    }
  }

  private createCategory(){
    const category: Category = Object.assign(new Category(), this.categoryForm.value);
    this.categoryService.create(category)
    .subscribe(
      category  => this.actionsForSuccess(category),
      error => this.actionsForError(error)
    );
  }

  private updateCategory(){
    const category: Category = Object.assign(new Category(), this.categoryForm.value);

    this.categoryService.update(category)
        .subscribe(
          category   => this.actionsForSuccess(category),
          error => this.actionsForError(error)
        );
  }

  private actionsForSuccess(category: Category){
    toastr.success("Soclicitação Processada com Sucesso!");
    
    //redirect/reload componentpage
    this.router.navigateByUrl("categories", {skipLocationChange:true}).then(
      () => this.router.navigate(["categories", category.id, "edit"])
    );
  }

  private actionsForError(error){
    toastr.error("Ocorreu um erro ao processar a sua solicitação! ");
    this.submittingForm = false;
    console.log(error);

    if(error.status == 422 ) // erro que retorna do servidor
    {
      this.serverErrorMessages = JSON.parse(error._body).errors;
      //retorna todos os erros num array de strings
    }else{
      this.serverErrorMessages = ["Falha na comunicação com o servidor, tente mais tarde!"];
    }
  }
}
