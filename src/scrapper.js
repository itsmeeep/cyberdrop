const downloader = require("./download.js");

const fetch = require("node-fetch");
const cheerio = require("cheerio");
const fs = require("fs").promises;

const Details = (url) => new Promise (async (resolve, reject) => {
    console.log("[#] Getting Page Details ...")
    var results = {
        title: "",
        files: []
    }

    try {
        var html = await fetch(url);
        html = await html.text();
        const $ = cheerio.load(html);

        // title 
        results.title = $("#title").attr("title").replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');

        // files
        var files = [];
        $("a.image").each(function() {
            var img = $(this).attr("href");
            files.push(img);
        });
        results.files = files;

        resolve({
            status: "success",
            message: "",
            data: results
        })
    } catch (err) {
        resolve({
            status: "error",
            message: err,
            data: results
        })
    }
});

const pageDetails = (url) => new Promise (async (resolve, reject) => {
    var details = await Details(url);
    if (details.status == "success") {
        console.log("[+] Getting Page Details Successful");

        // generating new directory
        console.log("[#] Generating Download Directory: " + details.data.title.toString());
        try {
            await fs.mkdir("./downloads/" + details.data.title.toString());
        } catch (err) {
            await fs.rm('./downloads/' + details.data.title.toString(), { recursive: true, force: true });
            await fs.mkdir("./downloads/" + details.data.title.toString());
        }

        console.log("[#] Downloading Files ...")
        var fileType = ["JPEG", "JPG", "PNG", "MP4"];

        for (var i = 0; i < details.data.files.length; i++) {
            var extension = details.data.files[i].toString().split(".");
            extension = extension.pop();

            if (fileType.indexOf(extension.toUpperCase()) > -1) {
                var fileURL = details.data.files[i];
                var fileName = details.data.files[i].toString().split("/");
                fileName = fileName.pop();
                var filePath = './downloads/' + details.data.title.toString() + "/" + fileName;

                var downloadProcess = await downloader.process(fileURL, filePath);
                if (downloadProcess.status == "success") {
                    console.log("[+] " + [i] + ". File Downloaded: " + fileName)
                } else {
                    console.log("[-] " + [i] + ". File Download Error: " + fileName)
                }
            }
        }
        console.log("[#] Downloading Files Completed")

        resolve({
            status: "success",
            message: ""
        })
    } else {
        console.log("[#] Downloading Files Failed")

        resolve({
            status: "error",
            message: details.message
        })
    }
});

module.exports = { pageDetails }