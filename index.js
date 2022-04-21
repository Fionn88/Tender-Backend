const express = require('express')
const port = process.env.PORT || 3000
const bodyParser = require('body-parser')
dotenv.config();
const address = process.env.IP
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
    console.log('The server is running at http://'+address+ ":" + port)
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

