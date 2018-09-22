
const I = actor();

const getEmptyDataMessageSelector = function(){return "[class*='empty-data-message']"};
const getToobarSelector = function(){return "[class*='Grid__toolbar']"};

module.exports = {


  getRightTableSelector(){
  return "[class*='Table__container'] .ant-table-fixed-right tbody"
},


  addButtonClick(){
    const selector = `${getToobarSelector()} [class*='ActionButton']`;
    I.waitForVisible(selector);
    I.click(selector);
  },

  getTableSelector(){
    return "[class*='Table__container'] .ant-table-scroll tbody"
  },

  async emptyDataMessageIsVisible(textPart){
    if (await I.lookForVisible(getEmptyDataMessageSelector())) {
      I.see(textPart,getEmptyDataMessageSelector());
      return true;
    } else {
      return false;
    }
  },

   pressCreateOnEmptyDataMessage(){
     within(getEmptyDataMessageSelector(), () =>{
      I.click('//button[text()="Создать"]');
    });
  },

  isVisible(){
    I.waitForVisible(this.getTableSelector());
  },

  isInvisible(){
    I.waitForInvisible(this.getTableSelector());
  },

  seeNameInTable(name){
    const selector = `${this.getTableSelector()} [data-property-code="name"]` ;
    I.waitForElement(selector);
    I.see(name, selector);
  },

};
