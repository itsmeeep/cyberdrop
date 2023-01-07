const scrapper = require("./scrapper.js")

const fs = require('fs').promises;
const readline = require('readline-sync');

async function exists (path) {  
    try {
        await fs.access(path)
        return true
    } catch {
        return false
    }
}

const readURL = () => new Promise (async (resolve, reject) => {
    try {
        // generating directory
        console.log("[#] Checking Directory ...");
        (await exists("./downloads") == false) ? await fs.mkdir("./downloads") : "";
        (await exists("./history") == false) ? await fs.mkdir("./history") : "";

        // check url files
        console.log("[#] Reading URL File ...")
        try {
            var url = await fs.readFile("./url.txt", "utf8");
            url = url.toString().split("\r\n");

            while (url.length == 1 && url[0] == "") {
                var terminal = readline.question("[#] URL File is Empty, Please Fill The URL. Press ENTER to Continue ...")

                url = await fs.readFile("./url.txt", "utf8");
                url = url.toString().split("\r\n");
            }

            resolve({
                status: "success",
                message: "Reading File Successful",
                data: url
            })
        } catch (err) {
            await fs.writeFile("./url.txt", "", "utf8");

            var url = await fs.readFile("./url.txt", "utf8");
            url = url.toString().split("\r\n")

            while (url.length == 1 && url[0] == "") {
                var terminal = readline.question("[#] URL File is Empty, Please Fill The URL. Press ENTER to Continue ...")

                url = await fs.readFile("./url.txt", "utf8")
                url = url.toString().split("\r\n")
            }

            resolve({
                status: "success",
                message: "Writing File Successful",
                data: url
            })
        }
    } catch (err) {
        resolve({
            status: "error",
            message: err,
            data: []
        })
    }
});

(async () => {
    var read = await readURL();
    if (read.status == "success") {
        console.log("[+] Reading URL File Successful")

        for (var i = 0; i < read.data.length; i++) {
            await scrapper.pageDetails(read.data[i]);
        }
    } else {
        console.log("[x] Reading URL File Failed")
    }
})();