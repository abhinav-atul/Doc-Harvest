// Scrolls page automatically for upto 25 seconds
function pageScroll() {
  var startTime = new Date().getTime();
  var interval = setInterval(function () {
    if (new Date().getTime() - startTime > 25000) {
      clearInterval(interval);
      buttonClicked();
      return;
    }
    window.scrollBy(0, 10000);
  }, 2000);
}

// Clean up filename by removing duplicate extensions and trailing labels
function cleanFileName(filename) {
  var cleaned = filename.trim();

  // Remove duplicate file extensions (e.g., ".pdfPDF" -> ".pdf")
  cleaned = cleaned.replace(/\.pdf(?=PDF|Pdf|pdf)/i, ".pdf");
  cleaned = cleaned.replace(/\.docx(?=DOCX|Docx|docx)/i, ".docx");
  cleaned = cleaned.replace(/\.doc(?=DOC|Doc|doc)/i, ".doc");
  cleaned = cleaned.replace(/\.xlsx(?=XLSX|Xlsx|xlsx)/i, ".xlsx");
  cleaned = cleaned.replace(/\.xls(?=XLS|Xls|xls)/i, ".xls");
  cleaned = cleaned.replace(/\.pptx(?=PPTX|Pptx|pptx)/i, ".pptx");
  cleaned = cleaned.replace(/\.ppt(?=PPT|Ppt|ppt)/i, ".ppt");

  // Remove trailing file type labels that appear after the extension
  cleaned = cleaned.replace(/\.(pdf|docx?|xlsx?|pptx?)(PDF|DOCX?|DOC|XLSX?|XLS|PPTX?|PPT)$/i, ".$1");

  return cleaned;
}

var titles = [];

var fileDOM = [];
function buttonClicked() {
  // Extracts the URLs for all the elements with the given class name having all the documents
  var anchorTags = document.getElementsByTagName("a");
  var hrefs = [];
  for (var i = 0; i < anchorTags.length; i++) {
    var hrefString = anchorTags[i].href;

    if (hrefString.includes("drive.google.com") && !hrefString.includes("drive.google.com/drive/folders/")) {
      if (!hrefs.includes(hrefString)) {
        hrefs.push(hrefString);
        var titleString = cleanFileName(anchorTags[i].textContent);
        titles.push(titleString);
    }
    else if(hrefs.includes(hrefString)){
        fileDOM.push(anchorTags[i]);
    }
}
  }
  var titleLinks = { hrefList: hrefs, titleList: titles };

  // Send the javascript object of title of document and link of document to the extension javascript file
  chrome.runtime.sendMessage(titleLinks);
}
// Receives request from content.js to scroll a document into view
chrome.runtime.onMessage.addListener(function (response, sender, sendResponse) {
  var elementIndex = titles.indexOf(response);
  var element = fileDOM[elementIndex];
  element.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "nearest",
  });
});

// Function call to initiate auto page scrolling
pageScroll();
