const connection = require("../config/centralkitchen")
const oauthConnection = require("../config/oauth")
const bcrypt = require("bcryptjs")
const moment = require('moment-timezone')

module.exports = {
    // controller login
        login:(req,res) =>{
            oauthConnection.query(`SELECT * FROM prm_karyawan WHERE NIK = "${req.body.NIK}"`,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    if(result.length >= 1){
                        let tanggalLahir = result[0].Tanggal_Lahir.replace(/[\D]/g, "");
                        let tanggalResign = result[0].tanggal_resign.replace(/[\D]/g, "");
                        let curDate = moment().tz("Asia/Jakarta").format('YYYYMMDD')
                        if( tanggalResign === '' || tanggalResign >= curDate){
                            let passSend = req.body.PASS
                            if(tanggalLahir === passSend){
                                res.status(200).send({
                                    status:"00",
                                    nik:result[0].NIK
                                });
                            } else {
                                res.status(200).send({
                                    status:"03",
                                    message:"Password salah"
                                });
                            }
                        } else {
                            res.status(200).send({
                                status:"02",
                                message:"Karyawan yang bersangkutan sudah tidak aktif"
                            });
                        }
                    } else {
                        res.status(200).send({
                            status:"01",
                            message:"Data karyawan tidak terdaftar di dalam sistem"
                        });
                    }
                }
            });
        },
    // controller login--
    // controller outlet login
        outletLogin:(req,res) =>{
            connection.query(`
            SELECT
            x.id_outlet
            FROM outlet as x
            WHERE id_outlet = "${req.body.PRM}"`,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let dataLenght = result.length
                    if(dataLenght>0){
                        connection.query(`
                        SELECT
                        x.id_user,
                        x.nik,
                        x.pass_user
                        FROM user as x
                        WHERE nik = "${req.body.NIK}"`,(error1,result1,field1)=> {
                            if (error1){
                                res.status(400).send({
                                    error1
                                });
                            }
                            else{
                                if(result1.length>0){
                                    let passPrm = result1[0].pass_user
                                    let passSend = req.body.PASS
                                    if(passPrm === passSend){
                                        res.status(200).send({
                                            status:"00",
                                            nik:result1[0].nik
                                        });
                                    } else {
                                        res.status(200).send({
                                            status:"01"
                                        });
                                    }
                                } else {
                                    res.status(200).send({
                                        status:"02"
                                    });
                                }
                            }
                        });
                    } else {
                        res.status(200).send({
                            status:"03"
                        });
                    }
                }
            });
        },
    // controller outlet login--
    // controller akses page
        getAkses:(req,res) =>{
            connection.query(`
            SELECT
            *
            FROM user
            WHERE nik = "${req.body.NIK}"`,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let dataToshow = result[0]
                    Object.assign(dataToshow, {id_outlet:req.body.OUTLET})
                    res.status(200).send({
                        akses:result[0].akses_page,
                        userinfo:dataToshow
                    });
                }
            });
        },
    // controller akses page--
    // controller akses outlet page
        getAksesOutlet:(req,res) =>{
            connection.query(`
            SELECT
            *,
            (
                SELECT
                nama_outlet
                FROM
                outlet
                WHERE id_outlet = "${req.body.OUTLET}"
            ) as nama_outlet
            FROM user
            WHERE nik = "${req.body.NIK}"`,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let dataToshow = result[0]
                    Object.assign(dataToshow, {id_outlet:req.body.OUTLET})
                    res.status(200).send({
                        akses:result[0].akses_page,
                        userinfo:dataToshow,
                        namaOutlet:result[0].nama_outlet
                    });
                }
            });
        },
    // controller akses outlet page--
    // controller dashboard
        dataDashboard:(req,res) =>{
            connection.query(`SELECT
            x.kode_purchase_order_h,
            x.nomor_po,
            x.tanggal_buat,
            x.tanggal_masuk_barang,
            x.kode_vendor,
            x.jumlah_pembelian,
            x.create_user,
            x.receive_user,
            (
                SELECT nama_vendor FROM master_vendor where kode_vendor = x.kode_vendor
            ) 
            as vendor_name,
            (
                SELECT IF(tanggal_masuk_barang = "","OPEN","RECEIVED") FROM purchase_order_h WHERE kode_purchase_order_h = x.kode_purchase_order_h
            )AS po_status
            FROM purchase_order_h as x
            ORDER BY x.tanggal_buat DESC `,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let dataPOH=[]
                    for(i=0;i<panjangArray1;i++){
                        let dataTopush1 = {
                            kode_purchase_order_h:`${result[i].kode_purchase_order_h}`,
                            nomor_po:`${result[i].nomor_po}`,
                            tanggal_buat:`${result[i].tanggal_buat}`,
                            tanggal_masuk_barang:`${result[i].tanggal_masuk_barang}`,
                            kode_vendor:`${result[i].kode_vendor}`,
                            nama_vendor:`${result[i].vendor_name}`,
                            jumlah_pembelian:`${result[i].jumlah_pembelian}`,
                            create_user:`${result[i].create_user}`,
                            receive_user:`${result[i].receive_user}`,
                            po_status:`${result[i].po_status}`
                        }
                        dataPOH.push(dataTopush1)
                    }
                    connection.query(`
                    SELECT 
                    x.kode_order_h,
                    x.nomor_order,
                    x.tanggal_buat,
                    (SELECT nama_outlet FROM outlet where id_outlet = x.id_outlet) as nama_outlet,
                    x.status_order,
                    x.create_user 
                    FROM
                    order_h as x WHERE x.status_order = "OPEN" ORDER BY x.tanggal_buat DESC `,(error1,result1,field1)=> {
                        if (error1){
                            res.status(400).send({
                                error1
                            });
                        }
                        else{
                            let panjangArray2=result1.length
                            let dataOrderH=[]
                            for(ib=0;ib<panjangArray2;ib++){
                                let dataTopush2 = {kode_order_h:`${result1[ib].kode_order_h}`,nomor_order:`${result1[ib].nomor_order}`,tanggal_buat:`${result1[ib].tanggal_buat}`,id_outlet:`${result1[ib].id_outlet}`,nama_outlet:`${result1[ib].nama_outlet}`,status_order:`${result1[ib].status_order}`,create_user:`${result1[ib].create_user}`}
                                dataOrderH.push(dataTopush2)
                            }
                            connection.query(`SELECT
                            x.kode_barang,
                            (SELECT nama_barang FROM master_barang where kode_barang = x.kode_barang) as nama_barang,
                            (SELECT unit_barang FROM master_barang where kode_barang = x.kode_barang) as unit_barang,
                            (SELECT satuan_barang FROM master_barang where kode_barang = x.kode_barang) as satuan_barang,
                            (SELECT conversi_satuan FROM master_barang where kode_barang = x.kode_barang) as konversi_barang,
                            x.kode_vendor,
                            (
                                SELECT nama_vendor FROM master_vendor WHERE kode_vendor = x.kode_vendor
                            ) AS nama_vendor,
                            (
                                SELECT SUM(qty) AS onhand FROM master_inventory WHERE kode_barang = x.kode_barang
                            ) AS onhand_qty
                            FROM
                            master_barang AS x
                            WHERE x.type_barang = "RAW MATERIAL"
                            ORDER BY onhand_qty ASC`,(error2,result2,field2)=> {
                                if (error2){
                                    res.status(400).send({
                                        error2
                                    });
                                }
                                else{
                                    let panjangArray3=result2.length
                                    let dataInventory=[]
                                    for(ic=0;ic<panjangArray3;ic++){
                                        let qtyInv =parseInt(result2[ic].onhand_qty == null ? 0 : result2[ic].onhand_qty)
                                        let convertionQtyInv =parseInt(result2[ic].konversi_barang)
                                        let qtyInvProcessA = Math.floor(qtyInv/convertionQtyInv)
                                        let qtyInvProcessB = qtyInv%convertionQtyInv
                                        let qtyInvToShow = qtyInvProcessA+"."+qtyInvProcessB
                                        // batas
                                        let dataTopush3 = {
                                            kode_barang:`${result2[ic].kode_barang}`,
                                            nama_barang:`${result2[ic].nama_barang}`,
                                            unit_barang:`${result2[ic].unit_barang}`,
                                            satuan_barang:`${result2[ic].satuan_barang}`,
                                            konversi_barang:`${result2[ic].konversi_barang}`,
                                            kode_vendor:`${result2[ic].kode_vendor}`,
                                            nama_vendor:`${result2[ic].nama_vendor}`,
                                            onhand_qty:`${result2[ic].onhand_qty == null ? 0 : result2[ic].onhand_qty}`,
                                            onhand_qty_to_show:`${qtyInvToShow}`,
                                            satuan_to_show:`${result2[ic].unit_barang}.${result2[ic].satuan_barang}`
                                        }
                                        dataInventory.push(dataTopush3)
                                    }
                                    connection.query(`SELECT
                                    x.kode_barang,
                                    (SELECT nama_barang FROM master_barang where kode_barang = x.kode_barang) as nama_barang,
                                    (SELECT unit_barang FROM master_barang where kode_barang = x.kode_barang) as unit_barang,
                                    (SELECT satuan_barang FROM master_barang where kode_barang = x.kode_barang) as satuan_barang,
                                    (SELECT conversi_satuan FROM master_barang where kode_barang = x.kode_barang) as konversi_barang,
                                    x.kode_vendor,
                                    (
                                        SELECT nama_vendor FROM master_vendor WHERE kode_vendor = x.kode_vendor
                                    ) AS nama_vendor,
                                    (
                                        SELECT SUM(qty) AS onhand FROM master_inventory WHERE kode_barang = x.kode_barang
                                    ) AS onhand_qty
                                    FROM
                                    master_barang AS x
                                    WHERE x.type_barang = "FINISHED GOODS"
                                    ORDER BY onhand_qty ASC`,(error3,result3,field3)=> {
                                        if (error3){
                                            res.status(400).send({
                                                error3
                                            });
                                        }
                                        else{
                                            let panjangArray4=result3.length
                                            let dataInventoryFinshedGoods=[]
                                            for(ic=0;ic<panjangArray4;ic++){
                                                let qtyInv =parseInt(result3[ic].onhand_qty == null ? 0 : result3[ic].onhand_qty)
                                                let convertionQtyInv =parseInt(result3[ic].konversi_barang)
                                                let qtyInvProcessA = Math.floor(qtyInv/convertionQtyInv)
                                                let qtyInvProcessB = qtyInv%convertionQtyInv
                                                let qtyInvToShow = qtyInvProcessA+"."+qtyInvProcessB
                                                // batas
                                                let dataTopush4 = {
                                                    kode_barang:`${result3[ic].kode_barang}`,
                                                    nama_barang:`${result3[ic].nama_barang}`,
                                                    unit_barang:`${result3[ic].unit_barang}`,
                                                    satuan_barang:`${result3[ic].satuan_barang}`,
                                                    konversi_barang:`${result3[ic].konversi_barang}`,
                                                    kode_vendor:`${result3[ic].kode_vendor}`,
                                                    nama_vendor:`${result3[ic].nama_vendor}`,
                                                    onhand_qty:`${result3[ic].onhand_qty == null ? 0 : result3[ic].onhand_qty}`,
                                                    onhand_qty_to_show:`${qtyInvToShow}`,
                                                    satuan_to_show:`${result3[ic].unit_barang}.${result3[ic].satuan_barang}`
                                                }
                                                dataInventoryFinshedGoods.push(dataTopush4)
                                            }
                                            res.status(200).send({
                                                dataPOH,
                                                dataOrderH,
                                                dataInventory,
                                                dataInventoryFinshedGoods
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        },
    // controller dashboard--
    // controller dashboard outlet
        dataDashboardOutlet:(req,res) =>{
            let PRMOUTLET=req.body.PRMOUTLET
            connection.query(`
            SELECT 
            x.kode_order_h,
            x.nomor_order,
            x.tanggal_buat,
            (SELECT nama_outlet FROM outlet where id_outlet = x.id_outlet) as nama_outlet,
            x.status_order,
            x.create_user 
            FROM
            order_h as x 
            WHERE 
                x.status_order = "OPEN"
                AND
                x.id_outlet = "${PRMOUTLET}"
            ORDER BY x.tanggal_buat DESC `,(error1,result1,field1)=> {
                if (error1){
                    res.status(400).send({
                        error1
                    });
                }
                else{
                    let panjangArray2=result1.length
                    let dataOrderH=[]
                    for(ib=0;ib<panjangArray2;ib++){
                        let dataTopush2 = {kode_order_h:`${result1[ib].kode_order_h}`,nomor_order:`${result1[ib].nomor_order}`,tanggal_buat:`${result1[ib].tanggal_buat}`,id_outlet:`${result1[ib].id_outlet}`,nama_outlet:`${result1[ib].nama_outlet}`,status_order:`${result1[ib].status_order}`,create_user:`${result1[ib].create_user}`}
                        dataOrderH.push(dataTopush2)
                    }
                    connection.query(`SELECT
                    x.kode_barang,
                    x.nama_barang,
                    x.satuan_barang,
                    x.kode_vendor,
                    (
                        SELECT nama_vendor FROM master_vendor WHERE kode_vendor = x.kode_vendor
                    ) AS nama_vendor,
                    (
                        SELECT SUM(qty) AS onhand FROM master_inventory_outlet WHERE kode_barang = x.kode_barang AND id_outlet = "${PRMOUTLET}"
                    ) AS onhand_qty
                    FROM
                    master_barang AS x
                    WHERE x.type_barang = "FINISHED GOODS"
                    ORDER BY onhand_qty ASC`,(error3,result3,field3)=> {
                        if (error3){
                            res.status(400).send({
                                error3
                            });
                        }
                        else{
                            let panjangArray4=result3.length
                            let dataInventoryFinshedGoods=[]
                            for(ic=0;ic<panjangArray4;ic++){
                                let dataTopush4 = {
                                    kode_barang:`${result3[ic].kode_barang}`,
                                    nama_barang:`${result3[ic].nama_barang}`,
                                    satuan_barang:`${result3[ic].satuan_barang}`,
                                    kode_vendor:`${result3[ic].kode_vendor}`,
                                    nama_vendor:`${result3[ic].nama_vendor}`,
                                    onhand_qty:`${result3[ic].onhand_qty == null ? 0 : result3[ic].onhand_qty}`
                                }
                                dataInventoryFinshedGoods.push(dataTopush4)
                            }
                            res.status(200).send({
                                dataOrderH,
                                dataInventoryFinshedGoods
                            });
                        }
                    });
                }
            });
        },
    // controller dashboard outlet--
    // controler outlet
        dataOutlet:(req,res) =>{
            connection.query(`SELECT * FROM outlet WHERE id_outlet != 'OUT0000001' `,(error,result,field)=> {
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
        editdataOutlet:(req,res) =>{
            connection.query(`
            UPDATE outlet SET 
            nama_outlet = "${req.body.NAME}",
            alamat_outlet = "${req.body.ALAMAT}",
            pic = "${req.body.PIC}",
            telp = "${req.body.TELP}",
            email = "${req.body.EMAIL}"
            WHERE id_outlet = "${req.body.ID}" `,(error,result,field)=> {
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
        },
        adddataOutlet: (req,res) =>{
            let prmkey=`OUT`;
            connection.query(`SELECT * FROM outlet where id_outlet LIKE N'%${prmkey}%' ORDER BY id_outlet DESC LIMIT 0,1`,
                (error, results, fields) => {
                    if (error)  {
                        res.status(400).send({
                        error
                        });
                    } else {
                        if(results.length >= 1){
                            let newidx1=results[0].id_outlet.substr(3,7);
                            let newidx2=parseInt(newidx1)+1;
                            if (newidx2>=0 && newidx2<=9)
                            {
                            var kd_barang=`${prmkey}000000${newidx2}`;
                            }
                            else if (newidx2>9 && newidx2<=99)
                            {
                            var kd_barang=`${prmkey}00000${newidx2}`;
                            }
                            else if (newidx2>99 && newidx2<=999)
                            {
                            var kd_barang=`${prmkey}0000${newidx2}`;
                            }
                            else if (newidx2>999 && newidx2<=9999)
                            {
                            var kd_barang=`${prmkey}000${newidx2}`;
                            }
                            else if (newidx2>9999 && newidx2<=99999)
                            {
                            var kd_barang=`${prmkey}00${newidx2}`;
                            }
                            else if (newidx2>99999 && newidx2<=999999)
                            {
                            var kd_barang=`${prmkey}0${newidx2}`;
                            }
                            else if (newidx2>999999 && newidx2<=9999999)
                            {
                            var kd_barang=`${prmkey}${newidx2}`;
                            }
                        } else {
                            var kd_barang=`${prmkey}0000001`;
                        }
                        connection.query(`INSERT INTO outlet values("${kd_barang}","${req.body.NAME}","${req.body.ALAMAT}","${req.body.PIC}","${req.body.TELP}","${req.body.EMAIL}")`,(error,result,field)=> {
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
                }
            );
        },
    // controler outlet--
    // controler vendor
        dataVendor:(req,res) =>{
            connection.query(`SELECT * FROM master_vendor `,(error,result,field)=> {
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
        editdataVendor:(req,res) =>{
            connection.query(`
            UPDATE master_vendor SET 
            nama_vendor = "${req.body.NAME}",
            alamat_vendor = "${req.body.ALAMAT}",
            pic = "${req.body.PIC}",
            telp_vendor = "${req.body.TELP}",
            email_vendor = "${req.body.EMAIL}" 
            WHERE kode_vendor = "${req.body.ID}" `,(error,result,field)=> {
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
        },
        adddataVendor: (req,res) =>{
            let prmkey=`VND`;
            connection.query(`SELECT * FROM master_vendor where kode_vendor LIKE N'%${prmkey}%' ORDER BY kode_vendor DESC LIMIT 0,1`,
                (error, results, fields) => {
                    if (error)  {
                        res.status(400).send({
                        error
                        });
                    } else {
                        if(results.length >= 1){
                            let newidx1=results[0].kode_vendor.substr(3,7);
                            let newidx2=parseInt(newidx1)+1;
                            if (newidx2>=0 && newidx2<=9)
                            {
                            var kd_barang=`${prmkey}000000${newidx2}`;
                            }
                            else if (newidx2>9 && newidx2<=99)
                            {
                            var kd_barang=`${prmkey}00000${newidx2}`;
                            }
                            else if (newidx2>99 && newidx2<=999)
                            {
                            var kd_barang=`${prmkey}0000${newidx2}`;
                            }
                            else if (newidx2>999 && newidx2<=9999)
                            {
                            var kd_barang=`${prmkey}000${newidx2}`;
                            }
                            else if (newidx2>9999 && newidx2<=99999)
                            {
                            var kd_barang=`${prmkey}00${newidx2}`;
                            }
                            else if (newidx2>99999 && newidx2<=999999)
                            {
                            var kd_barang=`${prmkey}0${newidx2}`;
                            }
                            else if (newidx2>999999 && newidx2<=9999999)
                            {
                            var kd_barang=`${prmkey}${newidx2}`;
                            }
                        } else {
                            var kd_barang=`${prmkey}0000001`;
                        }
                        connection.query(`INSERT INTO master_vendor values("${kd_barang}","${req.body.NAME}","${req.body.ALAMAT}","${req.body.PIC}","${req.body.TELP}","${req.body.EMAIL}")`,(error,result,field)=> {
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
                }
            );
        },
        getVendorOption:(req,res) =>{
            connection.query(`SELECT * FROM master_vendor `,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray=result.length
                    let dataToShow=[]
                    for(i=0;i<panjangArray;i++){
                        let dataTopush = {value:`${result[i].kode_vendor}`,label:`${result[i].nama_vendor}`}
                        dataToShow.push(dataTopush)
                    }
                    res.status(200).send({
                        dataToShow
                    });
                }
            });
        },
    // controler vendor--
    // controler master barang
        masterbarang:(req,res) =>{
            connection.query(`SELECT x.kode_barang,x.nama_barang,x.unit_barang,x.satuan_barang,x.harga_barang,x.conversi_satuan,x.kode_vendor,x.type_barang,(SELECT nama_vendor FROM master_vendor where kode_vendor = x.kode_vendor) as vendor_name FROM master_barang as x `,(error,result,field)=> {
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
        editMasterBarangData:(req,res) =>{
            let ID = req.body.ID
            let NAME = req.body.NAME
            let UNIT = req.body.UNIT
            let SATUAN = req.body.SATUAN
            let KONVERSI = req.body.KONVERSI
            let VENDORCODE = req.body.VENDORCODE
            let TYPE = req.body.TYPE
            connection.query(`
            UPDATE master_barang SET
            nama_barang = "${NAME}",
            unit_barang = "${UNIT}",
            satuan_barang = "${SATUAN}",
            harga_barang = "${req.body.HARGAPERUNIT}",
            conversi_satuan = "${KONVERSI}",
            type_barang = "${TYPE}",
            kode_vendor = "${VENDORCODE}"
            WHERE kode_barang = "${ID}" `,(error,result,field)=> {
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
        },
        addMasterBarangData: (req,res) =>{
            let prmkey=`ITM`;
            connection.query(`SELECT * FROM master_barang where kode_barang LIKE N'%${prmkey}%' ORDER BY kode_barang DESC LIMIT 0,1`,
                (error, results, fields) => {
                    if (error)  {
                        res.status(400).send({
                        error
                        });
                    } else {
                        if(results.length >= 1){
                            let newidx1=results[0].kode_barang.substr(3,7);
                            let newidx2=parseInt(newidx1)+1;
                            if (newidx2>=0 && newidx2<=9)
                            {
                            var kd_barang=`${prmkey}000000${newidx2}`;
                            }
                            else if (newidx2>9 && newidx2<=99)
                            {
                            var kd_barang=`${prmkey}00000${newidx2}`;
                            }
                            else if (newidx2>99 && newidx2<=999)
                            {
                            var kd_barang=`${prmkey}0000${newidx2}`;
                            }
                            else if (newidx2>999 && newidx2<=9999)
                            {
                            var kd_barang=`${prmkey}000${newidx2}`;
                            }
                            else if (newidx2>9999 && newidx2<=99999)
                            {
                            var kd_barang=`${prmkey}00${newidx2}`;
                            }
                            else if (newidx2>99999 && newidx2<=999999)
                            {
                            var kd_barang=`${prmkey}0${newidx2}`;
                            }
                            else if (newidx2>999999 && newidx2<=9999999)
                            {
                            var kd_barang=`${prmkey}${newidx2}`;
                            }
                        } else {
                            var kd_barang=`${prmkey}0000001`;
                        }
                        connection.query(`INSERT INTO master_barang values("${kd_barang}","${req.body.NAME}","${req.body.UNIT}","${req.body.SATUAN}","${req.body.HARGAPERUNIT}","${req.body.KONVERSI}","${req.body.TYPE}","${req.body.VENDORCODE}")`,(error,result,field)=> {
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
                }
            );
        },
        getMasterBarangOption:(req,res) =>{
            connection.query(`SELECT * FROM master_barang `,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray=result.length
                    let dataToShow=[]
                    for(i=0;i<panjangArray;i++){
                        let dataTopush = {value:`${result[i].kode_barang}`,label:`${result[i].nama_barang}`}
                        dataToShow.push(dataTopush)
                    }
                    res.status(200).send({
                        dataToShow
                    });
                }
            });
        },
    // controler master barang--
    // controler master produksi
        getFormAddMasterProduksi:(req,res) =>{
            connection.query(`
                SELECT
                x.kode_barang,
                x.nama_barang,
                x.satuan_barang,
                (
                SELECT
                master_vendor.nama_vendor
                FROM master_barang LEFT JOIN master_vendor ON master_barang.kode_vendor = master_vendor.kode_vendor WHERE master_barang.kode_barang = x.kode_barang
                ) as vendor_name,
                x.type_barang
                FROM master_barang as x
                WHERE x.type_barang = "FINISHED GOODS"`,(error1,result1,field1)=> {
                if (error1){
                    res.status(400).send({
                        error1
                    });
                }
                else{
                    let dataMasterBarang=[]
                    for(i=0;i<result1.length;i++){
                        let dataTopush2 = {
                            value:`${result1[i].kode_barang}`,
                            label:`${result1[i].nama_barang}`,
                            nama_barang:`${result1[i].nama_barang}`,
                            satuan:`${result1[i].satuan_barang}`
                        }
                        dataMasterBarang.push(dataTopush2)
                    }
                    connection.query(`
                        SELECT
                        x.kode_barang,
                        x.nama_barang,
                        x.satuan_barang,
                        (
                        SELECT
                        master_vendor.nama_vendor
                        FROM master_barang LEFT JOIN master_vendor ON master_barang.kode_vendor = master_vendor.kode_vendor WHERE master_barang.kode_barang = x.kode_barang
                        ) as vendor_name,
                        x.type_barang
                        FROM master_barang as x
                        WHERE x.type_barang = "RAW MATERIAL"`,(error2,result2,field2)=> {
                        if (error2){
                            res.status(400).send({
                                error2
                            });
                        }
                        else{
                            let dataMasterBarangWIP=[]
                            for(i2=0;i2<result2.length;i2++){
                                let dataTopush3 = {
                                    value:`${result2[i2].kode_barang}`,
                                    label:`${result2[i2].nama_barang}`,
                                    nama_barang:`${result2[i2].nama_barang}`,
                                    satuan:`${result2[i2].satuan_barang}`
                                }
                                dataMasterBarangWIP.push(dataTopush3)
                            }
                            res.status(200).send({
                                dataMasterBarang,
                                dataMasterBarangWIP
                            });
                        }
                    });
                }
            });
        },
        masterproduksi:(req,res) =>{
            connection.query(`
            SELECT 
            x.kode_master_produksi_h,
            x.nomor_master_produksi,
            x.kode_barang,
            (SELECT nama_barang FROM master_barang where kode_barang = x.kode_barang) as nama_barang,
            x.tanggal_buat
            FROM master_produksi_h as x 
            WHERE x.state ="ACTIVE"
            ORDER BY x.kode_master_produksi_h DESC `,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let dataMasterProduksiH=[]
                    for(i=0;i<panjangArray1;i++){
                        let dataTopush1 = {
                            kode_master_produksi_h:`${result[i].kode_master_produksi_h}`,
                            nomor_master_produksi:`${result[i].nomor_master_produksi}`,
                            kode_barang:`${result[i].kode_barang}`,
                            nama_barang:`${result[i].nama_barang}`,
                            tanggal_buat:`${result[i].tanggal_buat}`
                        }
                        dataMasterProduksiH.push(dataTopush1)
                    }
                    res.status(200).send({
                        dataMasterProduksiH
                    });
                }
            });
        },
        getMasterProduksi:(req,res) =>{
            connection.query(`
            SELECT
            x.kode_master_produksi_h,
            x.kode_barang,
            (SELECT nama_barang FROM master_barang where kode_barang = x.kode_barang) as nama_barang,
            (SELECT satuan_barang FROM master_barang where kode_barang = x.kode_barang) as satuan_barang,
            x.qty
            FROM
            master_produksi_h AS x
            WHERE
            x.kode_master_produksi_h = "${req.body.KODEMASTERPRODUKSIH}"
            `,(error1,result1,field1)=> {
                if (error1){
                    res.status(400).send({
                        error1
                    });
                }
                else{
                    let panjangArray1=result1.length
                    let dataMasterProduksiHasilD=[]
                    for(ia=0;ia<panjangArray1;ia++){
                        let dataTopush1 = {
                            kode_master_produksi_h:`${result1[ia].kode_master_produksi_h}`,
                            kode_barang:`${result1[ia].kode_barang}`,
                            nama_barang:`${result1[ia].nama_barang}`,
                            qty:`${result1[ia].qty}`,
                            satuan_barang:`${result1[ia].satuan_barang}`
                        }
                        dataMasterProduksiHasilD.push(dataTopush1)
                    }
                    connection.query(`
                    SELECT
                    x.kode_master_produksi_pakai_d,
                    x.kode_barang,
                    (SELECT nama_barang FROM master_barang where kode_barang = x.kode_barang) as nama_barang,
                    (SELECT satuan_barang FROM master_barang where kode_barang = x.kode_barang) as satuan_barang,
                    x.qty,
                    x.kode_master_produksi_h
                    FROM
                    master_produksi_pakai_d AS x
                    WHERE
                    x.kode_master_produksi_h = "${req.body.KODEMASTERPRODUKSIH}"
                    `,(error2,result2,field2)=> {
                        if (error2){
                            res.status(400).send({
                                error2
                            });
                        }
                        else{
                            let panjangArray2=result2.length
                            let dataMasterProduksiPakaiD=[]
                            for(ib=0;ib<panjangArray2;ib++){
                                let dataTopush2 = {
                                    kode_master_produksi_pakai_d:`${result2[ib].kode_master_produksi_pakai_d}`,
                                    kode_barang:`${result2[ib].kode_barang}`,
                                    nama_barang:`${result2[ib].nama_barang}`,
                                    satuan_barang:`${result2[ib].satuan_barang}`,
                                    qty:`${result2[ib].qty}`,
                                    kode_master_produksi_h:`${result2[ib].kode_master_produksi_h}`,
                                }
                                dataMasterProduksiPakaiD.push(dataTopush2)
                            }
                            connection.query(`
                            SELECT
                            x.kode_barang,
                            x.nama_barang,
                            x.satuan_barang,
                            x.kode_vendor,
                            (SELECT nama_vendor FROM master_vendor where kode_vendor = x.kode_vendor) as vendor_name,
                            (SELECT COUNT(kode_barang) as qty_in_stok FROM inventory where kode_barang = x.kode_barang AND tanggal_Keluar = "") as qty_in_stok
                            FROM master_barang as x `,(errorMB,resultMB,fieldMB)=> {
                                if (errorMB){
                                    res.status(400).send({
                                        errorMB
                                    });
                                }
                                else{
                                    let panjangArrayMB=resultMB.length
                                    let dataMasterBarang=[]
                                    for(i=0;i<panjangArrayMB;i++){
                                        let dataTopushMB = {
                                            value:`${resultMB[i].kode_barang}`,
                                            label:`${resultMB[i].kode_barang}-${resultMB[i].nama_barang}-${resultMB[i].vendor_name}`,
                                            nama_barang:`${resultMB[i].nama_barang}`,
                                            satuan:`${resultMB[i].satuan_barang}`,
                                            qty_in_stok:`${resultMB[i].qty_in_stok}`}
                                        dataMasterBarang.push(dataTopushMB)
                                    }
                                    res.status(200).send({
                                        dataMasterProduksiHasilD,
                                        dataMasterProduksiPakaiD,
                                        dataMasterBarang,
                                    });
                                }
                            });
                        }
                    });
                }
            });
        },
        addMasterProduksi: (req,res) =>{
            let TANGGALMASTERPRODUKSI = moment().tz("Asia/Jakarta").format('YYYY-MM-DD HH:mm:ss')
            let firstPrm = moment().tz("Asia/Jakarta").startOf('year').format('YYYY-MM-DD HH:mm:ss')
            let lastPrm = moment().tz("Asia/Jakarta").endOf('year').format('YYYY-MM-DD HH:mm:ss')
            let year = moment().tz("Asia/Jakarta").format("YYYY")
            connection.query(`
            SELECT COUNT(kode_master_produksi_h) AS total
            FROM master_produksi_h
            WHERE tanggal_buat
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
                    let runData = totalDatastring.padStart(7, '0')
                    let automateNumber = "PROD"+"/"+year+"/"+runData
                    let DataBarangHasil = req.body.ADDDATABARANGHASIL
                    let DataBarangPakai = req.body.ADDDATABARANGPAKAI
                    let DataBarangSisa = req.body.ADDDATABARANGSISA
                    connection.query(`INSERT INTO master_produksi_h values("","${automateNumber}","${DataBarangHasil[0].kode_barang}","${DataBarangHasil[0].qty}","${TANGGALMASTERPRODUKSI}","ACTIVE")`,(error,result,field)=> {
                        if (error){
                            res.status(400).send({
                                error
                            });
                        }
                        else{
                            let kode_master_produksi_h = result.insertId
                            let DataBarangPakailenght = DataBarangPakai.length;
                            var sqlBarangPakai = "INSERT INTO master_produksi_pakai_d (kode_master_produksi_pakai_d,kode_barang,qty,kode_master_produksi_h) VALUES ?";
                            var dataArrayBarangPakai = [];
                            for (ia=0;ia<DataBarangPakailenght;ia++) {
                                let dataToPushBarangPakai = [``, `${DataBarangPakai[ia].kode_barang}`, `${DataBarangPakai[ia].qty}`, `${kode_master_produksi_h}`]
                                dataArrayBarangPakai.push(dataToPushBarangPakai)
                            }
                            connection.query(sqlBarangPakai, [dataArrayBarangPakai],(error1,result1,field1)=> {
                                if (error1){
                                    res.status(400).send({
                                        error1
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
                }
            });
        },
        updateMasterProduksi:(req,res) =>{
            connection.query(`
            UPDATE master_produksi_h SET 
            state = "NONACTIVE"
            WHERE kode_master_produksi_h = "${req.body.IDPLANPRODUCTION}" `,(error,result,field)=> {
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
        },
        deleteMasterProduksi:(req,res) =>{
            let prmMasterProduksi = req.body.ID
            connection.query(`DELETE FROM master_produksi_pakai_d WHERE kode_master_produksi_h = "${prmMasterProduksi}"`,
            (error1,result1,field1)=> {
                if (error1){
                    res.status(400).send({
                        error1
                    });
                }
                else{
                    connection.query(`DELETE FROM master_produksi_sisa_d WHERE kode_master_produksi_h = "${prmMasterProduksi}"`,
                    (error2,result2,field2)=> {
                        if (error2){
                            res.status(400).send({
                                error2
                            });
                        }
                        else{
                            connection.query(`DELETE FROM master_produksi_h WHERE kode_master_produksi_h = "${prmMasterProduksi}"`,
                            (error2,result2,field2)=> {
                                if (error2){
                                    res.status(400).send({
                                        error2
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
                }
            });
        },
    // controler master produksi--
    // controler master rawprosessing
        getMasterRawprosessing:(req,res) =>{
            connection.query(`
            SELECT 
            x.kode_master_rawprosessing_h,
            x.nomor_master_rawprosessing,
            x.kode_barang,
            (SELECT nama_barang FROM master_barang where kode_barang = x.kode_barang) as nama_barang,
            x.tanggal_buat
            FROM master_rawprosessing_h as x
            WHERE x.state = "ACTIVE"
            ORDER BY x.kode_master_rawprosessing_h DESC `,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let dataMasterRawProsessingH=[]
                    for(i=0;i<panjangArray1;i++){
                        let dataTopush1 = {
                            kode_master_rawprosessing_h:`${result[i].kode_master_rawprosessing_h}`,
                            nomor_master_rawprosessing:`${result[i].nomor_master_rawprosessing}`,
                            kode_barang:`${result[i].kode_barang}`,
                            nama_barang:`${result[i].nama_barang}`,
                            tanggal_buat:`${result[i].tanggal_buat}`
                        }
                        dataMasterRawProsessingH.push(dataTopush1)
                    }
                    res.status(200).send({
                        dataMasterRawProsessingH
                    });
                }
            });
        },
        getMasterRawprosessingD:(req,res) =>{
            connection.query(`
            SELECT
            x.kode_master_rawprosessing_h,
            x.kode_barang,
            (SELECT nama_barang FROM master_barang where kode_barang = x.kode_barang) as nama_barang
            FROM
            master_rawprosessing_h AS x
            WHERE
            x.kode_master_rawprosessing_h = "${req.body.KODEDATAH}"
            `,(error1,result1,field1)=> {
                if (error1){
                    console.log("1");
                    res.status(400).send({
                        error1
                    });
                }
                else{
                    let panjangArray1=result1.length
                    let dataRawMaterialD=[]
                    for(ia=0;ia<panjangArray1;ia++){
                        let dataTopush1 = {
                            kode_master_rawprosessing_h:`${result1[ia].kode_master_rawprosessing_h}`,
                            kode_barang:`${result1[ia].kode_barang}`,
                            nama_barang:`${result1[ia].nama_barang}`
                        }
                        dataRawMaterialD.push(dataTopush1)
                    }
                    connection.query(`
                    SELECT
                    x.kode_master_rawprosessing_d,
                    x.kode_barang,
                    (SELECT nama_barang FROM master_barang where kode_barang = x.kode_barang) as nama_barang,
                    x.prm_cost,
                    x.kode_master_rawprosessing_h
                    FROM
                    master_rawprosessing_d AS x
                    WHERE
                    x.kode_master_rawprosessing_h = "${req.body.KODEDATAH}"
                    `,(error2,result2,field2)=> {
                        if (error2){
                            console.log("2");
                            res.status(400).send({
                                error2
                            });
                        }
                        else{
                            let panjangArray2=result2.length
                            let dataFinishedGoodsD=[]
                            for(ib=0;ib<panjangArray2;ib++){
                                let dataTopush2 = {
                                    master_rawprosessing_d:`${result2[ib].master_rawprosessing_d}`,
                                    kode_barang:`${result2[ib].kode_barang}`,
                                    nama_barang:`${result2[ib].nama_barang}`,
                                    prm_cost:`${result2[ib].prm_cost}`,
                                    kode_master_rawprosessing_h:`${result2[ib].kode_master_rawprosessing_h}`,
                                }
                                dataFinishedGoodsD.push(dataTopush2)
                            }
                            res.status(200).send({
                                dataRawMaterialD,
                                dataFinishedGoodsD
                            });
                        }
                    });
                }
            });
        },
        getFormAddMasterRawprosessing:(req,res) =>{
            connection.query(`
                SELECT
                x.kode_barang,
                x.nama_barang,
                x.satuan_barang,
                (
                SELECT
                master_vendor.nama_vendor
                FROM master_barang LEFT JOIN master_vendor ON master_barang.kode_vendor = master_vendor.kode_vendor WHERE master_barang.kode_barang = x.kode_barang
                ) as vendor_name
                FROM master_barang as x
                WHERE x.type_barang = "RAW MATERIAL"`,(error1,result1,field1)=> {
                if (error1){
                    res.status(400).send({
                        error1
                    });
                }
                else{
                    let panjangArray2=result1.length
                    let dataMasterBarangRaw=[]
                    for(i=0;i<panjangArray2;i++){
                        let dataTopush2 = {
                            value:`${result1[i].kode_barang}`,
                            label:`${result1[i].nama_barang}`,
                            nama_barang:`${result1[i].nama_barang}`,
                            satuan:`${result1[i].satuan_barang}`
                        }
                        dataMasterBarangRaw.push(dataTopush2)
                    }
                    connection.query(`
                        SELECT
                        x.kode_barang,
                        x.nama_barang,
                        x.satuan_barang,
                        (
                        SELECT
                        master_vendor.nama_vendor
                        FROM master_barang LEFT JOIN master_vendor ON master_barang.kode_vendor = master_vendor.kode_vendor WHERE master_barang.kode_barang = x.kode_barang
                        ) as vendor_name
                        FROM master_barang as x`,(error2,result2,field2)=> {
                        if (error2){
                            res.status(400).send({
                                error2
                            });
                        }
                        else{
                            let panjangArray3=result2.length
                            let dataMasterBarangFinished=[]
                            for(i=0;i<panjangArray3;i++){
                                let dataTopush3 = {
                                    value:`${result2[i].kode_barang}`,
                                    label:`${result2[i].nama_barang}`,
                                    nama_barang:`${result2[i].nama_barang}`,
                                    satuan:`${result2[i].satuan_barang}`
                                }
                                dataMasterBarangFinished.push(dataTopush3)
                            }
                            res.status(200).send({
                                dataMasterBarangRaw,
                                dataMasterBarangFinished
                            });
                        }
                    });
                }
            });
        },
        addMasterRawprosessing: (req,res) =>{
            let TANGGALMASTERRAWPROSESSING = moment().tz("Asia/Jakarta").format('YYYY-MM-DD HH:mm:ss')
            let firstPrm = moment().tz("Asia/Jakarta").startOf('year').format('YYYY-MM-DD HH:mm:ss')
            let lastPrm = moment().tz("Asia/Jakarta").endOf('year').format('YYYY-MM-DD HH:mm:ss')
            let year = moment().tz("Asia/Jakarta").format("YYYY")
            connection.query(`
            SELECT COUNT(kode_master_rawprosessing_h) AS total
            FROM master_rawprosessing_h
            WHERE tanggal_buat
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
                    let runData = totalDatastring.padStart(7, '0')
                    let automateNumber = "RAW"+"/"+year+"/"+runData
                    let DataBarangRawMaterial = req.body.ADDDATARAWMATERIAL
                    let DataBarangFinishedGoods = req.body.ADDDATAFINISHEDGOODS
                    connection.query(`INSERT INTO master_rawprosessing_h values("","${automateNumber}","${DataBarangRawMaterial[0].kode_barang}","${TANGGALMASTERRAWPROSESSING}","ACTIVE")`,(error,result,field)=> {
                        if (error){
                            res.status(400).send({
                                error
                            });
                        }
                        else{
                            let kode_master_rawprosessing_h = result.insertId
                            let DataFinishedGoodslenght = DataBarangFinishedGoods.length;
                            var sqlFinishedGoods = "INSERT INTO master_rawprosessing_d (kode_master_rawprosessing_d,kode_barang,prm_cost,kode_master_rawprosessing_h) VALUES ?";
                            var dataArrayFinishedGoods = [];
                            for (ia=0;ia<DataFinishedGoodslenght;ia++) {
                                let dataToPushFinishedGoods = [``, `${DataBarangFinishedGoods[ia].kode_barang}`, `${DataBarangFinishedGoods[ia].opsi_cost}`, `${kode_master_rawprosessing_h}`]
                                dataArrayFinishedGoods.push(dataToPushFinishedGoods)
                            }
                            connection.query(sqlFinishedGoods, [dataArrayFinishedGoods],(error1,result1,field1)=> {
                                if (error1){
                                    res.status(400).send({
                                        error1
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
                }
            });
        },
        updateMasterrawprosessing:(req,res) =>{
            connection.query(`
            UPDATE master_rawprosessing_h SET 
            state = "NONACTIVE"
            WHERE kode_master_rawprosessing_h = "${req.body.IDRAWPROCESSs}" `,(error,result,field)=> {
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
        },
    // controler master rawprosessing--
    // controler rawprosessing
        getFormRawProsessingPlan:(req,res) =>{
            connection.query(`
                SELECT
                x.kode_master_rawprosessing_h,
                x.nomor_master_rawprosessing,
                x.kode_barang,
                (SELECT nama_barang FROM master_barang where kode_barang = x.kode_barang) as nama_barang,
                (SELECT satuan_barang FROM master_barang where kode_barang = x.kode_barang) as satuan_barang,
                (SELECT SUM(qty) as qty_in_stok FROM master_inventory where kode_barang = x.kode_barang) as qty_in_stok
                FROM master_rawprosessing_h as x`,(error1,result1,field1)=> {
                if (error1){
                    res.status(400).send({
                        error1
                    });
                }
                else{
                    let panjangArray2=result1.length
                    let dataMasterBarang=[]
                    for(i=0;i<panjangArray2;i++){
                        let dataTopush2 = {
                            value:`${result1[i].kode_barang}`,
                            label:`${result1[i].nama_barang} (${result1[i].nomor_master_rawprosessing})`,
                            kode_master_rawprosessing_h:`${result1[i].kode_master_rawprosessing_h}`,
                            prmBarangHasil:`${result1[i].kode_master_rawprosessing_h}`,
                            nama_barang:`${result1[i].nama_barang}`,
                            qty_in_stok:`${result1[i].qty_in_stok === null ? 0 : result1[i].qty_in_stok}`,
                            satuan:`${result1[i].satuan_barang}`
                        }
                        dataMasterBarang.push(dataTopush2)
                    }
                    res.status(200).send({
                        dataMasterBarang
                    });
                }
            });
        },
        addFormRawProsessingPlan:(req,res) =>{
            let firstPrm = moment().tz("Asia/Jakarta").startOf('month').format('YYYY-MM-DD HH:mm:ss')
            let lastPrm = moment().tz("Asia/Jakarta").endOf('month').format('YYYY-MM-DD HH:mm:ss')
            let year = moment().tz("Asia/Jakarta").format("YYYY")
            let month = moment().tz("Asia/Jakarta").format("MM")
            connection.query(`
            SELECT COUNT(kode_raw_processing_h) AS total
            FROM raw_processing_h
            WHERE tanggal_raw_processing
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
                    let runData = totalDatastring.padStart(7, '0')
                    let automateNumber = "RAWPROCESSING"+"/"+year+"/"+month+"/"+runData
                    connection.query(`
                    INSERT INTO raw_processing_h 
                    values("","${automateNumber}","${req.body.NOTE}","${req.body.TANGGALRAWPROCES}","OPEN","${req.body.USER}","","${req.body.ADDDATARAWMATERIAL[0].prmMasterRawProsessing}")
                    `,(error1,result1,field1)=> {
                        if (error1){
                            res.status(400).send({
                                error1
                            });
                        }
                        else{
                            connection.query(`
                            SELECT
                            *
                            FROM master_inventory
                            WHERE
                                kode_barang = "${req.body.ADDDATARAWMATERIAL[0].kode_barang}"
                                AND
                                qty > 0
                            ORDER BY kode_inventory ASC
                            `,(error4,result4,field4)=> {
                                if (error4){
                                    res.status(400).send({
                                        error4
                                    });
                                }
                                else{
                                    let kodeRawProcessingH = result1.insertId
                                    let ADDDATARAWMATERIAL = req.body.ADDDATARAWMATERIAL
                                    let data = []
                                    for(iresult4=0;iresult4<result4.length;iresult4++){
                                        data.push(
                                            {
                                                kode_inventory:result4[iresult4].kode_inventory,
                                                kode_barang:result4[iresult4].kode_barang,
                                                tanggal_masuk:result4[iresult4].tanggal_masuk,
                                                ref_masuk:result4[iresult4].ref_masuk,
                                                type_masuk:result4[iresult4].type_masuk,
                                                harga:result4[iresult4].harga,
                                                qty:result4[iresult4].qty
                                            }
                                        )
                                    }
                                    let new_data=[]
                                    let data_update_inventory=[]
                                    let qty_request = ADDDATARAWMATERIAL[0].qty
                                    kurangi_qty_request = (qty) =>{
                                        hasil_pengurangan = parseInt(qty_request) - parseInt(qty)
                                        qty_request = hasil_pengurangan
                                    }
                                    for(ia=0;ia<data.length;ia++){
                                        let new_qty = parseInt(data[ia].qty) > parseInt(qty_request) ? data[ia].qty - qty_request : 0
                                        let qty_rawMaterial = parseInt(qty_request) > parseInt(data[ia].qty) ? parseInt(data[ia].qty) : parseInt(qty_request)
                                        data_update_inventory.push(
                                            {
                                                kode_inventory:data[ia].kode_inventory,
                                                qty:new_qty
                                            }
                                        )
                                        if(qty_request > 0){
                                            new_data.push(
                                                {
                                                    kode_inventory:data[ia].kode_inventory,
                                                    kode_barang:data[ia].kode_barang,
                                                    harga:data[ia].harga,
                                                    qty:qty_rawMaterial,
                                                    total_harga:parseInt(qty_rawMaterial)*parseInt(data[ia].harga)
                                                }
                                            )
                                        }
                                        parseInt(data[ia].qty) > parseInt(qty_request) ? kurangi_qty_request(qty_request) : kurangi_qty_request(data[ia].qty)
                                    }
                                    var sqlBarangPakai = "INSERT INTO raw_processing_pakai_d (kode_raw_processing_pakai_d,kode_inventory,kode_barang,qty,cost,total_cost,kode_raw_processing_h) VALUES ?";
                                    var dataArrayBarangPakai = [];
                                    for (i1=0;i1<new_data.length;i1++) {
                                        let dataToPush1 = [
                                            ``,
                                            `${new_data[i1].kode_inventory}`,
                                            `${new_data[i1].kode_barang}`,
                                            `${new_data[i1].qty}`,
                                            `${new_data[i1].harga}`,
                                            `${new_data[i1].total_harga}`,
                                            `${kodeRawProcessingH}`
                                        ]
                                        dataArrayBarangPakai.push(dataToPush1)
                                    }
                                    connection.query(sqlBarangPakai, [dataArrayBarangPakai],(error2,result2,field2)=> {
                                        if (error2){
                                            res.status(400).send({
                                                error2
                                            });
                                        }
                                        else{
                                            let queries = '';
                                            for (i4=0;i4<data_update_inventory.length;i4++) {
                                                queries = queries+`UPDATE master_inventory SET qty = "${data_update_inventory[i4].qty}" WHERE kode_inventory = "${parseInt(data_update_inventory[i4].kode_inventory)}";`
                                            }
                                            connection.query(queries,(error5,result5,field5)=> {
                                                if (error5){
                                                    res.status(400).send({
                                                        error5
                                                    });
                                                }
                                                else{
                                                    res.status(200).send({
                                                        status:"01",
                                                        kodeRawProcessingH:`${kodeRawProcessingH}`
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        },
        getRawProsessingPlanReport:(req,res) =>{
            connection.query(`
            SELECT
            x.kode_raw_processing_h,
            x.nomor_raw_processing,
            x.note_raw_processing,
            x.tanggal_raw_processing
            FROM raw_processing_h as x 
            WHERE x.kode_raw_processing_h = "${req.body.IDRAWPROCESSINGH}"`,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let dataRawProcessingH=[]
                    for(i=0;i<panjangArray1;i++){
                        let dataTopush1 = {
                            kode_raw_processing_h:`${result[i].kode_raw_processing_h}`,
                            nomor_raw_processing:`${result[i].nomor_raw_processing}`,
                            tanggal_raw_processing:`${result[i].tanggal_raw_processing}`,
                            tanggal_raw_processing_to_show:`${moment(result[i].tanggal_raw_processing).format("DD-MMMM-YYYY")}`,
                            note_raw_processing:`${result[i].note_raw_processing}`
                        }
                        dataRawProcessingH.push(dataTopush1)
                    }
                    connection.query(`
                    SELECT
                    x.kode_barang,
                    (SELECT sum(qty) FROM raw_processing_pakai_d where kode_raw_processing_h = "${req.body.IDRAWPROCESSINGH}") as total_qty,
                    (SELECT nama_barang FROM master_barang where kode_barang = x.kode_barang) as nama_barang,
                    (SELECT satuan_barang FROM master_barang where kode_barang = x.kode_barang) as satuan_barang,
                    x.kode_raw_processing_h
                    FROM
                    raw_processing_pakai_d as x
                    WHERE kode_raw_processing_h = "${req.body.IDRAWPROCESSINGH}"
                    GROUP BY x.kode_barang`,(error1,result1,field1)=> {
                        if (error1){
                            res.status(400).send({
                                error1
                            });
                        }
                        else{
                            let panjangArray2=result1.length
                            let dataRawProcessingD=[]
                            for(i1=0;i1<panjangArray2;i1++){
                                let dataTopush2 = {
                                    kode_barang:`${result1[i1].kode_barang}`,
                                    total_qty:`${result1[i1].total_qty}`,
                                    nama_barang:`${result1[i1].nama_barang}`,
                                    satuan_barang:`${result1[i1].satuan_barang}`,
                                    kode_raw_processing_h:`${result1[i1].kode_raw_processing_h}`
                                }
                                dataRawProcessingD.push(dataTopush2)
                            }
                            res.status(200).send({
                                dataRawProcessingH,
                                dataRawProcessingD
                            });
                        }
                    });
                }
            });
        },
        getRawProsessingPlanPageH:(req,res) =>{
            connection.query(`
            SELECT
            x.kode_raw_processing_h,
            x.nomor_raw_processing,
            x.note_raw_processing,
            x.tanggal_raw_processing,
            (
                SELECT
                (
                    SELECT nama_barang FROM master_barang where kode_barang = y.kode_barang
                ) as raw_material_y
                FROM raw_processing_pakai_d as y
                where kode_raw_processing_h = x.kode_raw_processing_h GROUP BY y.kode_barang
            ) as raw_material,
            (
                SELECT
                (
                    SELECT satuan_barang FROM master_barang where kode_barang = y.kode_barang
                ) as satuan_raw_material_y
                FROM raw_processing_pakai_d as y
                where kode_raw_processing_h = x.kode_raw_processing_h GROUP BY y.kode_barang
            ) as satuan_raw_material,
            (
                SELECT
                sum(qty) as total_qty
                FROM raw_processing_pakai_d as y
                where kode_raw_processing_h = x.kode_raw_processing_h GROUP BY y.kode_barang
            ) as raw_material_qty_plan,
            x.kode_master_rawprosessing_h
            FROM raw_processing_h as x
            WHERE x.status_raw_processing = "OPEN"
            ORDER BY tanggal_raw_processing DESC`,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let dataRawProcessingH=[]
                    for(i=0;i<panjangArray1;i++){
                        let dataTopush1 = {
                            kode_raw_processing_h:`${result[i].kode_raw_processing_h}`,
                            nomor_raw_processing:`${result[i].nomor_raw_processing}`,
                            note_raw_processing:`${result[i].note_raw_processing}`,
                            tanggal_raw_processing:`${result[i].tanggal_raw_processing}`,
                            raw_material:`${result[i].raw_material}`,
                            satuan_raw_material:`${result[i].satuan_raw_material}`,
                            raw_material_qty_plan:`${result[i].raw_material_qty_plan}`,
                            kode_master_rawprosessing_h:`${result[i].kode_master_rawprosessing_h}`
                        }
                        dataRawProcessingH.push(dataTopush1)
                    }
                    res.status(200).send({
                        dataRawProcessingH
                    });
                }
            });
        },
        getRawProsessingPlanPageD:(req,res) =>{
            connection.query(`
            SELECT
            x.kode_raw_processing_pakai_d,
            x.kode_barang,
            (SELECT sum(qty) FROM raw_processing_pakai_d where kode_raw_processing_h = "${req.body.IDRAWPROCESSH}") as total_qty,
            (SELECT sum(total_cost) FROM raw_processing_pakai_d where kode_raw_processing_h = "${req.body.IDRAWPROCESSH}") as total_cost,
            (SELECT nama_barang FROM master_barang where kode_barang = x.kode_barang) as nama_barang,
            (SELECT satuan_barang FROM master_barang where kode_barang = x.kode_barang) as satuan_barang,
            x.kode_raw_processing_h
            FROM
            raw_processing_pakai_d as x
            WHERE kode_raw_processing_h = "${req.body.IDRAWPROCESSH}"
            GROUP BY x.kode_barang`,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let dataRawMaterial=[]
                    for(i=0;i<panjangArray1;i++){
                        let hitung_cost = parseInt(result[i].total_cost)/parseInt(result[i].total_qty)
                        let dataTopush1 = {
                            kode_raw_processing_pakai_d:`${result[i].kode_raw_processing_pakai_d}`,
                            kode_barang:`${result[i].kode_barang}`,
                            total_qty:`${result[i].total_qty}`,
                            cost_satuan:`${Math.round(hitung_cost)}`,
                            total_cost:`${result[i].total_cost}`,
                            nama_barang:`${result[i].nama_barang}`,
                            satuan_barang:`${result[i].satuan_barang}`,
                            kode_raw_processing_h:`${result[i].kode_raw_processing_h}`
                        }
                        dataRawMaterial.push(dataTopush1)
                    }
                    connection.query(`
                    SELECT
                    x.kode_master_rawprosessing_d,
                    x.kode_barang,
                    x.prm_cost,
                    (SELECT nama_barang FROM master_barang where kode_barang = x.kode_barang) as nama_barang,
                    (SELECT unit_barang FROM master_barang where kode_barang = x.kode_barang) as unit_barang,
                    (SELECT satuan_barang FROM master_barang where kode_barang = x.kode_barang) as satuan_barang,
                    (SELECT conversi_satuan FROM master_barang where kode_barang = x.kode_barang) as konversi_barang,
                    x.kode_master_rawprosessing_h
                    FROM
                    master_rawprosessing_d as x
                    WHERE kode_master_rawprosessing_h = "${req.body.IDMASTERRAWPROCESS}"`,(error1,result1,field1)=> {
                        if (error1){
                            res.status(400).send({
                                error1
                            });
                        }
                        else{
                            let panjangArray2=result1.length
                            let dataFinishedGoods=[]
                            for(i1=0;i1<panjangArray2;i1++){
                                let dataTopush2 = {
                                    kode_master_rawprosessing_d:`${result1[i1].kode_master_rawprosessing_d}`,
                                    kode_barang:`${result1[i1].kode_barang}`,
                                    prm_cost:`${result1[i1].prm_cost}`,
                                    nama_barang:`${result1[i1].nama_barang}`,
                                    unit_barang:`${result1[i1].unit_barang}`,
                                    satuan_barang:`${result1[i1].satuan_barang}`,
                                    konversi_barang:`${result1[i1].konversi_barang}`,
                                    kode_master_rawprosessing_h:`${result1[i1].kode_master_rawprosessing_h}`,
                                    unit_receive:0,
                                    satuan_receive:0,
                                    qty:0
                                }
                                dataFinishedGoods.push(dataTopush2)
                            }
                            res.status(200).send({
                                dataRawMaterial,
                                dataFinishedGoods
                            });
                        }
                    });
                }
            });
        },
        rawProcessCompletion:(req,res) =>{
            let TANGGALCOMPLETE = moment().tz("Asia/Jakarta").format('YYYY-MM-DD HH:mm:ss')
            let dataFinishedGoods = req.body.FINISHEDGOODS
            let sqlFinishedGoods = "INSERT INTO master_inventory (kode_inventory,kode_barang,tanggal_masuk,ref_masuk,type_masuk,harga,qty) VALUES ?";
            let dataArrayFinishedGoods = [];
            for (ia=0;ia<dataFinishedGoods.length;ia++) {
                let cost = dataFinishedGoods[ia].prm_cost == "WITHCOST"?req.body.COST:0
                if(parseInt(dataFinishedGoods[ia].qty)>0){
                    let dataToPush = [
                        ``,
                        `${dataFinishedGoods[ia].kode_barang}`,
                        `${TANGGALCOMPLETE}`,
                        `${req.body.IDRAWPROCESSH}`,
                        `RAWPROCESS`,
                        `${cost}`,
                        `${dataFinishedGoods[ia].qty}`
                    ]
                    dataArrayFinishedGoods.push(dataToPush)
                }
            }
            connection.query(sqlFinishedGoods, [dataArrayFinishedGoods],(error1,result1,field1)=> {
                if (error1){
                    res.status(400).send({
                        error1
                    });
                }
                else{
                    connection.query(`
                    UPDATE raw_processing_h SET 
                    note_raw_processing = "${req.body.NOTE}",
                    status_raw_processing = "CLOSED",
                    closed_user = "${req.body.USER}"
                    WHERE kode_raw_processing_h = "${req.body.IDRAWPROCESSH}" `,(error,result,field)=> {
                        if (error){
                            res.status(400).send({
                                error
                            });
                        }
                        else{
                            let sqlraw_processing_hasil = "INSERT INTO raw_processing_hasil_d (kode_raw_processing_hasil_d,kode_barang,qty_produksi,cost,kode_raw_processing_h) VALUES ?";
                            let dataArrayraw_processing_hasil = [];
                            for (ib=0;ib<dataFinishedGoods.length;ib++) {
                                let cost = dataFinishedGoods[ib].prm_cost == "WITHCOST"?parseInt(req.body.COST):0
                                if(parseInt(dataFinishedGoods[ib].qty)>0){
                                    let dataToPushraw_processing_hasil = [
                                        ``,
                                        `${dataFinishedGoods[ib].kode_barang}`,
                                        `${dataFinishedGoods[ib].qty}`,
                                        `${cost}`,
                                        `${req.body.IDRAWPROCESSH}`
                                    ]
                                    dataArrayraw_processing_hasil.push(dataToPushraw_processing_hasil)
                                }
                            }
                            connection.query(sqlraw_processing_hasil, [dataArrayraw_processing_hasil],(error2,result2,field2)=> {
                                if (error2){
                                    res.status(400).send({
                                        error2
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
                }
            });
        },
    // controler rawprosessing--
    // controler purchase order
        getPOData:(req,res) =>{
            connection.query(`SELECT x.kode_purchase_order_h, x.nomor_po, x.taxParameter, x.tanggal_buat, x.tanggal_masuk_barang, x.kode_vendor, x.jumlah_pembelian, x.create_user, x.receive_user,(SELECT nama_vendor FROM master_vendor where kode_vendor = x.kode_vendor) as vendor_name  FROM purchase_order_h as x WHERE x.tanggal_masuk_barang != "-" ORDER BY x.tanggal_buat DESC `,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let dataPOH=[]
                    for(i=0;i<panjangArray1;i++){
                        let dataTopush1 = {
                            kode_purchase_order_h:`${result[i].kode_purchase_order_h}`,
                            nomor_po:`${result[i].nomor_po}`,
                            taxParameter:`${result[i].taxParameter}`,
                            tanggal_buat:`${result[i].tanggal_buat}`,
                            tanggal_masuk_barang:`${result[i].tanggal_masuk_barang}`,
                            kode_vendor:`${result[i].kode_vendor}`,
                            nama_vendor:`${result[i].vendor_name}`,
                            jumlah_pembelian:`${result[i].jumlah_pembelian}`,
                            create_user:`${result[i].create_user}`,
                            receive_user:`${result[i].receive_user}`
                        }
                        dataPOH.push(dataTopush1)
                    }
                    res.status(200).send({
                        dataPOH
                    });
                }
            });
        },
        getOpenPOData:(req,res) =>{
            connection.query(`SELECT x.kode_purchase_order_h, x.nomor_po, x.taxParameter, x.tanggal_buat, x.tanggal_masuk_barang, x.kode_vendor, x.jumlah_pembelian, x.create_user, x.receive_user,(SELECT nama_vendor FROM master_vendor where kode_vendor = x.kode_vendor) as vendor_name  FROM purchase_order_h as x WHERE x.tanggal_masuk_barang = "" ORDER BY x.tanggal_buat DESC `,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let dataPOH=[]
                    for(i=0;i<panjangArray1;i++){
                        let dataTopush1 = {
                            kode_purchase_order_h:`${result[i].kode_purchase_order_h}`,
                            nomor_po:`${result[i].nomor_po}`,
                            taxParameter:`${result[i].taxParameter}`,
                            tanggal_buat:`${result[i].tanggal_buat}`,
                            tanggal_masuk_barang:`${result[i].tanggal_masuk_barang}`,
                            kode_vendor:`${result[i].kode_vendor}`,
                            nama_vendor:`${result[i].vendor_name}`,
                            jumlah_pembelian:`${result[i].jumlah_pembelian}`,
                            create_user:`${result[i].create_user}`,
                            receive_user:`${result[i].receive_user}`
                        }
                        dataPOH.push(dataTopush1)
                    }
                    res.status(200).send({
                        dataPOH
                    });
                }
            });
        },
        getDetailPOData:(req,res) =>{
            connection.query(`
            SELECT 
            x.kode_purchase_order_d,
            x.kode_barang, 
            x.qty,
            x.qty_receive,
            x.harga,
            (SELECT nama_barang FROM master_barang where kode_barang = x.kode_barang) as nama_barang,
            (SELECT unit_barang FROM master_barang where kode_barang = x.kode_barang) as unit_barang,
            (SELECT satuan_barang FROM master_barang where kode_barang = x.kode_barang) as satuan_barang,
            (SELECT conversi_satuan FROM master_barang where kode_barang = x.kode_barang) as konversi_barang,
            x.kode_purchase_order_h 
            FROM purchase_order_d as x 
            WHERE kode_purchase_order_h = "${req.body.kodePOH}"`,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let dataPOD=[]
                    for(i=0;i<result.length;i++){
                        // batas
                        let qty =parseInt(result[i].qty_)
                        let convertionQty =parseInt(result[i].konversi_barang)
                        let qtyProcessA = Math.floor(qty/convertionQty)
                        let qtyProcessB = qty%convertionQty
                        let qtyToShow = qtyProcessA+"."+qtyProcessB
                        // batas
                        let qtyReceive =parseInt(result[i].qty_receive)
                        let convertionqtyReceive =parseInt(result[i].konversi_barang)
                        let qtyReceiveProcessA = Math.floor(qtyReceive/convertionqtyReceive)
                        let qtyReceiveProcessB = qtyReceive%convertionqtyReceive
                        let qtyReceiveToShow = qtyReceiveProcessA+"."+qtyReceiveProcessB
                        // batas
                        let dataTopush1 = {
                            kode_purchase_order_d:`${result[i].kode_purchase_order_d}`,
                            kode_barang:`${result[i].kode_barang}`,
                            qty:`${result[i].qty}`,
                            qtyToShow:`${qtyToShow}`,
                            qty_receive:`${result[i].qty_receive}`,
                            qtyReceiveToShow:`${qtyReceiveToShow}`,
                            unit_receive:0,
                            satua_receive:0,
                            harga:`${result[i].harga}`,
                            nama_barang:`${result[i].nama_barang}`,
                            unit_barang:`${result[i].unit_barang}`,
                            satuan_barang:`${result[i].satuan_barang}`,
                            konversi_barang:`${result[i].konversi_barang}`,
                            kode_purchase_order_h:`${result[i].kode_purchase_order_h}`,
                        }
                        dataPOD.push(dataTopush1)
                    }
                    res.status(200).send({
                        dataPOD
                    });
                }
            });
        },
        getPOReport:(req,res) =>{
            connection.query(`
            SELECT
            x.kode_purchase_order_h,
            x.nomor_po,
            x.taxParameter,
            x.tanggal_buat,
            x.tanggal_kirim,
            (SELECT nama_outlet FROM outlet where id_outlet = x.tujuan_pengiriman) as nama_outlet,
            x.tanggal_masuk_barang,
            x.kode_vendor,
            (SELECT nama_vendor FROM master_vendor where kode_vendor = x.kode_vendor) as vendor_name,
            (SELECT alamat_vendor FROM master_vendor where kode_vendor = x.kode_vendor) as alamat_vendor,
            (SELECT pic FROM master_vendor where kode_vendor = x.kode_vendor) as pic_vendor,
            (SELECT telp_vendor FROM master_vendor where kode_vendor = x.kode_vendor) as telp_vendor,
            (SELECT email_vendor FROM master_vendor where kode_vendor = x.kode_vendor) as email_vendor,
            x.jumlah_pembelian,
            x.create_user,
            x.receive_user
            FROM purchase_order_h as x 
            WHERE x.kode_purchase_order_h = "${req.body.IDPOH}"`,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let dataPOH=[]
                    for(i=0;i<panjangArray1;i++){
                        let dataTopush1 = {
                            kode_purchase_order_h:`${result[i].kode_purchase_order_h}`,
                            nomor_po:`${result[i].nomor_po}`,
                            taxParameter:`${result[i].taxParameter}`,
                            tanggal_buat:`${result[i].tanggal_buat}`,
                            tanggal_buat_to_show:`${moment(result[i].tanggal_buat).format("DD-MMMM-YYYY")}`,
                            tanggal_kirim:`${result[i].tanggal_kirim}`,
                            tanggal_kirim_to_show:`${moment(result[i].tanggal_kirim).format("DD-MMMM-YYYY")}`,
                            nama_outlet:`${result[i].nama_outlet}`,
                            tanggal_masuk_barang:`${result[i].tanggal_masuk_barang}`,
                            kode_vendor:`${result[i].kode_vendor}`,
                            nama_vendor:`${result[i].vendor_name}`,
                            alamat_vendor:`${result[i].alamat_vendor}`,
                            pic_vendor:`${result[i].pic_vendor}`,
                            telp_vendor:`${result[i].telp_vendor}`,
                            email_vendor:`${result[i].email_vendor}`,
                            jumlah_pembelian:`${result[i].jumlah_pembelian}`,
                            create_user:`${result[i].create_user}`,
                            receive_user:`${result[i].receive_user}`
                        }
                        dataPOH.push(dataTopush1)
                    }
                    connection.query(`
                    SELECT
                    x.kode_purchase_order_d,
                    x.kode_barang,
                    x.qty,
                    x.harga,
                    (SELECT nama_barang FROM master_barang where kode_barang = x.kode_barang) as nama_barang,
                    (SELECT unit_barang FROM master_barang where kode_barang = x.kode_barang) as unit_barang,
                    (SELECT satuan_barang FROM master_barang where kode_barang = x.kode_barang) as satuan_barang,
                    x.kode_purchase_order_h
                    FROM
                    purchase_order_d as x
                    WHERE kode_purchase_order_h = "${req.body.IDPOH}"`,(error1,result1,field1)=> {
                        if (error1){
                            res.status(400).send({
                                error1
                            });
                        }
                        else{
                            let panjangArray2=result1.length
                            let dataPOD=[]
                            for(i1=0;i1<panjangArray2;i1++){
                                let dataTopush2 = {
                                    kode_purchase_order_d:`${result1[i1].kode_purchase_order_d}`,
                                    kode_barang:`${result1[i1].kode_barang}`,
                                    qty:`${result1[i1].qty}`,
                                    harga:`${result1[i1].harga}`,
                                    nama_barang:`${result1[i1].nama_barang}`,
                                    unit_barang:`${result1[i1].unit_barang}`,
                                    satuan_barang:`${result1[i1].satuan_barang}`,
                                    kode_purchase_order_h:`${result1[i1].kode_purchase_order_h}`
                                }
                                dataPOD.push(dataTopush2)
                            }
                            res.status(200).send({
                                dataPOH,
                                dataPOD
                            });
                        }
                    });
                }
            });
        },
    // controler purchase order--
    // controler terima purchase order
        receivePO: (req,res) =>{
            const datePOin = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
            let DataPOD = req.body.DATAPOD
            let Datalenght = parseInt(DataPOD.length)
            let sql = "INSERT INTO master_inventory (kode_inventory,kode_barang,tanggal_masuk,ref_masuk,type_masuk,harga,qty) VALUES ?";
            let dataArray = [];
            for (ia=0;ia<Datalenght;ia++) {
                let harga_persatuan = req.body.PRMPAJAK == "YES" ? (DataPOD[ia].harga*1.1) / DataPOD[ia].konversi_barang : DataPOD[ia].harga / DataPOD[ia].konversi_barang
                let dataToPush = [
                    ``,
                    `${DataPOD[ia].kode_barang}`,
                    `${datePOin}`,
                    `${req.body.KODEEPOH}`,
                    `PO`,
                    `${harga_persatuan}`,
                    `${DataPOD[ia].qty_receive}`]
                dataArray.push(dataToPush)
            }
            connection.query(sql, [dataArray],(error1,result1,field1)=> {
                if (error1){
                    res.status(400).send({
                        error1
                    });
                }
                else{
                    connection.query(` UPDATE purchase_order_h SET tanggal_masuk_barang = "${datePOin}",receive_user = "${req.body.USER}" WHERE kode_purchase_order_h = "${req.body.KODEEPOH}" `,(error2,result2,field2)=> {
                        if (error2){
                            res.status(400).send({
                                error2
                            });
                        }
                        else{
                            connection.query(`DELETE FROM purchase_order_d WHERE kode_purchase_order_h = "${req.body.KODEEPOH}"`,(error4,result4,field4)=> {
                                if (error4){
                                    res.status(400).send({
                                        error4
                                    });
                                }
                                else{
                                    var sqlAdd = "INSERT INTO purchase_order_d (kode_purchase_order_d,kode_barang,qty,qty_receive,harga,kode_purchase_order_h) VALUES ?";
                                    var dataArrayAdd = [];
                                    for (ia=0;ia<Datalenght;ia++) {
                                        let dataToPushAdd = [``, `${DataPOD[ia].kode_barang}`, `${DataPOD[ia].qty}`,`${DataPOD[ia].qty_receive}`, `${DataPOD[ia].harga}`, `${DataPOD[ia].kode_purchase_order_h}`]
                                        dataArrayAdd.push(dataToPushAdd)
                                    }
                                    connection.query(sqlAdd, [dataArrayAdd],(error5,result5,field5)=> {
                                        if (error5){
                                            res.status(400).send({
                                                error5
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
                        }
                    });
                }
            });
        },
    // controler terima purchase order--
    // form pembuatan PO
        getFormPOData:(req,res) =>{
            connection.query(`SELECT * FROM master_vendor `,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let dataVendor=[]
                    for(i=0;i<panjangArray1;i++){
                        let dataTopush1 = {value:`${result[i].kode_vendor}`,label:`${result[i].nama_vendor}`}
                        dataVendor.push(dataTopush1)
                    }
                    connection.query(`
                    SELECT 
                    x.kode_barang,
                    x.nama_barang,
                    x.unit_barang,
                    x.satuan_barang,
                    x.harga_barang,
                    x.conversi_satuan,
                    x.kode_vendor,
                    (SELECT nama_vendor FROM master_vendor where kode_vendor = x.kode_vendor) as vendor_name
                    FROM master_barang as x `,(error1,result1,field1)=> {
                        if (error1){
                            res.status(400).send({
                                error1
                            });
                        }
                        else{
                            let panjangArray2=result1.length
                            let dataMasterBarang=[]
                            for(i1=0;i1<panjangArray2;i1++){
                                let dataTopush2 = {
                                    value:`${result1[i1].kode_barang}`,
                                    label:`${result1[i1].kode_barang}-${result1[i1].nama_barang}`,
                                    satuan:`${result1[i1].satuan_barang}`,
                                    unit:`${result1[i1].unit_barang}`,
                                    konversi:`${result1[i1].conversi_satuan}`,
                                    kode_vendor:`${result1[i1].kode_vendor}`,
                                    harga_barang:`${result1[i1].harga_barang}`
                                }
                                dataMasterBarang.push(dataTopush2)
                            }
                            connection.query(`SELECT * FROM outlet WHERE id_outlet = "OUT0000001" `,(error2,result2,field2)=> {
                                if (error2){
                                    res.status(400).send({
                                        error2
                                    });
                                }
                                else{
                                    let panjangArray3=result2.length
                                    let dataOutlet=[]
                                    for(i2=0;i2<panjangArray3;i2++){
                                        let dataTopush3 = {value:`${result2[i2].id_outlet}`,label:`${result2[i2].nama_outlet}`}
                                        dataOutlet.push(dataTopush3)
                                    }
                                    res.status(200).send({
                                        dataVendor,
                                        dataMasterBarang,
                                        dataOutlet
                                    });
                                }
                            });
                        }
                    });
                }
            });
        },
        addFormPOData: (req,res) =>{
            let tanngalKirim = moment(req.body.TANGGALKIRIM).format('YYYY-MM-DD HH:mm:ss')
            let firstPrm = moment().tz("Asia/Jakarta").startOf('month').format('YYYY-MM-DD HH:mm:ss')
            let lastPrm = moment().tz("Asia/Jakarta").endOf('month').format('YYYY-MM-DD HH:mm:ss')
            let year = moment().tz("Asia/Jakarta").format("YYYY")
            let month = moment().tz("Asia/Jakarta").format("MM")
            connection.query(`
            SELECT COUNT(kode_purchase_order_h) AS total
            FROM purchase_order_h
            WHERE tanggal_buat
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
                    let runData = totalDatastring.padStart(7, '0')
                    let automateNumber = "PO"+"/"+year+"/"+month+"/"+runData
                    connection.query(`INSERT INTO purchase_order_h values("","${automateNumber}","${req.body.TANGGALPO}","${tanngalKirim}","${req.body.OUTLETCODE}","","${req.body.VENDORCODE}","${req.body.TOTALPURCHASE}","${req.body.USER}","","${req.body.PAJAK}")`,(error,result,field)=> {
                        if (error){
                            res.status(400).send({
                                error
                            });
                        }
                        else{
                            let id_po_h = result.insertId
                            let addData = req.body.ADDDATA;
                            let Datalenght = addData.length;
                            var sql = "INSERT INTO purchase_order_d (kode_purchase_order_d,kode_barang,qty,qty_receive,harga,kode_purchase_order_h) VALUES ?";
                            var dataArray = [];
                            for (ia=0;ia<Datalenght;ia++) {
                                let dataToPush = [``, `${addData[ia].kode_barang}`, `${addData[ia].qty}`,`0`, `${addData[ia].harga}`, `${id_po_h}`]
                                dataArray.push(dataToPush)
                            }
                            connection.query(sql, [dataArray],(error1,result1,field1)=> {
                                if (error1){
                                    res.status(400).send({
                                        error1
                                    });
                                }
                                else{
                                    res.status(200).send({
                                        status:"01",
                                        id_po_h:`${id_po_h}`
                                    });
                                }
                            });
                        }
                    });
                }
            });
        },
        cancelPO:(req,res) =>{
            connection.query(`
            UPDATE purchase_order_h SET 
            tanggal_masuk_barang = "-"
            WHERE kode_purchase_order_h = "${req.body.IDPO}" `,(error,result,field)=> {
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
        },
    // form pembuatan PO--
    // controler order
        getFormAddOrder:(req,res) =>{
            connection.query(`SELECT * FROM outlet WHERE id_outlet="${req.body.OUTLET}" `,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray=result.length
                    let dataOutlet=[]
                    for(i=0;i<panjangArray;i++){
                        let dataTopush = {value:`${result[i].id_outlet}`,label:`${result[i].nama_outlet}`}
                        dataOutlet.push(dataTopush)
                    }
                    connection.query(`
                    SELECT 
                    x.kode_barang,
                    x.nama_barang,
                    x.unit_barang,
                    x.satuan_barang,
                    x.kode_vendor,
                    x.conversi_satuan,
                    (SELECT nama_vendor FROM master_vendor where kode_vendor = x.kode_vendor) as vendor_name
                    FROM master_barang as x
                    WHERE type_barang = "FINISHED GOODS"`,(error1,result1,field1)=> {
                        if (error1){
                            res.status(400).send({
                                error1
                            });
                        }
                        else{
                            let panjangArray2=result1.length
                            let dataMasterBarang=[]
                            for(i=0;i<panjangArray2;i++){
                                let dataTopush2 = {
                                    value:`${result1[i].kode_barang}`,
                                    label:`${result1[i].nama_barang}`,
                                    // label:`${result1[i].kode_barang}-${result1[i].nama_barang}-${result1[i].vendor_name}`,
                                    nama_barang:`${result1[i].nama_barang}`,
                                    unit:`${result1[i].unit_barang}`,
                                    satuan:`${result1[i].satuan_barang}`,
                                    conversi:`${result1[i].conversi_satuan}`
                                }
                                dataMasterBarang.push(dataTopush2)
                            }
                            res.status(200).send({
                                dataOutlet,
                                dataMasterBarang
                            });
                        }
                    });
                }
            });
        },
        addFormOrderData: (req,res) =>{
            let firstPrm = moment().tz("Asia/Jakarta").startOf('month').format('YYYY-MM-DD HH:mm:ss')
            let lastPrm = moment().tz("Asia/Jakarta").endOf('month').format('YYYY-MM-DD HH:mm:ss')
            let year = moment().tz("Asia/Jakarta").format("YYYY")
            let month = moment().tz("Asia/Jakarta").format("MM")
            connection.query(`
            SELECT COUNT(kode_order_h) AS total
            FROM order_h
            WHERE tanggal_buat
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
                    let runData = totalDatastring.padStart(7, '0')
                    let automateNumber = "ORDER"+"/"+year+"/"+month+"/"+runData
                    connection.query(`INSERT INTO order_h values("","${automateNumber}","${req.body.TANGGALORDER}","","${req.body.IDOUTLET}","OPEN","${req.body.USER}","")`,(error,result,field)=> {
                        if (error){
                            res.status(400).send({
                                error
                            });
                        }
                        else{
                            let id_order_h = result.insertId
                            let addData = req.body.ADDDATA;
                            let Datalenght = addData.length;
                            var sql = "INSERT INTO order_d (kode_order_d,kode_barang,qty_req,qty_send,qty_receive,kode_order_h) VALUES ?";
                            var dataArray = [];
                            for (ia=0;ia<Datalenght;ia++) {
                                let dataToPush = [``, `${addData[ia].kode_barang}`, `${addData[ia].qty}`, `0`, `0`, `${id_order_h}`]
                                dataArray.push(dataToPush)
                            }
                            connection.query(sql, [dataArray],(error1,result1,field1)=> {
                                if (error1){
                                    res.status(400).send({
                                        error1
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
                }
            });
        },
        getOrderData:(req,res) =>{
            connection.query(`
            SELECT 
            x.kode_order_h,
            x.nomor_order,
            x.tanggal_buat,
            (SELECT nama_outlet FROM outlet where id_outlet = x.id_outlet) as nama_outlet,
            (SELECT kode_delivery_order FROM delivery_order where kode_order_h = x.kode_order_h) as kode_delivery_order,
            (SELECT nomor_delivery_order FROM delivery_order where kode_order_h = x.kode_order_h) as nomor_delivery,
            (SELECT tanggal_kirim FROM delivery_order where kode_order_h = x.kode_order_h) as tanggal_kirim,
            x.status_order,x.create_user
            FROM order_h as x
            WHERE x.status_order != "RECEIVED" AND id_outlet = "${req.body.OUTLET}" ORDER BY x.tanggal_buat DESC `,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let dataOrderH=[]
                    for(i=0;i<panjangArray1;i++){
                        let dataTopush1 = {
                            kode_order_h:`${result[i].kode_order_h}`,
                            nomor_order:`${result[i].nomor_order}`,
                            tanggal_buat:`${result[i].tanggal_buat}`,
                            id_outlet:`${result[i].id_outlet}`,
                            nama_outlet:`${result[i].nama_outlet}`,
                            status_order:`${result[i].status_order}`,
                            create_user:`${result[i].create_user}`,
                            kode_delivery_order:`${result[i].kode_delivery_order}`,
                            nomor_delivery:`${result[i].nomor_delivery}`,
                            tanggal_kirim:`${result[i].tanggal_kirim}`
                        }
                        dataOrderH.push(dataTopush1)
                    }
                    res.status(200).send({
                        dataOrderH
                    });
                }
            });
        },
        getDetailOrderData:(req,res) =>{
            connection.query(`
            SELECT 
            x.kode_order_d,
            x.kode_barang,
            x.qty_req,
            (
                SELECT SUM(qty) as qty_in_stock 
                FROM 
                master_inventory 
                where 
                kode_barang = x.kode_barang 
            ) as qty_in_inventory,
            (SELECT nama_barang FROM master_barang where kode_barang = x.kode_barang) as nama_barang,
            (SELECT unit_barang FROM master_barang where kode_barang = x.kode_barang) as unit_barang,
            (SELECT satuan_barang FROM master_barang where kode_barang = x.kode_barang) as satuan_barang,
            (SELECT conversi_satuan FROM master_barang where kode_barang = x.kode_barang) as konversi_barang,
            x.qty_send,
            x.qty_receive,
            x.kode_order_h 
            FROM 
            order_d as x 
            WHERE kode_order_h = "${req.body.kodeOrderH}"`,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let orderList=[]
                    for(i=0;i<panjangArray1;i++){
                        let qtyReq =parseInt(result[i].qty_req)
                        let convertionQtyReq =parseInt(result[i].konversi_barang)
                        let qtyReqProcessA = Math.floor(qtyReq/convertionQtyReq)
                        let qtyReqProcessB = qtyReq%convertionQtyReq
                        let qtyReqToShow = qtyReqProcessA+"."+qtyReqProcessB
                        // batas
                        let qtyInv =parseInt(result[i].qty_in_inventory==null?0:result[i].qty_in_inventory)
                        let convertionQtyInv =parseInt(result[i].konversi_barang)
                        let qtyInvProcessA = Math.floor(qtyInv/convertionQtyInv)
                        let qtyInvProcessB = qtyInv%convertionQtyInv
                        let qtyInvToShow = qtyInvProcessA+"."+qtyInvProcessB
                        // batas
                        let qtySend =parseInt(result[i].qty_send)
                        let convertionqtySend =parseInt(result[i].konversi_barang)
                        let qtySendProcessA = Math.floor(qtySend/convertionqtySend)
                        let qtySendProcessB = qtySend%convertionqtySend
                        let qtySendToShow = qtySendProcessA+"."+qtySendProcessB
                        // batas
                        let qtyReceive =parseInt(result[i].qty_receive)
                        let convertionqtyReceive =parseInt(result[i].konversi_barang)
                        let qtyReceiveProcessA = Math.floor(qtyReceive/convertionqtyReceive)
                        let qtyReceiveProcessB = qtyReceive%convertionqtyReceive
                        let qtyReceiveToShow = qtyReceiveProcessA+"."+qtyReceiveProcessB
                        // batas
                        let dataTopush1 = {
                            kode_order_d:`${result[i].kode_order_d}`,
                            kode_barang:`${result[i].kode_barang}`,
                            qty_req:`${result[i].qty_req}`,
                            qty_req_ToShow:`${qtyReqToShow}`,
                            unit_qty_req:0,
                            satuan_qty_req:0,
                            qty_in_inventory:`${result[i].qty_in_inventory==null?0:result[i].qty_in_inventory}`,
                            qty_in_inventory_ToShow:`${qtyInvToShow}`,
                            nama_barang:`${result[i].nama_barang}`,
                            unit_barang:`${result[i].unit_barang}`,
                            satuan_barang:`${result[i].satuan_barang}`,
                            konversi_barang:`${result[i].konversi_barang}`,
                            qty_send:`${result[i].qty_send}`,
                            qty_send_ToShow:`${qtySendToShow}`,
                            unit_qty_send:0,
                            satuan_qty_send:0,
                            qty_receive:`${result[i].qty_receive}`,
                            qty_receive_ToShow:`${qtyReceiveToShow}`,
                            unit_qty_receive:0,
                            satuan_qty_receive:0,
                            kode_order_h:`${result[i].kode_order_h}`
                        }
                        orderList.push(dataTopush1)
                    }
                    res.status(200).send({
                        orderList
                    });
                }
            });
        },
        getOrderOption:(req,res) =>{
            connection.query(`SELECT x.kode_order_h,x.nomor_order,x.tanggal_buat,x.id_outlet,(SELECT nama_outlet FROM outlet where id_outlet = x.id_outlet) as nama_outlet,x.status_order,x.create_user FROM order_h as x WHERE x.status_order = "OPEN" `,(error,result,field)=> {
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
                            value:`${result[i].kode_order_h}`,
                            label:`${result[i].nomor_order}-${result[i].nama_outlet}-${result[i].tanggal_buat}`}
                        dataToShow.push(dataTopush)
                    }
                    res.status(200).send({
                        dataToShow
                    });
                }
            });
        },
        receiveOrder:(req,res) =>{
            connection.query(`
            SELECT 
            x.kode_delivery_order_d,
            x.kode_inventory,
            x.kode_barang,
            x.qty,
            x.cost,
            x.kode_delivery_order
            FROM delivery_order_d as x
            WHERE kode_delivery_order = "${req.body.IDDelivery}"`,(errorx,resultx,fieldx)=> {
                if (errorx){
                    res.status(400).send({
                        errorx
                    });
                }
                else{
                    const dateDOin = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
                    let sql = "INSERT INTO master_inventory_outlet (kode_inventory_outlet,kode_barang,tanggal_masuk,ref_masuk,type_masuk,harga,qty,id_outlet) VALUES ?";
                    let dataArray = [];
                    let queriesUpdateOrderD = '';
                    for (ia=0;ia<resultx.length;ia++) {
                        let receivedetail =  req.body.RECEIVEDATA.filter(function(data) {
                            return data.kode_barang == resultx[ia].kode_barang;
                        });
                        let dataToPush = [
                            ``,
                            `${resultx[ia].kode_barang}`,
                            `${dateDOin}`,
                            `${req.body.IDDelivery}`,
                            `DELIVERYORDER`,
                            `${resultx[ia].cost}`,
                            `${receivedetail[0].qty_receive}`,
                            `${req.body.PRMOUTLET}`
                        ]
                        if(parseInt(receivedetail[0].qty_receive) > 0 ){
                            dataArray.push(dataToPush)
                            queriesUpdateOrderD = queriesUpdateOrderD+`UPDATE order_d SET qty_receive = "${receivedetail[0].qty_receive}" WHERE kode_order_d = "${receivedetail[0].kode_order_d}";`
                        }
                    }
                    connection.query(sql, [dataArray],(error1,result1,field1)=> {
                        if (error1){
                            res.status(400).send({
                                error1
                            });
                        }
                        else{
                            connection.query(` UPDATE order_h SET status_order = "RECEIVED" WHERE kode_order_h = "${req.body.IDOrder}" `,(error2,result2,field2)=> {
                                if (error2){
                                    res.status(400).send({
                                        error2
                                    });
                                }
                                else{
                                    connection.query(` UPDATE delivery_order SET status_do = "RECEIVED",receive_user = "${req.body.USER}",receive_date = "${dateDOin}" WHERE kode_delivery_order = "${req.body.IDDelivery}" `,(error3,result3,field3)=> {
                                        if (error3){
                                            res.status(400).send({
                                                error3
                                            });
                                        }
                                        else{
                                            let sql2 = "INSERT INTO master_inventory (kode_inventory,kode_barang,tanggal_masuk,ref_masuk,type_masuk,harga,qty) VALUES ?";
                                            let dataArray2 = [];
                                            for (ia=0;ia<resultx.length;ia++) {
                                                let rejectdetail =  req.body.RECEIVEDATA.filter(function(data) {
                                                    return data.kode_barang == resultx[ia].kode_barang;
                                                });
                                                let rejectQty = parseInt(resultx[ia].qty) - parseInt(rejectdetail[0].qty_receive)
                                                let dataToPush2 = [
                                                    ``,
                                                    `${resultx[ia].kode_barang}`,
                                                    `${dateDOin}`,
                                                    `${req.body.IDDelivery}`,
                                                    `REJECTRECEIVE`,
                                                    `${resultx[ia].cost}`,
                                                    `${rejectQty}`
                                                ]
                                                parseInt(rejectQty) > 0 && dataArray2.push(dataToPush2)
                                            }
                                            connection.query(sql2, [dataArray2],(error4,result4,field4)=> {
                                                if (error4){
                                                    res.status(400).send({
                                                        error4
                                                    });
                                                }
                                                else{
                                                    connection.query(queriesUpdateOrderD,(error5,result5,field5)=> {
                                                        if (error5){
                                                            res.status(400).send({
                                                                error5
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
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        },
        getOrderReport:(req,res) =>{
            connection.query(`
            SELECT 
            x.kode_order_h,
            x.nomor_order,
            x.tanggal_buat,
            (SELECT nama_outlet FROM outlet where id_outlet = x.id_outlet) as nama_outlet,
            (SELECT kode_delivery_order FROM delivery_order where kode_order_h = x.kode_order_h) as kode_delivery_order,
            (SELECT nomor_delivery_order FROM delivery_order where kode_order_h = x.kode_order_h) as nomor_delivery,
            (SELECT tanggal_kirim FROM delivery_order where kode_order_h = x.kode_order_h) as tanggal_kirim,
            x.status_order,x.create_user
            FROM order_h as x
            WHERE x.kode_order_h = "${req.body.ID}"`,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let dataOrderH=[]
                    for(i=0;i<panjangArray1;i++){
                        let dataTopush1 = {
                            kode_order_h:`${result[i].kode_order_h}`,
                            nomor_order:`${result[i].nomor_order}`,
                            tanggal_buat:`${result[i].tanggal_buat}`,
                            tanggal_buat_to_show:`${moment(result[i].tanggal_buat).format("DD-MMMM-YYYY")}`,
                            id_outlet:`${result[i].id_outlet}`,
                            nama_outlet:`${result[i].nama_outlet}`,
                            status_order:`${result[i].status_order}`,
                            create_user:`${result[i].create_user}`,
                            kode_delivery_order:`${result[i].kode_delivery_order}`,
                            nomor_delivery:`${result[i].nomor_delivery}`,
                            tanggal_kirim:`${result[i].tanggal_kirim}`
                        }
                        dataOrderH.push(dataTopush1)
                    }
                    connection.query(`
                    SELECT 
                    x.kode_order_d,
                    x.kode_barang,
                    (
                        SELECT SUM(qty) as qty_in_stock 
                        FROM 
                        master_inventory 
                        where 
                        kode_barang = x.kode_barang 
                    ) as qty_in_inventory,
                    (SELECT nama_barang FROM master_barang where kode_barang = x.kode_barang) as nama_barang,
                    (SELECT unit_barang FROM master_barang where kode_barang = x.kode_barang) as unit_barang,
                    (SELECT satuan_barang FROM master_barang where kode_barang = x.kode_barang) as satuan_barang,
                    (SELECT conversi_satuan FROM master_barang where kode_barang = x.kode_barang) as konversi_barang,
                    x.qty_send,
                    x.qty_req,
                    x.kode_order_h 
                    FROM 
                    order_d as x 
                    WHERE kode_order_h = "${req.body.ID}"`,(error1,result1,field1)=> {
                        if (error1){
                            res.status(400).send({
                                error1
                            });
                        }
                        else{
                            let panjangArray2=result1.length
                            let orderList=[]
                            for(i=0;i<panjangArray2;i++){
                                // batas
                                let qtyReq =parseInt(result1[i].qty_req)
                                let convertionQtyReq =parseInt(result1[i].konversi_barang)
                                let qtyReqProcessA = Math.floor(qtyReq/convertionQtyReq)
                                let qtyReqProcessB = qtyReq%convertionQtyReq
                                let qtyReqToShow = qtyReqProcessA+"."+qtyReqProcessB
                                // batas
                                let qtySend =parseInt(result1[i].qty_send)
                                let convertionqtySend =parseInt(result1[i].konversi_barang)
                                let qtySendProcessA = Math.floor(qtySend/convertionqtySend)
                                let qtySendProcessB = qtySend%convertionqtySend
                                let qtySendToShow = qtySendProcessA+"."+qtySendProcessB
                                // batas
                                let dataTopush2 = {
                                    kode_order_d:`${result1[i].kode_order_d}`,
                                    kode_barang:`${result1[i].kode_barang}`,
                                    nama_barang:`${result1[i].nama_barang}`,
                                    unit_barang:`${result1[i].unit_barang}`,
                                    satuan_barang:`${result1[i].satuan_barang}`,
                                    qty_in_inventory:`${result1[i].qty_in_inventory==null?0:result1[i].qty_in_inventory}`,
                                    qty_req:`${result1[i].qty_req}`,
                                    qty_req_toshow:`${qtyReqToShow}`,
                                    qty_send:`${result1[i].qty_send}`,
                                    qty_send_toshow:`${qtySendToShow}`,
                                    kode_order_h:`${result1[i].kode_order_h}`
                                }
                                orderList.push(dataTopush2)
                            }
                            res.status(200).send({
                                dataOrderH,
                                orderList
                            });
                        }
                    });
                }
            });
        },
    // controler order--
    // controller deliveryOrder
        getDeliveryOrderData:(req,res) =>{
            connection.query(`
            SELECT
            x.kode_delivery_order,
            x.nomor_delivery_order,
            x.tanggal_kirim,
            x.create_user,
            x.create_date,
            x.kode_order_h,
            (SELECT nomor_order FROM order_h WHERE kode_order_h = x.kode_order_h) as nomor_order,
            (
                SELECT 
                (
                    SELECT nama_outlet FROM outlet WHERE id_outlet = y.id_outlet
                ) as nama_outlet FROM order_h as y WHERE kode_order_h = x.kode_order_h
            ) as outlet_tujuan 
            FROM delivery_order as x WHERE status_do = "OPEN" ORDER BY tanggal_kirim DESC`,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let dataDeliveryOrderH=[]
                    for(i=0;i<panjangArray1;i++){
                        let dataTopush1 = {
                            kode_delivery_order:`${result[i].kode_delivery_order}`,
                            nomor_delivery_order:`${result[i].nomor_delivery_order}`,
                            tanggal_kirim:`${result[i].tanggal_kirim}`,
                            create_user:`${result[i].create_user}`,
                            create_date:`${result[i].create_date}`,
                            kode_order_h:`${result[i].kode_order_h}`,
                            nomor_order:`${result[i].nomor_order}`,
                            outlet_tujuan:`${result[i].outlet_tujuan}`}
                        dataDeliveryOrderH.push(dataTopush1)
                    }
                    res.status(200).send({
                        dataDeliveryOrderH
                    });
                }
            });
        },
        addFormDeliveryOrder:(req,res) =>{
            let firstPrm = moment().tz("Asia/Jakarta").startOf('month').format('YYYY-MM-DD HH:mm:ss')
            let lastPrm = moment().tz("Asia/Jakarta").endOf('month').format('YYYY-MM-DD HH:mm:ss')
            let year = moment().tz("Asia/Jakarta").format("YYYY")
            let month = moment().tz("Asia/Jakarta").format("MM")
            connection.query(`
            SELECT COUNT(kode_delivery_order) AS total
            FROM delivery_order
            WHERE tanggal_kirim
            BETWEEN "${firstPrm}"
            AND "${lastPrm}"
            `,(errorx,resultx,fieldx)=> {
                if (errorx){
                    console.log("1");
                    res.status(400).send({
                        errorx
                    });
                }
                else{
                    let totalData = parseInt(resultx[0].total)+1
                    let totalDatastring = totalData.toString()
                    let runData = totalDatastring.padStart(7, '0')
                    let automateNumber = "DO"+"/"+year+"/"+month+"/"+runData
                    connection.query(`INSERT INTO delivery_order values("","${automateNumber}","${req.body.TANNGALKIRIM}","${req.body.USER}","${req.body.TANNGALKIRIM}","","","OPEN","${req.body.KODEORDER}")`,(error,result,field)=> {
                        if (error){
                            console.log("2");
                            res.status(400).send({
                                error
                            });
                        }
                        else{
                            let kodeDeliveryOrderH = result.insertId
                            connection.query(` UPDATE order_h SET status_order = "SEND", tanggal_kirim = "${req.body.TANNGALKIRIM}",send_user="${req.body.USER}" WHERE kode_order_h = "${req.body.KODEORDER}" `,(error1,result1,field1)=> {
                                if (error1){
                                    console.log("3");
                                    res.status(400).send({
                                        error1
                                    });
                                }
                                else{
                                    let DATAORDERD = req.body.DATAORDERD
                                    let DataOrderDlength = DATAORDERD.length
                                    connection.query(`
                                    SELECT
                                    *
                                    FROM master_inventory
                                    WHERE
                                        qty > 0
                                    ORDER BY kode_inventory ASC
                                    `,(error4,result4,field4)=> {
                                        if (error4){
                                            console.log("4");
                                            res.status(400).send({
                                                error4
                                            });
                                        }
                                        else{
                                            let dataresult4 = result4;
                                            let panjangArray2=dataresult4.length
                                            let masterInventory=[]
                                            for(ix1=0;ix1<panjangArray2;ix1++){
                                                let dataTopush2 = {
                                                    kode_inventory:`${dataresult4[ix1].kode_inventory}`,
                                                    kode_barang:`${dataresult4[ix1].kode_barang}`,
                                                    tanggal_masuk:`${dataresult4[ix1].tanggal_masuk}`,
                                                    ref_masuk:`${dataresult4[ix1].ref_masuk}`,
                                                    type_masuk:`${dataresult4[ix1].type_masuk}`,
                                                    harga:`${dataresult4[ix1].harga}`,
                                                    qty:`${dataresult4[ix1].qty}`
                                                }
                                                masterInventory.push(dataTopush2)
                                            }
                                            let newMasterInventory = []
                                            for (i2=0;i2<DataOrderDlength;i2++) {
                                                let dataToshow =  masterInventory.filter(function(data) {
                                                    return data.kode_barang == DATAORDERD[i2].kode_barang;
                                                });
                                                dataToshow.sort(function(a, b){
                                                    return a.kode_inventory-b.kode_inventory
                                                })
                                                let qty_to_cut = DATAORDERD[i2].qty_send
                                                kurangi_qty_to_cut = (qty) =>{
                                                    hasil_pengurangan = parseInt(qty_to_cut) - parseInt(qty)
                                                    qty_to_cut = hasil_pengurangan
                                                }
                                                for(i3=0;i3<dataToshow.length;i3++){
                                                    let new_qty = parseInt(dataToshow[i3].qty) > parseInt(qty_to_cut) ? parseInt(dataToshow[i3].qty) - parseInt(qty_to_cut) : 0
                                                    let prm_qty_void = parseInt(dataToshow[i3].qty) > parseInt(qty_to_cut) ? parseInt(qty_to_cut) : parseInt(dataToshow[i3].qty)
                                                    Object.assign(dataToshow[i3], {qty_void:prm_qty_void})
                                                    Object.assign(dataToshow[i3], {kodeDeliveryOrderH:kodeDeliveryOrderH})
                                                    new_qty > 0 ?kurangi_qty_to_cut(qty_to_cut):kurangi_qty_to_cut(dataToshow[i3].qty)
                                                    dataToshow[i3].qty = new_qty
                                                }
                                                for(ix2=0;ix2<dataToshow.length;ix2++){
                                                    let dataTopush3 = {
                                                        kode_inventory:`${dataToshow[ix2].kode_inventory}`,
                                                        kode_barang:`${dataToshow[ix2].kode_barang}`,
                                                        tanggal_masuk:`${dataToshow[ix2].tanggal_masuk}`,
                                                        ref_masuk:`${dataToshow[ix2].ref_masuk}`,
                                                        type_masuk:`${dataToshow[ix2].type_masuk}`,
                                                        harga:`${dataToshow[ix2].harga}`,
                                                        qty:`${dataToshow[ix2].qty}`,
                                                        qty_void:`${dataToshow[ix2].qty_void}`,
                                                        kodeDeliveryOrderH:`${dataToshow[ix2].kodeDeliveryOrderH}`
                                                    }
                                                    newMasterInventory.push(dataTopush3)
                                                }
                                                dataToshow = []
                                            }
                                            let queries = '';
                                            for (i4=0;i4<newMasterInventory.length;i4++) {
                                                queries = queries+`UPDATE master_inventory SET qty = "${newMasterInventory[i4].qty}" WHERE kode_inventory = "${parseInt(newMasterInventory[i4].kode_inventory)}";`
                                            }
                                            connection.query(queries,(error5,result5,field5)=> {
                                                if (error5){
                                                    console.log("5");
                                                    res.status(400).send({
                                                        error5
                                                    });
                                                }
                                                else{
                                                    var sqlDeliveryOrderD = "INSERT INTO delivery_order_d (kode_delivery_order_d,kode_inventory,kode_barang,qty,cost,total_cost,kode_delivery_order) VALUES ?";
                                                    var dataArrayDeliveryOrderD = [];
                                                    for (i1=0;i1<newMasterInventory.length;i1++) {
                                                        let dataToPush1 = [
                                                            ``,
                                                            `${newMasterInventory[i1].kode_inventory}`,
                                                            `${newMasterInventory[i1].kode_barang}`,
                                                            `${newMasterInventory[i1].qty_void}`,
                                                            `${newMasterInventory[i1].harga}`,
                                                            `${parseInt(newMasterInventory[i1].qty_void)*parseInt(newMasterInventory[i1].harga)}`,
                                                            `${kodeDeliveryOrderH}`
                                                        ]
                                                        parseInt(newMasterInventory[i1].qty_void) > 0 && dataArrayDeliveryOrderD.push(dataToPush1)
                                                    }
                                                    connection.query(sqlDeliveryOrderD, [dataArrayDeliveryOrderD],(error6,result6,field6)=> {
                                                        if (error6){
                                                            console.log("6");
                                                            res.status(400).send({
                                                                error6
                                                            });
                                                        }
                                                        else{
                                                            let queriesUpdateOrderD = '';
                                                            for (i4=0;i4<DATAORDERD.length;i4++) {
                                                                queriesUpdateOrderD = queriesUpdateOrderD+`UPDATE order_d SET qty_send = "${DATAORDERD[i4].qty_send}" WHERE kode_order_d = "${DATAORDERD[i4].kode_order_d}";`
                                                            }
                                                            connection.query(queriesUpdateOrderD,(error7,result7,field7)=> {
                                                                if (error7){
                                                                    res.status(400).send({
                                                                        error7
                                                                    });
                                                                }
                                                                else{
                                                                    res.status(200).send({
                                                                        status:"01",
                                                                        kodeDeliveryOrderH:kodeDeliveryOrderH
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        },
        getDeliveryOrderDetail:(req,res) =>{
            connection.query(`SELECT
            x.kode_delivery_order,
            x.nomor_delivery_order,
            x.tanggal_kirim,
            x.create_user,
            x.create_date,
            x.kode_order_h,
            (SELECT nomor_order FROM order_h WHERE kode_order_h = x.kode_order_h) 
            as nomor_order,
            (SELECT tanggal_buat FROM order_h WHERE kode_order_h = x.kode_order_h) 
            as tanggal_order,
            (SELECT 
            (SELECT nama_outlet FROM outlet WHERE id_outlet = y.id_outlet) as nama_outlet FROM order_h as y WHERE kode_order_h = x.kode_order_h) 
            as outlet_tujuan 
            FROM delivery_order as x
            WHERE x.kode_delivery_order = "${req.body.KODEDO}"`,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    connection.query(`SELECT
                    x.kode_order_d,
                    x.kode_barang,
                    (SELECT nama_barang FROM master_barang WHERE kode_barang = x.kode_barang) 
                    as nama_barang,
                    (SELECT unit_barang FROM master_barang where kode_barang = x.kode_barang) as unit_barang,
                    (SELECT satuan_barang FROM master_barang where kode_barang = x.kode_barang) as satuan_barang,
                    (SELECT conversi_satuan FROM master_barang where kode_barang = x.kode_barang) as konversi_barang,
                    x.qty_req,
                    x.qty_send,
                    x.qty_receive
                    FROM order_d as x
                    WHERE
                    x.kode_order_h = "${result[0].kode_order_h}"`,(error1,result1,field1)=> {
                        if (error1){
                            res.status(400).send({
                                error1
                            });
                        }
                        else{
                            let panjangArray2=result1.length
                            let dataDeliveryOrderD=[]
                            for(ia=0;ia<panjangArray2;ia++){
                                // batas
                                let qtyReq =parseInt(result1[ia].qty_req)
                                let convertionQtyReq =parseInt(result1[ia].konversi_barang)
                                let qtyReqProcessA = Math.floor(qtyReq/convertionQtyReq)
                                let qtyReqProcessB = qtyReq%convertionQtyReq
                                let qtyReqToShow = qtyReqProcessA+"."+qtyReqProcessB
                                // batas
                                let qtySend =parseInt(result1[ia].qty_send)
                                let convertionqtySend =parseInt(result1[ia].konversi_barang)
                                let qtySendProcessA = Math.floor(qtySend/convertionqtySend)
                                let qtySendProcessB = qtySend%convertionqtySend
                                let qtySendToShow = qtySendProcessA+"."+qtySendProcessB
                                // batas
                                let qtyReceive =parseInt(result1[ia].qty_receive)
                                let convertionqtyReceive =parseInt(result1[ia].konversi_barang)
                                let qtyReceiveProcessA = Math.floor(qtyReceive/convertionqtyReceive)
                                let qtyReceiveProcessB = qtyReceive%convertionqtyReceive
                                let qtyReceiveToShow = qtyReceiveProcessA+"."+qtyReceiveProcessB
                                // batas
                                let dataTopush2 = {kode_order_d:`${result1[ia].kode_order_d}`,
                                kode_barang:`${result1[ia].kode_barang}`,
                                nama_barang:`${result1[ia].nama_barang}`,
                                unit_barang:`${result1[ia].unit_barang}`,
                                satuan_barang:`${result1[ia].satuan_barang}`,
                                qty_req:`${result1[ia].qty_req}`,
                                qty_req_toShow:`${qtyReqToShow}`,
                                qty_send:`${result1[ia].qty_send}`,
                                qty_send_toShow:`${qtySendToShow}`,
                                qty_receive:`${result1[ia].qty_receive}`,
                                qty_receive_toShow:`${qtyReceiveToShow}`}
                                dataDeliveryOrderD.push(dataTopush2)
                            }
                            res.status(200).send({
                                "kode_delivery_order": `${result[0].kode_delivery_order}`,
                                "nomor_delivery_order": `${result[0].nomor_delivery_order}`,
                                "tanggal_kirim": `${result[0].tanggal_kirim}`,
                                "create_user": `${result[0].create_user}`,
                                "create_date": `${result[0].create_date}`,
                                "kode_order_h": `${result[0].kode_order_h}`,
                                "nomor_order": `${result[0].nomor_order}`,
                                "tanggal_order": `${result[0].tanggal_order}`,
                                "outlet_tujuan": `${result[0].outlet_tujuan}`,
                                dataDeliveryOrderD:dataDeliveryOrderD
                            });
                        }
                    });
                }
            });
        },
        getDeliveryOrderReport:(req,res) =>{
            connection.query(`
            SELECT
            x.kode_delivery_order,
            x.nomor_delivery_order,
            x.tanggal_kirim,
            x.kode_order_h,
            (
                SELECT nomor_order FROM order_h where kode_order_h = x.kode_order_h
            ) as nomor_order,
            (
                SELECT tanggal_buat FROM order_h where kode_order_h = x.kode_order_h
            ) as tanggal_order,
            (
                SELECT
                (
                    SELECT nama_outlet FROM outlet WHERE id_outlet = y.id_outlet
                ) as nama_outlet
                FROM order_h as y where kode_order_h = x.kode_order_h
            ) as nama_outlet
            FROM delivery_order as x 
            WHERE x.kode_delivery_order = "${req.body.ID}"`,(error,result,field)=> {
                if (error){
                    console.log("1");
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let dataProduksiH=[]
                    for(i=0;i<panjangArray1;i++){
                        let dataTopush1 = {
                            kode_delivery_order:`${result[i].kode_delivery_order}`,
                            nomor_delivery_order:`${result[i].nomor_delivery_order}`,
                            tanggal_kirim:`${result[i].tanggal_kirim}`,
                            tanggal_kirim_to_show:`${moment(result[i].tanggal_kirim).format("DD-MMMM-YYYY")}`,
                            kode_order_h:`${result[i].kode_order_h}`,
                            nomor_order:`${result[i].nomor_order}`,
                            tanggal_order:`${result[i].tanggal_order}`,
                            tanggal_order_to_show:`${moment(result[i].tanggal_order).format("DD-MMMM-YYYY")}`,
                            nama_outlet:`${result[i].nama_outlet}`
                        }
                        dataProduksiH.push(dataTopush1)
                    }
                    connection.query(`
                    SELECT
                    x.kode_order_d,
                    x.kode_barang ,
                    x.qty_send,
                    (SELECT nama_barang FROM master_barang where kode_barang = x.kode_barang) as nama_barang,
                    (SELECT unit_barang FROM master_barang where kode_barang = x.kode_barang) as unit_barang,
                    (SELECT satuan_barang FROM master_barang where kode_barang = x.kode_barang) as satuan_barang,
                    (SELECT conversi_satuan FROM master_barang where kode_barang = x.kode_barang) as konversi_barang,
                    x.kode_order_h
                    FROM
                    order_d as x
                    WHERE kode_order_h = "${dataProduksiH[0].kode_order_h}"
                    GROUP BY x.kode_barang`,(error1,result1,field1)=> {
                        if (error1){
                            res.status(400).send({
                                error1
                            });
                        }
                        else{
                            let panjangArray2=result1.length
                            let dataPakaiProduksiD=[]
                            for(i1=0;i1<panjangArray2;i1++){
                                // batas
                                let qtySend =parseInt(result1[i1].qty_send)
                                let convertionqtySend =parseInt(result1[i1].konversi_barang)
                                let qtySendProcessA = Math.floor(qtySend/convertionqtySend)
                                let qtySendProcessB = qtySend%convertionqtySend
                                let qtySendToShow = qtySendProcessA+"."+qtySendProcessB
                                // batas
                                let dataTopush2 = {
                                    kode_order_d:`${result1[i1].kode_order_d}`,
                                    kode_barang:`${result1[i1].kode_barang}`,
                                    qty:`${result1[i1].qty_send}`,
                                    qty_toShow:`${qtySendToShow}`,
                                    nama_barang:`${result1[i1].nama_barang}`,
                                    unit_barang:`${result1[i1].unit_barang}`,
                                    satuan_barang:`${result1[i1].satuan_barang}`,
                                    kode_order_h:`${result1[i1].kode_order_h}`
                                }
                                dataPakaiProduksiD.push(dataTopush2)
                            }
                            res.status(200).send({
                                dataProduksiH,
                                dataPakaiProduksiD
                            });
                        }
                    });
                }
            });
        },
    // controller deliveryOrder--
    // controller produksi
        getProductionPlanPageH:(req,res) =>{
            connection.query(`
            SELECT
            x.kode_produksi_h,
            x.nomor_produksi,
            x.note_produksi,
            x.tanggal_produksi,
            (
                SELECT
                (
                    SELECT nama_barang FROM master_barang where kode_barang = y.kode_barang
                ) as production_item_y
                FROM produksi_hasil_d as y
                where kode_produksi_h = x.kode_produksi_h
            ) as production_item,
            (
                SELECT
                (
                    SELECT satuan_barang FROM master_barang where kode_barang = y.kode_barang
                ) as satuan_production_item_y
                FROM produksi_hasil_d as y
                where kode_produksi_h = x.kode_produksi_h
            ) as satuan_production_item,
            (
                SELECT
                y.qty_plan
                FROM produksi_hasil_d as y
                where kode_produksi_h = x.kode_produksi_h
            ) as production_qty_plan,
            (SELECT sum(total_cost) FROM produksi_pakai_d WHERE kode_produksi_h = x.kode_produksi_h) as total_cost,
            x.status_produksi,
            x.kode_master_produksi_h
            FROM produksi_h as x
            WHERE x.status_produksi = "OPEN"
            ORDER BY tanggal_produksi DESC`,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let dataProduksiH=[]
                    for(i=0;i<panjangArray1;i++){
                        let dataTopush1 = {
                            kode_produksi_h:`${result[i].kode_produksi_h}`,
                            nomor_produksi:`${result[i].nomor_produksi}`,
                            note_produksi:`${result[i].note_produksi}`,
                            tanggal_produksi:`${result[i].tanggal_produksi}`,
                            production_item:`${result[i].production_item}`,
                            total_cost:`${result[i].total_cost}`,
                            satuan_production_item:`${result[i].satuan_production_item}`,
                            production_qty_plan:`${result[i].production_qty_plan}`,
                            kode_master_produksi_h:`${result[i].kode_master_produksi_h}`
                        }
                        dataProduksiH.push(dataTopush1)
                    }
                    res.status(200).send({
                        dataProduksiH
                    });
                }
            });
        },
        getProductionPlanPageD:(req,res) =>{
            connection.query(`
            SELECT
            x.kode_produksi_hasil_d,
            x.kode_barang,
            x.qty_plan,
            x.cost,
            (SELECT nama_barang FROM master_barang where kode_barang = x.kode_barang) as nama_barang,
            (SELECT satuan_barang FROM master_barang where kode_barang = x.kode_barang) as satuan_barang,
            x.kode_produksi_h
            FROM
            produksi_hasil_d as x
            WHERE kode_produksi_h = "${req.body.IDPRODUKSIH}"`,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let dataHasilProduksiD=[]
                    for(i=0;i<panjangArray1;i++){
                        let dataTopush1 = {
                            kode_produksi_hasil_d:`${result[i].kode_produksi_hasil_d}`,
                            kode_barang:`${result[i].kode_barang}`,
                            qty_plan:`${result[i].qty_plan}`,
                            qty_produksi:`${result[i].qty_plan}`,
                            cost:`${result[i].cost}`,
                            nama_barang:`${result[i].nama_barang}`,
                            satuan_barang:`${result[i].satuan_barang}`,
                            kode_produksi_h:`${result[i].kode_produksi_h}`
                        }
                        dataHasilProduksiD.push(dataTopush1)
                    }
                    connection.query(`
                    SELECT
                    x.kode_produksi_pakai_d,
                    x.kode_inventory,
                    x.kode_barang,
                    (SELECT sum(qty) FROM produksi_pakai_d WHERE kode_barang = x.kode_barang AND kode_produksi_h = "${req.body.IDPRODUKSIH}") as qty,
                    x.cost,
                    (SELECT nama_barang FROM master_barang where kode_barang = x.kode_barang) as nama_barang,
                    (SELECT satuan_barang FROM master_barang where kode_barang = x.kode_barang) as satuan_barang,
                    x.kode_produksi_h
                    FROM
                    produksi_pakai_d as x
                    WHERE kode_produksi_h = "${req.body.IDPRODUKSIH}"
                    GROUP BY x.kode_barang`,(error1,result1,field1)=> {
                        if (error1){
                            res.status(400).send({
                                error1
                            });
                        }
                        else{
                            let panjangArray2=result1.length
                            let dataPakaiProduksiD=[]
                            for(i1=0;i1<panjangArray2;i1++){
                                let dataTopush2 = {
                                    kode_produksi_pakai_d:`${result1[i1].kode_produksi_pakai_d}`,
                                    kode_inventory:`${result1[i1].kode_inventory}`,
                                    kode_barang:`${result1[i1].kode_barang}`,
                                    qty:`${result1[i1].qty}`,
                                    qty_sisa:0,
                                    cost:`${result1[i1].cost}`,
                                    nama_barang:`${result1[i1].nama_barang}`,
                                    satuan_barang:`${result1[i1].satuan_barang}`,
                                    kode_produksi_h:`${result1[i1].kode_produksi_h}`
                                }
                                dataPakaiProduksiD.push(dataTopush2)
                            }
                            res.status(200).send({
                                dataHasilProduksiD,
                                dataPakaiProduksiD
                            });
                        }
                    });
                }
            });
        },
        getCompletionProductionPageD:(req,res) =>{
            connection.query(`
            SELECT
            x.kode_produksi_hasil_d,
            x.kode_barang,
            x.qty_plan,
            x.cost,
            (SELECT nama_barang FROM master_barang where kode_barang = x.kode_barang) as nama_barang,
            (SELECT satuan_barang FROM master_barang where kode_barang = x.kode_barang) as satuan_barang,
            x.kode_produksi_h
            FROM
            produksi_hasil_d as x
            WHERE kode_produksi_h = "${req.body.IDPRODUKSIH}"`,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let dataHasilProduksiD=[]
                    for(i=0;i<panjangArray1;i++){
                        let dataTopush1 = {
                            kode_produksi_hasil_d:`${result[i].kode_produksi_hasil_d}`,
                            kode_barang:`${result[i].kode_barang}`,
                            qty_plan:`${result[i].qty_plan}`,
                            qty_produksi:`0`,
                            cost:`${result[i].cost}`,
                            nama_barang:`${result[i].nama_barang}`,
                            satuan_barang:`${result[i].satuan_barang}`,
                            kode_produksi_h:`${result[i].kode_produksi_h}`
                        }
                        dataHasilProduksiD.push(dataTopush1)
                    }
                    connection.query(`
                    SELECT
                    x.kode_produksi_pakai_d,
                    x.kode_barang,
                    x.qty,
                    x.qty_sisa,
                    x.cost,
                    (SELECT nama_barang FROM master_barang where kode_barang = x.kode_barang) as nama_barang,
                    (SELECT satuan_barang FROM master_barang where kode_barang = x.kode_barang) as satuan_barang,
                    x.kode_produksi_h
                    FROM
                    produksi_pakai_d as x
                    WHERE kode_produksi_h = "${req.body.IDPRODUKSIH}"`,(error1,result1,field1)=> {
                        if (error1){
                            res.status(400).send({
                                error1
                            });
                        }
                        else{
                            let panjangArray2=result1.length
                            let dataPakaiProduksiD=[]
                            for(i1=0;i1<panjangArray2;i1++){
                                let dataTopush2 = {
                                    kode_produksi_pakai_d:`${result1[i1].kode_produksi_pakai_d}`,
                                    kode_barang:`${result1[i1].kode_barang}`,
                                    qty:`${result1[i1].qty}`,
                                    qty_sisa:`${result1[i1].qty_sisa}`,
                                    cost:`${result1[i1].cost}`,
                                    nama_barang:`${result1[i1].nama_barang}`,
                                    satuan_barang:`${result1[i1].satuan_barang}`,
                                    kode_produksi_h:`${result1[i1].kode_produksi_h}`
                                }
                                dataPakaiProduksiD.push(dataTopush2)
                            }
                            res.status(200).send({
                                dataHasilProduksiD,
                                dataPakaiProduksiD
                            });
                        }
                    });
                }
            });
        },
        getFormProductionPlan:(req,res) =>{
            connection.query(`
                SELECT
                x.kode_master_produksi_h,
                x.nomor_master_produksi,
                x.kode_barang,
                (SELECT nama_barang FROM master_barang where kode_barang = x.kode_barang) as nama_barang,
                (SELECT satuan_barang FROM master_barang where kode_barang = x.kode_barang) as satuan_barang,
                x.qty
                FROM master_produksi_h as x`,(error1,result1,field1)=> {
                if (error1){
                    res.status(400).send({
                        error1
                    });
                }
                else{
                    let panjangArray2=result1.length
                    let dataMasterBarang=[]
                    for(i=0;i<panjangArray2;i++){
                        let dataTopush2 = {
                            value:`${result1[i].kode_barang}`,
                            label:`${result1[i].nama_barang} (${result1[i].nomor_master_produksi})`,
                            kode_master_produksi_h:`${result1[i].kode_master_produksi_h}`,
                            prmBarangHasil:`${result1[i].kode_master_produksi_h}`,
                            nama_barang:`${result1[i].nama_barang}`,
                            satuan:`${result1[i].satuan_barang}`,
                            qty:`${result1[i].qty}`}
                        dataMasterBarang.push(dataTopush2)
                    }
                    res.status(200).send({
                        dataMasterBarang
                    });
                }
            });
        },
        addItemProductionPlan:(req,res) =>{
            connection.query(`
                SELECT
                x.kode_master_produksi_pakai_d,
                x.kode_barang,
                (SELECT nama_barang FROM master_barang where kode_barang = x.kode_barang) as nama_barang,
                (SELECT satuan_barang FROM master_barang where kode_barang = x.kode_barang) as satuan_barang,
                x.qty,
                (SELECT SUM(qty) as qty_in_stok FROM master_inventory where kode_barang = x.kode_barang) as qty_in_stok
                FROM master_produksi_pakai_d as x WHERE x.kode_master_produksi_h = "${req.body.KEYPLANPRODUCTION}"`,(error1,result1,field1)=> {
                if (error1){
                    res.status(400).send({
                        error1
                    });
                }
                else{
                    let panjangArray2=result1.length
                    let dataKebutuhanProduksi=[]
                    for(i=0;i<panjangArray2;i++){
                        let dataTopush2 = {
                            kode_master_produksi_pakai_d:`${result1[i].kode_master_produksi_pakai_d}`,
                            kode_barang:`${result1[i].kode_barang}`,
                            nama_barang:`${result1[i].nama_barang}`,
                            satuan_barang:`${result1[i].satuan_barang}`,
                            qty:`${parseInt(result1[i].qty)*parseInt(req.body.MULTIPLEBY)}`,
                            cost:0,
                            qty_in_stok:`${result1[i].qty_in_stok === null ? 0 : result1[i].qty_in_stok}`}
                        dataKebutuhanProduksi.push(dataTopush2)
                    }
                    res.status(200).send({
                        dataKebutuhanProduksi
                    });
                }
            });
        },
        addFormProductionPlan:(req,res) =>{
            let firstPrm = moment().tz("Asia/Jakarta").startOf('month').format('YYYY-MM-DD HH:mm:ss')
            let lastPrm = moment().tz("Asia/Jakarta").endOf('month').format('YYYY-MM-DD HH:mm:ss')
            let year = moment().tz("Asia/Jakarta").format("YYYY")
            let month = moment().tz("Asia/Jakarta").format("MM")
            connection.query(`
            SELECT COUNT(kode_produksi_h) AS total
            FROM produksi_h
            WHERE tanggal_produksi
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
                    let runData = totalDatastring.padStart(7, '0')
                    let automateNumber = "PRODUKSI"+"/"+year+"/"+month+"/"+runData
                    connection.query(`
                    INSERT INTO produksi_h 
                    values("","${automateNumber}","${req.body.NOTE}","${req.body.TANGGALPRODUKSI}","OPEN","${req.body.USER}","","${req.body.ADDDATABARANGHASIL[0].prmMasterProduksi}")
                    `,(error1,result1,field1)=> {
                        if (error1){
                            res.status(400).send({
                                error1
                            });
                        }
                        else{
                            let kodeProduksiH = result1.insertId
                            let ADDDATABARANGHASIL = req.body.ADDDATABARANGHASIL
                            connection.query(`
                            INSERT INTO produksi_hasil_d 
                            values(
                                "",
                                "${ADDDATABARANGHASIL[0].kode_barang}",
                                "${ADDDATABARANGHASIL[0].qty}",
                                "0",
                                "0",
                                "${kodeProduksiH}"
                            )
                            `,(error2,result2,field2)=> {
                                if (error2){
                                    res.status(400).send({
                                        error2
                                    });
                                }
                                else{
                                    let ADDDATABARANGPAKAI = req.body.ADDDATABARANGPAKAI
                                    let DataBarangPakailength = ADDDATABARANGPAKAI.length
                                    connection.query(`
                                    SELECT
                                    *
                                    FROM master_inventory
                                    WHERE
                                        qty > 0
                                    ORDER BY kode_inventory ASC
                                    `,(error4,result4,field4)=> {
                                        if (error4){
                                            res.status(400).send({
                                                error4
                                            });
                                        }
                                        else{
                                            let dataresult4 = result4;
                                            let panjangArray2=dataresult4.length
                                            let masterInventory=[]
                                            for(ix1=0;ix1<panjangArray2;ix1++){
                                                let dataTopush2 = {
                                                    kode_inventory:`${dataresult4[ix1].kode_inventory}`,
                                                    kode_barang:`${dataresult4[ix1].kode_barang}`,
                                                    tanggal_masuk:`${dataresult4[ix1].tanggal_masuk}`,
                                                    ref_masuk:`${dataresult4[ix1].ref_masuk}`,
                                                    type_masuk:`${dataresult4[ix1].type_masuk}`,
                                                    harga:`${dataresult4[ix1].harga}`,
                                                    qty:`${dataresult4[ix1].qty}`
                                                }
                                                masterInventory.push(dataTopush2)
                                            }
                                            let newMasterInventory = []
                                            for (i2=0;i2<DataBarangPakailength;i2++) {
                                                let dataToshow =  masterInventory.filter(function(data) {
                                                    return data.kode_barang == ADDDATABARANGPAKAI[i2].kode_barang;
                                                });
                                                dataToshow.sort(function(a, b){
                                                    return a.kode_inventory-b.kode_inventory
                                                })
                                                let qty_to_cut = ADDDATABARANGPAKAI[i2].qty
                                                kurangi_qty_to_cut = (qty) =>{
                                                    hasil_pengurangan = parseInt(qty_to_cut) - parseInt(qty)
                                                    qty_to_cut = hasil_pengurangan
                                                }
                                                for(i3=0;i3<dataToshow.length;i3++){
                                                    let new_qty = parseInt(dataToshow[i3].qty) > parseInt(qty_to_cut) ? parseInt(dataToshow[i3].qty) - parseInt(qty_to_cut) : 0
                                                    let prm_qty_void = parseInt(dataToshow[i3].qty) > parseInt(qty_to_cut) ? parseInt(qty_to_cut) : parseInt(dataToshow[i3].qty)
                                                    Object.assign(dataToshow[i3], {qty_void:prm_qty_void})
                                                    Object.assign(dataToshow[i3], {kodeProduksiH:kodeProduksiH})
                                                    new_qty > 0 ?kurangi_qty_to_cut(qty_to_cut):kurangi_qty_to_cut(dataToshow[i3].qty)
                                                    dataToshow[i3].qty = new_qty
                                                }
                                                for(ix2=0;ix2<dataToshow.length;ix2++){
                                                    let dataTopush3 = {
                                                        kode_inventory:`${dataToshow[ix2].kode_inventory}`,
                                                        kode_barang:`${dataToshow[ix2].kode_barang}`,
                                                        tanggal_masuk:`${dataToshow[ix2].tanggal_masuk}`,
                                                        ref_masuk:`${dataToshow[ix2].ref_masuk}`,
                                                        type_masuk:`${dataToshow[ix2].type_masuk}`,
                                                        harga:`${dataToshow[ix2].harga}`,
                                                        qty:`${dataToshow[ix2].qty}`,
                                                        qty_void:`${dataToshow[ix2].qty_void}`,
                                                        kodeProduksiH:`${dataToshow[ix2].kodeProduksiH}`
                                                    }
                                                    newMasterInventory.push(dataTopush3)
                                                }
                                                dataToshow = []
                                            }
                                            let queries = '';
                                            console.log(newMasterInventory);
                                            for (i4=0;i4<newMasterInventory.length;i4++) {
                                                queries = queries+`UPDATE master_inventory SET qty = "${newMasterInventory[i4].qty}" WHERE kode_inventory = "${parseInt(newMasterInventory[i4].kode_inventory)}";`
                                            }
                                            connection.query(queries,(error5,result5,field5)=> {
                                                if (error5){
                                                    res.status(400).send({
                                                        error5
                                                    });
                                                }
                                                else{
                                                    var sqlBarangPakai = "INSERT INTO produksi_pakai_d (kode_produksi_pakai_d,kode_inventory,kode_barang,qty,qty_sisa,cost,total_cost,kode_produksi_h) VALUES ?";
                                                    var dataArrayBarangPakai = [];
                                                    for (i1=0;i1<newMasterInventory.length;i1++) {
                                                        let dataToPush1 = [
                                                            ``,
                                                            `${newMasterInventory[i1].kode_inventory}`,
                                                            `${newMasterInventory[i1].kode_barang}`,
                                                            `${newMasterInventory[i1].qty_void}`,
                                                            `0`,
                                                            `${newMasterInventory[i1].harga}`,
                                                            `${parseInt(newMasterInventory[i1].qty_void)*parseInt(newMasterInventory[i1].harga)}`,
                                                            `${kodeProduksiH}`
                                                        ]
                                                        parseInt(newMasterInventory[i1].qty_void) > 0 && dataArrayBarangPakai.push(dataToPush1)
                                                    }
                                                    connection.query(sqlBarangPakai, [dataArrayBarangPakai],(error3,result3,field3)=> {
                                                        if (error3){
                                                            res.status(400).send({
                                                                error3
                                                            });
                                                        }
                                                        else{
                                                            res.status(200).send({
                                                                status:"01",
                                                                kodeProduksiH:`${kodeProduksiH}`
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        },
        getProductionPlanReport:(req,res) =>{
            connection.query(`
            SELECT
            x.kode_produksi_h,
            x.nomor_produksi,
            x.note_produksi,
            x.tanggal_produksi,
            (
                SELECT
                (
                    SELECT nama_barang FROM master_barang where kode_barang = y.kode_barang
                ) as production_item_y
                FROM produksi_hasil_d as y
                where kode_produksi_h = x.kode_produksi_h
            ) as production_item,
            (
                SELECT
                (
                    SELECT satuan_barang FROM master_barang where kode_barang = y.kode_barang
                ) as satuan_production_item_y
                FROM produksi_hasil_d as y
                where kode_produksi_h = x.kode_produksi_h
            ) as satuan_production_item,
            (
                SELECT
                y.qty_plan
                FROM produksi_hasil_d as y
                where kode_produksi_h = x.kode_produksi_h
            ) as production_qty_plan
            FROM produksi_h as x 
            WHERE x.kode_produksi_h = "${req.body.IDPRODUKSIH}"`,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let dataProduksiH=[]
                    for(i=0;i<panjangArray1;i++){
                        let dataTopush1 = {
                            kode_produksi_h:`${result[i].kode_produksi_h}`,
                            nomor_produksi:`${result[i].nomor_produksi}`,
                            tanggal_produksi:`${result[i].tanggal_produksi}`,
                            tanggal_produksi_to_show:`${moment(result[i].tanggal_produksi).format("DD-MMMM-YYYY")}`,
                            note_produksi:`${result[i].note_produksi}`,
                            production_item:`${result[i].production_item}`,
                            satuan_production_item:`${result[i].satuan_production_item}`,
                            production_qty_plan:`${result[i].production_qty_plan}`
                        }
                        dataProduksiH.push(dataTopush1)
                    }
                    connection.query(`
                    SELECT
                    x.kode_produksi_pakai_d,
                    x.kode_barang,
                    (SELECT sum(qty) FROM produksi_pakai_d WHERE kode_barang = x.kode_barang) as qty,
                    x.cost,
                    (SELECT nama_barang FROM master_barang where kode_barang = x.kode_barang) as nama_barang,
                    (SELECT satuan_barang FROM master_barang where kode_barang = x.kode_barang) as satuan_barang,
                    x.kode_produksi_h
                    FROM
                    produksi_pakai_d as x
                    WHERE kode_produksi_h = "${req.body.IDPRODUKSIH}"
                    GROUP BY x.kode_barang`,(error1,result1,field1)=> {
                        if (error1){
                            res.status(400).send({
                                error1
                            });
                        }
                        else{
                            let panjangArray2=result1.length
                            let dataPakaiProduksiD=[]
                            for(i1=0;i1<panjangArray2;i1++){
                                let dataTopush2 = {
                                    kode_produksi_pakai_d:`${result1[i1].kode_produksi_pakai_d}`,
                                    kode_barang:`${result1[i1].kode_barang}`,
                                    qty:`${result1[i1].qty}`,
                                    cost:`${result1[i1].cost}`,
                                    nama_barang:`${result1[i1].nama_barang}`,
                                    satuan_barang:`${result1[i1].satuan_barang}`,
                                    kode_produksi_h:`${result1[i1].kode_produksi_h}`
                                }
                                dataPakaiProduksiD.push(dataTopush2)
                            }
                            res.status(200).send({
                                dataProduksiH,
                                dataPakaiProduksiD
                            });
                        }
                    });
                }
            });
        },
        productionPlanCompletion:(req,res) =>{
            let TANGGALCOMPLETE = moment().tz("Asia/Jakarta").format('YYYY-MM-DD HH:mm:ss')
            let dataHasilProduksi = req.body.HASILPRODUKSI
            let sqlHasilProduksi = "INSERT INTO master_inventory (kode_inventory,kode_barang,tanggal_masuk,ref_masuk,type_masuk,harga,qty) VALUES ?";
            let dataArrayHasilProduksi = [];
            let queriesHasilProduksi = '';
            for (ia=0;ia<dataHasilProduksi.length;ia++) {
                if(parseInt(dataHasilProduksi[ia].qty_produksi)>0){
                    let cost = req.body.COST / parseInt(dataHasilProduksi[ia].qty_produksi)
                    let dataToPush = [
                        ``,
                        `${dataHasilProduksi[ia].kode_barang}`,
                        `${TANGGALCOMPLETE}`,
                        `${req.body.IDPRODUKSIH}`,
                        `PRODUCTION`,
                        `${cost}`,
                        `${dataHasilProduksi[ia].qty_produksi}`
                    ]
                    dataArrayHasilProduksi.push(dataToPush)
                    queriesHasilProduksi = queriesHasilProduksi+`UPDATE produksi_hasil_d SET qty_produksi = "${dataHasilProduksi[ia].qty_produksi}", cost = "${cost}" WHERE kode_produksi_hasil_d = "${dataHasilProduksi[ia].kode_produksi_hasil_d}";`
                }
            }
            connection.query(sqlHasilProduksi, [dataArrayHasilProduksi],(error1,result1,field1)=> {
                if (error1){
                    res.status(400).send({
                        error1
                    });
                }
                else{
                    let queriesUpdateProduksiH = `UPDATE produksi_h SET status_produksi = "CLOSED", closed_user = "${req.body.USER}" WHERE kode_produksi_h = "${req.body.IDPRODUKSIH}";`
                    let allQueries = queriesHasilProduksi+queriesUpdateProduksiH
                    console.log(allQueries);
                    connection.query(allQueries,(error5,result5,field5)=> {
                        if (error5){
                            res.status(400).send({
                                error5
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
    // controller produksi--
    // controller user
        getUser:(req,res) =>{
            connection.query(`
            SELECT
            x.id_user,
            x.nama_user,
            x.nik,
            x.akses_page,
            x.pass_user
            FROM user as x `,(error,result,field)=> {
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
        addUser: (req,res) =>{
            connection.query(`INSERT INTO user values("","${req.body.NAMA}","${req.body.NIK}","${req.body.AKSES}","${req.body.PASS}")`,(error,result,field)=> {
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
        },
        editUser:(req,res) =>{
            connection.query(` UPDATE user SET akses_page = "${req.body.AKSES}",pass_user = "${req.body.PASS}" WHERE id_user = "${req.body.ID}" `,(error,result,field)=> {
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
        },
    // controller user--
    // controller test
        updateTabletest:(req,res) =>{
            let values = [
                { users: "anbya 1", id: 1 },
                { users: "anbya test123", id: 2 }
            ];
            let queries = '';
            
            for (ia=0;ia<values.length;ia++) {
                queries = queries+`UPDATE tabletest SET users = "${values[ia].users}" WHERE id = "${values[ia].id}";`
            }
            connection.query(queries,(error1,result1,field1)=> {
                if (error1){
                    res.status(400).send({
                        error1
                    });
                }
                else{
                    res.status(200).send({
                        status:"01"
                    });
                }
            });
        },
    // controller test--
    // controller transferout
        getFormTOCK:(req,res) =>{
            connection.query(`
            SELECT
            x.kode_barang,
            x.nama_barang,
            x.unit_barang,
            x.satuan_barang,
            x.conversi_satuan,
            x.kode_vendor,
            (SELECT nama_vendor FROM master_vendor where kode_vendor = x.kode_vendor) as vendor_name,
            (SELECT SUM(qty) FROM master_inventory where kode_barang = x.kode_barang) as qty_in_stok
            FROM master_barang as x
            WHERE x.type_barang = "FINISHED GOODS"`,(error1,result1,field1)=> {
                if (error1){
                    res.status(400).send({
                        error1
                    });
                }
                else{
                    let panjangArray2=result1.length
                    let dataMasterBarang=[]
                    for(i1=0;i1<panjangArray2;i1++){
                        let dataTopush2 = {value:`${result1[i1].kode_barang}`,label:`${result1[i1].nama_barang}`,satuan:`${result1[i1].satuan_barang}`,unit:`${result1[i1].unit_barang}`,konversi:`${result1[i1].conversi_satuan}`,qty_in_stok:`${result1[i1].qty_in_stok==null?0:result1[i1].qty_in_stok}`}
                        dataMasterBarang.push(dataTopush2)
                    }
                    connection.query(`SELECT * FROM outlet WHERE id_outlet != "${req.body.PRMOUTLET}"`,(error2,result2,field2)=> {
                        if (error2){
                            res.status(400).send({
                                error2
                            });
                        }
                        else{
                            let panjangArray3=result2.length
                            let dataOutlet=[]
                            for(i2=0;i2<panjangArray3;i2++){
                                let dataTopush3 = {value:`${result2[i2].id_outlet}`,label:`${result2[i2].nama_outlet}`}
                                dataOutlet.push(dataTopush3)
                            }
                            connection.query(`SELECT * FROM outlet WHERE id_outlet = "${req.body.PRMOUTLET}"`,(error3,result3,field3)=> {
                                if (error3){
                                    res.status(400).send({
                                        error3
                                    });
                                }
                                else{
                                    res.status(200).send({
                                        nama_outlet:result3[0].nama_outlet,
                                        dataMasterBarang,
                                        dataOutlet
                                    });
                                }
                            });
                        }
                    });
                }
            });
        },
        addFormTOCK:(req,res) =>{
            let firstPrm = moment().tz("Asia/Jakarta").startOf('month').format('YYYY-MM-DD HH:mm:ss')
            let lastPrm = moment().tz("Asia/Jakarta").endOf('month').format('YYYY-MM-DD HH:mm:ss')
            let year = moment().tz("Asia/Jakarta").format("YYYY")
            let month = moment().tz("Asia/Jakarta").format("MM")
            connection.query(`
            SELECT COUNT(kode_between_transfer) AS total
            FROM between_transfer
            WHERE tanggal_kirim_between_transfer
            BETWEEN "${firstPrm}"
            AND "${lastPrm}"
            `,(errorx,resultx,fieldx)=> {
                if (errorx){
                    console.log("1");
                    res.status(400).send({
                        errorx
                    });
                }
                else{
                    let totalData = parseInt(resultx[0].total)+1
                    let totalDatastring = totalData.toString()
                    let runData = totalDatastring.padStart(7, '0')
                    let automateNumber = "TOUT"+"/"+year+"/"+month+"/"+runData
                    connection.query(`
                    INSERT INTO between_transfer 
                    values
                    (
                        "",
                        "${automateNumber}",
                        "${req.body.TANGGALTO}",
                        "",
                        "${req.body.USER}",
                        "",
                        "${req.body.OUTLETPENGIRIM}",
                        "${req.body.OUTLETTUJUAN}",
                        "OPEN",
                        "${req.body.ADDNOTE}"
                    )
                    `,(error1,result1,field1)=> {
                        if (error1){
                            console.log("2");
                            res.status(400).send({
                                error1
                            });
                        }
                        else{
                            let kodeTO = result1.insertId
                            let ADDDATA = req.body.ADDDATA
                            let DataADDDATAlength = ADDDATA.length
                            connection.query(`
                            SELECT
                            *
                            FROM master_inventory
                            WHERE
                                qty > 0
                            ORDER BY kode_inventory ASC
                            `,(error4,result4,field4)=> {
                                if (error4){
                                    console.log("3");
                                    res.status(400).send({
                                        error4
                                    });
                                }
                                else{
                                    let dataresult4 = result4;
                                    let panjangArray2=dataresult4.length
                                    let masterInventory=[]
                                    for(ix1=0;ix1<panjangArray2;ix1++){
                                        let dataTopush2 = {
                                            kode_inventory:`${dataresult4[ix1].kode_inventory}`,
                                            kode_barang:`${dataresult4[ix1].kode_barang}`,
                                            tanggal_masuk:`${dataresult4[ix1].tanggal_masuk}`,
                                            ref_masuk:`${dataresult4[ix1].ref_masuk}`,
                                            type_masuk:`${dataresult4[ix1].type_masuk}`,
                                            harga:`${dataresult4[ix1].harga}`,
                                            qty:`${dataresult4[ix1].qty}`
                                        }
                                        masterInventory.push(dataTopush2)
                                    }
                                    let newMasterInventory = []
                                    for (i2=0;i2<DataADDDATAlength;i2++) {
                                        let dataToshow =  masterInventory.filter(function(data) {
                                            return data.kode_barang == ADDDATA[i2].kode_barang;
                                        });
                                        dataToshow.sort(function(a, b){
                                            return a.kode_inventory-b.kode_inventory
                                        })
                                        let qty_to_cut = ADDDATA[i2].qty
                                        kurangi_qty_to_cut = (qty) =>{
                                            hasil_pengurangan = parseInt(qty_to_cut) - parseInt(qty)
                                            qty_to_cut = hasil_pengurangan
                                        }
                                        for(i3=0;i3<dataToshow.length;i3++){
                                            let new_qty = parseInt(dataToshow[i3].qty) > parseInt(qty_to_cut) ? parseInt(dataToshow[i3].qty) - parseInt(qty_to_cut) : 0
                                            let prm_qty_void = parseInt(dataToshow[i3].qty) > parseInt(qty_to_cut) ? parseInt(qty_to_cut) : parseInt(dataToshow[i3].qty)
                                            Object.assign(dataToshow[i3], {qty_void:prm_qty_void})
                                            Object.assign(dataToshow[i3], {kodeTO:kodeTO})
                                            new_qty > 0 ?kurangi_qty_to_cut(qty_to_cut):kurangi_qty_to_cut(dataToshow[i3].qty)
                                            dataToshow[i3].qty = new_qty
                                        }
                                        for(ix2=0;ix2<dataToshow.length;ix2++){
                                            let dataTopush3 = {
                                                kode_inventory:`${dataToshow[ix2].kode_inventory}`,
                                                kode_barang:`${dataToshow[ix2].kode_barang}`,
                                                tanggal_masuk:`${dataToshow[ix2].tanggal_masuk}`,
                                                ref_masuk:`${dataToshow[ix2].ref_masuk}`,
                                                type_masuk:`${dataToshow[ix2].type_masuk}`,
                                                harga:`${dataToshow[ix2].harga}`,
                                                qty:`${dataToshow[ix2].qty}`,
                                                qty_void:`${dataToshow[ix2].qty_void}`,
                                                kodeTO:`${dataToshow[ix2].kodeTO}`
                                            }
                                            newMasterInventory.push(dataTopush3)
                                        }
                                        dataToshow = []
                                    }
                                    let queries = '';
                                    for (i4=0;i4<newMasterInventory.length;i4++) {
                                        queries = queries+`UPDATE master_inventory SET qty = "${newMasterInventory[i4].qty}" WHERE kode_inventory = "${parseInt(newMasterInventory[i4].kode_inventory)}";`
                                    }
                                    connection.query(queries,(error5,result5,field5)=> {
                                        if (error5){
                                            console.log("4");
                                            res.status(400).send({
                                                error5
                                            });
                                        }
                                        else{
                                            var sqlBarangPakai = "INSERT INTO between_transfer_d (kode_between_transfer_d,kode_inventory_outlet,kode_barang,qty,cost,total_cost,kode_between_transfer) VALUES ?";
                                            var dataArrayBarangPakai = [];
                                            for (i1=0;i1<newMasterInventory.length;i1++) {
                                                let dataToPush1 = [
                                                    ``,
                                                    `${newMasterInventory[i1].kode_inventory}`,
                                                    `${newMasterInventory[i1].kode_barang}`,
                                                    `${newMasterInventory[i1].qty_void}`,
                                                    `${newMasterInventory[i1].harga}`,
                                                    `${parseInt(newMasterInventory[i1].qty_void)*parseInt(newMasterInventory[i1].harga)}`,
                                                    `${kodeTO}`
                                                ]
                                                parseInt(newMasterInventory[i1].qty_void) > 0 && dataArrayBarangPakai.push(dataToPush1)
                                            }
                                            connection.query(sqlBarangPakai, [dataArrayBarangPakai],(error3,result3,field3)=> {
                                                if (error3){
                                                    console.log("5");
                                                    res.status(400).send({
                                                        error3
                                                    });
                                                }
                                                else{
                                                    res.status(200).send({
                                                        status:"01",
                                                        kodeTO:`${kodeTO}`
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        },
        getFormTO:(req,res) =>{
            connection.query(`
            SELECT
            x.kode_barang,
            x.nama_barang,
            x.unit_barang,
            x.satuan_barang,
            x.conversi_satuan,
            x.kode_vendor,
            (SELECT nama_vendor FROM master_vendor where kode_vendor = x.kode_vendor) as vendor_name,
            (SELECT SUM(qty) FROM master_inventory_outlet where kode_barang = x.kode_barang AND id_outlet = "${req.body.PRMOUTLET}") as qty_in_stok
            FROM master_barang as x
            WHERE x.type_barang = "FINISHED GOODS"`,(error1,result1,field1)=> {
                if (error1){
                    res.status(400).send({
                        error1
                    });
                }
                else{
                    let panjangArray2=result1.length
                    let dataMasterBarang=[]
                    for(i1=0;i1<panjangArray2;i1++){
                        let dataTopush2 = {value:`${result1[i1].kode_barang}`,label:`${result1[i1].nama_barang}`,satuan:`${result1[i1].satuan_barang}`,unit:`${result1[i1].unit_barang}`,konversi:`${result1[i1].conversi_satuan}`,qty_in_stok:`${result1[i1].qty_in_stok==null?0:result1[i1].qty_in_stok}`}
                        dataMasterBarang.push(dataTopush2)
                    }
                    connection.query(`SELECT * FROM outlet WHERE id_outlet = "OUT0000001"`,(error2,result2,field2)=> {
                        if (error2){
                            res.status(400).send({
                                error2
                            });
                        }
                        else{
                            let panjangArray3=result2.length
                            let dataOutlet=[]
                            for(i2=0;i2<panjangArray3;i2++){
                                let dataTopush3 = {value:`${result2[i2].id_outlet}`,label:`${result2[i2].nama_outlet}`}
                                dataOutlet.push(dataTopush3)
                            }
                            connection.query(`SELECT * FROM outlet WHERE id_outlet = "${req.body.PRMOUTLET}"`,(error3,result3,field3)=> {
                                if (error3){
                                    res.status(400).send({
                                        error3
                                    });
                                }
                                else{
                                    res.status(200).send({
                                        nama_outlet:result3[0].nama_outlet,
                                        dataMasterBarang,
                                        dataOutlet
                                    });
                                }
                            });
                        }
                    });
                }
            });
        },
        addFormTO:(req,res) =>{
            let firstPrm = moment().tz("Asia/Jakarta").startOf('month').format('YYYY-MM-DD HH:mm:ss')
            let lastPrm = moment().tz("Asia/Jakarta").endOf('month').format('YYYY-MM-DD HH:mm:ss')
            let year = moment().tz("Asia/Jakarta").format("YYYY")
            let month = moment().tz("Asia/Jakarta").format("MM")
            connection.query(`
            SELECT COUNT(kode_between_transfer) AS total
            FROM between_transfer
            WHERE tanggal_kirim_between_transfer
            BETWEEN "${firstPrm}"
            AND "${lastPrm}"
            `,(errorx,resultx,fieldx)=> {
                if (errorx){
                    console.log("1");
                    res.status(400).send({
                        errorx
                    });
                }
                else{
                    let totalData = parseInt(resultx[0].total)+1
                    let totalDatastring = totalData.toString()
                    let runData = totalDatastring.padStart(7, '0')
                    let automateNumber = "TOUT"+"/"+year+"/"+month+"/"+runData
                    connection.query(`
                    INSERT INTO between_transfer 
                    values
                    (
                        "",
                        "${automateNumber}",
                        "${req.body.TANGGALTO}",
                        "",
                        "${req.body.USER}",
                        "",
                        "${req.body.OUTLETPENGIRIM}",
                        "${req.body.OUTLETTUJUAN}",
                        "OPEN",
                        "${req.body.ADDNOTE}"
                    )
                    `,(error1,result1,field1)=> {
                        if (error1){
                            console.log("2");
                            res.status(400).send({
                                error1
                            });
                        }
                        else{
                            let kodeTO = result1.insertId
                            let ADDDATA = req.body.ADDDATA
                            let DataADDDATAlength = ADDDATA.length
                            connection.query(`
                            SELECT
                            *
                            FROM master_inventory_outlet
                            WHERE
                                qty > 0
                                AND
                                id_outlet = "${req.body.OUTLETPENGIRIM}"
                            ORDER BY kode_inventory_outlet ASC
                            `,(error4,result4,field4)=> {
                                if (error4){
                                    console.log("3");
                                    res.status(400).send({
                                        error4
                                    });
                                }
                                else{
                                    let dataresult4 = result4;
                                    let panjangArray2=dataresult4.length
                                    let masterInventory=[]
                                    for(ix1=0;ix1<panjangArray2;ix1++){
                                        let dataTopush2 = {
                                            kode_inventory_outlet:`${dataresult4[ix1].kode_inventory_outlet}`,
                                            kode_barang:`${dataresult4[ix1].kode_barang}`,
                                            tanggal_masuk:`${dataresult4[ix1].tanggal_masuk}`,
                                            ref_masuk:`${dataresult4[ix1].ref_masuk}`,
                                            type_masuk:`${dataresult4[ix1].type_masuk}`,
                                            harga:`${dataresult4[ix1].harga}`,
                                            qty:`${dataresult4[ix1].qty}`
                                        }
                                        masterInventory.push(dataTopush2)
                                    }
                                    let newMasterInventory = []
                                    for (i2=0;i2<DataADDDATAlength;i2++) {
                                        let dataToshow =  masterInventory.filter(function(data) {
                                            return data.kode_barang == ADDDATA[i2].kode_barang;
                                        });
                                        dataToshow.sort(function(a, b){
                                            return a.kode_inventory_outlet-b.kode_inventory_outlet
                                        })
                                        let qty_to_cut = ADDDATA[i2].qty
                                        kurangi_qty_to_cut = (qty) =>{
                                            hasil_pengurangan = parseInt(qty_to_cut) - parseInt(qty)
                                            qty_to_cut = hasil_pengurangan
                                        }
                                        for(i3=0;i3<dataToshow.length;i3++){
                                            let new_qty = parseInt(dataToshow[i3].qty) > parseInt(qty_to_cut) ? parseInt(dataToshow[i3].qty) - parseInt(qty_to_cut) : 0
                                            let prm_qty_void = parseInt(dataToshow[i3].qty) > parseInt(qty_to_cut) ? parseInt(qty_to_cut) : parseInt(dataToshow[i3].qty)
                                            Object.assign(dataToshow[i3], {qty_void:prm_qty_void})
                                            Object.assign(dataToshow[i3], {kodeTO:kodeTO})
                                            new_qty > 0 ?kurangi_qty_to_cut(qty_to_cut):kurangi_qty_to_cut(dataToshow[i3].qty)
                                            dataToshow[i3].qty = new_qty
                                        }
                                        for(ix2=0;ix2<dataToshow.length;ix2++){
                                            let dataTopush3 = {
                                                kode_inventory_outlet:`${dataToshow[ix2].kode_inventory_outlet}`,
                                                kode_barang:`${dataToshow[ix2].kode_barang}`,
                                                tanggal_masuk:`${dataToshow[ix2].tanggal_masuk}`,
                                                ref_masuk:`${dataToshow[ix2].ref_masuk}`,
                                                type_masuk:`${dataToshow[ix2].type_masuk}`,
                                                harga:`${dataToshow[ix2].harga}`,
                                                qty:`${dataToshow[ix2].qty}`,
                                                qty_void:`${dataToshow[ix2].qty_void}`,
                                                kodeTO:`${dataToshow[ix2].kodeTO}`
                                            }
                                            newMasterInventory.push(dataTopush3)
                                        }
                                        dataToshow = []
                                    }
                                    let queries = '';
                                    for (i4=0;i4<newMasterInventory.length;i4++) {
                                        queries = queries+`UPDATE master_inventory_outlet SET qty = "${newMasterInventory[i4].qty}" WHERE kode_inventory_outlet = "${parseInt(newMasterInventory[i4].kode_inventory_outlet)}";`
                                    }
                                    connection.query(queries,(error5,result5,field5)=> {
                                        if (error5){
                                            console.log("4");
                                            res.status(400).send({
                                                error5
                                            });
                                        }
                                        else{
                                            var sqlBarangPakai = "INSERT INTO between_transfer_d (kode_between_transfer_d,kode_inventory_outlet,kode_barang,qty,cost,total_cost,kode_between_transfer) VALUES ?";
                                            var dataArrayBarangPakai = [];
                                            for (i1=0;i1<newMasterInventory.length;i1++) {
                                                let dataToPush1 = [
                                                    ``,
                                                    `${newMasterInventory[i1].kode_inventory_outlet}`,
                                                    `${newMasterInventory[i1].kode_barang}`,
                                                    `${newMasterInventory[i1].qty_void}`,
                                                    `${newMasterInventory[i1].harga}`,
                                                    `${parseInt(newMasterInventory[i1].qty_void)*parseInt(newMasterInventory[i1].harga)}`,
                                                    `${kodeTO}`
                                                ]
                                                parseInt(newMasterInventory[i1].qty_void) > 0 && dataArrayBarangPakai.push(dataToPush1)
                                            }
                                            connection.query(sqlBarangPakai, [dataArrayBarangPakai],(error3,result3,field3)=> {
                                                if (error3){
                                                    console.log("5");
                                                    res.status(400).send({
                                                        error3
                                                    });
                                                }
                                                else{
                                                    res.status(200).send({
                                                        status:"01",
                                                        kodeTO:`${kodeTO}`
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        },
        getTransferoutData:(req,res) =>{
            connection.query(`
            SELECT
            x.kode_between_transfer,
            x.nomor_between_transfer,
            x.tanggal_kirim_between_transfer,
            x.tanggal_terima_between_transfer,
            x.outlet_send,
            (SELECT nama_outlet FROM outlet where id_outlet = x.outlet_send) as nama_outlet_pengirim,
            x.outlet_receive,
            (SELECT nama_outlet FROM outlet where id_outlet = x.outlet_receive) as nama_outlet_penerima,
            x.between_transfer_state,
            x.note_transfer
            FROM between_transfer as x
            WHERE outlet_send = "${req.body.OUTLET}" ORDER BY x.tanggal_kirim_between_transfer DESC `,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let dataTransferout=[]
                    for(i=0;i<panjangArray1;i++){
                        let dataTopush1 = {
                            kode_between_transfer:`${result[i].kode_between_transfer}`,
                            nomor_between_transfer:`${result[i].nomor_between_transfer}`,
                            tanggal_kirim_between_transfer:`${result[i].tanggal_kirim_between_transfer}`,
                            tanggal_terima_between_transfer:`${result[i].tanggal_terima_between_transfer}`,
                            outlet_receive:`${result[i].outlet_receive}`,
                            nama_outlet_pengirim:`${result[i].nama_outlet_pengirim}`,
                            nama_outlet_penerima:`${result[i].nama_outlet_penerima}`,
                            between_transfer_state:`${result[i].between_transfer_state}`,
                            note_transfer:`${result[i].note_transfer}`
                        }
                        dataTransferout.push(dataTopush1)
                    }
                    res.status(200).send({
                        dataTransferout
                    });
                }
            });
        },
        getDetailTransferoutData:(req,res) =>{
            connection.query(`
            SELECT 
            x.kode_between_transfer_d,
            x.kode_barang,
            x.qty,
            (
                SELECT
                nama_barang
                FROM master_barang where kode_barang = x.kode_barang
            ) as nama_barang,
            (
                SELECT 
                satuan_barang 
                FROM 
                master_barang 
                where 
                kode_barang = x.kode_barang
            ) as satuan_barang,
            x.kode_between_transfer 
            FROM 
            between_transfer_d as x 
            WHERE kode_between_transfer = "${req.body.kodeTO}"`,(error,result,field)=> {
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
        getTransferoutPrint:(req,res) =>{
            connection.query(`
            SELECT
            x.kode_between_transfer,
            x.nomor_between_transfer,
            x.tanggal_kirim_between_transfer,
            x.outlet_send,
            (SELECT nama_outlet FROM outlet where id_outlet = x.outlet_send) as nama_outlet_pengirim,
            x.outlet_receive,
            (SELECT nama_outlet FROM outlet where id_outlet = x.outlet_receive) as nama_outlet_penerima,
            x.between_transfer_state,
            x.note_transfer
            FROM between_transfer as x
            WHERE kode_between_transfer = "${req.body.ID}"`,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let dataTransferout=[]
                    for(i=0;i<panjangArray1;i++){
                        let dataTopush1 = {
                            kode_between_transfer:`${result[i].kode_between_transfer}`,
                            nomor_between_transfer:`${result[i].nomor_between_transfer}`,
                            tanggal_kirim_between_transfer:`${result[i].tanggal_kirim_between_transfer}`,
                            tanggal_kirim_between_transfer_to_show:`${moment(result[i].tanggal_kirim_between_transfer).format("DD-MMMM-YYYY")}`,
                            outlet_receive:`${result[i].outlet_receive}`,
                            nama_outlet_pengirim:`${result[i].nama_outlet_pengirim}`,
                            nama_outlet_penerima:`${result[i].nama_outlet_penerima}`,
                            between_transfer_state:`${result[i].between_transfer_state}`,
                            note_transfer:`${result[i].note_transfer}`
                        }
                        dataTransferout.push(dataTopush1)
                    }connection.query(`
                    SELECT 
                    x.kode_between_transfer_d,
                    x.kode_barang,
                    x.qty,
                    (
                        SELECT
                        nama_barang
                        FROM master_barang where kode_barang = x.kode_barang
                    ) as nama_barang,
                    (
                        SELECT 
                        satuan_barang 
                        FROM 
                        master_barang 
                        where 
                        kode_barang = x.kode_barang
                    ) as satuan_barang,
                    x.kode_between_transfer
                    FROM 
                    between_transfer_d as x 
                    WHERE kode_between_transfer = "${req.body.ID}"`,(error1,result1,field1)=> {
                        if (error1){
                            res.status(400).send({
                                error1
                            });
                        }
                        else{
                            let dataTransferout_D=[]
                            for(i=0;i<result1.length;i++){
                                let dataTopush2 = {
                                    kode_between_transfer_d:`${result1[i].kode_between_transfer_d}`,
                                    kode_barang:`${result1[i].kode_barang}`,
                                    qty:`${result1[i].qty}`,
                                    nama_barang:`${result1[i].nama_barang}`,
                                    satuan_barang:`${result1[i].satuan_barang}`,
                                    kode_between_transfer:`${result1[i].kode_between_transfer}`
                                }
                                dataTransferout_D.push(dataTopush2)
                            }
                            res.status(200).send({
                                dataTransferout,
                                dataTransferout_D
                            });
                        }
                    });
                }
            });
        },
    // controller transferout--
    // controller transferin
        getTransferinData:(req,res) =>{
            connection.query(`
            SELECT
            x.kode_between_transfer,
            x.nomor_between_transfer,
            x.tanggal_kirim_between_transfer,
            x.tanggal_terima_between_transfer,
            x.outlet_send,
            (SELECT nama_outlet FROM outlet where id_outlet = x.outlet_send) as nama_outlet_pengirim,
            x.outlet_receive,
            (SELECT nama_outlet FROM outlet where id_outlet = x.outlet_receive) as nama_outlet_penerima,
            x.between_transfer_state,
            x.note_transfer
            FROM between_transfer as x
            WHERE outlet_receive = "${req.body.OUTLET}"
            ORDER BY x.tanggal_kirim_between_transfer DESC `,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let dataTransferin=[]
                    for(i=0;i<panjangArray1;i++){
                        let dataTopush1 = {
                            kode_between_transfer:`${result[i].kode_between_transfer}`,
                            nomor_between_transfer:`${result[i].nomor_between_transfer}`,
                            tanggal_kirim_between_transfer:`${result[i].tanggal_kirim_between_transfer}`,
                            tanggal_terima_between_transfer:`${result[i].tanggal_terima_between_transfer}`,
                            outlet_receive:`${result[i].outlet_receive}`,
                            nama_outlet_pengirim:`${result[i].nama_outlet_pengirim}`,
                            nama_outlet_penerima:`${result[i].nama_outlet_penerima}`,
                            between_transfer_state:`${result[i].between_transfer_state}`,
                            note_transfer:`${result[i].note_transfer}`
                        }
                        dataTransferin.push(dataTopush1)
                    }
                    res.status(200).send({
                        dataTransferin
                    });
                }
            });
        },
        getDetailTransferinData:(req,res) =>{
            connection.query(`
            SELECT 
            x.kode_between_transfer_d,
            x.kode_barang,
            x.qty,
            (
                SELECT
                nama_barang
                FROM master_barang where kode_barang = x.kode_barang
            ) as nama_barang,
            (
                SELECT 
                satuan_barang 
                FROM 
                master_barang 
                where 
                kode_barang = x.kode_barang
            ) as satuan_barang,
            x.kode_between_transfer 
            FROM 
            between_transfer_d as x 
            WHERE kode_between_transfer = "${req.body.kodeTO}"`,(error,result,field)=> {
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
        receiveTransferOut:(req,res) =>{
            connection.query(`
            SELECT 
            x.kode_between_transfer_d,
            x.kode_inventory_outlet,
            x.kode_barang,
            x.qty,
            x.cost,
            x.kode_between_transfer
            FROM between_transfer_d as x
            WHERE kode_between_transfer = "${req.body.ID}"`,(errorx,resultx,fieldx)=> {
                if (errorx){
                    res.status(400).send({
                        errorx
                    });
                }
                else{
                    const dateTIN = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
                    let sql = "INSERT INTO master_inventory_outlet (kode_inventory_outlet,kode_barang,tanggal_masuk,ref_masuk,type_masuk,harga,qty,id_outlet) VALUES ?";
                    let dataArray = [];
                    for (ia=0;ia<resultx.length;ia++) {
                        let dataToPush = [
                            ``,
                            `${resultx[ia].kode_barang}`,
                            `${dateTIN}`,
                            `${req.body.ID}`,
                            `TRANSFERIN`,
                            `${resultx[ia].cost}`,
                            `${resultx[ia].qty}`,
                            `${req.body.PRMOUTLET}`
                        ]
                        dataArray.push(dataToPush)
                    }
                    connection.query(sql, [dataArray],(error1,result1,field1)=> {
                        if (error1){
                            res.status(400).send({
                                error1
                            });
                        }
                        else{
                            connection.query(` UPDATE between_transfer SET between_transfer_state = "RECEIVED",tanggal_terima_between_transfer="${dateTIN}",receive_user="${req.body.USER}" WHERE kode_between_transfer = "${req.body.ID}" `,(error2,result2,field2)=> {
                                if (error2){
                                    res.status(400).send({
                                        error2
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
                }
            });
        },
        receiveTransferOutCK:(req,res) =>{
            connection.query(`
            SELECT 
            x.kode_between_transfer_d,
            x.kode_inventory_outlet,
            x.kode_barang,
            x.qty,
            x.cost,
            x.kode_between_transfer
            FROM between_transfer_d as x
            WHERE kode_between_transfer = "${req.body.ID}"`,(errorx,resultx,fieldx)=> {
                if (errorx){
                    console.log("1");
                    res.status(400).send({
                        errorx
                    });
                }
                else{
                    const dateTIN = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
                    let sql = "INSERT INTO master_inventory (kode_inventory,kode_barang,tanggal_masuk,ref_masuk,type_masuk,harga,qty) VALUES ?";
                    let dataArray = [];
                    for (ia=0;ia<resultx.length;ia++) {
                        let dataToPush = [
                            ``,
                            `${resultx[ia].kode_barang}`,
                            `${dateTIN}`,
                            `${req.body.ID}`,
                            `TRANSFERIN`,
                            `${resultx[ia].cost}`,
                            `${resultx[ia].qty}`
                        ]
                        dataArray.push(dataToPush)
                    }
                    connection.query(sql, [dataArray],(error1,result1,field1)=> {
                        if (error1){
                            console.log("2");
                            res.status(400).send({
                                error1
                            });
                        }
                        else{
                            connection.query(` UPDATE between_transfer SET between_transfer_state = "RECEIVED",tanggal_terima_between_transfer="${dateTIN}",receive_user="${req.body.USER}" WHERE kode_between_transfer = "${req.body.ID}" `,(error2,result2,field2)=> {
                                if (error2){
                                    console.log("3");
                                    res.status(400).send({
                                        error2
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
                }
            });
        },
    // controller transferin--
    // controller sales
        getSalesH:(req,res) =>{
            connection.query(`
            SELECT 
            x.id_sales_h,
            x.nomor_sales,
            x.tanggal_sales,
            x.create_user,
            x.id_outlet
            FROM sales_h as x
            WHERE x.id_outlet = "${req.body.OUTLET}" ORDER BY x.tanggal_sales DESC `,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let dataSalesH=[]
                    for(i=0;i<panjangArray1;i++){
                        let dataTopush1 = {
                            id_sales_h:`${result[i].id_sales_h}`,
                            nomor_sales:`${result[i].nomor_sales}`,
                            tanggal_sales:`${result[i].tanggal_sales}`,
                            create_user:`${result[i].create_user}`,
                            id_outlet:`${result[i].id_outlet}`
                        }
                        dataSalesH.push(dataTopush1)
                    }
                    res.status(200).send({
                        dataSalesH
                    });
                }
            });
        },
        getSalesD:(req,res) =>{
            connection.query(`
            SELECT 
            x.id_sales_plu_d,
            x.id_plu,
            x.nomor_plu,
            x.nama_plu,
            x.qty,
            x.id_sales_h 
            FROM 
            sales_plu_d as x 
            WHERE id_sales_h = "${req.body.IDSALES}"`,(error,result,field)=> {
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
        getSalesForm:(req,res) =>{
            connection.query(`
                SELECT
                x.id_plu,
                x.nomor_plu,
                x.nama_plu,
                x.master_plu_state
                FROM master_plu_h as x
                WHERE x.master_plu_state = "ACTIVE"`,(error1,result1,field1)=> {
                if (error1){
                    res.status(400).send({
                        error1
                    });
                }
                else{
                    let dataMasterPLU=[]
                    let prmPLUDx=[]
                    for(i=0;i<result1.length;i++){
                        let dataTopush1 = {
                            value:`${result1[i].id_plu}`,
                            label:`${result1[i].nama_plu}(${result1[i].nomor_plu})`,
                            id_plu:`${result1[i].id_plu}`,
                            nomor_plu:`${result1[i].nomor_plu}`,
                            nama_plu:`${result1[i].nama_plu}`,
                            master_plu_state:`${result1[i].master_plu_state}`
                        }
                        dataMasterPLU.push(dataTopush1)
                        prmPLUDx.push(result1[i].id_plu)
                    }
                    let prmPLUD = prmPLUDx.toString()
                    connection.query(`
                        SELECT
                        x.id_plu_d,
                        x.kode_barang,
                        (SELECT nama_barang from master_barang WHERE kode_barang = x.kode_barang) as nama_barang,
                        x.qty,
                        x.id_plu
                        FROM master_plu_d as x
                        WHERE x.id_plu IN (${prmPLUD})`,(error2,result2,field2)=> {
                        if (error2){
                            res.status(400).send({
                                error2
                            });
                        }
                        else{
                            let dataPLUD=[]
                            for(i2=0;i2<result2.length;i2++){
                                let dataTopush2 = {
                                    id_plu_d:`${result2[i2].id_plu_d}`,
                                    kode_barang:`${result2[i2].kode_barang}`,
                                    nama_barang:`${result2[i2].nama_barang}`,
                                    qty:`${result2[i2].qty}`,
                                    id_plu:`${result2[i2].id_plu}`
                                }
                                dataPLUD.push(dataTopush2)
                            }
                            connection.query(`
                                SELECT
                                x.kode_barang,
                                (
                                    SELECT 
                                    SUM(qty) as totalQty 
                                    from master_inventory_outlet 
                                    WHERE 
                                    kode_barang = x.kode_barang
                                    AND
                                    id_outlet = "${req.body.OUTLET}"
                                ) as totalQty,
                                x.id_outlet
                                FROM master_inventory_outlet as x
                                WHERE x.id_outlet = "${req.body.OUTLET}"
                                GROUP BY x.kode_barang`,(error3,result3,field3)=> {
                                if (error3){
                                    res.status(400).send({
                                        error3
                                    });
                                }
                                else{
                                    let dataInventory=[]
                                    for(i3=0;i3<result3.length;i3++){
                                        let dataTopush3 = {
                                            kode_barang:`${result3[i3].kode_barang}`,
                                            totalQty:`${result3[i3].totalQty}`,
                                            id_outlet:`${result3[i3].id_outlet}`
                                        }
                                        dataInventory.push(dataTopush3)
                                    }
                                    res.status(200).send({
                                        dataMasterPLU,
                                        dataPLUD,
                                        dataInventory
                                    });
                                }
                            });
                        }
                    });
                }
            });
        },
        addSales:(req,res) =>{
            let firstPrm = moment().tz("Asia/Jakarta").startOf('month').format('YYYY-MM-DD')
            let lastPrm = moment().tz("Asia/Jakarta").endOf('month').format('YYYY-MM-DD')
            let year = moment().tz("Asia/Jakarta").format("YYYY")
            let month = moment().tz("Asia/Jakarta").format("MM")
            connection.query(`
            SELECT COUNT(id_sales_h) AS total
            FROM sales_h
            WHERE tanggal_sales
            BETWEEN "${firstPrm}"
            AND "${lastPrm}"
            `,(errorx,resultx,fieldx)=> {
                if (errorx){
                    console.log("1");
                    res.status(400).send({
                        errorx
                    });
                }
                else{
                    let totalData = parseInt(resultx[0].total)+1
                    let totalDatastring = totalData.toString()
                    let runData = totalDatastring.padStart(7, '0')
                    let automateNumber = "SALES"+"/"+year+"/"+month+"/"+runData
                    connection.query(`
                    INSERT INTO sales_h 
                    values
                    (
                        "",
                        "${automateNumber}",
                        "${req.body.TANGGALSALES}",
                        "${req.body.USER}",
                        "${req.body.OUTLET}"
                    )
                    `,(error1,result1,field1)=> {
                        if (error1){
                            console.log("2");
                            res.status(400).send({
                                error1
                            });
                        }
                        else{
                            let idSalesH = result1.insertId
                            let ADDDATA = req.body.ADDDATASALES
                            let DataADDDATAlength = ADDDATA.length
                            connection.query(`
                            SELECT
                            *
                            FROM master_inventory_outlet
                            WHERE
                                qty > 0
                                AND
                                id_outlet = "${req.body.OUTLET}"
                            ORDER BY kode_inventory_outlet ASC
                            `,(error4,result4,field4)=> {
                                if (error4){
                                    console.log("3");
                                    res.status(400).send({
                                        error4
                                    });
                                }
                                else{
                                    let dataresult4 = result4;
                                    let panjangArray2=dataresult4.length
                                    let masterInventory=[]
                                    for(ix1=0;ix1<panjangArray2;ix1++){
                                        let dataTopush2 = {
                                            kode_inventory_outlet:`${dataresult4[ix1].kode_inventory_outlet}`,
                                            kode_barang:`${dataresult4[ix1].kode_barang}`,
                                            tanggal_masuk:`${dataresult4[ix1].tanggal_masuk}`,
                                            ref_masuk:`${dataresult4[ix1].ref_masuk}`,
                                            type_masuk:`${dataresult4[ix1].type_masuk}`,
                                            harga:`${dataresult4[ix1].harga}`,
                                            qty:`${dataresult4[ix1].qty}`
                                        }
                                        masterInventory.push(dataTopush2)
                                    }
                                    let newMasterInventory = []
                                    for (i2=0;i2<DataADDDATAlength;i2++) {
                                        let dataToshow =  masterInventory.filter(function(data) {
                                            return data.kode_barang == ADDDATA[i2].kode_barang;
                                        });
                                        dataToshow.sort(function(a, b){
                                            return a.kode_inventory_outlet-b.kode_inventory_outlet
                                        })
                                        let qty_to_cut = ADDDATA[i2].qty
                                        kurangi_qty_to_cut = (qty) =>{
                                            hasil_pengurangan = parseInt(qty_to_cut) - parseInt(qty)
                                            qty_to_cut = hasil_pengurangan
                                        }
                                        for(i3=0;i3<dataToshow.length;i3++){
                                            let new_qty = parseInt(dataToshow[i3].qty) > parseInt(qty_to_cut) ? parseInt(dataToshow[i3].qty) - parseInt(qty_to_cut) : 0
                                            let prm_qty_void = parseInt(dataToshow[i3].qty) > parseInt(qty_to_cut) ? parseInt(qty_to_cut) : parseInt(dataToshow[i3].qty)
                                            Object.assign(dataToshow[i3], {qty_void:prm_qty_void})
                                            Object.assign(dataToshow[i3], {idSalesH:idSalesH})
                                            new_qty > 0 ?kurangi_qty_to_cut(qty_to_cut):kurangi_qty_to_cut(dataToshow[i3].qty)
                                            dataToshow[i3].qty = new_qty
                                        }
                                        for(ix2=0;ix2<dataToshow.length;ix2++){
                                            let dataTopush3 = {
                                                kode_inventory_outlet:`${dataToshow[ix2].kode_inventory_outlet}`,
                                                kode_barang:`${dataToshow[ix2].kode_barang}`,
                                                tanggal_masuk:`${dataToshow[ix2].tanggal_masuk}`,
                                                ref_masuk:`${dataToshow[ix2].ref_masuk}`,
                                                type_masuk:`${dataToshow[ix2].type_masuk}`,
                                                harga:`${dataToshow[ix2].harga}`,
                                                qty:`${dataToshow[ix2].qty}`,
                                                qty_void:`${dataToshow[ix2].qty_void}`,
                                                idSalesH:`${dataToshow[ix2].idSalesH}`
                                            }
                                            newMasterInventory.push(dataTopush3)
                                        }
                                        dataToshow = []
                                    }
                                    let queries = '';
                                    for (i4=0;i4<newMasterInventory.length;i4++) {
                                        queries = queries+`UPDATE master_inventory_outlet SET qty = "${newMasterInventory[i4].qty}" WHERE kode_inventory_outlet = "${parseInt(newMasterInventory[i4].kode_inventory_outlet)}";`
                                    }
                                    connection.query(queries,(error5,result5,field5)=> {
                                        if (error5){
                                            console.log("4");
                                            res.status(400).send({
                                                error5
                                            });
                                        }
                                        else{
                                            var sqlSalesD = "INSERT INTO sales_d (id_sales_d,kode_inventory,kode_barang,qty,cost,id_sales_h) VALUES ?";
                                            var dataArraySalesD = [];
                                            for (i1=0;i1<newMasterInventory.length;i1++) {
                                                let dataToPush1 = [
                                                    ``,
                                                    `${newMasterInventory[i1].kode_inventory_outlet}`,
                                                    `${newMasterInventory[i1].kode_barang}`,
                                                    `${newMasterInventory[i1].qty_void}`,
                                                    `${newMasterInventory[i1].harga}`,
                                                    `${idSalesH}`
                                                ]
                                                parseInt(newMasterInventory[i1].qty_void) > 0 && dataArraySalesD.push(dataToPush1)
                                            }
                                            connection.query(sqlSalesD, [dataArraySalesD],(error3,result3,field3)=> {
                                                if (error3){
                                                    console.log("5");
                                                    res.status(400).send({
                                                        error3
                                                    });
                                                }
                                                else{
                                                    var sqlPLUD = "INSERT INTO sales_plu_d (id_sales_plu_d,id_plu,nomor_plu,nama_plu,qty,id_sales_h) VALUES ?";
                                                    var dataArrayPLUD = [];
                                                    for (iPLUD=0;iPLUD<req.body.ADDDATAPLU.length;iPLUD++) {
                                                        let dataToPushPLUD = [
                                                            ``,
                                                            `${req.body.ADDDATAPLU[iPLUD].id_plu}`,
                                                            `${req.body.ADDDATAPLU[iPLUD].nomor_plu}`,
                                                            `${req.body.ADDDATAPLU[iPLUD].nama_plu}`,
                                                            `${req.body.ADDDATAPLU[iPLUD].qty}`,
                                                            `${idSalesH}`
                                                        ]
                                                        dataArrayPLUD.push(dataToPushPLUD)
                                                    }
                                                    connection.query(sqlPLUD, [dataArrayPLUD],(errorPLUD,resultPLUD,fieldPLUD)=> {
                                                        if (errorPLUD){
                                                            console.log("5");
                                                            res.status(400).send({
                                                                errorPLUD
                                                            });
                                                        }
                                                        else{
                                                            res.status(200).send({
                                                                status:"01",
                                                                idSalesH:`${idSalesH}`
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        },
    // controller sales--
    // controller master plu
        getMasterPLU:(req,res) =>{
            connection.query(`
            SELECT 
            x.id_plu,
            x.nomor_plu,
            x.tanggal_buat,
            x.nama_plu,
            x.master_plu_state
            FROM master_plu_h as x
            WHERE x.master_plu_state = "ACTIVE" ORDER BY x.tanggal_buat DESC `,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let dataPLUH=[]
                    for(i=0;i<result.length;i++){
                        let dataTopush1 = {
                            id_plu:`${result[i].id_plu}`,
                            nomor_plu:`${result[i].nomor_plu}`,
                            tanggal_buat:`${result[i].tanggal_buat}`,
                            nama_plu:`${result[i].nama_plu}`,
                            master_plu_state:`${result[i].master_plu_state}`
                        }
                        dataPLUH.push(dataTopush1)
                    }
                    res.status(200).send({
                        dataPLUH
                    });
                }
            });
        },
        addMasterPLU: (req,res) =>{
            let TANGGALBUAT = moment().tz("Asia/Jakarta").format('YYYY-MM-DD HH:mm:ss')
            let firstPrm = moment().tz("Asia/Jakarta").startOf('month').format('YYYY-MM-DD HH:mm:ss')
            let lastPrm = moment().tz("Asia/Jakarta").endOf('month').format('YYYY-MM-DD HH:mm:ss')
            let year = moment().tz("Asia/Jakarta").format("YYYY")
            connection.query(`
            SELECT COUNT(id_plu) AS total
            FROM master_plu_h
            WHERE tanggal_buat
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
                    let automateNumber = "PLU"+"/"+year+"/"+runData
                    connection.query(`INSERT INTO master_plu_h values("","${TANGGALBUAT}","${automateNumber}","${req.body.NAMAPLU}","ACTIVE")`,(error,result,field)=> {
                        if (error){
                            res.status(400).send({
                                error
                            });
                        }
                        else{
                            let id_plu = result.insertId
                            let addData = req.body.DETAILPLU;
                            var sql = "INSERT INTO master_plu_d (id_plu_d,kode_barang,qty,id_plu) VALUES ?";
                            var dataArray = [];
                            for (ia=0;ia<addData.length;ia++) {
                                let dataToPush = [
                                    ``,
                                    `${addData[ia].kode_barang}`,
                                    `${addData[ia].qty}`,
                                    `${id_plu}`]
                                dataArray.push(dataToPush)
                            }
                            connection.query(sql, [dataArray],(error1,result1,field1)=> {
                                if (error1){
                                    res.status(400).send({
                                        error1
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
                }
            });
        },
        getDetailMasterPLU:(req,res) =>{
            connection.query(`
            SELECT
            x.id_plu_d,
            x.kode_barang,
            x.qty,
            (SELECT nama_barang FROM master_barang where kode_barang = x.kode_barang) as nama_barang,
            (SELECT satuan_barang FROM master_barang where kode_barang = x.kode_barang) as satuan_barang,
            x.id_plu
            FROM
            master_plu_d as x
            WHERE id_plu = "${req.body.IDPLU}"`,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let dataDetailPLU=[]
                    for(i=0;i<panjangArray1;i++){
                        let dataTopush1 = {
                            id_plu_d:`${result[i].id_plu_d}`,
                            kode_barang:`${result[i].kode_barang}`,
                            qty:`${result[i].qty}`,
                            nama_barang:`${result[i].nama_barang}`,
                            satuan_barang:`${result[i].satuan_barang}`,
                            id_plu:`${result[i].id_plu}`
                        }
                        dataDetailPLU.push(dataTopush1)
                    }
                    res.status(200).send({
                        dataDetailPLU
                    });
                }
            });
        },
        updateMasterPLU:(req,res) =>{
            connection.query(`
            UPDATE master_plu_h SET 
            master_plu_state = "NONACTIVE"
            WHERE id_plu = "${req.body.IDPLU}" `,(error,result,field)=> {
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
        },
    // controller master plu--
    // controller pembelian
        getFormAddPembelianCK:(req,res) =>{
            connection.query(`SELECT * FROM outlet WHERE id_outlet="${req.body.OUTLET}" `,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray=result.length
                    let dataOutlet=[]
                    for(i=0;i<panjangArray;i++){
                        let dataTopush = {value:`${result[i].id_outlet}`,label:`${result[i].nama_outlet}`}
                        dataOutlet.push(dataTopush)
                    }
                    connection.query(`
                    SELECT 
                    x.kode_barang,
                    x.nama_barang,
                    x.unit_barang,
                    x.satuan_barang,
                    x.kode_vendor,
                    x.conversi_satuan,
                    (SELECT nama_vendor FROM master_vendor where kode_vendor = x.kode_vendor) as vendor_name
                    FROM master_barang as x`,(error1,result1,field1)=> {
                        if (error1){
                            res.status(400).send({
                                error1
                            });
                        }
                        else{
                            let panjangArray2=result1.length
                            let dataMasterBarang=[]
                            for(i=0;i<panjangArray2;i++){
                                let dataTopush2 = {
                                    value:`${result1[i].kode_barang}`,
                                    label:`${result1[i].nama_barang}`,
                                    // label:`${result1[i].kode_barang}-${result1[i].nama_barang}-${result1[i].vendor_name}`,
                                    nama_barang:`${result1[i].nama_barang}`,
                                    unit:`${result1[i].unit_barang}`,
                                    satuan:`${result1[i].satuan_barang}`,
                                    conversi:`${result1[i].conversi_satuan}`
                                }
                                dataMasterBarang.push(dataTopush2)
                            }
                            res.status(200).send({
                                dataOutlet,
                                dataMasterBarang
                            });
                        }
                    });
                }
            });
        },
        addDataPembelianCK: (req,res) =>{
            let firstPrm = moment().tz("Asia/Jakarta").startOf('month').format('YYYY-MM-DD HH:mm:ss')
            let lastPrm = moment().tz("Asia/Jakarta").endOf('month').format('YYYY-MM-DD HH:mm:ss')
            let year = moment().tz("Asia/Jakarta").format("YYYY")
            let month = moment().tz("Asia/Jakarta").format("MM")
            connection.query(`
            SELECT COUNT(kode_pembelian_h) AS total
            FROM pembelian_h
            WHERE tanggal_beli
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
                    let runData = totalDatastring.padStart(7, '0')
                    let automateNumber = "PEMBELIAN"+"/"+year+"/"+month+"/"+runData
                    connection.query(`INSERT INTO pembelian_h values("","${automateNumber}","${req.body.TANGGALBELI}","${req.body.USER}","${req.body.IDOUTLET}")`,(error,result,field)=> {
                        if (error){
                            res.status(400).send({
                                error
                            });
                        }
                        else{
                            let id_pembelian_h = result.insertId
                            let addData = req.body.ADDDATA;
                            let Datalenght = addData.length;
                            var sql = "INSERT INTO pembelian_d (kode_pembelian_d,kode_barang,qty,harga,kode_pembelian_h) VALUES ?";
                            var dataArray = [];
                            for (ia=0;ia<Datalenght;ia++) {
                                let dataToPush = [``,`${addData[ia].kode_barang}`,`${addData[ia].qty}`,`${addData[ia].harga}`,`${id_pembelian_h}`]
                                dataArray.push(dataToPush)
                            }
                            connection.query(sql, [dataArray],(error1,result1,field1)=> {
                                if (error1){
                                    res.status(400).send({
                                        error1
                                    });
                                }
                                else{
                                    var sqlINV = "INSERT INTO master_inventory (kode_inventory,kode_barang,tanggal_masuk,ref_masuk,type_masuk,harga,qty) VALUES ?";
                                    var dataArrayINV = [];
                                    for (ib=0;ib<Datalenght;ib++){
                                        let dataToPushINV = [
                                            ``,
                                            `${addData[ib].kode_barang}`,
                                            `${req.body.TANGGALBELI}`,
                                            `${id_pembelian_h}`,
                                            `PEMBELIAN`,
                                            `${parseInt(addData[ib].harga)/parseInt(addData[ib].qty)}`,
                                            `${addData[ib].qty}`
                                        ]
                                        dataArrayINV.push(dataToPushINV)
                                    }
                                    connection.query(sqlINV, [dataArrayINV],(errorINV,resultINV,fieldINV)=> {
                                        if (errorINV){
                                            res.status(400).send({
                                                errorINV
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
                        }
                    });
                }
            });
        },
        addDataPembelian: (req,res) =>{
            let firstPrm = moment().tz("Asia/Jakarta").startOf('month').format('YYYY-MM-DD HH:mm:ss')
            let lastPrm = moment().tz("Asia/Jakarta").endOf('month').format('YYYY-MM-DD HH:mm:ss')
            let year = moment().tz("Asia/Jakarta").format("YYYY")
            let month = moment().tz("Asia/Jakarta").format("MM")
            connection.query(`
            SELECT COUNT(kode_pembelian_h) AS total
            FROM pembelian_h
            WHERE tanggal_beli
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
                    let runData = totalDatastring.padStart(7, '0')
                    let automateNumber = "PEMBELIAN"+"/"+year+"/"+month+"/"+runData
                    connection.query(`INSERT INTO pembelian_h values("","${automateNumber}","${req.body.TANGGALBELI}","${req.body.USER}","${req.body.IDOUTLET}")`,(error,result,field)=> {
                        if (error){
                            res.status(400).send({
                                error
                            });
                        }
                        else{
                            let id_pembelian_h = result.insertId
                            let addData = req.body.ADDDATA;
                            let Datalenght = addData.length;
                            var sql = "INSERT INTO pembelian_d (kode_pembelian_d,kode_barang,qty,harga,kode_pembelian_h) VALUES ?";
                            var dataArray = [];
                            for (ia=0;ia<Datalenght;ia++) {
                                let dataToPush = [``,`${addData[ia].kode_barang}`,`${addData[ia].qty}`,`${addData[ia].harga}`,`${id_pembelian_h}`]
                                dataArray.push(dataToPush)
                            }
                            connection.query(sql, [dataArray],(error1,result1,field1)=> {
                                if (error1){
                                    res.status(400).send({
                                        error1
                                    });
                                }
                                else{
                                    var sqlINV = "INSERT INTO master_inventory_outlet (kode_inventory_outlet,kode_barang,tanggal_masuk,ref_masuk,type_masuk,harga,qty,id_outlet) VALUES ?";
                                    var dataArrayINV = [];
                                    for (ib=0;ib<Datalenght;ib++){
                                        let dataToPushINV = [
                                            ``,
                                            `${addData[ib].kode_barang}`,
                                            `${req.body.TANGGALBELI}`,
                                            `${id_pembelian_h}`,
                                            `PEMBELIAN`,
                                            `${parseInt(addData[ib].harga)/parseInt(addData[ib].qty)}`,
                                            `${addData[ib].qty}`,
                                            `${req.body.IDOUTLET}`
                                        ]
                                        dataArrayINV.push(dataToPushINV)
                                    }
                                    connection.query(sqlINV, [dataArrayINV],(errorINV,resultINV,fieldINV)=> {
                                        if (errorINV){
                                            res.status(400).send({
                                                errorINV
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
                        }
                    });
                }
            });
        },
        getPembelianH:(req,res) =>{
            connection.query(`
            SELECT 
            x.kode_pembelian_h,
            x.nomor_pembelian,
            x.tanggal_beli,
            x.create_user,
            x.id_outlet
            FROM pembelian_h as x
            WHERE x.id_outlet = "${req.body.OUTLET}" ORDER BY x.tanggal_beli DESC `,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let dataPembelianH=[]
                    for(i=0;i<panjangArray1;i++){
                        let dataTopush1 = {
                            kode_pembelian_h:`${result[i].kode_pembelian_h}`,
                            nomor_pembelian:`${result[i].nomor_pembelian}`,
                            tanggal_beli:`${result[i].tanggal_beli}`,
                            create_user:`${result[i].create_user}`,
                            id_outlet:`${result[i].id_outlet}`
                        }
                        dataPembelianH.push(dataTopush1)
                    }
                    res.status(200).send({
                        dataPembelianH
                    });
                }
            });
        },
        getDetailPembelian:(req,res) =>{
            connection.query(`
            SELECT 
            x.kode_pembelian_d,
            x.kode_barang,
            x.qty,
            x.harga,
            (SELECT nama_barang FROM master_barang where kode_barang = x.kode_barang) as nama_barang,
            (SELECT unit_barang FROM master_barang where kode_barang = x.kode_barang) as unit_barang,
            (SELECT satuan_barang FROM master_barang where kode_barang = x.kode_barang) as satuan_barang,
            (SELECT conversi_satuan FROM master_barang where kode_barang = x.kode_barang) as konversi_barang,
            x.kode_pembelian_h 
            FROM 
            pembelian_d as x 
            WHERE kode_pembelian_h = "${req.body.kodePembelianH}"`,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let pembelianList=[]
                    for(i=0;i<panjangArray1;i++){
                        let qtyPembelian =parseInt(result[i].qty)
                        let convertionQtyPembelian =parseInt(result[i].konversi_barang)
                        let qtyPembelianProcessA = Math.floor(qtyPembelian/convertionQtyPembelian)
                        let qtyPembelianProcessB = qtyPembelian%convertionQtyPembelian
                        let qtyPembelianToShow = qtyPembelianProcessA+"."+qtyPembelianProcessB
                        // batas
                        let dataTopush1 = {
                            kode_pembelian_d:`${result[i].kode_pembelian_d}`,
                            kode_barang:`${result[i].kode_barang}`,
                            qty_Pembelian:`${result[i].qty}`,
                            qty:`${qtyPembelianToShow}`,
                            nama_barang:`${result[i].nama_barang}`,
                            unit_barang:`${result[i].unit_barang}`,
                            satuan_barang:`${result[i].satuan_barang}`,
                            konversi_barang:`${result[i].konversi_barang}`,
                            harga:`${result[i].harga}`,
                            kode_pembelian_h:`${result[i].kode_pembelian_h}`
                        }
                        pembelianList.push(dataTopush1)
                    }
                    res.status(200).send({
                        pembelianList
                    });
                }
            });
        },
    // controller pembelian--
    // controler return
        getFromReturn:(req,res) =>{
            connection.query(`
            SELECT
            x.kode_purchase_order_h,
            x.nomor_po,
            x.tanggal_buat,
            x.tanggal_kirim,
            x.tujuan_pengiriman,
            x.tanggal_masuk_barang,
            x.kode_vendor,
            (SELECT nama_vendor FROM master_vendor WHERE kode_vendor = x.kode_vendor) as nama_vendor,
            x.jumlah_pembelian,
            x.create_user,
            x.receive_user,
            x.taxParameter
            FROM purchase_order_h as x
            WHERE (x.tanggal_masuk_barang != "") AND (x.tanggal_masuk_barang != "-") `,(error,result,field)=> {
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
                            value:`${result[i].kode_purchase_order_h}`,
                            label:`${result[i].nomor_po}-${result[i].nama_vendor}-${result[i].tanggal_masuk_barang}`
                        }
                        dataToShow.push(dataTopush)
                    }
                    res.status(200).send({
                        dataToShow
                    });
                }
            });
        },
        addFormReturnCK:(req,res) =>{
            let firstPrm = moment().tz("Asia/Jakarta").startOf('month').format('YYYY-MM-DD HH:mm:ss')
            let lastPrm = moment().tz("Asia/Jakarta").endOf('month').format('YYYY-MM-DD HH:mm:ss')
            let year = moment().tz("Asia/Jakarta").format("YYYY")
            let month = moment().tz("Asia/Jakarta").format("MM")
            connection.query(`
            SELECT COUNT(kode_return_h) AS total
            FROM return_h
            WHERE tanggal_return
            BETWEEN "${firstPrm}"
            AND "${lastPrm}"
            `,(errorx,resultx,fieldx)=> {
                if (errorx){
                    console.log("1");
                    res.status(400).send({
                        errorx
                    });
                }
                else{
                    let totalData = parseInt(resultx[0].total)+1
                    let totalDatastring = totalData.toString()
                    let runData = totalDatastring.padStart(7, '0')
                    let automateNumber = "RTRN"+"/"+year+"/"+month+"/"+runData
                    connection.query(`
                    INSERT INTO return_h 
                    values
                    (
                        "",
                        "${automateNumber}",
                        "${req.body.TANGGALRETURN}",
                        "${req.body.POCODE}",
                        "${req.body.USER}",
                        "${req.body.TANGGALRETURN}"
                    )
                    `,(error1,result1,field1)=> {
                        if (error1){
                            console.log("2");
                            res.status(400).send({
                                error1
                            });
                        }
                        else{
                            let kodeRTRN = result1.insertId
                            let ADDDATA = req.body.ADDDATA
                            let DataADDDATAlength = ADDDATA.length
                            connection.query(`
                            SELECT
                            *
                            FROM master_inventory
                            WHERE
                                qty > 0
                            ORDER BY kode_inventory ASC
                            `,(error4,result4,field4)=> {
                                if (error4){
                                    console.log("3");
                                    res.status(400).send({
                                        error4
                                    });
                                }
                                else{
                                    let dataresult4 = result4;
                                    let panjangArray2=dataresult4.length
                                    let masterInventory=[]
                                    for(ix1=0;ix1<panjangArray2;ix1++){
                                        let dataTopush2 = {
                                            kode_inventory:`${dataresult4[ix1].kode_inventory}`,
                                            kode_barang:`${dataresult4[ix1].kode_barang}`,
                                            tanggal_masuk:`${dataresult4[ix1].tanggal_masuk}`,
                                            ref_masuk:`${dataresult4[ix1].ref_masuk}`,
                                            type_masuk:`${dataresult4[ix1].type_masuk}`,
                                            harga:`${dataresult4[ix1].harga}`,
                                            qty:`${dataresult4[ix1].qty}`
                                        }
                                        masterInventory.push(dataTopush2)
                                    }
                                    let newMasterInventory = []
                                    for (i2=0;i2<DataADDDATAlength;i2++) {
                                        let dataToshow =  masterInventory.filter(function(data) {
                                            return data.kode_barang == ADDDATA[i2].kode_barang;
                                        });
                                        dataToshow.sort(function(a, b){
                                            return a.kode_inventory-b.kode_inventory
                                        })
                                        let qty_to_cut = ADDDATA[i2].qtyReturn
                                        kurangi_qty_to_cut = (qty) =>{
                                            hasil_pengurangan = parseInt(qty_to_cut) - parseInt(qty)
                                            qty_to_cut = hasil_pengurangan
                                        }
                                        for(i3=0;i3<dataToshow.length;i3++){
                                            let new_qty = parseInt(dataToshow[i3].qty) > parseInt(qty_to_cut) ? parseInt(dataToshow[i3].qty) - parseInt(qty_to_cut) : 0
                                            let prm_qty_void = parseInt(dataToshow[i3].qty) > parseInt(qty_to_cut) ? parseInt(qty_to_cut) : parseInt(dataToshow[i3].qty)
                                            Object.assign(dataToshow[i3], {qty_void:prm_qty_void})
                                            Object.assign(dataToshow[i3], {kodeRTRN:kodeRTRN})
                                            new_qty > 0 ?kurangi_qty_to_cut(qty_to_cut):kurangi_qty_to_cut(dataToshow[i3].qty)
                                            dataToshow[i3].qty = new_qty
                                        }
                                        for(ix2=0;ix2<dataToshow.length;ix2++){
                                            let dataTopush3 = {
                                                kode_inventory:`${dataToshow[ix2].kode_inventory}`,
                                                kode_barang:`${dataToshow[ix2].kode_barang}`,
                                                tanggal_masuk:`${dataToshow[ix2].tanggal_masuk}`,
                                                ref_masuk:`${dataToshow[ix2].ref_masuk}`,
                                                type_masuk:`${dataToshow[ix2].type_masuk}`,
                                                harga:`${dataToshow[ix2].harga}`,
                                                qty:`${dataToshow[ix2].qty}`,
                                                qty_void:`${dataToshow[ix2].qty_void}`,
                                                kodeRTRN:`${dataToshow[ix2].kodeRTRN}`
                                            }
                                            newMasterInventory.push(dataTopush3)
                                        }
                                        dataToshow = []
                                    }
                                    let queries = '';
                                    for (i4=0;i4<newMasterInventory.length;i4++) {
                                        queries = queries+`UPDATE master_inventory SET qty = "${newMasterInventory[i4].qty}" WHERE kode_inventory = "${parseInt(newMasterInventory[i4].kode_inventory)}";`
                                    }
                                    connection.query(queries,(error5,result5,field5)=> {
                                        if (error5){
                                            console.log("4");
                                            res.status(400).send({
                                                error5
                                            });
                                        }
                                        else{
                                            var sqlReturnBarang = "INSERT INTO return_d (kode_return_d,kode_inventory,kode_barang,qty,cost,kode_return_h) VALUES ?";
                                            var dataArrayReturnBarang = [];
                                            for (i1=0;i1<newMasterInventory.length;i1++) {
                                                let dataToPush1 = [
                                                    ``,
                                                    `${newMasterInventory[i1].kode_inventory}`,
                                                    `${newMasterInventory[i1].kode_barang}`,
                                                    `${newMasterInventory[i1].qty_void}`,
                                                    `${newMasterInventory[i1].harga}`,
                                                    `${kodeRTRN}`
                                                ]
                                                parseInt(newMasterInventory[i1].qty_void) > 0 && dataArrayReturnBarang.push(dataToPush1)
                                            }
                                            connection.query(sqlReturnBarang, [dataArrayReturnBarang],(error3,result3,field3)=> {
                                                if (error3){
                                                    console.log("5");
                                                    res.status(400).send({
                                                        error3
                                                    });
                                                }
                                                else{
                                                    res.status(200).send({
                                                        status:"01",
                                                        kodeRTRN:`${kodeRTRN}`
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        },
        getReturnData:(req,res) =>{
            connection.query(`
            SELECT
            x.kode_return_h,
            x.nomor_return,
            x.tanggal_return,
            x.kode_purchase_order_h
            FROM 
            return_h as x
            ORDER BY x.tanggal_return DESC `,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let dataRTRN=[]
                    for(i=0;i<panjangArray1;i++){
                        let dataTopush1 = {
                            kode_return_h:`${result[i].kode_return_h}`,
                            nomor_return:`${result[i].nomor_return}`,
                            tanggal_return:`${result[i].tanggal_return}`,
                            kode_purchase_order_h:`${result[i].kode_purchase_order_h}`
                        }
                        dataRTRN.push(dataTopush1)
                    }
                    res.status(200).send({
                        dataRTRN
                    });
                }
            });
        },
        getReturnDetail:(req,res) =>{
            connection.query(`
            SELECT
            x.kode_return_h,
            x.nomor_return,
            x.tanggal_return,
            x.kode_purchase_order_h
            FROM 
            return_h as x
            WHERE x.kode_return_h = "${req.body.kodeRTRN}"`,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    connection.query(`
                    SELECT
                    x.kode_return_d,
                    x.kode_barang,
                    (SELECT nama_barang FROM master_barang WHERE kode_barang = x.kode_barang) as nama_barang,
                    (SELECT unit_barang FROM master_barang where kode_barang = x.kode_barang) as unit_barang,
                    (SELECT satuan_barang FROM master_barang where kode_barang = x.kode_barang) as satuan_barang,
                    (SELECT conversi_satuan FROM master_barang where kode_barang = x.kode_barang) as konversi_barang,
                    x.qty,
                    x.cost
                    FROM return_d as x
                    WHERE
                    x.kode_return_h = "${req.body.kodeRTRN}"`,(error1,result1,field1)=> {
                        if (error1){
                            res.status(400).send({
                                error1
                            });
                        }
                        else{
                            let panjangArray2=result1.length
                            let dataRTRND=[]
                            for(ia=0;ia<panjangArray2;ia++){
                                // batas
                                let qty =parseInt(result1[ia].qty)
                                let convertionqty =parseInt(result1[ia].konversi_barang)
                                let qtyProcessA = Math.floor(qty/convertionqty)
                                let qtyProcessB = qty%convertionqty
                                let qtyToShow = qtyProcessA+" / "+qtyProcessB
                                // batas
                                let dataTopush2 = {
                                    kode_return_d:`${result1[ia].kode_return_d}`,
                                    kode_barang:`${result1[ia].kode_barang}`,
                                    nama_barang:`${result1[ia].nama_barang}`,
                                    unit_barang:`${result1[ia].unit_barang}`,
                                    satuan_barang:`${result1[ia].satuan_barang}`,
                                    qty:`${result1[ia].qty_req}`,
                                    qty_toShow:`${qtyToShow}`,
                                    cost:`${result1[ia].cost}`
                                }
                                    dataRTRND.push(dataTopush2)
                            }
                            res.status(200).send({
                                "kode_return_h": `${result[0].kode_return_h}`,
                                "nomor_return": `${result[0].nomor_return}`,
                                "tanggal_return": `${result[0].tanggal_return}`,
                                "vendor_code": `${result[0].vendor_code}`,
                                "vendor_name": `${result[0].vendor_name}`,
                                dataRTRND:dataRTRND
                            });
                        }
                    });
                }
            });
        },
    // controler return--
    // controler return
        getFromWaste:(req,res) =>{
            connection.query(`
            SELECT 
            x.kode_barang,
            (
                SELECT SUM(qty) as qty_in_stock 
                FROM 
                master_inventory 
                where 
                kode_barang = x.kode_barang 
            ) as qty_in_inventory,
            x.nama_barang,
            x.unit_barang,
            x.satuan_barang,
            x.conversi_satuan,
            x.kode_vendor,
            (SELECT nama_vendor FROM master_vendor where kode_vendor = x.kode_vendor) as vendor_name
            FROM master_barang as x `,(error1,result1,field1)=> {
                if (error1){
                    res.status(400).send({
                        error1
                    });
                }
                else{
                    let panjangArray2=result1.length
                    let dataMasterBarang=[]
                    for(i1=0;i1<panjangArray2;i1++){
                        // batas
                        let qtyInv =parseInt(result1[i1].qty_in_inventory==null?0:result1[i1].qty_in_inventory)
                        let convertionQtyInv =parseInt(result1[i1].conversi_satuan)
                        let qtyInvProcessA = Math.floor(qtyInv/convertionQtyInv)
                        let qtyInvProcessB = qtyInv%convertionQtyInv
                        let qtyInvToShow = qtyInvProcessA+"/"+qtyInvProcessB
                        // batas
                        let dataTopush2 = {
                            value:`${result1[i1].kode_barang}`,
                            label:`${result1[i1].kode_barang}-${result1[i1].nama_barang}`,
                            satuan:`${result1[i1].satuan_barang}`,
                            unit:`${result1[i1].unit_barang}`,
                            konversi:`${result1[i1].conversi_satuan}`,
                            kode_vendor:`${result1[i1].kode_vendor}`,
                            qty_in_inventory:`${result1[i1].qty_in_inventory}`,
                            qtyInvToShow:`${qtyInvToShow}`
                        }
                        dataMasterBarang.push(dataTopush2)
                    }
                    res.status(200).send({
                        dataMasterBarang
                    });
                }
            });
        },
        addFormWasteCK:(req,res) =>{
            let firstPrm = moment().tz("Asia/Jakarta").startOf('month').format('YYYY-MM-DD HH:mm:ss')
            let lastPrm = moment().tz("Asia/Jakarta").endOf('month').format('YYYY-MM-DD HH:mm:ss')
            let year = moment().tz("Asia/Jakarta").format("YYYY")
            let month = moment().tz("Asia/Jakarta").format("MM")
            connection.query(`
            SELECT COUNT(kode_waste_h) AS total
            FROM waste_h
            WHERE tanggal_waste
            BETWEEN "${firstPrm}"
            AND "${lastPrm}"
            `,(errorx,resultx,fieldx)=> {
                if (errorx){
                    console.log("1");
                    res.status(400).send({
                        errorx
                    });
                }
                else{
                    let totalData = parseInt(resultx[0].total)+1
                    let totalDatastring = totalData.toString()
                    let runData = totalDatastring.padStart(7, '0')
                    let automateNumber = "WST"+"/"+year+"/"+month+"/"+runData
                    connection.query(`
                    INSERT INTO waste_h 
                    values
                    (
                        "",
                        "${automateNumber}",
                        "${req.body.PRMOUTLET}",
                        "${req.body.TANGGALWASTE}",
                        "${req.body.USER}",
                        "${req.body.TANGGALWASTE}"
                    )
                    `,(error1,result1,field1)=> {
                        if (error1){
                            console.log("2");
                            res.status(400).send({
                                error1
                            });
                        }
                        else{
                            let kodeWST = result1.insertId
                            let ADDDATA = req.body.ADDDATA
                            let DataADDDATAlength = ADDDATA.length
                            connection.query(`
                            SELECT
                            *
                            FROM master_inventory
                            WHERE
                                qty > 0
                            ORDER BY kode_inventory ASC
                            `,(error4,result4,field4)=> {
                                if (error4){
                                    console.log("3");
                                    res.status(400).send({
                                        error4
                                    });
                                }
                                else{
                                    let dataresult4 = result4;
                                    let panjangArray2=dataresult4.length
                                    let masterInventory=[]
                                    for(ix1=0;ix1<panjangArray2;ix1++){
                                        let dataTopush2 = {
                                            kode_inventory:`${dataresult4[ix1].kode_inventory}`,
                                            kode_barang:`${dataresult4[ix1].kode_barang}`,
                                            tanggal_masuk:`${dataresult4[ix1].tanggal_masuk}`,
                                            ref_masuk:`${dataresult4[ix1].ref_masuk}`,
                                            type_masuk:`${dataresult4[ix1].type_masuk}`,
                                            harga:`${dataresult4[ix1].harga}`,
                                            qty:`${dataresult4[ix1].qty}`
                                        }
                                        masterInventory.push(dataTopush2)
                                    }
                                    let newMasterInventory = []
                                    for (i2=0;i2<DataADDDATAlength;i2++) {
                                        let dataToshow =  masterInventory.filter(function(data) {
                                            return data.kode_barang == ADDDATA[i2].kode_barang;
                                        });
                                        dataToshow.sort(function(a, b){
                                            return a.kode_inventory-b.kode_inventory
                                        })
                                        let qty_to_cut = ADDDATA[i2].qty
                                        kurangi_qty_to_cut = (qty) =>{
                                            hasil_pengurangan = parseInt(qty_to_cut) - parseInt(qty)
                                            qty_to_cut = hasil_pengurangan
                                        }
                                        for(i3=0;i3<dataToshow.length;i3++){
                                            let new_qty = parseInt(dataToshow[i3].qty) > parseInt(qty_to_cut) ? parseInt(dataToshow[i3].qty) - parseInt(qty_to_cut) : 0
                                            let prm_qty_void = parseInt(dataToshow[i3].qty) > parseInt(qty_to_cut) ? parseInt(qty_to_cut) : parseInt(dataToshow[i3].qty)
                                            Object.assign(dataToshow[i3], {qty_void:prm_qty_void})
                                            Object.assign(dataToshow[i3], {kodeWST:kodeWST})
                                            new_qty > 0 ?kurangi_qty_to_cut(qty_to_cut):kurangi_qty_to_cut(dataToshow[i3].qty)
                                            dataToshow[i3].qty = new_qty
                                        }
                                        for(ix2=0;ix2<dataToshow.length;ix2++){
                                            let dataTopush3 = {
                                                kode_inventory:`${dataToshow[ix2].kode_inventory}`,
                                                kode_barang:`${dataToshow[ix2].kode_barang}`,
                                                tanggal_masuk:`${dataToshow[ix2].tanggal_masuk}`,
                                                ref_masuk:`${dataToshow[ix2].ref_masuk}`,
                                                type_masuk:`${dataToshow[ix2].type_masuk}`,
                                                harga:`${dataToshow[ix2].harga}`,
                                                qty:`${dataToshow[ix2].qty}`,
                                                qty_void:`${dataToshow[ix2].qty_void}`,
                                                kodeWST:`${dataToshow[ix2].kodeWST}`
                                            }
                                            newMasterInventory.push(dataTopush3)
                                        }
                                        dataToshow = []
                                    }
                                    let queries = '';
                                    for (i4=0;i4<newMasterInventory.length;i4++) {
                                        queries = queries+`UPDATE master_inventory SET qty = "${newMasterInventory[i4].qty}" WHERE kode_inventory = "${parseInt(newMasterInventory[i4].kode_inventory)}";`
                                    }
                                    connection.query(queries,(error5,result5,field5)=> {
                                        if (error5){
                                            console.log("4");
                                            res.status(400).send({
                                                error5
                                            });
                                        }
                                        else{
                                            var sqlWasteBarang = "INSERT INTO waste_d (kode_waste_d,kode_inventory,kode_barang,qty,cost,kode_waste_h) VALUES ?";
                                            var dataArrayWasteBarang = [];
                                            for (i1=0;i1<newMasterInventory.length;i1++) {
                                                let dataToPush1 = [
                                                    ``,
                                                    `${newMasterInventory[i1].kode_inventory}`,
                                                    `${newMasterInventory[i1].kode_barang}`,
                                                    `${newMasterInventory[i1].qty_void}`,
                                                    `${newMasterInventory[i1].harga}`,
                                                    `${kodeWST}`
                                                ]
                                                parseInt(newMasterInventory[i1].qty_void) > 0 && dataArrayWasteBarang.push(dataToPush1)
                                            }
                                            connection.query(sqlWasteBarang, [dataArrayWasteBarang],(error3,result3,field3)=> {
                                                if (error3){
                                                    console.log("5");
                                                    res.status(400).send({
                                                        error3
                                                    });
                                                }
                                                else{
                                                    res.status(200).send({
                                                        status:"01",
                                                        kodeWST:`${kodeWST}`
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        },
        getWasteData:(req,res) =>{
            connection.query(`
            SELECT
            x.kode_waste_h,
            x.nomor_waste,
            x.tanggal_waste,
            x.id_outlet,
            (SELECT nama_outlet FROM outlet where id_outlet = x.id_outlet) as nama_outlet 
            FROM 
            waste_h as x
            WHERE x.id_outlet = "${req.body.PRMOUTLET}"
            ORDER BY x.tanggal_waste DESC `,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    let panjangArray1=result.length
                    let dataWST=[]
                    for(i=0;i<panjangArray1;i++){
                        let dataTopush1 = {
                            kode_waste_h:`${result[i].kode_waste_h}`,
                            nomor_waste:`${result[i].nomor_waste}`,
                            tanggal_waste:`${result[i].tanggal_waste}`,
                            id_outlet:`${result[i].id_outlet}`,
                            nama_outlet:`${result[i].nama_outlet}`
                        }
                        dataWST.push(dataTopush1)
                    }
                    res.status(200).send({
                        dataWST
                    });
                }
            });
        },
        getWasteDetail:(req,res) =>{
            connection.query(`
            SELECT
            x.kode_waste_h,
            x.nomor_waste,
            x.tanggal_waste,
            x.id_outlet,
            (SELECT nama_outlet FROM outlet where id_outlet = x.id_outlet) as nama_outlet 
            FROM 
            waste_h as x
            WHERE x.kode_waste_h = "${req.body.kodeWST}"`,(error,result,field)=> {
                if (error){
                    res.status(400).send({
                        error
                    });
                }
                else{
                    connection.query(`
                    SELECT
                    x.kode_waste_d,
                    x.kode_barang,
                    (SELECT nama_barang FROM master_barang WHERE kode_barang = x.kode_barang) as nama_barang,
                    (SELECT unit_barang FROM master_barang where kode_barang = x.kode_barang) as unit_barang,
                    (SELECT satuan_barang FROM master_barang where kode_barang = x.kode_barang) as satuan_barang,
                    (SELECT conversi_satuan FROM master_barang where kode_barang = x.kode_barang) as konversi_barang,
                    x.qty,
                    x.cost
                    FROM waste_d as x
                    WHERE
                    x.kode_waste_h = "${req.body.kodeWST}"`,(error1,result1,field1)=> {
                        if (error1){
                            res.status(400).send({
                                error1
                            });
                        }
                        else{
                            let panjangArray2=result1.length
                            let dataWSTD=[]
                            for(ia=0;ia<panjangArray2;ia++){
                                // batas
                                let qty =parseInt(result1[ia].qty)
                                let convertionqty =parseInt(result1[ia].konversi_barang)
                                let qtyProcessA = Math.floor(qty/convertionqty)
                                let qtyProcessB = qty%convertionqty
                                let qtyToShow = qtyProcessA+" / "+qtyProcessB
                                // batas
                                let dataTopush2 = {
                                    kode_return_d:`${result1[ia].kode_return_d}`,
                                    kode_barang:`${result1[ia].kode_barang}`,
                                    nama_barang:`${result1[ia].nama_barang}`,
                                    unit_barang:`${result1[ia].unit_barang}`,
                                    satuan_barang:`${result1[ia].satuan_barang}`,
                                    qty:`${result1[ia].qty_req}`,
                                    qty_toShow:`${qtyToShow}`,
                                    cost:`${result1[ia].cost}`
                                }
                                    dataWSTD.push(dataTopush2)
                            }
                            res.status(200).send({
                                "kode_waste_h": `${result[0].kode_waste_h}`,
                                "nomor_waste": `${result[0].nomor_waste}`,
                                "tanggal_waste": `${result[0].tanggal_waste}`,
                                "id_outlet": `${result[0].id_outlet}`,
                                "nama_outlet": `${result[0].nama_outlet}`,
                                dataWSTD:dataWSTD
                            });
                        }
                    });
                }
            });
        },
// controler return--
};