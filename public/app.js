
  $("#scrape").on("click", function() {
    $("#savedarticles").hide();
    $("#articles").empty();
    $("#articles").show();
    $.ajax({
      method: "GET",
      url: "/scrape"
    }).then(function() {
      alert("Scrape complete")
      $.getJSON("/articles", function(data) {
        for (var i=0; i< data.length; i++) {
          $("#articles").append(
            "<h3>" + data[i].title 
            + "</h3><br /><a class='btn btn-secondary' href=" 
            + data[i].link + ">Link</a>"
            + "<div class='btn btn-info' id='save' data-id=" + data[i]._id + ">Save Article</div>"
            + "<br />--------------------------------------------------------");
        }
      })
    })
  })

  // clicks a comment button
  $(document).on("click", "#comment", function() {
    // empty the notes section
    $("#notes").empty();
    // grab the id from the comment tag
    var thisId = $(this).attr("data-id");
    console.log(thisId);
  
    // ajax call for the article
    $.ajax({
      method: "GET",
      url: "/saved/" + thisId
    })
      // With that done, add the note information to the page
      .then(function(data) {
        // console.log(data);
        $("#notes").append("<h4>" + data.title + "</h4>");
        $("#notes").append("<input id='titleinput' name='title' >");
        $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
        $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
  
        // If there's a note in the article
        if (data.note) {
          // Place the title of the note in the title input
          $("#titleinput").val(data.note.title);
          // Place the body of the note in the body textarea
          $("#bodyinput").val(data.note.body);
        }
      });
  });
  
  // save comment
  $(document).on("click", "#savenote", function() {
    var thisId = $(this).attr("data-id");
  
    $.ajax({
      method: "POST",
      url: "/saved/" + thisId,
      data: {
        title: $("#titleinput").val(),
        body: $("#bodyinput").val()
      }
    })
      .then(function(data) {
        console.log(data);
        $("#notes").empty();
      });
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });
  

  $(document).on("click", "#save", function() {
    var thisId = $(this).attr("data-id");

    $.ajax({
      method: "GET",
      url: "/articles/" + thisId,
    }).then(function(data) {
      $.ajax({
        method: "POST",
        url: "/saved",
        data: {
          title: data.title,
          link: data.link,
          _id: data._id
        }
      }).then(function() {
        console.log("Article saved successfully!");
        var element = document.getElementById("save");
        element.classList.remove('btn-info');
        element.classList.add('btn-warning');
        element.innerHTML = "Saved";
      })
    })
  })

  $(document).on("click", "#view-saved", function () {
    $("#articles").hide();
    $("#savedarticles").show();
    $.getJSON("/saved", function(data) {
      for (var i=0; i< data.length; i++) {
        $("#savedarticles").append(
          "<h3>" + data[i].title 
          + "</h3><br /><a class='btn btn-secondary' href=" 
          + data[i].link + ">Link</a>"
          + "<div class='btn btn-success' id='comment' data-id=" + data[i]._id + ">Comment</div>"
          + "<div class='btn btn-danger' id='delete' data-id=" + data[i]._id + ">Delete</div>"
          + "<br />--------------------------------------------------------");
      }
    })
  });

  $(document).on("click", "#delete", function () {
    var thisId = $(this).attr("data-id");
    $.ajax({
      method: "DELETE",
      url: "/saved/" + thisId,
    }).then(function() {
      console.log("Article removed!")
      
    })
  })