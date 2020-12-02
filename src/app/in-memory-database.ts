import { InMemoryDbService} from "angular-in-memory-web-api";
import { Category } from "./pages/categories/shared/category.model";

export class InMemoryDatabase implements InMemoryDbService{

    createDb(){
        const categories : Category [] = [
            { id: 1, name: "Lazer", description: "Piscina, Camping e Restaurante"},
            { id: 2, name: "Moradia", description: "Água e Luz"},
            { id: 3, name: "Salário", description: "Recebimento"},
            { id: 4, name: "Saúde", description: "Convênio Médico"}
        ];
        return { categories };
    }
}