import { Component, OnInit,AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { Entry } from "../shared/entry.model";
import { EntryService } from "../shared/entry.service";

import { Category } from "../../categories/shared/category.model";
import { CategoryService } from "../../categories/shared/category.service";

import { switchMap } from "rxjs/operators";

import toastr from "toastr";
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';


@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})

export class EntryFormComponent implements OnInit, AfterContentChecked {

  currencyAction: string;
  entryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[]=null;
  submittingForm: boolean=false;
  entry: Entry = new Entry();
  categories: Array<Category>;
  


  imaskConfig = {
    mask: Number,
    scale: 2,
    thousandsSeparator:'',
    padFractionalZeros:true,
    normalizeZeros:true,
    radix: ','
  };

  ptBR = {
    firstDayOfWeek: 0,
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
    dayNamesMin: ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sa'],
    monthNames: [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho',
      'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    today: 'Hoje',
    clear: 'Limpar'
  };

  constructor(
    private entryService: EntryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    this.setCurrentAction();
    this.loadEntry();
    this.buildEntryForm();
    this.loadCategories();
  }

  
  ngAfterContentChecked(){
    this.setPageTitle();
  }

  submitForm(){
    this.submittingForm = true;
    
    if(this.currencyAction == "new")
      this.createEntry();
    else
      this.updateEntry();
    //
  }

  get typeOptions() : Array<any>{
    return Object.entries(Entry.types).map(
      ([value, text]) => {
        return{
          text: text,
          value: value
        }
      }
    )
  }

  // PRIVATE METHODS
  private setCurrentAction(){
    if(this.route.snapshot.url[0].path=="new")
      this.currencyAction ="new";
    else
      this.currencyAction = "edit";
  }

  private buildEntryForm(){
    this.entryForm=this.formBuilder.group({
      id : [null],
      name : [null,[Validators.required,Validators.minLength(2)]],
      description : [null],
      type : ["expense",[Validators.required]],
      amount : [null,[Validators.required]],
      date : [null,[Validators.required]],
      paid : [true,[Validators.required]],
      categoryId : [null,[Validators.required]]
    });
  }

  private loadEntry(){
    if(this.currencyAction=="edit"){
      this.route.paramMap.pipe(
        switchMap(params => this.entryService.getById(+params.get("id"))),
        
      ).subscribe(
        (entry)=>{
          this.entry = entry;
          this.entryForm.patchValue(entry);//binds loadd entry data to EntryForms
        },(error) => alert('Ocorreu um erro no servidor!')
      )
    }
  }

  private loadCategories(){
    this.categoryService.getAll().subscribe(
      categories => this.categories = categories
    );
  }

  private setPageTitle(){
    if(this.currencyAction=="new")
      this.pageTitle = 'Cadastro Novo Lançamento';
    else{
      const entryName = this.entry.name || "";
      this.pageTitle = 'Editar Lançamento: ' + entryName;
    }
  }

  private createEntry(){
    const entry: Entry = Entry.fromJson(this.entryForm.value);

    this.entryService.create(entry)
    .subscribe(
      entry  => this.actionsForSuccess(entry),
      error => this.actionsForError(error)
    );
  }

  private updateEntry(){
    const entry: Entry = Entry.fromJson(this.entryForm.value);

    this.entryService.update(entry)
        .subscribe(
          entry   => this.actionsForSuccess(entry),
          error => this.actionsForError(error)
        );
  }

  private actionsForSuccess(entry: Entry){
    toastr.success("Soclicitação Processada com Sucesso!");
    
    //redirect/reload componentpage
    this.router.navigateByUrl("entries", {skipLocationChange:true}).then(
      () => this.router.navigate(["entries", entry.id, "edit"])
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
