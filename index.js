const express = require('express')
const port = process.env.PORT || 3000
const bodyParser = require('body-parser')
const dotenv = require('dotenv');
dotenv.config();
const address = process.env.IP_DEV
const axios = require('axios');

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


// Get 所有標案資訊
main.get('/tenderquery', async (req, res) => {
  connection.query("SELECT id,title,amount,DATE_FORMAT(relaseDate,'%Y-%M-%D') as relaseDate,DATE_FORMAT(terminationDate,'%Y-%M-%D') as terminationDate FROM DevDb.tender_info", (err, tender) => {
    if (err) throw err;

    // console.log(rows);
    res.json({
      tender
    })

  })
})

//insert 到資料庫再上鏈，到資料庫時就會回傳給前端(在上鏈之前)，所以無法確認是否有上鏈，除非看資料庫是否有回txid
main.post('/createCertificateMuti', async (req, res) => {
  var data = req.body.data;
  var tenderid = req.body.data[0].tendersID
  console.log(data)

  var today = new Date();
  var year = today.getFullYear()
  var month = (today.getMonth() + 1).toString().replace(/ /g, '').padStart(2, '0')
  var day = today.getDate().toString().replace(/ /g, '').padStart(2, '0');
  var date = year + month + day

  var status = 'VALID'

  console.log(data.length)


  connection.query("SELECT id FROM DevDb.tag_number WHERE tenderId = ? AND time = ? ORDER BY num DESC LIMIT 1", [tenderid, date], (error, results, fields) => {
    if (error) throw error;

    //如果在 tag_number 找不到資料
    if (results == null || results == '' || results == undefined) {
      console.log("results == null || results == '' || results == undefined")

      if (data.length == 1) {
        console.log("data.length = 1")

        var serialNumber = '00001'
        var id = tenderid + date + serialNumber
        var name = data[0].name
        var currency = data[0].accountCurrecy;
        var branch = data[0].branchName;
        var amount = data[0].amount;
        var accountCode = data[0].code;
        var account = data[0].account;

        connection.query(`INSERT INTO DevDb.tag_number(id, tenderid, name, time) VALUES ('${id}', '${tenderid}', '${name}', '${date}')`, function (err, results) {
          if (err) throw err;


          console.log("1 record inserted tag_number.");
          connection.query(`INSERT INTO DevDb.certificate(id, tenderid, accountCode, account, name, currency, branch, amount, status) VALUES ('${id}', '${tenderid}', '${accountCode}','${account}','${name}','${currency}','${branch}','${amount}','${status}')`, function (err, results) {
            if (err) throw err;

            console.log("1 record inserted certificate.");
            res.json({ status: "Ture", message: "1 record inserted." })

          })

        })
        //上鏈並寫回資料庫
        goToTheChain(res, id, tenderid, accountCode, account, name, currency, branch, amount, status)

      } else if (data.length > 1) {
        console.log("data.length > 1")
        for (let i = 1; i < data.length + 1; i++) {
          var num = parseInt(i, 10)
          var numString = num.toString().padStart(5, "0");
          var id = tenderid + date + numString
          var name = data[i - 1].name;
          var currency = data[i - 1].accountCurrecy;
          var branch = data[i - 1].branchName;
          var amount = data[i - 1].amount;
          var accountCode = data[i - 1].code;
          var account = data[i - 1].account;

          connection.query(`INSERT INTO DevDb.tag_number(id, tenderid, name, time) VALUES ('${id}', '${tenderid}', '${name}', '${date}')`, function (err, results) {
            if (err) throw err;

            console.log("1 record inserted tag_number.");
          })

          connection.query(`INSERT INTO DevDb.certificate(id, tenderid, accountCode, account, name, currency, branch, amount, status) VALUES ('${id}', '${tenderid}', '${accountCode}','${account}','${name}','${currency}','${branch}','${amount}','${status}')`, function (err, results) {
            if (err) throw err;

            console.log("1 record inserted certificate.");
            if (i == data.length - 1) {
              console.log("i == data.length - 1")
              res.json({ status: "Ture", message: "1 record inserted." })
            }


          })
          //上鏈並寫回資料庫
          goToTheChain(res, id, tenderid, accountCode, account, name, currency, branch, amount, status)

        }


      }
    }
    else {
      if (data.length == 1) {
        console.log("data.length == 1")
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

            console.log("1 record inserted certificate.");
            res.json({ status: "Ture", message: "1 record inserted." })

          })
        })
        //上鏈並寫回資料庫
        goToTheChain(res, id, tenderid, accountCode, account, name, currency, branch, amount, status)

      } else if (data.length > 1) {
        console.log("data.length > 1")
        for (let i = 1; i < data.length + 1; i++) {
          var string = JSON.stringify(results);
          var obj = JSON.parse(string);
          var serialNumber = obj[0]["id"].substr(obj.length - 6);

          var num = parseInt(serialNumber, 10)

          // num 為 ID 的控制器
          num = num + i;
          var numString = num.toString().padStart(5, "0");
          console.log(numString)
          var id = tenderid + date + numString
          var name = data[i - 1].name
          var currency = data[i - 1].currency;
          var branch = data[i - 1].branchName;
          var amount = data[i - 1].amount;
          var accountCode = data[i - 1].code;
          var account = data[i - 1].account;
          console.log("accountCode: " + accountCode)
          connection.query(`INSERT INTO DevDb.tag_number(id, tenderid, name, time) VALUES ('${id}', '${tenderid}', '${name}', '${date}')`, function (err, results) {
            if (err) throw err;


            console.log("1 record inserted tag_number.");
          })

          connection.query(`INSERT INTO DevDb.certificate(id, tenderid, accountCode, account, name, currency, branch, amount, status) VALUES ('${id}', '${tenderid}', '${accountCode}','${account}','${name}','${currency}','${branch}','${amount}','${status}')`, function (err, results) {
            if (err) throw err;

            console.log("1 record inserted certificate.");
            if (i == data.length - 1) {
              console.log("i == data.length - 1")
              res.json({ status: "Ture", message: "1 record inserted." })
            }

          })

          //上鏈並寫回資料庫
          goToTheChain(res, id, tenderid, accountCode, account, name, currency, branch, amount, status)

        }


      }

    }
  })


})


