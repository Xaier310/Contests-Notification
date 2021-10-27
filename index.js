const nodemailer = require("nodemailer");
const { Telegraf } = require('telegraf'); 
// const { Composer } = require("micro-bot");
require('dotenv').config();
const { TaskTimer } = require('tasktimer');
const Verifier = require("email-verifier");
var validator = require("email-validator");
const puppeteer=require("puppeteer");
const timer = new TaskTimer(1000);  
const {google} = require("googleapis");
const mongoose = require('mongoose');
const platform = ["Codechef", "Leetcode", "Hackerearth"];
var jsonFiletimeOuts={}; 
var universalInfo;
const bot = new Telegraf(process.env.BOT_TOKEN);  
const express=require("express");
const { gmail } = require("googleapis/build/src/apis/gmail");
const app=express();
let port=process.env.PORT;
if(port===null||port===""||port==undefined) port=3000;
app.listen(port,()=>console.log("Server has started successfully on port "+port)); 
app.get("/",(req,res)=>{ 
    console.log(jsonFiletimeOuts);
    res.sendFile(__dirname+"/home.html");
});
app.get("/confirm",(req,res)=>{
res.sendFile(__dirname+"/confirmation.html");
});




const oAuth2Client = new google.auth.OAuth2(process.env.clientID,process.env.clientSecret);
oAuth2Client.setCredentials({refresh_token : process.env.refreshToken1});
// const bot = new Composer(); 
// bot.init = async (mBot)=>{
// bot.telegram = mBot.telegram;
// }

mongoose.connect(process.env.MONGO_SERVER)
.then(()=>console.log("connected database successfully..."))
.catch(err=>console.log(err));


const contestSchema = new mongoose.Schema(
    {"usrDetails":[{"ids":[{"id":Number,"notifyTime":[Number],"email":String}]}],
     "keys":[{"key":String},{"key":String},{"key":String}]}
); 

const Contest = mongoose.model("contest",contestSchema);  



        const accessToken=oAuth2Client.getAccessToken();
        var transporter = [];
        transporter[0] = nodemailer.createTransport({
            service: "gmail",
            auth: { 
                type: 'OAuth2',
                user: process.env.EMAIL_USERID, 
                pass: process.env.EMAIL_PASSWORD,
                refreshToken: process.env.refreshToken2,
                clientId:process.env.clientID,
                clientSecret:process.env.clientSecret, 
                accessToken : accessToken
            }
        });
        transporter[1] = nodemailer.createTransport({
            service: "gmail",
            auth: {  
                type: 'OAuth2',
                user: process.env.EMAIL_USERID2,
                pass: process.env.EMAIL_PASSWORD2,
                clientId:process.env.clientID,
                clientSecret:process.env.clientSecret, 
                refreshToken : process.env.refreshToken1,
                accessToken : accessToken
            }
        });
    
    
    










/* Checking every 1 hour for notifications on codechef website****/
timer.add([
    {
        id: 'task-1',       // unique ID of the task
        tickInterval: 1800,    // run every 5 ticks (5 x interval = 5000 ms)
        totalRuns: 0,      // run 10 times only. (set to 0 for unlimited times)
        callback(task) {
             notifyThem();
             console.log("notifyThem runs after 45 seconds");
        }
    },
    {
        id: 'task-2',       // unique ID of the task
        tickInterval: 300,    // run every 5 ticks (5 x interval = 5000 ms)
        totalRuns: 0,      // run 10 times only. (set to 0 for unlimited times)
        callback(task) {
            saveData();
            console.log("saveData runs after 1/2 minutes");
        }
    }
]);

async function saveData (){  
    try{
        universalInfo = await codechefInfo().catch(err=>console.log(err));
        setAllTimings(universalInfo);
    }
    catch(err){
        console.log(err);
    }
}

saveData();
timer.start();


//**********testing purpose */
// let objj={
//     link: 'https://www.codechef.com/DECP2021?itm_campaign=contest_listing',
//     key: 'DeCipher',
//     code: 'DECP2021',
//     startTime: '2021-11-13T20:00:00+05:30',
//     endTime: '12 hours '
//   }
//   sendMyMail(undefined, objj, "xaier310@gmail.com", 5, 600, process.env.EMAIL_USERID, undefined);







