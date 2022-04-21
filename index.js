const express = require('express')
const port = process.env.PORT || 3000
const bodyParser = require('body-parser')
const dotenv = require('dotenv');
dotenv.config();
const address = process.env.IP

const main = express()
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: true }));

const mysql = require('mysql');
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'DevAuth',
  password: 'Dev127336',
  database: 'DevDb',
  multipleStatements: true
})

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected!');
});

main.listen(port, () => {
  console.log('The server is running at http://' + address + ":" + port)
})

main.get('/', async (req, res) => {
  res.json({ status: "Welcome!! You Start Successfully" })
})

let tenders = [
  {
    id: "NCHC-P-106104",
    title: "人工智慧超級電腦採購案",
    amount: "49,000,000",
    relaseDate: "2017-10-25",
    terminationDate: "2017-12-01",
  },
  {
    id: "NCHC-S-109003",
    title: "109年雲端服務及大數據運算平台(台灣杉2)維護案",
    amount: "70,000,000",
    relaseDate: "2020-01-03",
    terminationDate: "2020-02-07",
  },
  {
    id: "NCHC-P-107241",
    title: "工程科學多尺度雲端服務平台租用採購案",
    amount: "9,000,000",
    relaseDate: "2018-11-20",
    terminationDate: "2018-12-04",
  },
  {
    id: "NCHC-P-109001",
    title: "先進人工智慧大數據計算主機與儲存系統",
    amount: "860,000,000",
    relaseDate: "2020-05-08",
    terminationDate: "2020-07-03",
  }
]

main.get('/tender', async (req, res) => {
  res.json(tenders)
})

main.get('/tenderquery', async (req, res) => {
  connection.query("SELECT id,title,amount,DATE_FORMAT(relaseDate,'%Y-%M-%D') as relaseDate,DATE_FORMAT(terminationDate,'%Y-%M-%D') as terminationDate FROM DevDb.tender_info", (err, tender) => {
    if (err) throw err;

    // console.log(rows);
    res.json({
      tender
    })

  })
})

main.post('/createCertificate', async (req, res) => {
  var tenderid = req.body.tenderid;
  var accountCode = req.body.accountCode;
  var account = req.body.account;
  var name = req.body.name;
  var currency = req.body.currency;
  var branch = req.body.branch;
  var amount = req.body.amount;
  var status = '已繳交押標金'

  var today = new Date();
  var year = today.getFullYear()
  var month = (today.getMonth() + 1).toString().replace(/ /g, '').padStart(2, '0')
  var day = today.getDate().toString().replace(/ /g, '').padStart(2, '0');
  var date = year + month + day

  console.log("tenderid: " + tenderid)
  console.log("accountCode: " + accountCode)
  console.log("account: " + account)
  console.log("name: " + name)
  console.log("currency: " + currency)
  console.log("branch: " + branch)
  console.log("amount: " + amount)
  console.log("status: " + status)


  //根據系統日期和標案號查詢，查詢最新的一筆，是否有憑證，如沒有，流水號直接是 00001，如有就會加一（看 else）
  connection.query("SELECT id FROM DevDb.tag_number WHERE tenderId = ? AND time = ? ORDER BY num DESC LIMIT 1", [tenderid, date], (error, results, fields) => {
    if (error) throw error;
    if (results == null || results == '' || results == undefined) {
      var serialNumber = '00001'
      console.log('results == null')
      var id = tenderid + date + serialNumber
      connection.query(`INSERT INTO DevDb.tag_number(id, tenderid, name, time) VALUES ('${id}', '${tenderid}', '${name}', '${date}')`, function (err, results) {
        if (err) throw err;


        console.log("1 record inserted tag_number.");
        connection.query(`INSERT INTO DevDb.certificate(id, tenderid, accountCode, account, name, currency, branch, amount, status) VALUES ('${id}', '${tenderid}', '${accountCode}','${account}','${name}','${currency}','${branch}','${amount}','${status}')`, function (err, results) {
          if (err) throw err;

          res.json({ status: "Ture", message: "1 record inserted." })
          console.log("1 record inserted certificate.");

        })
      })
    }else{
      //抓取ID流水號

      var string = JSON.stringify(results);
      var obj = JSON.parse(string);
      var serialNumber = obj[0]["id"].substr(obj.length - 6);

      var num = parseInt(serialNumber, 10)

      // Method 2 -------> num = numInt
      // var numString = serialNumber.substring(serialNumber.lastIndexOf('0')+ 1, serialNumber.length)
      // var numInt = parseInt(numString, 10)
      
      console.log("num: "+num)
      num++;
      var numString = num.toString().padStart(5, "0");
      console.log(numString)
      var id = tenderid + date + numString
      connection.query(`INSERT INTO DevDb.tag_number(id, tenderid, name, time) VALUES ('${id}', '${tenderid}', '${name}', '${date}')`, function (err, results) {
        if (err) throw err;


        console.log("1 record inserted tag_number.");
        connection.query(`INSERT INTO DevDb.certificate(id, tenderid, accountCode, account, name, currency, branch, amount, status) VALUES ('${id}', '${tenderid}', '${accountCode}','${account}','${name}','${currency}','${branch}','${amount}','${status}')`, function (err, results) {
          if (err) throw err;

          res.json({ status: "Ture", message: "1 record inserted." })
          console.log("1 record inserted certificate.");

        })
      })
      
   
    }
  })

})

