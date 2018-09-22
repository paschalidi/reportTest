
const I = actor();
const elements = require('./base/tableElements');


module.exports = {

  async initCreateNewReport(){
    if (await elements.emptyDataMessageIsVisible("У вас пока нет отчетов")) {
      await elements.pressCreateOnEmptyDataMessage();
    }
    else this.addNewReportClick();

  },
  isVisible(){
    elements.isVisible();
  },

  addNewReportClick(){
    elements.addButtonClick();
  },

  checkReportName(name){
    elements.seeNameInTable(name);
  },

  async getReportID(){
    return await I.grabAttributeFrom(`${elements.getTableSelector()} tr:nth-child(1)`, 'data-row-key');
  },

  runReportButtonClick(reportID){
    const selector = `${elements.getRightTableSelector()} [data-row-key="${reportID}"] button:nth-child(1)`;
    I.waitForVisible(selector);
    I.click(selector);
  },

  async seeParamsInTable(params){
    for (let key in params) {
      switch (key) {
        case "name":
        case "templateName":
          await within(`${elements.getTableSelector()} [data-row-key="${await this.getReportID()}"]`, async() =>{
            I.waitForVisible(`[data-property-code="${key}"]`);
            I.see(params[key], `[data-property-code="${key}"]`);
          });
          break;
        case "types":
          await within(`${elements.getRightTableSelector()} [data-row-key="${await this.getReportID()}"]`, async() =>{
            for (let i in params[key]) {
              I.see(params[key][i].toLowerCase(), `[class*='indicators-column']  span:nth-child(${i})`);
            }
          });
          break;
      }
    }
  },

};
