var prio = require('priority-web-sdk');
var express = require('priority-web-sdk');
var config;


/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.doApi = async (req, res) => {
  console.log("************************************** START *******************************************");
  if(req.body.config){
    config = req.body.config;
    console.log("recieved config in request, using it %s", config.url);
  	
  }
  console.log('determine call type');
  var result='';
  var statusCode = 200;
  if(req.query.calltype){
    console.log(req.query.calltype);
    switch(req.query.calltype){
      case 'UploadText':
        try {
          result =  await UploadText(
            req.body.MainFormName,
            req.body.FilterValue,
         	  req.body.SubFormName,
            req.body.text_html,
       		  req.body.addFlag);
           
        } catch (error) {
            statusCode = 500;
            result = error.message; 
         }  
      break;
    case 'addAttachment':
      
    try {
      result =  await addAttachment(
          req.body.MainFormName,
          req.body.FilterValue,
         	req.body.SubFormName,
          req.body.base64EncodedFile,
          req.body.fileName,
       );
      
        } catch (error) {
            console.log("function addAttachment threw an error");
            statusCode = 500;
            result = error.message; 
         }
      break;
     default:
    	console.log('Wrong calltype Parameter in Query:' + req.query.calltype);
   }
  }
  else
  {
  	console.log('missing calltype Parameter in Query');
  }
  console.log("************************************** END *******************************************");
  res.status(statusCode).send(result);
};

async function addAttachment(MainFormName,_FilterValue,SubFormName, base64EncodedFile,fileName){
    try {
      console.log("trying login");
     	fileName = fileName.replace(/\t/g, '&nbsp;');
      await prio.login(config, null);
      console.log("login ok");
      var myform = await prio.formStart(MainFormName, onMessage, updateFormCallback, 0);
        console.log("form %s created",MainFormName);
        await myform.setSearchFilter(_FilterValue);
        var rows = await myform.getRows(1);
        if (rows[myform.name][1] == undefined) {
            console.log("Could not find row ");
            return;
        }
        else{
             console.log("found row");
        }
        var subform = await myform.startSubForm(SubFormName, onMessage, null);
        console.log("subform created");
        let uploadResult = await subform.uploadDataUrl(base64EncodedFile, fileName, function (fileUploadResult) {
            if (fileUploadResult.progress >= 100) {
                console.info("Done uploading");
            } else {
                console.info("File upload progress " + fileUploadResult.progress);
            }
        });

        await subform.newRow();
        await subform.fieldUpdate("EXTFILENAME", uploadResult.file);
        //console.log(uploadResult.file);
        await subform.fieldUpdate("EXTFILEDES", fileName);
        await subform.saveRow(0);
        await subform.endCurrentForm(
            (r) => console.info("endCurrentForm #2 success " + r),
            (e) => {
                console.error(`addAttachment endCurrentForm error ${e.message}`);
            });
        
        await myform.endCurrentForm();
        console.log(uploadResult.file);
        return uploadResult.file;
      } catch (error) {
        console.log("error uploading attachment");
        console.log(JSON.stringify(error));
        throw error;
    }


}


async function UploadText(MainFormName,FilterValue,SubFormName, text_html,addFlag) {
    
try {
        console.log("trying login");
        await prio.login(config, null);
        console.log("login ok");
        var myform = await prio.formStart(MainFormName, onMessage, updateFormCallback, 0);
        console.log("%s form created",MainFormName);
        console.log(FilterValue);
        await myform.setSearchFilter(FilterValue);
        var rows = await myform.getRows(1);
        if (rows[myform.name][1] == undefined) {
            console.log("Could not get required row");
            return;
        }
        else{
            console.log("found row");
          	console.log("Opening subform");
            var subform = await myform.startSubForm(SubFormName, onMessage, null);
			      console.log("Opened subform %s",SubFormName);
			      console.log("preparing to add the following text");
            console.log(text_html);
			      await subform.saveText(text_html.replace(/\t/g, '&nbsp;'), addFlag, 0, 0);
			      console.log("added text");
						await subform.endCurrentForm();
			      console.log("end sub form");
        }
        
        await myform.endCurrentForm();
        console.log("end main form");
        return "OK";
      } catch (error) {
        console.log(JSON.stringify(error));
        throw error;
    }
    
   
}

/* Form filter */
class FilterValue {
    constructor(q) {
        this.or = 0;
        this.ignorecase = 1;
        this.QueryValues = [];
        if (q != undefined) {
            for (var i in q) {
                this.QueryValues.push(q[i]);
            }
        }
    }
}

/* Form filter items */
class QueryValue {
    constructor(field) {
        this.field = field;
        this.fromval = "";
        this.toval = "";
        this.op = "=";
        this.sort = 0;
        this.isdesc = 0;
    }
}

function updateFormCallback(updates) {
    console.log(updates);
}
function onMessage(msg) {
  console.log(msg.message);
  console.log(msg.type);
  if(msg.type == "warning") {
    // Automtically select "OK" for all server side warnings.
    msg.form.warningConfirm(1, err => console.log('An error occurred confirming a warning: ' + err.message));
    return;
  }

  if(msg.type == "information") { 
    //Automtically select "OK" for all server side warnings.
    msg.form.infoMsgConfirm(err => console.log('An error occurred confirming an info: ' + err.message));
    return;
 }
  
  throw new Error('Error occured on server: ' + msg.message); 
}