function goToTheChain(res, id, tenderId, accountCode, account, name, currency, amount, branch, status) {

  // 上鏈
  axios.post("https://tender-chain.fishlab.com.tw/CreateData", {
    "Id": `${id}`,
    "TenderID": `${tenderId}`,
    "Accountcode": `${accountCode}`,
    "Account": `${account}`,
    "Name": `${name}`,
    "Currency": `${currency}`,
    "Amount": `${amount}`,
    "Branch": `${branch}`,
    "Status": `${status}`
  })
    .then(function (response) {

      console.log("status: " + response.status)
      if (response.status === 200) {
        console.log("status === 200")

        //--------------------------->>>>>>>>>>  查詢 txid
        axios.get('https://tender-chain.fishlab.com.tw/ReadData', {
          params: {
            Id: id
          }
        })
          .then(resp => {
            console.log("status: " + resp.status)

            console.log("resp.data.txid: " + resp.data.txid)
            var txid = resp.data.txid
            //回寫資料庫
            connection.query(`UPDATE DevDb.certificate SET txid = ? WHERE id = ?`, [txid, id], function (err, results) {
              if (err) throw err;

              console.log("1 record updated certificate.");
            })


          }).catch(err => {
            console.log(err);
          })

         //--------------------------->>>>>>>>>>  查詢 txid


      }


    }).catch(err => {
      console.log("err")
      console.log(err);
    })

}




