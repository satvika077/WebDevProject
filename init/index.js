const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URI = "mongodb://127.0.0.1:27017/wanderlust";
 main() 
 .then(()=>{
    console.log("conneted to DB");    
 })
 .catch((err)=>{
    console.log(err);
 });
 async function main(){
    await mongoose.connect(MONGO_URI);
 }

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({...obj, owner: "689f09c255e55194c301ada5",}));
  await Listing.insertMany(initData.data);
  console.log("Database initialized with sample data");
};

initDB();