/********************CodeChef Coding******************/

    async function codechefInfo(){ 
        try{
            const browser=await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox','--disable-setuid-sandbox']
              });
             const newTab=await browser.newPage();
             newTab.setDefaultNavigationTimeout(0);
             await newTab.goto("https://www.codechef.com/contests/?itm_medium=navmenu&itm_campaign=allcontests_head");
             await newTab.waitForSelector("#future-contests-data");
             await newTab.$eval("#show_all_contests",x=>x.click());
             await newTab.waitForSelector("#future-contests-data tr td a[href]");
             const infos=await newTab.$$eval("#future-contests-data tr td a[href]",x=>{
              return [...x].map((el)=>({                                                                                                                                   
                  link:el.href,
                  key: el.textContent
                }))                                                                                                                                                   
            });
              const code=await newTab.$$eval("#future-contests-data tr td:first-child",x=>{                                                                           
                  return ([...x].map(el=>el.textContent))
               })
               await newTab.waitForSelector("#future-contests-data tr td[data-starttime]");
             const startTime=await newTab.$$eval("#future-contests-data tr td[data-starttime]",x=>{
              return [...x].map((el)=>el.getAttribute("data-starttime"));
               });
               await newTab.waitForSelector("#future-contests-data tr td[data-starttime]+td");
             const endTime=await newTab.$$eval("#future-contests-data tr td[data-starttime]+td",x=>{
               //IF it is in the form of nodelist
              return [...x].map((el)=>el.textContent)
               })
        
               for(let i=0;i<infos.length;i++){
                 infos[i].code = code[i];
                 infos[i].startTime=startTime[i];
                 infos[i].endTime=endTime[i];
               } 
               browser.close(); 
            //    console.log(infos);
             return infos;  
        }
        catch(err){
            console.log(err);
        }
     }


  async function setAllTimings(infos){  
      try{ 
    let allContent=await Contest.find({}).catch(err=>console.log(err)); 
    let jsonFile=allContent[0];
    let ids=jsonFile.usrDetails[0].ids;
    
    for(let i=0;i<infos.length;i++){
        for(let j=0;j<ids.length;j++){
            for(let k=0;k<ids[j].notifyTime.length;k++){ 
         let notifyTime = ids[j].notifyTime[k]; 
         let obj = infos[i];
         let diff=diffInTime(obj.startTime); 
         let time=diff - notifyTime*60*60*1000; 
         if(jsonFiletimeOuts["tele" + ids[j].id + obj.key + (notifyTime * 60)]===undefined)
         setTiming(obj, ids[j].id, time, notifyTime, j); 
         if((jsonFiletimeOuts["email" + ids[j].email + obj.key + (notifyTime * 60)]===undefined)&&ids[j].email)
         sendMyMail(undefined, obj, ids[j].email, time, notifyTime, process.env.EMAIL_USERID, undefined);
            }
        }
    } 
}
catch(err){
    console.log(err);
}
}



    
    
   async function notifyThem() {
       try{
        let infos = [];
        infos[0] = await codechefInfo().catch(errr=>console.log(errr)); 
        //infos[1]=leetcodeInfo();
            const allContent=await Contest.find({});    
            jsonFile=allContent[0];

        for (let j = 0; j < infos.length; j++) {
            let tempKey = "";
            let flag = false;
            let count = true;
            let ids = jsonFile.usrDetails[j].ids;
            for (let y = 0; y < infos[j].length; y++)
                if (jsonFile.keys[j].key === infos[j][y].key)
                    count = false;
    
            for (let i = 0; i < infos[j].length; i++) {
                if (jsonFile.keys[j].key === infos[j][i].key || count) {
                    if (!count) i++;
    
                    //all upcomingss part-1
                    let m = i;
                    let UpcomingContests = `<b>#CODECHEF_UPCOMING_CONTESTS</b>\n`;
                    for (m = 0; m < i; m++) {
                        let startTime = new Date(infos[0][m].startTime).toLocaleString("en-GB", { timeZone: "Asia/Kolkata" });
                        // let endTime = new Date(infos[0][m].endTime).toLocaleString('en-GB'); 
                        let endTime = infos[0][m].endTime;
                        UpcomingContests += `<em>Contest ${m + 1} </em>\n${infos[0][m].key} \nStarting Time: ${startTime} \nDuration: ${endTime} \n\n`;
                    }
                    for (;infos[j]&& m < infos[j].length; m++) {
                        let startTime = new Date(infos[0][m].startTime).toLocaleString('en-GB', { timeZone: "Asia/Kolkata" });
                        // let endTime = new Date(infos[0][m].endTime).toLocaleString('en-GB'); 
                        let endTime = infos[0][m].endTime;
    
                       UpcomingContests += `<em>Contest ${m + 1} (New one...)</em>\n<b>${infos[0][m].key} \nStarting Time: ${startTime} \nDuration: ${endTime}</b>\n\n`;
                    }
                       UpcomingContests += `https://www.codechef.com/contests/?itm_medium=navmenu&itm_campaign=allcontests_headContest`;
    
                    for (; i < infos[j].length; i++) {
                        const diffInTim = diffInTime(infos[j][i].startTime);
    
                        for (let k = 0; k < ids.length; k++) {
                            let sendObject = infos[j][i];
                            let sendUsrId = ids[k].id;
                            let usrMail = ids[k].email;
    
                            //upcoming part-2 (only sending part)
                            if (!flag) {
                                bot.telegram.sendMessage(sendUsrId, UpcomingContests, { parse_mode: "HTML" }).catch(e => console.log(e));
    
                                if (usrMail !== undefined && usrMail !== null && usrMail !== "")
                                    sendMyMailUC(undefined, infos[0], usrMail, count, process.env.EMAIL_USERID, undefined);
                            }
    
    
                            for (let l = 0; ids[k].notifyTime !== undefined && l < ids[k].notifyTime.length; l++) {
                                let beforeTime = ids[k].notifyTime[l];
                                realTime = diffInTim - beforeTime * 1000 * 60 * 60;
    
                                if (usrMail !== undefined && usrMail !== null && usrMail !== "")
                                    sendMyMail(undefined, sendObject, usrMail, realTime, beforeTime, process.env.EMAIL_USERID, undefined);
                                /*******pass realTime instead of 0(custom)*********/
                                setTiming(sendObject, sendUsrId, realTime, beforeTime, k);
                            }
                        }
                        tempKey = infos[j][i].key;
                        flag = true;
                    } break;
                }
            }
            if (flag) {
                Contest.updateMany({},{"$set":{
                    [`keys.${j}.key`]:tempKey
                }},(err)=>{
                    if(err) console.log(err);
                    else console.log("last key successfully added")
                });
                
              
            }
        } 
        // setAllTimings(infos[0]);
       } 

       catch(err){
           console.log(err);
       }
        
    }






