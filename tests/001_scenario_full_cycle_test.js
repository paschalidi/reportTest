
Feature('Создание/удаление шаблона и отчета');

require('dotenv').config();
const  moment  = require('moment');
require('events').EventEmitter.defaultMaxListeners = 100;


Before(async(I, auth) => {
  await auth.logInWithLS();
});

const templateData = {
  "name":"Тестовый шаблон 1",
  "code":"testTemplateOne",
  "section":"тестовые",
  "file":"new_report.rptdesign.xml",
  "parametersFile":"test-par-file.json"
};

const templateDataInTable = {
  "name":"Тестовый шаблон 1",
  "status":"Активный",
  "section":"тестовые",
  "editor":`${process.env.LOGIN}`,
  "reportsCount":"0"
};

const templateParams = {
  "1":{"name":"Дата/Время", "type":"Дата/Время"},
  "2":{"name":"Текст", "type":"Строка"},
  "3":{"name":"Булево значение", "type":"Булево значение"},
  "4":{"name":"Число с плавающей точкой", "type":"Число с плавающей точкой"},
  "5":{"name":"Целое число", "type":"Целое число"},
  "6":{"name":"Файл", "type":"Файл"}
};

const templatePermissions = {
  "ReportAdmin":[
    "VIEW_TEMPLATE",
    "EDIT_TEMPLATE",
    "DELETE_RESTORE_TEMPLATE",
    "GENERATE_REPORT",
    "VIEW_OWN_REPORT",
    "DELETE_OWN_REPORT"
  ]
};

const reportParams = {
  "templateName":"Тестовый шаблон 1",
  "params":{"TIMESTAMP":`${moment().locale("ru").format('DD MMM YYYY, dddd')}`, "STRING":"Простой текст","DOUBLE":"1.44", "LONG":"314","BOOLEAN":true, "FILE":"test-par-file.json"},
  "reportName":"Первый отчет",
  "types":{"1":"PDF", "2":"XLS"}
};

const reportInfo = {
  "name":`${reportParams["reportName"]}`,
  "templateName":`${reportParams["templateName"]}`,
  "types":reportParams["types"]

};


Scenario(`Создание шаблона "${templateData["name"]}"`, async (I, adminTable,templateForm,changeRole) => {

  await changeRole.openAdminMode();
  await adminTable.initCreateNewTemplate();
  templateForm.shortFormIsVisible();
  await templateForm.fillCommonField(templateData);
  templateForm.fullFormIsVisible();
  templateForm.currentStatusIs("Черновик");
  await templateForm.checkDataInGeneralInfo(templateData);
  await templateForm.checkTemplateParams(templateParams);
  await templateForm.checkPermissions(templatePermissions);
  templateForm.clickFirstButton();
  templateForm.currentStatusIs("Активный");
  await I.refreshPage();
  adminTable.isVisible();
  await adminTable.seeParamsInTable(templateDataInTable, templateData["code"]);

});


Scenario(`Создание отчета по шаблону "${templateData["name"]}"`, async (I, userTable, newReportRCB, changeRole) => {

  await changeRole.openUserMode();
  await userTable.initCreateNewReport();
  newReportRCB.isVisible();
  await newReportRCB.createNewReport(reportParams);
  newReportRCB.isClosed();
  userTable.isVisible();
  userTable.checkReportName(reportParams["reportName"]);
  const reportId = await userTable.getReportID();
  await userTable.seeParamsInTable(reportInfo);
  userTable.runReportButtonClick(reportId);
  newReportRCB.isVisible();
  await newReportRCB.checkReportParams(reportParams["params"]);
  newReportRCB.closeRCB();

});


Scenario(`Архивация шаблона "${templateData["name"]}" с удалением отчета`, async (I, adminTable,changeRole,modalDialog) => {


  const templateShortDataInTable = {
    "status":"Активный",
    "section":"тестовые",
    "reportsCount":"1"
  };

  await changeRole.openAdminMode();
  adminTable.isVisible();
  await adminTable.seeParamsInTable(templateShortDataInTable, templateData["code"]);
  adminTable.templateActionButtonClick(templateData["code"]);
  modalDialog.isVisible();
  modalDialog.checkCountReports("1 отчет");
  modalDialog.deleteAndArchive();
  templateShortDataInTable["status"] = "Архив";
  templateShortDataInTable["reportsCount"] = "0";
  await adminTable.seeParamsInTable(templateShortDataInTable, templateData["code"]);

});

Scenario(`Удаление шаблона "${templateData["name"]}"`, async (I, adminTable,changeRole) => {

  const templateShortDataInTable = {
    "status":"Архив"
  };

  await changeRole.openAdminMode();
  adminTable.isVisible();
  await adminTable.seeParamsInTable(templateShortDataInTable, templateData["code"]);
  adminTable.templateActionButtonClick(templateData["code"]);
  adminTable.isInvisible();


});