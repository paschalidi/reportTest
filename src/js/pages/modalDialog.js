
const I = actor();

const getModalSelector = function(){return ".ant-modal-content"};

module.exports = {

  isVisible(){
    I.waitForVisible(getModalSelector());
  },

  deleteAndArchive(){
    this.clickButton("Удалить и архивировать");
  },

  clickButton(text){
    const selector = `//button[text()="${text}"]`;
    within(`${getModalSelector()}`, () =>{
      I.waitForVisible(selector);
      I.click(selector);
    });
  },

  checkCountReports(reportInfo){
    const selector = `div a`;
    within(`${getModalSelector()} [class*=ConfirmModal__text]`, () =>{
      I.waitForVisible(selector);
      I.see(reportInfo, selector);
    });
  }
};
