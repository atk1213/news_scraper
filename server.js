const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
let path = require("path");

let Note = require("./models/note.js");
let Article = require("./models/article.js");

const cheerio = require("cheerio");
const request = require("request");

const app = express();
// let PORT = 3000;
let PORT = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: false }));

const exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({
    defaultLayout: "main",
}));
app.set("view engine", "handlebars");

app.use(express.static("public"));

mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/scraper");
// mongoose.connect("mongodb://heroku");

var db = mongoose.connection;

db.once("open", function () {
    console.log("Mongoose connection successful.");
});

app.get("/", function (req, res) {
    Article.find({ "saved": false }, function (error, data) {
        var hbsObject = {
            article: data
        };
        res.render("index", hbsObject);
    });
});

app.get("/saved", function (req, res) {
    Article.find({ "saved": true }).populate("notes").exec(function (error, articles) {
        var hbsObject = {
            article: articles
        };
        res.render("note", hbsObject);
    });
});

app.get("/scrape", function (req, res) {
    request("https://www.npr.org/sections/national/", function (error, response, html) {
        let $ = cheerio.load(html);
        let results = {};
        $("div.item-info").each(function (i, element) {
            results.title = $(element).children("h2.title").text();
            results.summary = $(element).children("p.teaser").text();
            results.link = $(element).children("p.teaser").find("a").attr("href");

            let entry = new Article(results);

            entry.save(function (error, doc) {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log(doc);
                }
            });
        });
        res.send("Scrape Complete");
    });
});

app.post("/articles/save/:id", function (req, res) {
    Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true })
        .exec(function (error, doc) {
            if (error) {
                console.log(error);
            }
            else {
                res.send(doc);
            }
        });
});

app.post("/articles/remove/:id", function (req, res) {
    Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": false, "notes": [] })
        .exec(function (error, doc) {
            if (error) {
                console.log(error);
            }
            else {
                res.send(doc);
            }
        });
});

app.post("/notes/save/:id", function (req, res) {
    var newNote = new Note({
        body: req.body.text,
        article: req.params.id
    });
    console.log(req.body)
    newNote.save(function (error, note) {
        if (error) {
            console.log(error);
        }
        else {
            Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { "notes": note } })
                .exec(function (error) {
                    if (error) {
                        console.log(error);
                        res.send(error);
                    }
                    else {
                        res.send(note);
                    }
                });
        }
    });
});

// Delete Note
// throwing error, note is getting deleted, but app crashes...
app.delete("/notes/delete/:note_id/:article_id", function (req, res) {
    Note.findOneAndRemove({ "_id": req.params.note_id }, function (err) {
        if (error) {
            console.log(error);
            res.send(error);
        }
        else {
            Article.findOneAndUpdate({ "_id": req.params.article_id }, { $pull: { "notes": req.params.note_id } })
                .exec(function (err) {
                    if (error) {
                        console.log(error);
                        res.send(error);
                    }
                    else {
                        res.send("Note Deleted");
                    }
                });
        }
    });
});

app.listen(PORT, function () {
    console.log("App now listening at localhost:" + PORT);
});