/*****Function For sending reminder notifications on email*****/
async function sendMyMail(senderEmailIndex = 0, obj, targetEmail, time, notifyTime, senderEmail, retryingTime = 0) {
    let heading;
    if (time < 0||time>2147483646) return;  
    let startTime = new Date(obj.startTime).toLocaleString('en-GB', { timeZone: "Asia/Kolkata" });

    // let endTime = new Date(obj.endTime).toLocaleString('en-GB'); 
    let endTime = obj.endTime;

    if (notifyTime >= 1) heading = `CODECHEF_REMINDER : Contest Will Start In ${notifyTime}hr`;

    else if (notifyTime === 0) heading = `CODECHEF_REMINDER : Contest Has Been Started`;

    else heading = `CODECHEF_REMINDER : Contest Will Start In ${notifyTime * 60} minutes`; 
    let msg = `<span style="opacity: 0"> ${Date.now()} </span> <div style="color:black;text-align:center;font-family: 'Gill Sans Extrabold', sans-serif;display:block; border:1px solid white;width:auto;margin:10px auto; padding:20px 30px; background-color:#F7F6F2;"><section style="margin :10px auto;">
     <img style="display:block;width:50vw;margin:10px auto;border-radius:10px;box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;" src="https://raw.githubusercontent.com/Xaier310/contests.css/main/IMG_20210831_205417_653.jpg" alt="" /><h2 style="font-family: monospace;font-weight:bold;">${heading}</h2>   <p><i>There are the details...</i></p><h3 style="font-family: monospace;font-weight:bold;">${obj.key}</h3><h4> Start Time : ${startTime}</h4><h4 style="margin-bottom:30px;"> End Time : ${endTime}</h4><a style="border:1px solid;background-color:#345B63; padding:10px 15px; text-decoration:none;color:white;border-radius:5px;" href=${obj.link}>Take Contest</a></section>
    </div><span style="opacity: 0"> ${Date.now()} </span>`;


    var mailOptions = {
        from: `Contests Reminder<${senderEmail}>`,
        to: targetEmail,
        subject: "CODECHEF CONTEST REMINDER",
        html: msg,
        text: msg
    };

    jsonFiletimeOuts["email" + targetEmail + obj.key + (notifyTime * 60)] = setTimeout(() => {
        transporter[senderEmailIndex].sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log("target : " + mailOptions.to + "--" + "Error is " + error);
                if (retryingTime < 10) {
                    console.log("Retrying..." + retryingTime+"with "+mailOptions.from);   
                    if(retryingTime>5){
                        oAuth2Client.setCredentials({refresh_token : process.env.refreshToken2});
                        sendMyMail(1, obj, targetEmail, 0, notifyTime, process.env.EMAIL_USERID2, ++retryingTime);
                    } 
                    else sendMyMail(0, obj, targetEmail, 0, notifyTime, process.env.EMAIL_USERID, ++retryingTime);
                }
            }
            else console.log("Email sent to " + mailOptions.to + " from " + senderEmail);
        });
    }, time);
}


/******* Function to send msg on email whenenver new contest comes on site ********/
function sendMyMailUC(senderEmailIndex = 0, info, targetEmail, count, senderEmail, retryingTime = 0) {
    (async ()=>{
        const allContent=await Contest.find({});    
        jsonFile=allContent[0];
        

    let ctx = `<span style="opacity: 0"> ${Date.now()} </span><div style="text-align:center;display:block; border:1px solid white;width:auto;margin:10px auto; padding:20px 30px; background-color:#F7F6F2;"><section style="margin:10px auto;"><img style="display:block;width:50vw;margin:10px auto;border-radius:10px;box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;" src="https://raw.githubusercontent.com/Xaier310/contests.css/main/IMG_20210831_205417_653.jpg" alt="" /></br><h1 style="font-size:5vw;font-family: monospace;font-weight:bold;margin:22px auto 15px;">UPCOMING_CONTESTS</h1>`;
    for (let i = 0; i < info.length; i++) {
        if (jsonFile.keys[0].key === info[i].key || count) {
            if (!count) i++;
            //upcoming part 1 
            let m = i;
            let UpcomingContests = ctx;
            for (m = 0; m < i; m++) {
                let startTime = new Date(info[m].startTime).toLocaleString('en-GB', { timeZone: "Asia/Kolkata" }); 
                // let endTime = new Date(info[m].endTime).toLocaleString('en-GB');
                let endTime = info[m].endTime;
                UpcomingContests += `<i>Contest ${m + 1}</i><h4 style="margin-top:8px;margin-bottom:10px">${info[m].key}</h4><p style="line-height:1.5 rem"><b>Start Time :</b> ${startTime} <br><b> End Time :</b> ${endTime}</p><br><br>`;
            }
            for (; m < info.length; m++) {
                let startTime = new Date(info[m].startTime).toLocaleString('en-GB', { timeZone: "Asia/Kolkata" });
                // let endTime = new Date(info[m].endTime).toLocaleString('en-GB'); 
                let endTime = info[m].endTime;
                UpcomingContests += `<i>Contest ${m + 1} (NEW ONE...)</i><h4 style="margin-top:8px;margin-bottom:10px;">${info[m].key}</h4><p style="line-height:1.5rem"> <b>Start Time : </b>${startTime}<br> <b>End Time :</b> ${endTime}</p> <br><br>`; 
                ctx = UpcomingContests;
            }
        }
        break;
    }
    ctx += `<a style="margin-bottom:20px;border:1px solid;background-color:#345B63; padding:10px 15px; text-decoration:none;color:white;border-radius:5px;" href="https://www.codechef.com/contests/?itm_medium=navmenu&itm_campaign=allcontests_head">See Contests</a></section></div><span style="opacity: 0"> ${Date.now()}</span> `; 

    var mailOptions = {
        from: `Contests Reminder<${senderEmail}>`,
        to: targetEmail,
        subject: "CODECHEF NEW UPCOMING CONTEST ADDED",
        html: ctx,
        text: ctx
    }; 
transporter[senderEmailIndex].sendMail(mailOptions, function (error, infoo) {
if (error) {
console.log("target : " + mailOptions.to + "--" + error); 
if (retryingTime < 10) {  
    console.log("Retrying..." +retryingTime+"with "+mailOptions.from);
    if(retryingTime>5){ 
        oAuth2Client.setCredentials({refresh_token : process.env.refreshToken2});
        sendMyMailUC(1, info, targetEmail, count, process.env.EMAIL_USERID2, ++retryingTime); 
    }
}
        }
        else console.log("Email sent to " + mailOptions.to + " from " + senderEmail);
    }); 
})().catch(err=>console.log(err));
}