// Get 目前憑證
main.get('/certificateValid', async (req, res) => {
  var status = 'VALID';
  connection.query("SELECT * FROM DevDb.certificate WHERE status = ?",[status], (err, certificate) => {
    if (err) throw err;

    res.json({
      certificate
    })


  })
})

// Get 歷史憑證
main.get('/certificateRevoke', async (req, res) => {
  var status = 'REVOKE';
  connection.query("SELECT * FROM DevDb.certificate WHERE status = ?",[status], (err, certificate) => {
    if (err) throw err;

    res.json({
      certificate
    })


  })
})

main.post('/revokeCertificate', async (req, res) => {

  var txid = req.body.txid
  var status = 'REVOKE'
  connection.query(`UPDATE DevDb.certificate SET status = ? WHERE txid = ?`, [status, txid], function (err, results) {
    if (err) throw err;

    console.log("1 record updated certificate.");
  })


  connection.query(`SELECT * FROM DevDb.certificate WHERE txid = ?`, [txid], (err, certificate) => {

    if (err) throw err;

    console.log(certificate)
    var jsonString = JSON.stringify(certificate)
    var parsed = JSON.parse(jsonString);
    var chain = parsed[0];


    revokeToTheChain(res, chain.id, chain.tenderId, chain.accountCode, chain.account, chain.name, chain.currency, chain.branch, chain.amount, chain.status)




  })



})

function revokeToTheChain(res, id, tenderId, accountCode, account, name, currency, amount, branch, status) {

  

  axios.post("https://tender-chain.fishlab.com.tw/UpdateData", {
    "Id": `${id}`,
    "TenderID": `${tenderId}`,
    "Accountcode": `${accountCode}`,
    "Account": `${account}`,
    "Name": `${name}`,
    "Currency": `${currency}`,
    "Amount": `${amount}`,
    "Branch": `${branch}`,
    "Status": `${status}`
  })
    .then(function (response) {

      console.log("status: " + response.status)
      if (response.status === 200) {
        res.json({ status: "Ture", message: `${id} revoke complete` })
      }

    }).catch(err => {
      console.log("err")
      console.log(err);
    })

}


// -------------------------------------->>>>>>>>>>   以下為測試API

