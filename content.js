// Waits for receiving the list of extracted links from background.js
chrome.runtime.onMessage.addListener(function (response, sender, sendResponse) {
    if (!response["titleList"]) return;

    // Transition to results state
    document.getElementById("loadingState").style.display = "none";
    document.getElementById("hero").style.display = "none";
    document.getElementById("headerBar").style.display = "flex";
    document.getElementById("resultsState").style.display = "flex";

    var totalFiles = response["titleList"].length;
    document.getElementById("fileCount").textContent = totalFiles + " file" + (totalFiles !== 1 ? "s" : "") + " found";
    document.getElementById("selectedCount").textContent = "0 / " + totalFiles + " selected";

    var ul = document.getElementById("titleList");

    for (var i = 0; i < totalFiles; i++) {
        var li = document.createElement("li");
        li.setAttribute("class", "titleItems");

        // File type icon
        var fileName = response["titleList"][i];
        var iconSrc = "assets/file.png";
        if (fileName.includes(".xlsx") || fileName.includes(".xls")) {
            iconSrc = "assets/excelFile.png";
        } else if (fileName.includes(".docx") || fileName.includes(".doc")) {
            iconSrc = "assets/wordFile.png";
        } else if (fileName.includes(".pptx") || fileName.includes(".ppt")) {
            iconSrc = "assets/powerpointFile.png";
        } else if (fileName.includes(".pdf")) {
            iconSrc = "assets/pdfFile.png";
        }

        var icon = document.createElement("img");
        icon.className = "file-icon";
        icon.src = iconSrc;
        icon.alt = "";

        var nameSpan = document.createElement("span");
        nameSpan.className = "file-name";
        nameSpan.textContent = fileName;
        nameSpan.title = fileName;

        var checkBox = document.createElement("input");
        checkBox.setAttribute("type", "checkbox");
        checkBox.setAttribute("value", i);
        checkBox.className = "check";

        li.appendChild(icon);
        li.appendChild(nameSpan);
        li.appendChild(checkBox);
        ul.appendChild(li);
    }

    // Select All functionality
    var selAllCheck = document.getElementById("selAllCheck");
    selAllCheck.addEventListener("click", function () {
        var checks = document.querySelectorAll(".check");
        for (var i = 0; i < checks.length; i++) {
            checks[i].checked = this.checked;
        }
        var count = this.checked ? totalFiles : 0;
        numberOfCheckedItems = count;
        document.getElementById("selectedCount").textContent = count + " / " + totalFiles + " selected";
    });

    // Individual checkbox counter
    var numberOfCheckedItems = 0;
    var allChecks = document.querySelectorAll(".check");
    for (var j = 0; j < allChecks.length; j++) {
        allChecks[j].addEventListener("click", function () {
            if (this.checked) {
                ++numberOfCheckedItems;
            } else {
                --numberOfCheckedItems;
            }
            document.getElementById("selectedCount").textContent = numberOfCheckedItems + " / " + totalFiles + " selected";
            // Sync select-all checkbox
            selAllCheck.checked = (numberOfCheckedItems === totalFiles);
        });
    }

    // Download Files button
    document.getElementById("dwnbtn").addEventListener("click", function () {
        var checkboxes = document.getElementsByClassName("check");
        var selectedFiles = [];
        var selectedLinks = [];
        var selectedNames = [];
        for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                selectedFiles.push(parseInt(checkboxes[i].value));
            }
        }
        for (var j = 0; j < selectedFiles.length; j++) {
            selectedLinks.push(response["hrefList"][selectedFiles[j]]);
            selectedNames.push(response["titleList"][selectedFiles[j]]);
        }

        for (var k = 0; k < selectedLinks.length; k++) {
            var driveUrl = selectedLinks[k];
            var fileName = selectedNames[k];
            // Extract file ID from Google Drive URL
            var fileId = driveUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
            if (fileId && fileId[1]) {
                var downloadableLink = "https://drive.google.com/uc?id=" + fileId[1];
                var downloadFileName = fileName;

                // Check file extension and determine export format
                if (fileName.endsWith(".pdf")) {
                    downloadableLink += "&export=download";
                } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
                    downloadableLink += "&export=download";
                } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
                    downloadableLink += "&export=download";
                } else if (fileName.endsWith(".pptx") || fileName.endsWith(".ppt")) {
                    downloadableLink += "&export=download";
                } else {
                    // For files without standard extension (Google Docs), export as PDF
                    downloadableLink += "&export=pdf";
                    // Add .pdf extension if not already present
                    if (!downloadFileName.endsWith(".pdf")) {
                        downloadFileName += ".pdf";
                    }
                }

                chrome.downloads.download({
                    url: downloadableLink,
                    filename: downloadFileName,
                    saveAs: false
                });
            }
        }
    });

    // Click file name to scroll to it on the page
    var items = document.querySelectorAll(".titleItems");
    for (var j = 0; j < items.length; j++) {
        items[j].addEventListener("click", function (e) {
            // Don't trigger scroll when clicking the checkbox
            if (e.target.type === "checkbox") return;
            var fileClicked = this.querySelector(".file-name").textContent;
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, fileClicked);
            });
        });
    }
});

// Cancel buttons - reload everything
function handleCancel() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: function () { location.reload(); }
        });
    });
    location.reload();
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("runScript").addEventListener("click", getLinks);
    document.getElementById("cancel").addEventListener("click", handleCancel);
    document.getElementById("cancel2").addEventListener("click", handleCancel);
});

// Function executed to run background scripts
function getLinks() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ["background.js"]
        });
    });
    document.getElementById("hero").style.display = "none";
    document.getElementById("loadingState").style.display = "flex";
}
