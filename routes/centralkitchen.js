const express = require("express");

const router = express.Router();

const {
    // controller login
    login,
    // controller login--
    // controller outlet login
    outletLogin,
    // controller outlet login--
    // controller akses page
    getAkses,
    // controller akses page--
    // controller akses outlet page
    getAksesOutlet,
    // controller akses outlet page--
    // controller dashboard
    dataDashboard,
    // controller dashboard--
    // controller dashboard outlet
    dataDashboardOutlet,
    // controller dashboard outlet--
    // controler outlet
    dataOutlet,
    editdataOutlet,
    adddataOutlet,
    // controler outlet--
    // controler vendor
    dataVendor,
    editdataVendor,
    adddataVendor,
    getVendorOption,
    // controler vendor--
    // controler master barang
    masterbarang,
    addMasterBarangData,
    editMasterBarangData,
    getMasterBarangOption,
    // controler master barang--
    // controler master produksi
    getFormAddMasterProduksi,
    masterproduksi,
    getMasterProduksi,
    addMasterProduksi,
    updateMasterProduksi,
    deleteMasterProduksi,
    // controler master produksi--
    // controler master rawprosessing
    getMasterRawprosessing,
    getMasterRawprosessingD,
    getFormAddMasterRawprosessing,
    addMasterRawprosessing,
    updateMasterrawprosessing,
    // controler master rawprosessing--
    // controler rawprosessing
    getFormRawProsessingPlan,
    addFormRawProsessingPlan,
    getRawProsessingPlanReport,
    getRawProsessingPlanPageH,
    getRawProsessingPlanPageD,
    rawProcessCompletion,
    // controler rawprosessing--
    // controler purchase order
    getPOData,
    getOpenPOData,
    getDetailPOData,
    getPOReport,
    // controler purchase order--
    // controler terima purchase order
    receivePO,
    // controler terima purchase order--
    // form pembuatan PO
    getFormPOData,
    addFormPOData,
    cancelPO,
    // form pembuatan PO--
    // controler order
    getFormAddOrder,
    addFormOrderData,
    getOrderData,
    getDetailOrderData,
    getOrderOption,
    receiveOrder,
    getOrderReport,
    // controler order--
    // controller deliveryOrder
    getDeliveryOrderData,
    addFormDeliveryOrder,
    getDeliveryOrderDetail,
    getDeliveryOrderReport,
    // controller deliveryOrder--
    // controller produksi
    getProductionPlanPageH,
    getProductionPlanPageD,
    getCompletionProductionPageD,
    getFormProductionPlan,
    addItemProductionPlan,
    addFormProductionPlan,
    getProductionPlanReport,
    productionPlanCompletion,
    // controller produksi--
    // controller user
    getUser,
    addUser,
    editUser,
    // controller user--
    // controller test
    updateTabletest,
    // controller test--
    // controller transferout
    getFormTOCK,
    addFormTOCK,
    getFormTO,
    addFormTO,
    getTransferoutData,
    getDetailTransferoutData,
    getTransferoutPrint,
    // controller transferout--
    
    // controller transferin
    getTransferinData,
    getDetailTransferinData,
    receiveTransferOut,
    receiveTransferOutCK,
    // controller transferin--
    // controller sales
    getSalesH,
    getSalesD,
    getSalesForm,
    addSales,
    // controller sales--
    // controller master plu
    getMasterPLU,
    addMasterPLU,
    getDetailMasterPLU,
    updateMasterPLU,
    // controller master plu--
    // controller pembelian
    getFormAddPembelianCK,
    addDataPembelianCK,
    addDataPembelian,
    getPembelianH,
    getDetailPembelian,
    // controller pembelian--

} = require("../controllers/centralkitchen");

