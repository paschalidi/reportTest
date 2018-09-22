const moment = require('moment');


class PuppeteerHelper extends Helper {

  async setTokenToLS(creds) {
    const page = this.helpers['Puppeteer'].page;

    const data = {
      "token": creds.access_token,
      "refresh_token": creds.refresh_token,
      "expires": creds.expires_in * 1000 + moment().valueOf()

    };
    await page.evaluate(async (data) => {
      await localStorage.setItem("REFERENCE_TOKEN", data.token);
      await localStorage.setItem("REFERENCE_REFRESH_TOKEN", data.refresh_token);
      await localStorage.setItem("REFERENCE_TOKEN_EXPIRES", data.expires);
    }, data);
  }

  async lookForVisible(selector) {
    const page = this.helpers['Puppeteer'].page;

    return await page.$(selector) !== null;
  }

}

module.exports = PuppeteerHelper;
