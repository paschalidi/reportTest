const fetch = require('node-fetch');
require('dotenv').config();

class Authorization extends Helper {

  async getCreds() {
   try{
     let payload = {
       username: process.env.LOGIN,
       password: process.env.PASSWORD
     };
     let response = await fetch(process.env.SECURITY_APP + '/login', {
       method: 'POST',
       body: JSON.stringify(payload),
       headers: { 'Content-Type': 'application/json'}
     });
     return await response.json();
  }  catch(e){
       throw(e);
     }
  }
}

module.exports = Authorization;
