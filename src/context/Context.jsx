//custom context for task management
// import { createContext, useState } from "react";

// export const CounterContext = createContext();

// export function CounterProvider({ children }) {
//   let [count,setcount]=useState(0);

//   function decrement(){
//     if(count===0){
//       return;
//     }
//     setcount(count-1);
//   }
//   function increment(){
//     setcount(count+1);
//   }
//   return (
//     <CounterContext.Provider value={{ count, decrement, increment }}>
//       {children}
//     </CounterContext.Provider>
//   );
// }
