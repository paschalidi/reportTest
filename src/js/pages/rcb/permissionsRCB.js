
const I = actor();
const elements = require('./base/rcbElements');
const { assert } = require('chai');

module.exports = {

  isVisible(){
    elements.rcbIsVisible("Доступно пользователям");
  },

  closeRCB(){
    elements.closeRCB();
  },

  async setPermissions(data){
      if (await I.lookForVisible('[data-property-key="permissions"]>div >label:nth-child(1) .ant-checkbox-indeterminate')){
        I.doubleClick("Выбрать все");
      } else if (await I.lookForVisible('[data-property-key="permissions"]>div >label:nth-child(1) .ant-checkbox-checked'))
        I.click("Выбрать все");
      for (let i in data) {
        I.waitForText(data[i]);
        I.click(data[i]);
      }
  },

  async checkPermissions(data){
    await within(`${elements.getRCBSelector()} .ant-checkbox-group`, async() =>{
      for (let i in data) {
        I.waitForElement(`.ant-checkbox-checked [value='${data[i]}']`);
      }
    });
  },

  async editPermissions(data){
    await within(elements.getRCBSelector(), async() =>{

    });
  },

  savePermissions(){
    const saveButtonSelector = `//button[text()="Сохранить"]`;
    I.waitForElement(saveButtonSelector);
    I.click(saveButtonSelector);
  }

};