/*****function for sending uncoming and reminders notiication on telegram *********/
function setTiming(obj, id, time, notifyTime, k) {
    let heading;
    if (time < 0||time>2147483646) return; 
    let startTime = new Date(obj.startTime).toLocaleString('en-GB', { timeZone: "Asia/Kolkata" }); 
    // let endTime = new Date(obj.endTime).toLocaleString('en-GB');
    let endTime = obj.endTime;
    if (notifyTime >= 1)
    heading = `<b>CODECHEF_REMINDER : Contest Will Start In ${notifyTime}hr</b>\n\n<em>These are the details...</em>`;

    else if (notifyTime === 0) heading = `<b>CODECHEF_REMINDER : Contest Has Been Started</b>\n\n<em>These are the details...</em>`;

    else heading = `<b>CODECHEF_REMINDER : Contest Will Start In ${notifyTime * 60} minutes</b>\n\n<em>These are the details...</em>`;

    let msg = `${heading}\n\nContest Name : \n${obj.key}\nStarting Time : ${startTime}\nDuration : ${endTime}\n\n${obj.link}`;
    jsonFiletimeOuts["tele" + id + obj.key + (notifyTime * 60)] = setTimeout(() => {
        bot.telegram.sendMessage(id, msg, { parse_mode: 'HTML' });
    }, time);

}



/************function for getting diffrence in contest and current timing ******/
function diffInTime(startTime) {
    const tempCurrentDT = new Date();//.toLocaleString("en-GB", { timeZone: "Asia/Kolkata" });
    let currentDTParse = Date.parse(tempCurrentDT);
    // let currentDT = new Date(currentDTParse);
    let tempContestDT =new Date(startTime);//.toLocaleString("en-GB", { timeZone: "Asia/Kolkata" }); 
    let contestDTParse = Date.parse(tempContestDT);
    // let contestDT = new Date(tempContestDT);
    // let contestGetTime = contestDT.getTime();
    // let currentGetTime = currentDT.getTime(); 
    // console.log(tempContestDT);
    // console.log(tempCurrentDT);
    // let diff = contestGetTime - currentGetTime;
    let diff = contestDTParse - currentDTParse;
    return diff;
}
// console.log(diffInTime("2021-09-29T20:00:00+05:30")/(1000*60*60));


/********* Commands of Telegram bots ********/

/****    command for removing emails ******/
bot.command("cc_removeemail", (ctx) => {
    let emails = ctx.message.text.split(/[\s,]+/);
    emails.shift();
    (async ()=>{
        const allContent=await Contest.find({});    
        jsonFile=allContent[0];
        
    let ids = jsonFile.usrDetails[0].ids;
    let flag = false;
    let i = 0;
    for (i = 0; i < ids.length; i++)
        if (ctx.chat.id === ids[i].id) {
            flag = true; break;
        }
    if (flag) {
        if (ids[i].email === undefined || ids[i].email === "NULL" || ids[i].email === "") { 
            ctx.reply("You dont have any email added"); return; }
        else {
            let myEmail = ids[i].email;

            (async () => {
                // let obj = await codechefInfo().catch(eerr=>console.log(eerr)); 
                 let obj = universalInfo;
                for (let m = 0; m < obj.length; m++)
                    for (let n = 0; ids[i].notifyTime && n < ids[i].notifyTime.length; n++){
                        clearTimeout(jsonFiletimeOuts["email" + myEmail + obj[m].key + (ids[i].notifyTime[n] * 60)]); 
                    if(jsonFiletimeOuts["email" + myEmail + obj[m].key + (ids[i].notifyTime[n] * 60)]) 
                    delete jsonFiletimeOuts["email" + myEmail + obj[m].key + (ids[i].notifyTime[n] * 60)];
                    }
                        console.log(jsonFiletimeOuts);
                    })().catch(err=>console.log(err)); 

            // delete ids[i].email;
            Contest.updateMany({},{"$unset":{
                [`usrDetails.0.ids.${i}.email`]:1
            }},(err)=>{
                if (err) { 
                    console.log(err); 
                    ctx.reply("Sever error...Try after some time"); }
                else ctx.reply("Email removed successfully");
            });
        }
    }
    else {
        ctx.reply("You are not using our bot and email service...In order to  use our bot service \n-Click /cc_addme");
    } 
    
    })().catch(err=>console.log(err));
});


