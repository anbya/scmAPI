const connection = require("../config/oauth")
const moment = require('moment-timezone')

module.exports = {
    login: (req,res) => {
        connection.query(`SELECT * FROM prm_karyawan WHERE NIK = "${req.body.NIK}"`,(error,result,field)=> {
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
                                result:result[0]
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
};