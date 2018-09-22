
const I = actor();
require('dotenv').config();

const getCredsAndClearTabs = async function () {
  const creds = await I.getCreds();
  await I.amOnPage(process.env.APP + `/api/core/test/data/clean?token=${creds.access_token}&refreshToken=${creds.refresh_token}`);
  return creds;
};

module.exports = {

  async logInWithLS(){
    const creds = await getCredsAndClearTabs();
    await I.setTokenToLS(creds);
    await I.amOnPage(process.env.APP);
  }

};