# Google Apps Script Update Priority ERP
## Send Text & attachments
The only way to update texts (before version 20.0) & attachments via the Priority API is by using the [Priority Web SDK](https://prioritysoftware.github.io/api/).
The Priority Web SDK is based on Javascript and supports usage either from the web browser (client side) or Node.js (server side).

This makes it difficult to use the Priority API to update texts/attachments via other Languages.

[Google Apps Script](https://developers.google.com/apps-script) is an excellent tool for automating Google Applications, such as gmail, docs, sheets etc'. It is based on Javascript, but does not allow using the Priority Web SDK.
> Some other technologies encounter the same issue. For example .Net, Java and others, which can utilize the REST API easily, but still have the text/attachment limitations.

The easiest was to solve this, it to create a web service, based on Node.js, which accepts the relevant parameters and updates the Priority.

The web service can run on any machine which has Node.js installed, but in our case it runs as a [Google Cloud Function](https://cloud.google.com/functions), which makes it accessible from anywhere.

## Node.js web service
The code for the cloud function web service is in index.js. It can be easily adapted to run on [Node.js express](https://expressjs.com/).

the web service exposes one function, doApi, which is called when the cloud function is called.
The web service needs to expose 2 functions (for text and for attachments). That is done using the 'calltype' parameter in the url.

>Examples:
>
>https://cloud-function-url?calltype=UploadText
>
>https://cloud-function-url?calltype=addAttachment

Each of these parameters is then mapped to the relevant web sdk function.

The functions are generic, in that they are designed to work with any text / attachment sub form.

Create a new google cloud function and paste the code of index.js
**Note:** These functions may run slowly - depending on the size of the text / attachment. Set the google cloud function timeout to as high as possible (540 seconds) in order to make sure it does not time out during execution.

## Google Apps Script Sample code
The code calling the cloud function is in 3 separate files. 
- code.gs
- priority_api_classes.gs
- utils.gs

The main code is in the code.gs file.
The 2 functions unit_test_text() and unit_test_attachments() are the ones that should be run in order to perform the required uploads to Priority.

### Running the code
1. Create a new [Google Apps Script](https://developers.google.com/apps-script/guides/standalone)
2. Create three scripts with the names as defined above and copy the code into them
3. Edit code.gs to reflect your data - the task id, the drive document id, the Priority Api config information and the google function url.
**Note:** Upload only google drive objects which are actual files - PDF, images, etc. This code was not tested with google sheets, google docs and google slides files.
4. Run the relevant functions and check the relevant task in Priority.
