const express = require('express')

const router = express.Router()

const {
    loginAdmin,
    getAllAdmin,
    getSCUOutlet,
    cekBarcode,
    inputBarcode,
    carisesi,
    scanDetail,
    scandetailbypc9,
    scandetailbypc9breakdown,
    hapusdatascan,
    uploaddatascan,
    cekdatascan,
    addSession,
    daftarSesi,
    getZ10,
    uploadZ30,
    getSesiData,
    hapusZ30,
    addZ10
} = require("../controllers/opname")


router.post("/login", loginAdmin);
router.get("/getAllAdmin", getAllAdmin);
router.get("/getSCUOutlet", getSCUOutlet);
router.post("/cekbarcode", cekBarcode);
router.post("/inputbarcode", inputBarcode);
router.post("/carisesi", carisesi);
router.post("/scandetail", scanDetail);
router.post("/scandetailbypc9", scandetailbypc9);
router.post("/scandetailbypc9breakdown", scandetailbypc9breakdown);
router.post("/hapusdatascan", hapusdatascan);
router.post("/uploaddatascan", uploaddatascan);
router.post("/cekdatascan", cekdatascan);
router.post("/addSession", addSession);
router.post("/daftarSesi", daftarSesi);
router.get("/getZ10", getZ10);
router.post("/uploadZ30", uploadZ30);
router.post("/getSesiData", getSesiData);
router.post("/hapusZ30", hapusZ30);
router.post("/addZ10", addZ10);

module.exports = router;