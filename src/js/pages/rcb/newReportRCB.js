
const I = actor();
const elements = require('./base/rcbElements');
const { assert } = require('chai');

const setTemplate = function (templateName){
  const blockSelector = `[data-property-key="templateCode"]`;
  I.waitForVisible(`${blockSelector} input`);
  I.fillField(`${blockSelector} input`, templateName);
  I.waitForVisible(`//span[text()="${templateName}"]`);
  I.click(`[class*='TemplateField__template-section'] span:nth-child(1)`);
  I.waitForVisible(`${blockSelector} [class*="TemplateField__checked"]`);
};

const setReportName = function (reportName){
  const reportNameSelector = `[data-property-key="name"] input`;
  I.waitForVisible(reportNameSelector);
  I.fillField(reportNameSelector, reportName);
};

const setReportType = async function (type){
  const reportTypeSelector = `[data-property-key="types"]`;
  I.waitForVisible(reportTypeSelector);
  for (let key in type) {
    I.waitForText(type[key], `${reportTypeSelector} span`);
    I.click(`//span[text()="${type[key]}"]`);
  }
  await I.seeNumberOfVisibleElements('[class*="Field__selected"]', await Object.keys(type).length);
};

const   setParams = function(params){
  for (let key in params) {
    switch (key) {
      case "TIMESTAMP":
        const timestamp = '[data-property-key="TIMESTAMP"]';
        const dateTimePicker = '[class*="DateTimePicker__container"]';
        I.waitForVisible(timestamp);
        I.click(timestamp);
        I.waitForVisible(`${dateTimePicker} [class*="date-cell-current"]`);
        I.click(`${dateTimePicker} [class*="date-cell-current"]`);
        I.seeInField(`${timestamp} input`, params[key]);
        break;
      case "STRING":
        const stringSelector = "[data-property-key='STRING'] input";
        I.waitForVisible(stringSelector);
        I.fillField(stringSelector, params[key]);
        break;
      case "DOUBLE":
        const doubleSelector = "[data-property-key='DOUBLE'] input";
        I.waitForVisible(doubleSelector);
        I.fillField(doubleSelector, params[key]);
        break;
      case "LONG":
        const longSelector = "[data-property-key='LONG'] input";
        I.waitForVisible(longSelector);
        I.fillField(longSelector, params[key]);
        break;
      case "BOOLEAN":
        if (params[key]) {
          const booleanSelector = "[data-property-key='BOOLEAN'] span";
          I.waitForVisible(booleanSelector);
          I.click(booleanSelector);
          I.waitForElement(booleanSelector);
        }
        break;
      case "FILE":
        const fileSelector = `[data-property-key="FILE"] input`;
        const successUploadSelector = `form div .ant-col-20`;
        I.attachFile(fileSelector, `data/${params[key]}`);
        I.waitForInvisible(fileSelector);
        I.waitForVisible(successUploadSelector);
        break;
    }
  }

};


module.exports = {

  isVisible(){
    elements.rcbIsVisible("Новый отчет");
  },

  isClosed(){
    elements.rcbIsClosed();
  },

  closeRCB(){
    elements.closeRCB();
  },

  async checkReportParams(params){
    const stepSelector = `${elements.getRCBSelector()} [class*="wizard-step"]`;
    I.waitForElement(stepSelector);
    await within(stepSelector, async() =>{
      for (let key in params){
        switch (key) {
          case "TIMESTAMP":
          case "STRING":
          case "DOUBLE":
          case "LONG":
            const inputSelector = `[data-property-key="${key}"] input`;
            I.waitForVisible(inputSelector);
            I.click(inputSelector);
            const text = await I.grabValueFrom(inputSelector);
            await assert.equal(params[key], text, "Значение не совпало");
            break;
          case "BOOLEAN":
            const booleanSelector = `[data-property-key='${key}'] span`;
            I.waitForVisible(booleanSelector);
            const selectedSelector = `${booleanSelector}.ant-checkbox-checked`;
            if (params[key]) {
              I.seeElement(selectedSelector);
            } else {
              I.dontSeeElement(selectedSelector);
            }
            break;
          case "FILE":
            const successUploadSelector = `form div.ant-col-20`;
            I.waitForVisible(successUploadSelector);
            const currentText = await I.grabTextFrom(successUploadSelector);
            await assert.equal(params[key], currentText, "Значение не совпало");
            break;
        }
      }
    });

  },

  async createNewReport(reportData){
    setTemplate(reportData["templateName"]);
    this.nextButtonClick();
    setParams(reportData["params"]);
    await within(elements.getRCBSelector(), async() =>{
      this.nextButtonClick();
      setReportName(reportData["reportName"]);
      await setReportType(reportData["types"]);
      this.nextButtonClick();
    });
  },

  nextButtonClick(){
    const selector = `//button[text()="Далее"]`;
    I.waitForElement(selector);
    I.click(selector);
  }

};
