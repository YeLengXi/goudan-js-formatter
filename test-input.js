// 测试输入文件 - 用于代码格式化工具改进

const add=(a,b)=>a+b;
const obj={name:"test",value:123};
const arr=[1,2,3,4,5];

function greet(name){
  console.log("Hello "+name);
  if(name){
    return true;
  }
  return false;
}

class Calculator{
  constructor(){
    this.result=0;
  }
  add(x){this.result+=x;return this;}
  multiply(x){this.result*=x;return this;}
}

const calc=new Calculator();
calc.add(5).multiply(2);

// 箭头函数测试
const double=x=>x*2;
users.map(u=>u.name);

// 对象测试
const config={debug:true,version:"2.0",features:["a","b","c"]};

// 链式调用
promise.then(x=>process(x)).catch(e=>handle(e)).finally(()=>cleanup());
