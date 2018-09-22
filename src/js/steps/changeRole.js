
const I = actor();
require('dotenv').config();

const changeRole = async function (roleName){
  await I.amOnPage(`${process.env.APP}/?app=${roleName}`);
  await I.waitInUrl(`${roleName}`);
  I.wait(0.25);

};

module.exports = {

  async openAdminMode(){
    await changeRole("ADMIN");
  },

  async openUserMode(){
    await changeRole("USER");
  },

};
