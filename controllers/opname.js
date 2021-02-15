const connection = require("../config/opname")
const connectionHris = require("../config/oauth")
const moment = require('moment-timezone')

module.exports = {
    loginAdmin: (req,res) => {
        connectionHris.query(`SELECT * FROM prm_karyawan WHERE NIK = "${req.body.NIK}"`,(error,result,field)=> {
            if (error){
                res.status(400).send({
                    error
                });
            }
            else{
                if(result.length >= 1){
                    let tanggalResign = result[0].tanggal_resign.replace(/[\D]/g, "");
                    let curDate = moment().tz("Asia/Jakarta").format('YYYYMMDD')
                    if( tanggalResign === '' || tanggalResign >= curDate){
                        res.status(200).send({
                            message: `Login success`,
                            result
                        });
                    } else {
                        res.send({message:"karyawan yang bersangkutan sudah tidak aktif"});
                    }
                } else {
                    res.status(200).send({
                        message: `Akun tidak ditemukan`
                    });
                }
            }
        });
    },
    getAllAdmin:(req,res) =>{
        connectionHris.query("SELECT * FROM prm_karyawan",(error,result,field)=> {
            if (error){
                res.status(400).send({
                    error
                });
            }
            else{
                res.status(200).send({
                    result
                });
            }

        });
    },
    getSCUOutlet:(req,res) =>{
        connectionHris.query(`SELECT * FROM lokasi WHERE parameter_nik = "2" `,(error,result,field)=> {
            if (error){
                res.status(400).send({
                    error
                });
            }
            else{
                let panjangArray=result.length
                let dataToShow=[]
                for(i=0;i<panjangArray;i++){
                    let dataTopush = {
                        value:`${result[i].id_lokasi}`,
                        label:`${result[i].nama_lokasi}`
                    }
                    dataToShow.push(dataTopush)
                }
                res.status(200).send({
                    dataToShow
                });
            }
        });
    },
    cekdatascan:(req,res) =>{
        let id_opname = req.body.ID
        let nik = req.body.NIK
        connection.query(`SELECT * FROM scan WHERE id_opname = '${id_opname}' AND NIK = '${nik}' AND status_upload = 'NOTDONE' `,(error,result,field)=> {
            if (error){
                res.status(400).send({
                    error
                });
            }
            else{
                if(result.length >= 1){
                    res.status(200).send({
                        "status":'00'
                    });
                } else {
                    res.status(200).send({
                        "status":'01'
                    });
                }
            }

        });
    },
    uploaddatascan:(req,res) =>{
        let id_opname = req.body.ID
        let nik = req.body.NIK
        connection.query(`SELECT * FROM scan WHERE id_opname = '${id_opname}' AND NIK = '${nik}' AND status_upload = 'DONE' GROUP BY lokasi `,(errorl,resultl,fieldl)=> {
            if (errorl){
                res.status(400).send({
                    errorl
                });
            }
            else{
                if(resultl.length >= 1){
                    var keberapa = resultl.length+1
                    var lokasi = `lokasi ke-`+keberapa+` `+nik
                } else {
                    var keberapa = 1
                    var lokasi = `lokasi ke-`+keberapa+` `+nik
                }
                connection.query(`UPDATE scan SET lokasi = '${lokasi}' WHERE id_opname = '${id_opname}' AND NIK = '${nik}' AND status_upload = 'NOTDONE' `,(error,result,field)=> {
                    if (error){
                        res.status(400).send({
                            error
                        });
                    }
                    else{
                        connection.query(`UPDATE scan SET status_upload = 'DONE' WHERE id_opname = '${id_opname}' AND NIK = '${nik}' AND lokasi = '${lokasi}' `,(error1,result1,field1)=> {
                            if (error1){
                                res.status(400).send({
                                    error1
                                });
                            }
                            else{
                                res.status(200).send({
                                    "status":'00',
                                    "pesan":'berhasil mengupload data scan'
                                });
                            }

                        });
                    }

                });
            }

        });
    },
    hapusdatascan:(req,res) =>{
        let id_opname = req.body.ID
        let nik = req.body.NIK
        connection.query(`DELETE FROM scan WHERE id_opname = '${id_opname}' AND NIK = '${nik}' AND status_upload = 'NOTDONE'`,(error,result,field)=> {
            if (error){
                res.status(400).send({
                    error
                });
            }
            else{
                res.status(200).send({
                    "status":'00',
                    "pesan":'berhasil menghapus data scan'
                });
            }

        });
    },
    scandetailbypc9breakdown:(req,res) =>{
        let id_opname = req.body.ID
        let nik = req.body.NIK
        let pc9 = req.body.PC9
        connection.query(`SELECT * FROM scan WHERE id_opname = '${id_opname}' AND NIK = '${nik}' AND pc9 = '${pc9}' AND status_upload = 'NOTDONE' `,(error,result,field)=> {
            if (error){
                res.status(400).send({
                    error
                });
            }
            else{
                if(result.length >= 1){
                    res.status(200).send({
                        "status":'00',
                        result
                    });
                } else {
                    res.status(200).send({
                        "status":'01'
                    });
                }
            }

        });
    },
    scandetailbypc9:(req,res) =>{
        let id_opname = req.body.ID
        let nik = req.body.NIK
        connection.query(`SELECT pc9,short_name,(SELECT COUNT(pc9) FROM scan AS T2 WHERE id_opname = '${id_opname}' AND NIK = '${nik}' AND T2.pc9 = T1.pc9 AND status_upload = 'NOTDONE') as test FROM scan AS T1 WHERE id_opname = '${id_opname}' AND NIK = '${nik}' AND status_upload = 'NOTDONE' GROUP BY pc9`,(error,result,field)=> {
            if (error){
                res.status(400).send({
                    error
                });
            }
            else{
                if(result.length >= 1){
                    res.status(200).send({
                        "status":'00',
                        result
                    });
                } else {
                    res.status(200).send({
                        "status":'01'
                    });
                }
            }

        });
    },
    scanDetail:(req,res) =>{
        let id_opname = req.body.ID
        let nik = req.body.NIK
        connection.query(`SELECT * FROM scan WHERE id_opname = '${id_opname}' AND NIK = '${nik}'`,(error,result,field)=> {
            if (error){
                res.status(400).send({
                    error
                });
            }
            else{
                if(result.length >= 1){
                    res.status(200).send({
                        "status":'00',
                        result
                    });
                } else {
                    res.status(200).send({
                        "status":'01'
                    });
                }
            }

        });
    },
    cekBarcode:(req,res) =>{
        connection.query(`SELECT * FROM z10 WHERE barcode = '${req.body.BARCODE}'`,(error,result,field)=> {
            if (error){
                res.status(400).send({
                    error
                });
            }
            else{
                if(result.length >= 1){
                    res.status(200).send({
                        "status":'00',
                        "barcode":result[0].barcode,
                        "productcode":result[0].productcode,
                        "short_name":result[0].short_name,
                        "Season":result[0].Season,
                        "Level1_Description":result[0].Level1_Description,
                        "Level2_Description":result[0].Level2_Description,
                        "Level3_Description":result[0].Level3_Description,
                        "Level4_Description":result[0].Level4_Description,
                        "waist":result[0].waist,
                        "inseam":result[0].inseam,
                        "Retail_Price":result[0].Retail_Price
                    });
                } else {
                    res.status(200).send({
                        "status":'01'
                    });
                }
            }

        });
    },
    inputBarcode:(req,res) =>{
        let barcode = req.body.BARCODE
        let pc9 = req.body.PC9
        let short_name = req.body.SHORT_NAME
        let product_category = req.body.PRODUCT_CATEGORY
        let waist = req.body.WAIST
        let inseam = req.body.INSEAM
        let idopname = req.body.IDOPNAME
        let nik = req.body.NIK

        connection.query(`INSERT INTO scan values('${barcode.replace(/\s/g, '')}','${pc9.replace(/\s/g, '')}','${short_name.replace(/\s/g, '')}','${product_category}','${waist.replace(/\s+/g, '')}','${inseam.replace(/\s+/g, '')}','','${nik.replace(/\s/g, '')}','${idopname.replace(/\s/g, '')}','NOTDONE')`,(error,result,field)=> {
            if (error){
                res.status(400).send({
                    error
                });
            }
            else{
                res.status(200).send({
                    "status":'00'
                });
            }

        });
    },
    carisesi:(req,res) =>{
        connection.query(`SELECT * FROM opname_session WHERE id_opname = '${req.body.IDOPNAME}'`,(error,result,field)=> {
            if (error){
                res.status(400).send({
                    error
                });
            }
            else{
                if(result.length >= 1){
                    if(result[0].status_opname == "OPEN"){
                        res.status(200).send({
                            "status":"00",
                            "id_opname":result[0].id_opname,
                            "nama_user":result[0].nama_user,
                            "lokasi_opname":result[0].lokasi_opname,
                            "tanggal_opname":result[0].tanggal_opname,
                            "keterangan_opname":result[0].keterangan_opname,
                            "status_opname":result[0].status_opname
                        });
                    } else {
                        res.status(200).send({
                            "status":"01",
                            "pesan":"kode sesi sudah tidak berlaku"
                        });
                    }
                } else {
                    res.status(200).send({
                        "status":"01",
                        "pesan":"Kode sesi tidak dikenal"
                    });
                }
            }

        });
    },
    addSession:(req,res) =>{
        let firstPrm = moment().startOf('month').format('YYYY-MM-DD HH:mm:ss')
        let lastPrm = moment().endOf('month').format('YYYY-MM-DD HH:mm:ss')
        let year = moment().format("YY")
        let month = moment().format("M")
        connection.query(`
        SELECT COUNT(id_opname) AS total
        FROM opname_session
        WHERE tanggal_opname
        BETWEEN "${firstPrm}"
        AND "${lastPrm}"
        `,(errorx,resultx,fieldx)=> {
            if (errorx){
                res.status(400).send({
                    errorx
                });
            }
            else{
                let totalData = parseInt(resultx[0].total)+1
                let totalDatastring = totalData.toString()
                let runData = totalDatastring.padStart(4, '0')
                let automateNumber = "SOP"+year+month+runData
                connection.query(`INSERT INTO opname_session values(
                    "${automateNumber}",
                    "${req.body.NIKUSER}",
                    "${req.body.NAMAUSER}",
                    "${req.body.IDLOKASI}",
                    "${req.body.NAMALOKASI}",
                    "${req.body.TANGGAL}",
                    "${req.body.NOTE}",
                    "OPEN"
                    )`,(error,result,field)=> {
                    if (error){
                        res.status(400).send({
                            error
                        });
                    }
                    else{
                        res.status(200).send({
                            status:"01"
                        });
                    }
                });
            }
        });
    },
    daftarSesi:(req,res) =>{
        connection.query(`SELECT * FROM opname_session WHERE NIK_usser = '${req.body.NIK}'`,(error,result,field)=> {
            if (error){
                res.status(400).send({
                    error
                });
            }
            else{
                let dataSesi=[]
                for(i=0;i<result.length;i++){
                    let dataTopush1 = {
                        id_opname:`${result[i].id_opname}`,
                        NIK_usser:`${result[i].NIK_usser}`,
                        nama_user:`${result[i].nama_user}`,
                        id_lokasi_opname:`${result[i].id_lokasi_opname}`,
                        lokasi_opname:`${result[i].lokasi_opname}`,
                        tanggal_opname:`${result[i].tanggal_opname}`,
                        keterangan_opname:`${result[i].keterangan_opname}`,
                        status_opname:`${result[i].status_opname}`
                    }
                    dataSesi.push(dataTopush1)
                }
                res.status(200).send({
                    dataSesi
                });
            }

        });
    },
    getZ10:(req,res) =>{
        connection.query("SELECT * FROM z10",(error,result,field)=> {
            if (error){
                res.status(400).send({
                    error
                });
            }
            else{
                res.status(200).send({
                    status:"oke",
                    data:result[0]
                });
            }

        });
    },
    addZ10:(req,res) =>{
        let sqlZ10 = "INSERT INTO z10 (barcode,productcode,short_name,Season,Level1_Description,Level2_Description,Level3_Description,Level4_Description,waist,inseam,SHORT_SKU,SKU_TYPE_CODE,Retail_Price,ts_id) VALUES ?";
        let dataArrayZ10 = [];
        for (iZ10=0;iZ10<req.body.DATAZ10.length;iZ10++) {
            let dataToPushZ10 = [
                `${req.body.DATAZ10[iZ10].barcode}`,
                `${req.body.DATAZ10[iZ10].Product_Code}`,
                `${req.body.DATAZ10[iZ10].short_name}`,
                `${req.body.DATAZ10[iZ10].Season}`,
                `${req.body.DATAZ10[iZ10].Level1_Description}`,
                `${req.body.DATAZ10[iZ10].Level2_Description}`,
                `${req.body.DATAZ10[iZ10].Level3_Description}`,
                `${req.body.DATAZ10[iZ10].Level4_Description}`,
                `${req.body.DATAZ10[iZ10].size_code}`,
                `${req.body.DATAZ10[iZ10].color_code}`,
                `${req.body.DATAZ10[iZ10].color_code}`,
                `${req.body.DATAZ10[iZ10].color_code}`,
                `${req.body.DATAZ10[iZ10].Retail_Price}`,
                `${req.body.DATAZ10[iZ10].ts_id}`
            ]
            dataArrayZ10.push(dataToPushZ10)
        }
        connection.query(sqlZ10, [dataArrayZ10],(errorZ10,resultZ10,fieldZ10)=> {
            if (errorZ10){
                console.log("5");
                res.status(400).send({
                    errorZ10
                });
            }
            else{
                res.status(200).send({
                    status:"01"
                });
            }
        });
    },
    uploadZ30:(req,res) =>{
        let sqlZ30 = "INSERT INTO z30 (store_code,store_name,division,department,sub_department,class,short_name,season_collection,season,product_code,size_code,color_code,onhand_qty,unit_retail_price,onhand_retail,unit_average_cost,onhand_cost,id_opname) VALUES ?";
        let dataArrayZ30 = [];
        for (iz30=0;iz30<req.body.DATAZ30.length;iz30++) {
            let dataToPushZ30 = [
                `${req.body.DATAZ30[iz30].data0}`,
                `${req.body.DATAZ30[iz30].data1}`,
                `${req.body.DATAZ30[iz30].data2}`,
                `${req.body.DATAZ30[iz30].data3}`,
                `${req.body.DATAZ30[iz30].data4}`,
                `${req.body.DATAZ30[iz30].data5}`,
                `${req.body.DATAZ30[iz30].data6}`,
                `${req.body.DATAZ30[iz30].data7}`,
                `${req.body.DATAZ30[iz30].data8}`,
                `${req.body.DATAZ30[iz30].data9}`,
                `${req.body.DATAZ30[iz30].data10}`,
                `${req.body.DATAZ30[iz30].data11}`,
                `${req.body.DATAZ30[iz30].data12}`,
                `${req.body.DATAZ30[iz30].data13}`,
                `${req.body.DATAZ30[iz30].data14}`,
                `${req.body.DATAZ30[iz30].data15}`,
                `${req.body.DATAZ30[iz30].data16}`,
                `${req.body.IDOPNAME}`
            ]
            dataArrayZ30.push(dataToPushZ30)
        }
        connection.query(sqlZ30, [dataArrayZ30],(errorZ30,resultZ30,fieldZ30)=> {
            if (errorZ30){
                console.log("5");
                res.status(400).send({
                    errorZ30
                });
            }
            else{
                res.status(200).send({
                    status:"01",
                    dataUpload:`${req.body.DATAZ30}`
                });
            }
        });
    },
    getSesiData:(req,res) =>{
        connection.query(`
        SELECT 
        x.store_code,
        x.store_name,
        x.division,
        x.department,
        x.sub_department,
        x.class,
        x.short_name,
        x.season_collection,
        x.season,
        x.product_code,
        x.size_code,
        x.color_code,
        x.onhand_qty,
        x.unit_retail_price,
        x.onhand_retail,
        x.unit_average_cost,
        x.onhand_cost,
        x.id_opname
        FROM z30 as x
        WHERE x.id_opname = "${req.body.IDOPNAME}" `,(errorZ30,resultZ30,fieldZ30)=> {
            if (errorZ30){
                res.status(400).send({
                    errorZ30
                })
            }
            else{
                let dataZ30=[]
                for(let i=0;i<resultZ30.length;i++){
                    let dataTopushZ30 = {
                        store_code:`${resultZ30[i].store_code}`,
                        store_name:`${resultZ30[i].store_name}`,
                        division:`${resultZ30[i].division}`,
                        department:`${resultZ30[i].department}`,
                        sub_department:`${resultZ30[i].sub_department}`,
                        class:`${resultZ30[i].class}`,
                        short_name:`${resultZ30[i].short_name}`,
                        season_collection:`${resultZ30[i].season_collection}`,
                        season:`${resultZ30[i].season}`,
                        product_code:`${resultZ30[i].product_code}`,
                        size_code:`${resultZ30[i].size_code}`,
                        color_code:`${resultZ30[i].color_code}`,
                        onhand_qty:`${resultZ30[i].onhand_qty}`,
                        unit_retail_price:`${resultZ30[i].unit_retail_price}`,
                        onhand_retail:`${resultZ30[i].onhand_retail}`,
                        unit_average_cost:`${resultZ30[i].unit_average_cost}`,
                        onhand_cost:`${resultZ30[i].onhand_cost}`,
                        id_opname:`${resultZ30[i].id_opname}`
                    }
                    dataZ30.push(dataTopushZ30)
                }
                connection.query(`
                SELECT
                x.barcode,
                x.pc9,
                x.short_name,
                x.product_category,
                x.waist,
                x.inseam,
                x.lokasi,
                x.NIK,
                x.id_opname,
                x.status_upload
                FROM scan as x
                WHERE x.id_opname = "${req.body.IDOPNAME}" AND x.status_upload = "DONE" `,(errorScan,resultScan,fieldScan)=> {
                    if (errorScan){
                        res.status(400).send({
                            errorScan
                        })
                    }
                    else{
                        let dataScan=[]
                        for(let i=0;i<resultScan.length;i++){
                            let dataTopushScan = {
                                barcode:`${resultScan[i].barcode}`,
                                pc9:`${resultScan[i].pc9}`,
                                short_name:`${resultScan[i].short_name}`,
                                product_category:`${resultScan[i].product_category}`,
                                waist:`${resultScan[i].waist}`,
                                inseam:`${resultScan[i].inseam}`,
                                lokasi:`${resultScan[i].lokasi}`,
                                NIK:`${resultScan[i].NIK}`,
                                id_opname:`${resultScan[i].id_opname}`,
                                status_upload:`${resultScan[i].status_upload}`
                            }
                            dataScan.push(dataTopushScan)
                        }
                        res.status(200).send({
                            dataZ30,
                            dataScan
                        });
                    }
                });
            }
        });
    },
    hapusZ30:(req,res) =>{
        connection.query(`DELETE FROM z30 WHERE id_opname = "${req.body.IDOPNAME}"`,(error,result,field)=> {
            if (error){
                res.status(400).send({
                    error
                });
            }
            else{
                res.status(200).send({
                    "status":'01'
                });
            }

        });
    },
};