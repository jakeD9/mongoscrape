var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

// grab our mongo models
var db = require("./models");

var PORT = 3000;

var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// connect to mongoDB
mongoose.connect("mongodb://localhost/mongoscraper", { useNewUrlParser: true });


app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.marketwatch.com").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // grab every link on the page
    $("h3.article__headline").each(function(i, element) {
      // empty result object
      var result = {};

      // add title and link to the object
      result.title = $(element)
        .children()
        .text();
      result.link = $(element)
        .children()
        .attr("href");

      // clear old articles
      db.Article.remove({})
        .then(function() {
          console.log("Old articles purged, hope you saved the ones you wanted!")
        })
        .catch(function(err) {
          console.log(err);
        });

      // push new article object to database
      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          console.log(err);
        });
    });

    res.send("Scrape Complete");
  });
});

// find all articles in db and render /articles
app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(Article) {
      res.json(Article);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// finds specific article from /articles
app.get("/saved/:id", function(req, res) {
  db.SavedArticle.findOne({ _id: req.params.id })
    .then(function(dbSavedArticle) {
      res.json(dbSavedArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});


app.post("/saved/:id", function(req, res) {
  console.log(req.body);
  db.Note.create(req.body)
    .then(function(dbComment) {
      return db.SavedArticle.findOneAndUpdate({ _id: req.params.id }, { comment: dbComment._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/saved", function(req,res) {
  db.SavedArticle.find({})
    .then(function(dbSavedArticle) {
      res.json(dbSavedArticle);
    })
    .catch(function(err) {
      res.json(err);
    })
})

app.post("/saved", function(req, res) {
  db.SavedArticle.create(req.body)
    .then(function(dbSavedArticle) {
      res.json(dbSavedArticle)
      console.log(dbSavedArticle);
      console.log("Article Saved!")
    })
    .catch(function(err) {
      res.json(err);
    })
})

app.delete("/saved/:id", function(req,res) {
  db.SavedArticle.findOneAndRemove({ _id: req.params.id })
    .then(function() {
      console.log("Deleted article!")
    })
    .catch(function(err) {
      if (err) throw err;
    })
})

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
