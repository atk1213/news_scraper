$("#scrape").on("click", function() {
    $.ajax({
        method: "GET",
        url: "/scrape",
    }).done(function(data) {
        console.log(data)
        window.location = "/"
    })
});

$(".save").on("click", function() {
    let thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/save/" + thisId
    }).done(function(data) {
        window.location = "/saved"
    })
});

$(".remove").on("click", function() {
    let thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/remove/" + thisId
    }).done(function(data) {
        window.location = "/saved"
    })
});

$(".saveNote").on("click", function() {
    let thisId = $(this).attr("data-id");
    if (!$("#noteText" + thisId).val()) {
        alert("please enter a note to save")
    }else {
      $.ajax({
            method: "POST",
            url: "/notes/save/" + thisId,
            data: {
              text: $("#noteText" + thisId).val()
            }
          }).done(function(data) {
              console.log(data);
              $("#noteText" + thisId).val("");
              window.location = "/saved"
          });
    }
});

$(".deleteNote").on("click", function() {
    let noteId = $(this).attr("data-note-id");
    let articleId = $(this).attr("data-article-id");
    $.ajax({
        method: "DELETE",
        url: "/notes/delete/" + noteId + "/" + articleId
    }).done(function(data) {
        console.log(data)
        window.location = "/saved"
    })
});