import { Component, OnInit } from '@angular/core';
import { element } from 'protractor';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { Category } from '../shared/category.model'
import { CategoryService } from '../shared/category.service'

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {

  categories : Category[]=[];

  constructor(private categoryservice : CategoryService) { }

  ngOnInit() {
    this.categoryservice.getAll().subscribe(
      categories => this.categories = categories,
      error => alert ('Erro ao carregar listagem')
    )
  }

  deleteCategory(category : Category){
    const mustDelete=confirm('Deseja excluir este ítem?');

   if(mustDelete){
      this.categoryservice.delete(category.id).subscribe(
        ()=>this.categories= this.categories.filter(element=> element !=category),
        () => alert("Erro ao excluie!")
      )
    }
  }
  public alert()
  {
    alert("excluir");
  }

}
