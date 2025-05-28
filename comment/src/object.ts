class girlFriend {
    name:string;
    age:number;
    character:string[];
    height:number;
    weight:number;

    constructor(name:string, age:number, character:string[], height:number, weight:number) {
        this.name = name;
        this.age = age;
        this.character = character;
        this.height = height;
        this.weight = weight;
    }
}

const MyGirlFriend = new girlFriend("小红", 18, ["温柔", "善良"], 160, 50);
console.log(MyGirlFriend);