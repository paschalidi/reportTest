
const I = actor();
const { assert } = require('chai');
const permissionsRCB = require('./rcb/permissionsRCB');

const getFormSelector = function(){return "[class*='NavigationLayout__content']"};
const getToolbarSelector = function(){return "[class*= 'Toolbar__toolbar']"};
const getSidebarSelector = function(){return "[class*= 'NavigationLayout__sidebar']"};

const generalInfoBlock = {
  "selector": "> div:nth-child(1)",
  "header": "Общая информация"
};

const permissionsBlock = {
  "selector": "> div:nth-child(4)",
  "header": "Доступно пользователям"
};

module.exports = {

  async blockIsVisible(selector, header){
    const generalInfoSelector = `${getFormSelector()} ${selector}`;
    await within(generalInfoSelector, async() =>{
      await I.waitForVisible(`//h4[text()='${header}']`);
    });
    return generalInfoSelector;
  },

  async clickSaveButton(){
    await within(getFormSelector(), async() =>{
      I.click("//button[text()='Сохранить']");
    });
  },

  clickFirstButton(){
    const selector = `${getToolbarSelector()} button:nth-child(1)`;
    I.waitForElement(selector);
    I.click(selector);
  },

  clickSecondButton(){
    const selector = `${getToolbarSelector()} button:nth-child(2)`;
    I.waitForElement(selector);
    I.click(selector);
  },

  async clickCancelButton(){
    const selector = "//button[text()='Отмена']";
    await within(getFormSelector(), async() =>{
      I.waitForElement(selector);
      I.click(selector);
    });
  },


  currentStatusIs(status){
    const selector = `${getToolbarSelector()} [class*='template-status']`;
    I.waitForElement(selector);
    I.waitForText(status, selector);
  },

  async fillCommonField(data){
    await within(await this.blockIsVisible(generalInfoBlock["selector"], generalInfoBlock["header"]), async() =>{
      for (let key in data) {
        switch (key) {
          case "name":
          case "code":
          case "section":
            const selector = `[data-property-key="${key}"]`;
            I.click(selector);
            I.fillField(selector, data[key]);
            if (key == "section") {
              I.pressKey('Enter');
            }
            break;
          case "file":
          case "parametersFile":
            let i = 5;
            if (key == "file"){
              i = 4;
            }
            const fileSelector = `[data-property-key="${key}"]`;
            const successUploadSelector = `form div:nth-child(${i}) .ant-col-20`;
            I.attachFile(`${fileSelector} input`, `data/${data[key]}`);
            I.waitForInvisible(fileSelector);
            I.waitForVisible(successUploadSelector);
            break;
        }
      }
    });
    await this.clickSaveButton();
  },

  async checkDataInGeneralInfo(data){
    await within(await this.blockIsVisible(generalInfoBlock["selector"], generalInfoBlock["header"]), async() =>{
      for (let key in data) {
        const selector = `[data-property-key="${key}"]`;
        switch (key) {
          case "name":
            I.waitForElement(`${selector} textarea`);
            I.seeInField(`${selector} textarea`, data[key]);
            break;
          case "code":
            I.waitForElement(`${selector} input`);
            I.seeInField(`${selector} input`, data[key]);
            break;
          case "section":
            I.waitForElement(`${selector} [class*="selected-value"]`);
            I.see(data[key], `${selector} [class*="selected-value"]`);
            break;
          case "file":
          case "parametersFile":
            let i = 5;
            if (key == "file"){
              i = 4;
            }
            const successUploadSelector = `form div:nth-child(${i}) .ant-col-20`;
            I.waitForElement(successUploadSelector);
            I.see(data[key], successUploadSelector);
            break;
        }
      }
    });
  },


  async checkTemplateParams(data){
    await within(await this.blockIsVisible("> div:nth-child(2)", "Параметры шаблона"), async() =>{
      for (let key in data) {
        for (let i in data[key]){
          const selector = `.ant-table-scroll .ant-table-tbody tr:nth-child(${key}) [data-property-code="${i}"]`;
          I.waitForElement(selector);
          I.see(data[key][i], selector);
        }
      }
    });
  },

  async checkPermissions(data){
      for (let key in data) {
        await within(await this.blockIsVisible(permissionsBlock["selector"], permissionsBlock["header"]), async() =>{
        I.click(`//span[text()="${key}"]`);
        });
        permissionsRCB.isVisible();
        await permissionsRCB.checkPermissions(data[key]);
        permissionsRCB.closeRCB();
      }
  },

  async setPermissions(data){
    for (let key in data) {
      await within(await this.blockIsVisible(permissionsBlock["selector"], permissionsBlock["header"]), async() =>{
        I.click(`//span[text()="${key}"]`);
      });
      permissionsRCB.isVisible();
      await permissionsRCB.setPermissions(data[key]);
      permissionsRCB.savePermissions();
    }
  },

  fullFormIsVisible(){
    I.waitForVisible(getSidebarSelector());
    I.seeElement(getSidebarSelector());
   },

  shortFormIsVisible(){
    I.waitForVisible(getFormSelector());
    I.seeElement(getSidebarSelector());
  }

};
