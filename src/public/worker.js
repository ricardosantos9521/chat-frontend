self.addEventListener("message", ()=>{
    console.log("teste");
    self.postMessage("teste");
});