/****    command for add email ******/
bot.command("cc_addemail", (ctx) => {
    let emails = ctx.message.text.split(/[\s,]+/);
    emails.shift();
    if (emails.length === 0) { ctx.reply("Please enter your email address"); return; } 
    (async ()=>{
        const allContent=await Contest.find({});    
        jsonFile=allContent[0];
 
    let ids = jsonFile.usrDetails[0].ids;
    for (let k = 0; k < 1; k++) {
        let flag = true;
        let i = 0; for (i = 0; i < ids.length; i++)                                                                                                                               if (ctx.chat.id === ids[i].id) {
            flag = false; break;
        }
        if (flag) { ctx.reply("You are not using our contests notification service...In order to add email follow this\n-Click /cc_addme\n-Use /addEmail xyz@gmail.com"); return; } let isValid = validator.validate(emails[k]); if (isValid) {
            let verifier = new Verifier(process.env.EMAIL_CHECK_API_KEY); 
            verifier.verify(emails[k], (err, data) => {
                if (err) console.log(err);
                if (data.smtpCheck !== "true" || data.dnsCheck !== "true" || data.freeCheck !== "true") {
                    ctx.reply(emails[k] + " : Invalid Email Address");
                    return;
                } else {
                    if (!flag) {
                        let flag2 = false; if (ids[i].email === undefined) flag2 = true; if (ids[i].email === emails[k]) {
                            ctx.reply(emails[k] + " : email address is already added"); return;
                        } else {
                            let preEmail = ids[i].email; 
                            let emailToSet= emails[k];
                           
                            Contest.updateMany({},{"$set":{
                                [`usrDetails.0.ids.${i}.email`]:emailToSet
                            }},(err)=>{
                                if(err) console.log(err);
                                else  if(flag2) ctx.reply(emails[k] + " : email address has been added");
                                else ctx.reply(preEmail + " : email address has been replaced \n& " + emails[k] + " : email address has been added"); 
                            });

                            (async () => {
                                // let obj = await codechefInfo().catch(err=>console.log(err)); 
                                let obj = universalInfo;
                                for (let m = 0; obj && m < obj.length; m++)
                            for (let n = 0; ids[i].notifyTime && n < ids[i].notifyTime.length; n++) {
                            if (preEmail !== undefined){
                            clearTimeout(jsonFiletimeOuts["email" + preEmail + obj[m].key + (ids[i].notifyTime[n]*60)]);
                        if(jsonFiletimeOuts["email" + preEmail + obj[m].key + (ids[i].notifyTime[n]*60)])
                        delete jsonFiletimeOuts["email" + preEmail + obj[m].key + (ids[i].notifyTime[n]*60)];
                        }
                            
                            let realTime = diffInTime(obj[m].startTime) - ids[i].notifyTime[n]*60*60*1000; 
                            if(ids[i].email)
                            sendMyMail(undefined, obj[m], ids[i].email, realTime, ids[i].notifyTime[n], process.env.EMAIL_USERID, undefined);
                                    }
                                    console.log(jsonFiletimeOuts);
                                })().catch(err=>console.log(err)); 
                              
                        }
                    }
                    else
                        ctx.reply("You are not using our contests notification service...In order to add email follow this\n-Click /cc_addme\n-Use /addEmail xyz@gmail.com");
                }
            });
        }
        else ctx.reply(emails[k] + " : Invalid Email Address");
    } 
    
    })().catch(err=>console.log(err));
});


/********** command to show all upcoming contests *******/
bot.command("cc_upcomingcontests",(ctx)=>{ 
    (async ()=>{  
    // let infos = await codechefInfo().catch(eerr=>console.log(eerr)); 
    let infos = universalInfo;
    let UC = `<b>#CODECHEF_UPCOMING_CONTESTS</b>\n`;
                    for (m = 0; infos&&m < infos.length; m++) {
                        let startTime = new Date(infos[m].startTime).toLocaleString('en-GB', { timeZone: "Asia/Kolkata" });
                        // let endTime = new Date(infos[m].endTime).toLocaleString('en-GB'); 
                        let endTime = infos[m].endTime;
                        UC += `<em>Contest ${m + 1} </em>\n${infos[m].key} \nStarting Time: ${startTime} \nDuration: ${endTime} \n\n`;
                        }
                    UC += `https://www.codechef.com/contests/?itm_medium=navmenu&itm_campaign=allcontests_headContest`; 
                   
                    bot.telegram.sendMessage(ctx.chat.id,UC,{parse_mode : "HTML"});
                } )().catch(errr=>console.log(errr));
})






/****    command for adding users to get notifications and giving details of commands ******/
bot.start((ctx) => {
    (async ()=>{
        const allContent=await Contest.find({});    
        jsonFile=allContent[0];

    let ids = jsonFile.usrDetails[0].ids;
    let ti=10/60;
    let i = 0; 
    let flag=true;
    for (i = 0; i < ids.length; i++)
        if (ids[i].id === ctx.chat.id) flag=false;
    if (flag) {
        let obj = { 
            id: ctx.chat.id,
            notifyTime: [0,ti]
        }
        // ids.push(obj); 
        Contest.updateMany({}, {
            "$push": {
                [`usrDetails.0.ids`]: obj
            }
        }, (err) => {
            if (err) console.log(err);
            else console.log("Bot is started");
        });
        

        (async () => {
            // let obj = await codechefInfo().catch(eerr=>console.log(eerr)); 
            let obj = universalInfo;
            for (let m = 0; obj && m < obj.length; m++) {                
                let realTime1 = diffInTime(obj[m].startTime) - ti*60*60*1000;
                let realTime2 = diffInTime(obj[m].startTime);
                setTiming(obj[m], ctx.chat.id, realTime1, ti, ids.length-1);
                setTiming(obj[m], ctx.chat.id, realTime2, ti, ids.length-1);
            }
            console.log(jsonFiletimeOuts);
        })().catch(err=>console.log(err)); 

    }
    let msg = `<strong>Get Notifications for coding contests !!!!</strong>\n\n<b>NOTE : </b>Till now we have only codechef notfication service available, we will add other platforms also\n\n<em>Some commands :</em>\nTo get codechef notification : \n/cc_addme\n\nTo stop notification of codechef : \n/cc_removeme\n\nTo set timing ( like if you want notification 5 minutes before contest starts then use ) : \n/cc_addtime 5min\n\nTo add multiple timings( Give timings seperated with space ) Like : \n/cc_addtime 5min 2hr 3min\n\nTo remove your timing ( like you don't want notification before 5 minutes anymore then use ) : \n/cc_removetime 5min\n\nTo remove multiple timings( Give timings seperated with space ) Like : \n/cc_removetime 5min 2hr 7min\n\nTo get notifications on email as well then use : \n/cc_addemail xyz@gmail.com\n\nTo remove email( If you don't want notification on email anymore ) : \n/cc_removeemail\n\nTo see your timings, email & status : \n/mydetails\n\nTo see codechef upcoming contests list : \n/cc_upcomingcontests\n\nTo see this message again : \n/help\n\n\n<b>Default setting :</b>You will get automatically notification 10 minutes before the contests starts and when contests starts. To costimize your timings use \n/cc_addtime and /cc_removetime`; 
     bot.telegram.sendMessage(ctx.chat.id, msg, { parse_mode: "HTML" });
    
    })().catch(err=>console.log(err));
    
    }); 
    


