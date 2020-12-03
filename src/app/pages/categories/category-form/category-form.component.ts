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
    this.buildCategoryForm();
    this.loadCategory();
  }

  
  ngAfterContentChecked(){
    this.setPageTitle();
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
        switchMap(params => this.categoryService.getById(+params.get("id")))
      ).subscribe(
        (wcategory)=>{
          this.category = this.category;
          this.categoryForm.patchValue(this.category);//binds loadd category data to CategoryForms
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
}
