import { Component, OnInit } from '@angular/core';
import { element } from 'protractor';
import { Entry } from '../shared/entry.model'
import { EntryService } from '../shared/entry.service'

@Component({
  selector: 'app-entry-list',
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.css']
})


export class EntryListComponent implements OnInit {

  entries : Entry[]=[];

  constructor(private entryservice : EntryService) { }

  ngOnInit() {

    console.log('Valor', this.entryservice.getAll())

    this.entryservice.getAll().subscribe(
      entries => this.entries = entries.sort((a,b) => b.id - a.id),
      error => alert ('Erro ao carregar listagem')
    )
  }

  deleteEntry(entry : Entry){
    const mustDelete=confirm('Deseja excluir este ítem?');

    if(mustDelete){
      this.entryservice.delete(entry.id).subscribe(
        ()=>this.entries= this.entries.filter(element=> element !=entry),
        () => alert("Erro ao excluie!")
      )
    }
  }
  public alert()
  {
    alert("excluir");
  }

}
