const app = require("./app");
const DAO = require("./db/conn");
const db = new DAO();
const PORT = process.env.PORT || 3001;

(async function(){
  try{
    await db.connect("TimHortonsLocations", "locations");
    app.listen(PORT, () => {
      console.log("Server listening on port 3001!");
    });
  }catch(e){
    console.error(e);
  }

})();