// 前端測試，只跟資料庫溝通不做上鏈
main.post('/createCertificateTest', async (req, res) => {
  var data = req.body.data;
  var tenderid = req.body.data[0].tendersID
  console.log(data)

  var today = new Date();
  var year = today.getFullYear()
  var month = (today.getMonth() + 1).toString().replace(/ /g, '').padStart(2, '0')
  var day = today.getDate().toString().replace(/ /g, '').padStart(2, '0');
  var date = year + month + day

  var status = 'VALID'

  console.log(data.length)


  connection.query("SELECT id FROM DevDb.tag_number WHERE tenderId = ? AND time = ? ORDER BY num DESC LIMIT 1", [tenderid, date], (error, results, fields) => {
    if (error) throw error;

    //如果在 tag_number 找不到資料
    if (results == null || results == '' || results == undefined) {
      console.log("results == null || results == '' || results == undefined")

      if (data.length == 1) {
        console.log("data.length = 1")

        var serialNumber = '00001'
        var id = tenderid + date + serialNumber
        var name = data[0].name
        var currency = data[0].accountCurrecy;
        var branch = data[0].branchName;
        var amount = data[0].amount;
        var accountCode = data[0].code;
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
        for (let i = 1; i < data.length + 1; i++) {
          var num = parseInt(i, 10)
          var numString = num.toString().padStart(5, "0");
          var id = tenderid + date + numString
          var name = data[i - 1].name;
          var currency = data[i - 1].accountCurrecy;
          var branch = data[i - 1].branchName;
          var amount = data[i - 1].amount;
          var accountCode = data[i - 1].code;
          var account = data[i - 1].account;

          connection.query(`INSERT INTO DevDb.tag_number(id, tenderid, name, time) VALUES ('${id}', '${tenderid}', '${name}', '${date}')`, function (err, results) {
            if (err) throw err;

            console.log("1 record inserted tag_number.");
          })

          connection.query(`INSERT INTO DevDb.certificate(id, tenderid, accountCode, account, name, currency, branch, amount, status) VALUES ('${id}', '${tenderid}', '${accountCode}','${account}','${name}','${currency}','${branch}','${amount}','${status}')`, function (err, results) {
            if (err) throw err;

            console.log("1 record inserted certificate.");
            if (i == data.length - 1) {
              console.log("i == data.length - 1")
              res.json({ status: "Ture", message: "1 record inserted." })
            }


          })

        }


      }
    }
    else {
      if (data.length == 1) {
        console.log("data.length == 1")
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
        console.log("data.length > 1")
        for (let i = 1; i < data.length + 1; i++) {
          var string = JSON.stringify(results);
          var obj = JSON.parse(string);
          var serialNumber = obj[0]["id"].substr(obj.length - 6);

          var num = parseInt(serialNumber, 10)

          // num 為 ID 的控制器
          num = num + i;
          var numString = num.toString().padStart(5, "0");
          console.log(numString)
          var id = tenderid + date + numString
          var name = data[i - 1].name
          var currency = data[i - 1].currency;
          var branch = data[i - 1].branchName;
          var amount = data[i - 1].amount;
          var accountCode = data[i - 1].code;
          var account = data[i - 1].account;
          console.log("accountCode: " + accountCode)
          connection.query(`INSERT INTO DevDb.tag_number(id, tenderid, name, time) VALUES ('${id}', '${tenderid}', '${name}', '${date}')`, function (err, results) {
            if (err) throw err;


            console.log("1 record inserted tag_number.");
          })

          connection.query(`INSERT INTO DevDb.certificate(id, tenderid, accountCode, account, name, currency, branch, amount, status) VALUES ('${id}', '${tenderid}', '${accountCode}','${account}','${name}','${currency}','${branch}','${amount}','${status}')`, function (err, results) {
            if (err) throw err;

            console.log("1 record inserted certificate.");
            if (i == data.length - 1) {
              console.log("i == data.length - 1")
              res.json({ status: "Ture", message: "1 record inserted." })
            }

          })


        }


      }

    }
  })


})


// 後端測試，Fabric 上鏈查詢測試
main.post('/fabricTest', async (req, res) => {

  var id = req.body.id

  console.log(id)
  axios.get('https://tender-chain.fishlab.com.tw/ReadData', {
    params: {
      Id: id
    }
  })
    .then(resp => {
      console.log("status: " + resp.status)

      console.log(typeof resp)
      console.log(typeof resp.data)
      console.log("resp.data.txid: " + resp.data.txid)
      var txid = resp.data.txid
      res.json({ txid })

    }).catch(err => {
      console.log(err);
    })
})


// 後端測試，測試鏈上去更改 STATUS 狀態
main.post('/fabricRevokeTest', async (req, res) => {

  var id = 'NCHC-P-1061042022051600001'
  var tenderId = 'NCHC-P-106104'
  var accountCode = '004'
  var account = '20170223199912'
  var name = '王小明'
  var currency = '台幣'
  var branch = '1234'
  var amount = '48000000'
  var status = 'REVOKE'

  axios.post("https://tender-chain.fishlab.com.tw/UpdateData", {
    "Id": `${id}`,
    "TenderID": `${tenderId}`,
    "Accountcode": `${accountCode}`,
    "Account": `${account}`,
    "Name": `${name}`,
    "Currency": `${currency}`,
    "Amount": `${amount}`,
    "Branch": `${branch}`,
    "Status": `${status}`
  })
    .then(function (response) {

      console.log("status: " + response.status)
      if (response.status === 200) {

        res.json({ status: "Ture", message: `${id} revoke complete` })
      }

    }).catch(err => {
      console.log("err")
      console.log(err);
    })


})