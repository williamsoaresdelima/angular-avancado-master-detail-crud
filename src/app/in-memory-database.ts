import { InMemoryDbService} from "angular-in-memory-web-api";

export class InMemoryDatabase implements InMemoryDbService{

    createDb(){
        const categories = [
            { id: 1, name: "Lazer", description: "Piscina, Camping e Restaurante"},
            { id: 2, name: "Moradia", description: "Água e Luz"},
            { id: 3, name: "Salário", description: "Recebimento"},
            { id: 3, name: "Saúde", description: "Convênio Médico"}
        ];
        return { categories };
    }
}