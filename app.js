const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname+"/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.use(express.static("public"));

mongoose.connect("mongodb+srv://bonafide1313:bonafide1313@cluster0.ocxae.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todo list"
})

const item2 = new Item({
  name: "Hit the + button to add a new item"
})

const item3 = new Item({
  name: "Hit check box to ckeck off completed item"
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/",function(req,res){
  day = date.getDate();

  Item.find({}, function(err, foundItems){
    if(err){
      console.log(err);
    }
    else{

      if(foundItems.length === 0)
      {
        Item.insertMany(defaultItems, function(err){
          if(err){
            console.log(err);
          }
          else{
            console.log("Inserted");
          }
        });
        res.redirect("/");
      }
      else{
        res.render("list",{listTitle: day, newItems: foundItems});
      }

    }
  })
});

app.get("/:listName", function(req,res){
  const listName = _.capitalize(req.params.listName);

  List.findOne({name: listName}, function(err, results){
    if(!err){
      if(!results){
        const list = new List({
          name: listName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+listName);
      }
      else{
        res.render("list", {listTitle: results.name, newItems: results.items});
      }
    }
  });
});


app.post("/", function(req,res){

  const item = req.body.newItem;
  const listName = req.body.list;
  const day = date.getDate();

  const newItem = new Item({
    name: item
  });

  if(listName === day){
    newItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});

app.post("/delete", function(req,res){
  const checkID = req.body.checkbox;
  const listName = req.body.listName;
  const day = date.getDate();

  if(listName === day){
    Item.findByIdAndRemove(checkID, function(err){
      if(err){
        console.log(err);
      }
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkID}}}, function(err){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}
app.listen(port,function(){
  console.log("Server up and running");
});
