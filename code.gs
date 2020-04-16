function unit_test_text(){
    var start = new Date();
    var thisQuery = new QueryValue("CUSTNOTE");
    //edit line below to run demo
    thisQuery.fromval = <priority task id>;
    var filt = new FilterValue([thisQuery]);
    var text = String.format("<p>Hello the time now is <b>{0}</b></p>",new Date().toISOString())
    add_text_to_priority_entity(config, "CUSTNOTESA","CUSTNOTESTEXT",text,true,filt)
    console.log("duration = %d ms",new Date()-start);
}

function unit_test_attachments(){
    var start = new Date();
    //edit line below to run demo
    var att = DriveApp.getFileById('<drive document id>');
    var thisQuery = new QueryValue("CUSTNOTE");
    //edit line below to run demo
    thisQuery.fromval = <priority task id>;
    var filt = new FilterValue([thisQuery]);
    var b64 = Utilities.base64Encode(att.getBlob().getBytes());
    
    add_attachment_to_priority_entity(config, "CUSTNOTESA","CUSTNOTEEXTFILE",filt,
                          b64,att.getName(),att.getBlob().getContentType());
    console.log("duration = %d ms",new Date()-start);
    return;
}
//edit config to run demo
var config = {
        url: 'https://<priority-api-url>/',
        tabulaini: '<your-tabula.ini>',
        language: 3,
        company: '<your company>',
        username: '<user>',
        password: '<password>'
    };
//the google cloud function url
//edit line below to run demo
var gcf_url = '<google cloud function url>';
function add_attachment_to_priority_entity(config, main_form,attachments_form,main_form_filter,
                                            base64_encoded_file,file_name,content_type){
  var url = gcf_url + '?calltype=addAttachment';
  var b64Url='data:' + content_type + ';base64,' + base64_encoded_file;
      var att = {
             MainFormName : main_form,
             FilterValue : main_form_filter,
         	 SubFormName : attachments_form,
             fileName : file_name,
             base64EncodedFile:b64Url,
             config:config
      };
      
      console.log('created json for attachment %s',file_name);
      var options_attachment = {
        'method' : 'post',
        'contentType': 'application/json',
        // Convert the JavaScript object to a JSON string.
        'payload' : JSON.stringify(att)
      };
      //console.log(JSON.stringify(options_attachment));
      var result = UrlFetchApp.fetch(url, options_attachment);
      console.log(result.getContentText());
      console.log(result.getResponseCode());
}
function add_text_to_priority_entity(config, main_form,text_form,text,add_flag,main_form_filter){
  var url = gcf_url + '?calltype=UploadText';
  var params = {
    MainFormName : main_form,
    FilterValue : main_form_filter,
    SubFormName : text_form,
    addFlag : add_flag,
	text_html: text.substring(0,190000),
    config:config
  };
    
  // Make a POST request with a JSON payload.
  var options = {
    'method' : 'post',
    'contentType': 'application/json',
    // Convert the JavaScript object to a JSON string.
    'payload' : JSON.stringify(params)
  };
  result = UrlFetchApp.fetch(url, options);
  console.log(result.getContentText());
  console.log(result.getResponseCode());
  

}
