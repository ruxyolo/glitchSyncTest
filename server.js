const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const crypto = require('crypto');
const cmd = require('node-cmd');
var server;
const port = 7515; //A nice number

app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function githubSync(req, res) {
  let hmac = crypto.createHmac('sha1', process.env.gitSecret);
  let sig  = `sha1=${hmac.update(JSON.stringify(req.body)).digest('hex')}`;
  
  if (req.headers['x-github-event'] == 'push' && sig === req.headers['x-hub-signature']) {
    cmd.run('chmod 777 -R ./git.sh');
    
    cmd.run('./git.sh', (err, data) => {
      if (err) {
        console.warn('Error when trying to sync with github!')
        console.log(err)   
        return res.sendStatus(500);
      } else { //Sucessful sync
        cmd.run('refresh');
    
        return res.sendStatus(202);
      }
    })
    
  } else if (sig != req.headers['x-hub-signature']) {
    return res.sendStatus(401);
  }
}

function server_start() {
  if (!server) {
    console.log("Loading localhost...");

    //cmd.run('rm -rf .git'); //Clear .git data
    
    app.post('/git', githubSync);
    
    app.get("/", (req, res) => {
      res.sendStatus(202);
    });
    server = app.listen(port, function () {
      console.log("Server is up on port: " + port);
    });
  }
}
server_start()
