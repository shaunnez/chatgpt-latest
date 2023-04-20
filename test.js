/** csv file
a,b,c
1,2,3
4,5,6
*/
// const csvFilePath = "./ird.csv";
// const csv = require("csvtojson");
const fs = require("fs");

// csv({
//   noheader: true,
// })
//   .fromFile(csvFilePath)
//   .then((jsonObj) => {
//     const updatedJson = jsonObj.map((x) => {
//       return { Domain: x.field1, Embedding: x.field2 };
//     });
//     let data = JSON.stringify(updatedJson);
//     fs.writeFileSync("ird.json", data);
//   });

const json = require("./public/ird.json");
const newJson = json.splice(0, 1244);
// console.log(json[0]);
fs.writeFileSync("ird2.json", JSON.stringify(newJson));
fs.writeFileSync("ird3.json", JSON.stringify(json));