/****    command for getting infos ******/
bot.help((ctx) => {
    let msg = `<strong>Get Notifications for coding contests !!!!</strong>\n\n<b>NOTE : </b>Till now we have only codechef notfication service available, we will add other platforms also\n\n<em>Some commands :</em>\nTo get codechef notification : \n/cc_addme\n\nTo stop notification of codechef : \n/cc_removeme\n\nTo set timing ( like if you want notification 5 minutes before contest starts then use ) : \n/cc_addtime 5min\n\nTo add multiple timings( Give timings seperated with space ) Like : \n/cc_addtime 5min 2hr 3min\n\nTo remove your timing ( like you don't want notification before 5 minutes anymore then use ) : \n/cc_removetime 5min\n\nTo remove multiple timings( Give timings seperated with space ) Like : \n/cc_removetime 5min 2hr 7min\n\nTo get notifications on email as well then use : \n/cc_addemail xyz@gmail.com\n\nTo remove email( If you don't want notification on email anymore ) : \n/cc_removeemail\n\nTo see your timings, email & status : \n/mydetails\n\nTo see codechef upcoming contests list : \n/cc_upcomingcontests\n\nTo see this message again : \n/help\n\n\n<b>Default setting :</b>You will get automatically notification 10 minutes before the contests starts and when contests starts. To costimize your timings use \n/cc_addtime and /cc_removetime`; 
    bot.telegram.sendMessage(ctx.chat.id, msg, { parse_mode: "HTML" });
})




/****    command for removing Times ******/
bot.command("cc_removetime", (ctx) => {
    let msgString = ctx.message.text.split(/[\s,]+/);
    msgString.shift(); 
    if (msgString.length === 0) {
   ctx.reply("Invalid syntax...Specify which time you wanna remove, seprating with a space\n Like, /cc_removetime 5mint");
        return;
    }

    let checkMinArr = msgString.map(function (x) {
        if (x.match(/[a-zA-Z]+/g)) {
            let y = x.match(/[a-zA-Z]+/g)[0];
            if (y === "min" || y === 'Min' || y === 'MIN' || y === 'MiN' || y === 'MINUTE' || y === 'Minute' || y === 'minute' || y === 'mint' || y === 'MINUTES' || y === 'minutes')
                return true;
            else return false;
        } return false;
    });
    let tempMsg = msgString.map((x) => {
        return parseFloat(x);
    });
    let msg = tempMsg; for (let h = 0; h < tempMsg.length; h++) {
        if (isNaN(tempMsg[h])) {
            ctx.reply("Type valid time");
            return;
        }
        if (checkMinArr[h]) {
            if (msg[h] < 60)
                msg[h] = parseInt(msg[h]) / 60;
            else
                msg[h] = Math.round((parseInt(msg[h]) / 60) * 10) / 10;

        }
    }

    (async ()=>{
        const allContent=await Contest.find({});    
        jsonFile=allContent[0];

    let ids = jsonFile.usrDetails[0].ids;
    let flag = false;
    let j;
    for (j = 0; j < ids.length; j++)
        if (ctx.chat.id === ids[j].id) {
            flag = true;
            break;
        } let flag3 = false;
    if (flag && (ids[j].notifyTime === undefined || ids[j].notifyTime.length === 0)) {
        ctx.reply("You don't have any timings scheduled...In order to  set timing\n-Use /cc_addtime xhr");
        return;
    }

    else if (flag) {
        for (let i = 0; flag && i < msg.length; i++) {
            for (let k = 0; k < ids[j].notifyTime.length; k++)
                if (ids[j].notifyTime[k] === msg[i]) {
                    flag3 = true;

                    (async () => {
                        // let obj = await codechefInfo().catch(eerr=>console.log(eerr)); 
                        let obj = universalInfo;
                        for (let m = 0; obj && m < obj.length; m++)                      
                        for (let n = 0; msg && n < msg.length; n++) 
                        {   //console.log()
                            if (ids[j].email !== undefined){
                                clearTimeout(jsonFiletimeOuts["email" + ids[j].email + obj[m].key + (msg[n] * 60)]);
                            if(jsonFiletimeOuts["email" + ids[j].email + obj[m].key + (msg[n] * 60)])
                            delete jsonFiletimeOuts["email" + ids[j].email + obj[m].key + (msg[n] * 60)];
                            }
                                clearTimeout(jsonFiletimeOuts["tele" + ids[j].id + obj[m].key + (msg[n] * 60)]); 
                                if(jsonFiletimeOuts["tele" + ids[j].id + obj[m].key + (msg[n] * 60)])
                                delete jsonFiletimeOuts["tele" + ids[j].id + obj[m].key + (msg[n] * 60)];
                        }
                        console.log(jsonFiletimeOuts);
                    })().catch(err=>console.log(err));
            
                    ids[j].notifyTime.splice(k, 1);
                }
        }
        Contest.updateMany({},{"$set":{
            [`usrDetails.0.ids.${j}.notifyTime`]: ids[j].notifyTime
        }
        }, (err) => {
            if (err) {
                console.log(err); ctx.reply("Server error...Try after some time"); return;
            }
            else console.log("successfullly updated")
        });

        
    }
    if (flag === false)
        ctx.reply("You are not using our contests notification service...In order to use it\n-Click /cc_addme");
    else if (flag3)
        ctx.reply("Timing removed successfully");
    else
        ctx.reply("Timing not matched...To see your timings\n-Click /mydetails");
        
        })().catch(err=>console.log(err));

    });



