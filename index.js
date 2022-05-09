const express = require('express')
const port = process.env.PORT || 3000
const bodyParser = require('body-parser')
const dotenv = require('dotenv');
dotenv.config();
const address = process.env.IP

const main = express()
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: true }));

main.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

const mysql = require('mysql');
const connection = mysql.createConnection({
  host: address,
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
    } else {
      //抓取ID流水號

      var string = JSON.stringify(results);
      var obj = JSON.parse(string);
      var serialNumber = obj[0]["id"].substr(obj.length - 6);

      var num = parseInt(serialNumber, 10)

      // Method 2 -------> num = numInt
      // var numString = serialNumber.substring(serialNumber.lastIndexOf('0')+ 1, serialNumber.length)
      // var numInt = parseInt(numString, 10)

      console.log("num: " + num)
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


main.post('/createCertificateMuti', async (req, res) => {
  var data = req.body.data;
  var tenderid = req.body.data[0].tenderid

  var today = new Date();
  var year = today.getFullYear()
  var month = (today.getMonth() + 1).toString().replace(/ /g, '').padStart(2, '0')
  var day = today.getDate().toString().replace(/ /g, '').padStart(2, '0');
  var date = year + month + day

  var status = '已繳交押標金'

  console.log(data)


  connection.query("SELECT id FROM DevDb.tag_number WHERE tenderId = ? AND time = ? ORDER BY num DESC LIMIT 1", [tenderid, date], (error, results, fields) => {
    if (error) throw error;

    if (results == null || results == '' || results == undefined) {
      console.log("results == null || results == '' || results == undefined")
      console.log(data.length)


      if (data.length == 1) {
        console.log("data.length = 1")

        var serialNumber = '00001'
        var id = tenderid + date + serialNumber
        var name = data[0].name
        var currency = data[0].currency;
        var branch = data[0].branch;
        var amount = data[0].amount;
        var accountCode = data[0].accountCode;
        var account = data[0].account;

        connection.query(`INSERT INTO DevDb.tag_number(id, tenderid, name, time) VALUES ('${id}', '${tenderid}', '${name}', '${date}')`, function (err, results) {
          if (err) throw err;


          console.log("1 record inserted tag_number.");
          connection.query(`INSERT INTO DevDb.certificate(id, tenderid, accountCode, account, name, currency, branch, amount, status) VALUES ('${id}', '${tenderid}', '${accountCode}','${account}','${name}','${currency}','${branch}','${amount}','${status}')`, function (err, results) {
            if (err) throw err;

            res.json({ status: "Ture", message: "1 record inserted." })
            console.log("1 record inserted certificate.");

          })
        })

      } else if (data.length > 1) {
        console.log("data.length > 1")
        for (let i = 0; i < data.length; i++) {
          // console.log(data[i].tenderid)
          i++
          var num = parseInt(i, 10)
          var numString = num.toString().padStart(5, "0");
          console.log(numString)
          var id = tenderid + date + numString
          var name = data[i].name;
          var currency = data[i].currency;
          var branch = data[i].branch;
          var amount = data[i].amount;
          var accountCode = data[i].accountCode;
          var account = data[i].account;
          connection.query(`INSERT INTO DevDb.tag_number(id, tenderid, name, time) VALUES ('${id}', '${tenderid}', '${name}', '${date}')`, function (err, results) {
            if (err) throw err;


            console.log("1 record inserted tag_number.");
            connection.query(`INSERT INTO DevDb.certificate(id, tenderid, accountCode, account, name, currency, branch, amount, status) VALUES ('${id}', '${tenderid}', '${accountCode}','${account}','${name}','${currency}','${branch}','${amount}','${status}')`, function (err, results) {
              if (err) throw err;

              // console.log("1 record inserted certificate.");
              if(i == data.length - 1){
                console.log("i == data.length - 1")
                res.json({ status: "Ture", message: "1 record inserted." })
              }
              
              
            })
          })

        }


      }
    } else {
      if (data.length == 1) {

        var string = JSON.stringify(results);
        var obj = JSON.parse(string);
        var serialNumber = obj[0]["id"].substr(obj.length - 6);

        var num = parseInt(serialNumber, 10)
        console.log("num: " + num)
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

      } else if (data.length > 1) {

        for (let i = 0; i < data.length; i++) {
          console.log(data[i].tenderid)
          var string = JSON.stringify(results);
          var obj = JSON.parse(string);
          var serialNumber = obj[i]["id"].substr(obj.length - 6);

          console.log("serialNumber: "+serialNumber)

          var num = parseInt(serialNumber, 10)
          console.log("num: " + num)
          num++;
          var numString = num.toString().padStart(5, "0");
          console.log(numString)
          var id = tenderid + date + numString
          var name = data[i].name
          var currency = data[i].currency;
          var branch = data[i].branch;
          var amount = data[i].amount;
          var accountCode = data[i].accountCode;
          var account = data[i].account;
          console.log("accountCode: "+ accountCode)
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


      }

    }
  })


})