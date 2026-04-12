A few types examples

```typescript

let n : number = 1;
n = 2;
n = 3;

let a : any;
a = "Hi";
a = 2;

let s : string = "Hi";
s = " ";
s = "hello " + "Mark";

let b : boolean = true;
b = false;

let x : { name: string };
x = { name: "John" };


let y : { name: string, surname: string };
y = { name: "Mary", surname: "Jane" };

x = y;

let r : Record<string, number>;

r = {
  one: 1,
  b: 4,
  x: 3
}

let arr : Array<number>;
arr = [1,2,3];
arr = [100, -10, 3 + 4];

let u : number | Array<number>;
u = 8;
u = [2,4]

type Person = { name: string, age: number }

let person : Person;

person = {
  name: "Karl",
  age: 55,
}


function add(x: number, y: number) {
  return x + y;
}

console.log(add(1, 2));
```