/****    command for adding times ******/
bot.command("cc_addtime", (ctx) => {
    let msgString = ctx.message.text.split(/[\s,]+/);
    msgString.shift();
    if (msgString.length === 0) {
        ctx.reply("Invalid syntax...Specify which time you wanna add, seprating with a space. Like,\n-Use /cc_removetime 5mint");
        return;
    }
    let flag5 = false;
    msgString.forEach(function (x, index) {
        let u = x.match(/[a-zA-Z]+/g);
        if (u) {
            let yy = u[0];
            if (!(yy === "min" || yy === 'Min' || yy === 'MIN' || yy === 'MiN' || yy === 'MINUTE' || yy === 'Minute' || yy === 'minute' || yy === 'mint' || yy === 'MINUTES' || yy === 'minutes' || yy === "hr"
                || yy === "Hour" || yy === "HOURS" || yy === "HOUR" || yy === "hours" || yy === "hrs" || yy === "Hours")) {
                ctx.reply("Type valid time");
                flag5 = true;
            }
        }
    });
    if (flag5) return;
    let checkMinArr = msgString.map(function (x) {
        let z = x.match(/[a-zA-Z]+/g);
        let y = "";
        if (z !== undefined && z !== null) y = z[0];;
        if (y === "min" || y === 'Min' || y === 'MIN' || y === 'MiN' || y === 'MINUTE' || y === 'Minute' || y === 'minute' || y === 'mint' || y === 'MINUTES' || y === 'minutes') return true;
        else return false;
    }); 
    let tempMsg = msgString.map((x) => {
        return parseFloat(x)
    })

    let msg = tempMsg; for (let h = 0; h < tempMsg.length; h++) {
        if (isNaN(tempMsg[h]) || tempMsg[h] < 0) { bot.telegram.sendMessage(ctx.chat.id, "Type valid Time"); return; } if (checkMinArr[h]) {
            if (msg[h] > 60) msg[h] = Math.round((parseInt(msg[h]) / 60) * 10) / 10;
            else msg[h] = parseInt(msg[h]) / 60;
        }
        else
            msg[h] = Math.round(msg[h] * 10) / 10;
    } 
    (async ()=>{
        const allContent=await Contest.find({});    
        jsonFile=allContent[0];

    let ids = jsonFile.usrDetails[0].ids; 
    flag = false; 
    let j; 
    for (j = 0; j < ids.length; j++)
        if (ctx.chat.id === ids[j].id) {
            flag = true;
            break;
        }
    if (flag === false) {

        ctx.reply("You are not using our contests notification service...In order to use click it / cc_addme"); return;
    } let i = 0;
    if (flag && (ids[j].notifyTime === undefined || ids[j].notifyTime.length === 0)) {
        if (ids[j].notifyTime == undefined) {
            let tempNotifyTime = []
            ids[j].notifyTime = tempNotifyTime;
        } for (i = 0; i < msg.length; i++) 
        { ids[j].notifyTime.push(msg[i]); }
     

                Contest.updateMany({},{"$set":{
                    [`usrDetails.0.ids.${j}.notifyTime`]: ids[j].notifyTime
                }
                }, (err) => {
                    if (err) {
                        console.log(err);
                        ctx.reply("Server error...Try after some time"); return;
                    }
                    else {
                        ctx.reply("Timing added successfully");
                    
                (async () => {
                    // let obj = await codechefInfo().catch(eerr=>console.log(eerr)); 
                    let obj = universalInfo;
                    for (let m = 0; obj && m < obj.length; m++)                      
                    for (let n = 0; msg && n < msg.length; n++) {
                        let realTime = diffInTime(obj[m].startTime) - msg[n]*60*60*1000;
                        if (ids[j].email !== undefined) 
                        sendMyMail(undefined, obj[m], ids[j].email, realTime, msg[n], process.env.EMAIL_USERID, undefined); 
                        setTiming(obj[m], ids[j].id, realTime, msg[n], j);
                    } 
                    console.log(jsonFiletimeOuts);
                })().catch(err=>console.log(err)); 
                
            }
                });
                    
        return;
    }

    let flag3 = false;
    for (; flag && i < msg.length; i++) {
        let flag2 = true;
        for (let k = 0; k < ids[j].notifyTime.length; k++)
            if (ids[j].notifyTime[k] === msg[i]) flag2 = false;
        if (flag2) {
            flag3 = true;

            (async () => { 
                // let obj = await codechefInfo().catch(eerr=>console.log(eerr));  
                let obj = universalInfo;
                for (let m = 0; obj && m < obj.length; m++)                      
                for (let n = 0; msg && n < msg.length; n++) { 
                    let realTime = diffInTime(obj[m].startTime) - msg[n]*60*60*1000; 
                    if (ids[j].email !== undefined) 
                sendMyMail(undefined, obj[m], ids[j].email, realTime, msg[n], process.env.EMAIL_USERID, undefined); 
                
                setTiming(obj[m], ids[j].id, realTime, msg[n], j); 
                     } 
                     console.log(jsonFiletimeOuts);
                    })().catch(err=>console.log(err));

            ids[j].notifyTime.push(msg[i]); 

            Contest.updateMany({}, {
                "$set": {
                    [`usrDetails.0.ids.${j}.notifyTime`]:ids[j].notifyTime
                }
            }, (err) => {
                if (err) {
                    console.log(err);
                    ctx.reply("Server error...Try after some time");
                }
                else console.log("successfullly updated")
            });
                
        }
    }

    if (flag3) {
        ctx.reply("Timing added successfully");
    }

    else
    ctx.reply("Timing was already added");  

    })().catch(err=>console.log(err));
});


