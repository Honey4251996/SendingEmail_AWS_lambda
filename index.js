exports.handler = (event, context, callback) => {
  
  ////////////////////////////////////////////////////////////
  // require Packages
  ////////////////////////////////////////////////////////////
  let aws = require("aws-sdk");
  let ses = new aws.SES({
    region: event.SESRegion,
    accessKeyId: event.SESKey,
    secretAccessKey: event.SESSecret
  });
  let mailcomposer = require("nodemailer/lib/mail-composer");
  ////////////////////////////////////////////////////////////
  
  var send = (person) => {
    let sendRawEmailPromise;
    
    var mailData = {
      from: {
        name: event.from.name,
        address: event.from.address
      },
      replyTo: event.replyTo,
      to: {
        name: person.name,
        address: person.address
      },
      subject: event.subject,
      text: event.message,
      headers : { 'X-SES-CONFIGURATION-SET': event.SESconfigurationSet }
    };
    if (event.attachments.length > 0) { mailData.attachments = event.attachments; }
  
    var mail = new mailcomposer(mailData).compile();
  
    return new Promise((resolve, reject) => {
      return mail.build((err, message) => {
        if (err) {
          return resolve(`Error sending raw email: ${err}`);
        }
        sendRawEmailPromise = ses.sendRawEmail({RawMessage: {Data: message}}).promise();
        return resolve(sendRawEmailPromise);
      });
    });
  }
  
  var actions = event.to.map(send)
  Promise.all(actions)
    .then(data =>
      callback(null, {
        "responseCode" : 200,
        "data" : data
      })
    );
};
