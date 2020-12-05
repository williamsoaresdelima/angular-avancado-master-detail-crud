import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from "@angular/forms";

@Component({
  selector: 'app-form-field-error',
  template: `
    <p class="text-danger">
      {{errorMessage}}
    </p>

  `,
  styleUrls: ['./form-field-error.component.css']
})
export class FormFieldErrorComponent implements OnInit {

  @Input('form-control') formControl: FormControl;


  constructor() { }

  ngOnInit(): void {
  }

  public get errorMessage(): string | null{
    if(this.mustShowErrorMessage())
      return this.getErrorMessage();
    else
      return null;
  }

  private mustShowErrorMessage():boolean{
    return this.formControl.invalid && this.formControl.touched;
  }

  private getErrorMessage() : string | null{
    if(this.formControl.errors.required){
      return "Obrigatório!"
    }
    else if (this.formControl.errors.minlenght){
      const requiredLenght = this.formControl.errors.minlength.requiredLength;
      return `No mínimo ${requiredLenght} caracteres`;
    }
    else if (this.formControl.errors.maxlength){
      const requiredLenght = this.formControl.errors.maxlength.requiredLength;
      return `No máximo ${requiredLenght} caracteres`;
    }
    else if (this.formControl.errors.email){
      return "Formato email inválido";
    }
    



  }


}