/****    command for to get your timigs, email and status ******/
bot.command("mydetails", (ctx) => {
  (async ()=>{
    const allContent=await Contest.find({});    
    jsonFile=allContent[0];

    let det = "";
    for (let j = 0; j < jsonFile.usrDetails.length; j++) {
        let flag = "INACTIVE";
        let timingData = "No timings";
        let emailData = "No email";
        let ids = jsonFile.usrDetails[j].ids;
        for (let i = 0; i < ids.length; i++) {
            if (ids[i].id === ctx.chat.id) {
                flag = "ACTIVE";
                if (ids[i].notifyTime !== undefined && ids[i].notifyTime.length > 0) {
                    ids[i].notifyTime.sort();
                    let min = ids[i].notifyTime.filter(function (x) {
                        return x < 1;
                    });
                    let max = ids[i].notifyTime.filter(function (x) {
                        return x >= 1;
                    });
                    min = min.map(function (y) {
                        return y * 60;
                    });

                    timingData = min.join("min, ");
                    if (min.length > 0)
                        timingData += "min";
                    if (max.length > 0 && min.length > 0) timingData += ", ";
                    timingData += max.join("hr, ");
                    if (max.length > 0)
                        timingData += "hr";
                }
                if (ids[i].email !== undefined)
                    emailData = ids[i].email;

            }
        }
        let tempDet = `<b>#${platform[j]}</b>\n<b>Status</b> : ${flag}\n<b>Timing</b> : ${timingData}\n<b>Email</b> : ${emailData}\n`;
        det += tempDet;
    }
    bot.telegram.sendMessage(ctx.chat.id, det + "\n\nTiming : How much time before the contests( starts ), you will get notifications", { parse_mode: "HTML" });
    
    })().catch(err=>console.log(err));
});


/****    command for getting our services ******/
bot.command("cc_addme", (ctx) => {
    (async ()=>{
        const allContent=await Contest.find({});    
        jsonFile=allContent[0];

    let flag = true; 
    let ti=10/60;
    let ids = jsonFile.usrDetails[0].ids;
    for (let i = 0; i < ids.length; i++) {
        if (ids[i].id === ctx.chat.id) flag = false;
    } 
    if (flag) {
        let obj = { id: ctx.chat.id, notifyTime: [0, ti] }
        ids.push(obj); 

        (async () => {
            // let obj = await codechefInfo().catch(eerr=>console.log(eerr)); 
            let obj = universalInfo;
            for (let m = 0; obj && m < obj.length; m++) {                
                let realTime1 = diffInTime(obj[m].startTime) - ti*60*60*1000;
                let realTime2 = diffInTime(obj[m].startTime);
                setTiming(obj[m], ctx.chat.id, realTime1, ti, ids.length-1);
                setTiming(obj[m], ctx.chat.id, realTime2, 0, ids.length-1);
            }
            console.log(jsonFiletimeOuts);
        })().catch(err=>console.log(err)); 

        Contest.updateMany({},{"$push":{
            [`usrDetails.0.ids`]: obj
        }
        }, (err) => {
            if (err) console.log(err);
            else  ctx.reply("You are added successfully");
        });
            
    }
    else ctx.reply("You are already added"); 

    })().catch(err=>console.log(err));
})



/****    command for not getting our servies ******/
bot.command("cc_removeme", (ctx) => {
    (async ()=>{
        const allContent=await Contest.find({});    
        jsonFile=allContent[0];

    let flag = true;
    let ids = jsonFile.usrDetails[0].ids;
    for (let i = 0; i < ids.length; i++) {
        if (ids[i].id === ctx.chat.id) {
            flag = false;
            let idss=ids[i].notifyTime; 
            let myEmail=ids[i].email;

            (async () => {
                // let obj = await codechefInfo().catch(eerr=>console.log(eerr)); 
                let obj = universalInfo;
                for (let m = 0; obj && m < obj.length; m++)
                   for(let n=0;idss&&n<idss.length;n++){
                       clearTimeout(jsonFiletimeOuts["email"+myEmail+obj[m].key+(idss[n]*60)]);
                       clearTimeout(jsonFiletimeOuts["tele"+ctx.chat.id+obj[m].key+(idss[n]*60)]);
                        if(jsonFiletimeOuts["email"+myEmail+obj[m].key+(idss[n]*60)]) 
                        delete jsonFiletimeOuts["email"+myEmail+obj[m].key+(idss[n]*60)]; 
                        if(jsonFiletimeOuts["tele"+ctx.chat.id+obj[m].key+(idss[n]*60)]) 
                        delete jsonFiletimeOuts["tele"+ctx.chat.id+obj[m].key+(idss[n]*60)];  
                  }        
                  console.log(jsonFiletimeOuts);  
                })().catch(errr=>console.log(errr));
      
            // ids.splice(i, 1);

                Contest.updateMany({},{"$unset":{
                    [`usrDetails.0.ids.${i}`]:1
                }
                }, (err) => {
                    if (err) {
                        console.log("Error : " + err);
                        ctx.reply("Server error...Try after some time");
                    }
                    else {
                        ctx.reply("You are removed successfully"); 
                        Contest.updateMany({},{"$pull":{
                            [`usrDetails.0.ids`]:null
                        }
                        }, (err) => {
                            if (err) console.log(err);
                        });}
                }); 
                    
        }
    } 
    if (flag) ctx.reply("You are not using our contests notification service...In order to use it\n-Click /cc_addme");

    })().catch(err=>console.log(err));
});



bot.launch()
// module.exports = bot
//rocky-depths-95272
//https://rocky-depths-95272.herokuapp.com/