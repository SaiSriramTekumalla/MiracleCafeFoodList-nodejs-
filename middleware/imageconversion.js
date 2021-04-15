var fs = require('fs')

 function fileToBase64(filename) {
     console.log(filename)
    var filename = "package.json";
    var binaryData = fs.readFileSync(filename)
    var base64String = new Buffer(binaryData).toString("base64")
    console.log(base64String)  
    return base64String

}

module.exports = fileToBase64

