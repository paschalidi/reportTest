
const I = actor();
const elements = require('./base/tableElements');


module.exports = {

  async initCreateNewTemplate(){
    if (await elements.emptyDataMessageIsVisible("У вас пока нет шаблонов")) {
      elements.pressCreateOnEmptyDataMessage();
    }
    else this.addNewReportTemplateClick();

  },
  isVisible(){
    elements.isVisible();
  },

  isInvisible(){
    elements.isInvisible();
  },

  addNewReportTemplateClick(){
    elements.addButtonClick();
  },

  checkTemplateName(name){
    elements.seeNameInTable(name);
  },

  templateActionButtonClick(code){
    const selector = `${elements.getRightTableSelector()} [data-row-key="${code}"] button`;
    I.waitForVisible(selector);
    I.click(selector);
  },

  async seeParamsInTable(params, code){
    const rowSelector = `${elements.getTableSelector()} [data-row-key="${code}"]`;
    I.waitForVisible(rowSelector);
    for (let key in params) {
      await within(rowSelector, async() =>{
        switch (key) {
          case "status":
            I.waitForVisible(`[class*="TemplateStatus"]`);
            I.waitForText(params[key], `[class*="TemplateStatus"]`);
            break;
          case "name":
          case "section":
          case "reportsCount":
            await I.waitForVisible(`[data-property-code="${key}"]`);
            await I.see(params[key], `[data-property-code="${key}"]`);
            break;
          case "editor":
            I.waitForVisible(`[data-property-code="${key}"]`);
            I.see(params[key], `[data-property-code="${key}"] a`);
            break;
        }
      });
    }
  },

};
