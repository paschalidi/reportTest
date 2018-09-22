
const I = actor();

module.exports = {

  getRCBSelector(){
    return "[data-test-selector='right-content-bar']"
  },

  rcbIsVisible(header){
    I.waitForElement(this.getRCBSelector());
    I.see(header, this.getRCBSelector());
  },

  closeRCB(){
    I.click(`${this.getRCBSelector()} [data-test-selector='right-content-bar-close']`);

  },

  rcbIsClosed(){
    I.waitForInvisible(this.getRCBSelector());
  }


};