// controller login
router.post("/login", login);
// controller login--
// controller outlet login
router.post("/outletLogin", outletLogin);
// controller outlet login--
// controller akses page
router.post("/getAkses", getAkses);
// controller akses page--
// controller akses outlet page
router.post("/getAksesOutlet", getAksesOutlet);
// controller akses outlet page--
// controller dashboard
router.get("/dataDashboard", dataDashboard);
// controller dashboard--
// controller dashboard outlet
router.post("/dataDashboardOutlet", dataDashboardOutlet);
// controller dashboard outlet--
// controler outlet
router.get("/dataOutlet", dataOutlet);
router.post("/editdataOutlet", editdataOutlet);
router.post("/adddataOutlet", adddataOutlet);
// controler outlet--
// controler vendor
router.get("/dataVendor", dataVendor);
router.post("/editdataVendor", editdataVendor);
router.post("/adddataVendor", adddataVendor);
router.get("/getVendorOption", getVendorOption);
// controler vendor--
// controler master barang
router.get("/masterbarang", masterbarang);
router.post("/editMasterBarangData", editMasterBarangData);
router.post("/addMasterBarangData", addMasterBarangData);
router.get("/getMasterBarangOption", getMasterBarangOption);
// controler master barang--
// controler master produksi
router.get("/getFormAddMasterProduksi", getFormAddMasterProduksi);
router.get("/masterproduksi", masterproduksi);
router.post("/getMasterProduksi", getMasterProduksi);
router.post("/addMasterProduksi", addMasterProduksi);
router.post("/updateMasterProduksi", updateMasterProduksi);
router.post("/deleteMasterProduksi", deleteMasterProduksi);
// controler master produksi--
// controler master rawprosessing
router.get("/getMasterRawprosessing", getMasterRawprosessing);
router.post("/getMasterRawprosessingD", getMasterRawprosessingD);
router.get("/getFormAddMasterRawprosessing", getFormAddMasterRawprosessing);
router.post("/addMasterRawprosessing", addMasterRawprosessing);
router.post("/updateMasterrawprosessing", updateMasterrawprosessing);
// controler master rawprosessing--
// controler rawprosessing
router.get("/getFormRawProsessingPlan", getFormRawProsessingPlan);
router.post("/addFormRawProsessingPlan", addFormRawProsessingPlan);
router.post("/getRawProsessingPlanReport", getRawProsessingPlanReport);
router.get("/getRawProsessingPlanPageH", getRawProsessingPlanPageH);
router.post("/getRawProsessingPlanPageD", getRawProsessingPlanPageD);
router.post("/rawProcessCompletion", rawProcessCompletion);
// controler rawprosessing--
// controler purchase order
router.get("/getPOData", getPOData);
router.get("/getOpenPOData", getOpenPOData);
router.post("/getDetailPOData", getDetailPOData);
router.post("/getPOReport", getPOReport);
// controler purchase order--
// controler terima purchase order
router.post("/receivePO", receivePO);
// controler terima purchase order--
// form pembuatan PO
router.get("/getFormPOData", getFormPOData);
router.post("/addFormPOData", addFormPOData);
router.post("/cancelPO", cancelPO);
// form pembuatan PO--
// controler order
router.post("/getOrderData", getOrderData);
router.post("/getDetailOrderData", getDetailOrderData);
router.get("/getOrderOption", getOrderOption);
router.post("/getFormAddOrder", getFormAddOrder);
router.post("/addFormOrderData", addFormOrderData);
router.post("/receiveOrder", receiveOrder);
router.post("/getOrderReport", getOrderReport);
// controler order--
// controller deliveryOrder
router.get("/getDeliveryOrderData", getDeliveryOrderData);
router.post("/addFormDeliveryOrder", addFormDeliveryOrder);
router.post("/getDeliveryOrderDetail", getDeliveryOrderDetail);
router.post("/getDeliveryOrderReport", getDeliveryOrderReport);
// controller deliveryOrder--
// controller produksi
router.get("/getProductionPlanPageH", getProductionPlanPageH);
router.post("/getProductionPlanPageD", getProductionPlanPageD);
router.post("/getCompletionProductionPageD", getCompletionProductionPageD);
router.get("/getFormProductionPlan", getFormProductionPlan);
router.post("/addItemProductionPlan", addItemProductionPlan);
router.post("/addFormProductionPlan", addFormProductionPlan);
router.post("/getProductionPlanReport", getProductionPlanReport);
router.post("/productionPlanCompletion", productionPlanCompletion);
// controller produksi--
    // router.get("/getFormAddProduksi", getFormAddProduksi);
    // router.post("/getDetailBarangProduksi", getDetailBarangProduksi);
    // router.get("/getProduksiPageH", getProduksiPageH);
    // router.post("/getProduksiPageD", getProduksiPageD);
    // router.post("/addProduksi", addProduksi);
// controller user
router.get("/getUser", getUser);
router.post("/addUser", addUser);
router.post("/editUser", editUser);
// controller user--
// controller test
router.post("/updateTabletest", updateTabletest);
// controller test--

// controller transferout
router.post("/getFormTOCK", getFormTOCK);
router.post("/addFormTOCK", addFormTOCK);
router.post("/getFormTO", getFormTO);
router.post("/addFormTO", addFormTO);
router.post("/getTransferoutData", getTransferoutData);
router.post("/getDetailTransferoutData", getDetailTransferoutData);
router.post("/getTransferoutPrint", getTransferoutPrint);
// controller transferout--

// controller transferin
router.post("/getTransferinData", getTransferinData);
router.post("/getDetailTransferinData", getDetailTransferinData);
router.post("/receiveTransferOut", receiveTransferOut);
router.post("/receiveTransferOutCK", receiveTransferOutCK);
// controller transferin--

// controller sales
router.post("/getSalesH", getSalesH);
router.post("/getSalesD", getSalesD);
router.post("/getSalesForm", getSalesForm);
router.post("/addSales", addSales);
// controller sales--

// controller master plu
router.get("/getMasterPLU", getMasterPLU);
router.post("/addMasterPLU", addMasterPLU);
router.post("/getDetailMasterPLU", getDetailMasterPLU);
router.post("/updateMasterPLU", updateMasterPLU);
// controller master plu--
// controller pembelian
router.post("/getFormAddPembelianCK", getFormAddPembelianCK);
router.post("/addDataPembelianCK", addDataPembelianCK);
router.post("/addDataPembelian", addDataPembelian);
router.post("/getPembelianH", getPembelianH);
router.post("/getDetailPembelian", getDetailPembelian);
// controller pembelian--

module.exports = router;
