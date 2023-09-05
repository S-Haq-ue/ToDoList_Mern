//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://*********@cluster0.utbum2w.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Flutter 3 module",
});
const item2 = new Item({
  name: "dart 3 module",
});
const item3 = new Item({
  name: "Mern 3 module",
});

const defualtItems = [item1, item2, item3,];

const listSchema = {
  name: String,
  items: [itemsSchema],
}

const List = mongoose.model("List", listSchema);

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  var foundList = List.findOne({ name: customListName });
  if (!foundList) {
    const list = new List({
      name: customListName,
      items: defualtItems,
    });

    list.save();
    res.redirect("/" + customListName);
  }
  else {
    res.redirect("list" + { listTitle: foundList.name, newListItems: foundList.items });
  }
});

app.get("/", async function (req, res) {

  foundItems = await Item.find({}).exec();
  if (foundItems.length == 0) {
    Item.insertMany(defualtItems);
    res.redirect("/");
  } else {
    res.render("list", { listTitle: "Today", newListItems: foundItems });
  }
  // console.log("these are the\n"+foundItems);
});

// app.get("/list", async function (req, res) {

//   foundItems = await List.find({}).exec();
//   console.log(foundItems);
//   res.render("lists", {newListsItems: foundItems});
//   // console.log("these are the\n"+foundItems);
// });

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.listName;
  const nItem = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    nItem.save();
    res.redirect("/");
    console.log("0000000000");
  } else {
    var foundList = List.findOne({ name: listName });
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  }
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", async function (req, res) {
  const checkboxItemId = req.body.checkbox;
  const listName = req.body.lName;
  // Item.findByIdAndRemove(checkboxItemId);
  if (listName == "Today") {
    const a = await Item.findById(checkboxItemId).exec();
    // console.log(checkboxItemId);
    await Item.deleteOne(a);
    res.redirect("/");
  } else {
    List.findByIdAndUpdate({ name: listName }, {
      $pull: {
        _id: checkboxItemId
      }
    }, function (err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }


});

app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server started on port 3000");
});
