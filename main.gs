const mails = [
    // comma-separated emails of salary slip senders
    // example: abc@xyz.com
];

const mailNameMapping = {
  //  comma-separated email- name mapping of salary slip senders: name
  // 'abc@xyz.com': 'abc'
};

/**
 * Create a trigger that executes the myFunction function tomorrow.
 */

const retryTomorrow = () => {
  var date = new Date();
  ScriptApp.newTrigger('retry')
  .timeBased()
  .atDate(date.getFullYear(), date.getMonth(), date.getDate() + 1)
  .create();
};

// Get Name of person based on the mail 
const getName = (key) => {
  return mailNameMapping[key];
};


// Wrapper for myFunction
const retry = () => {
  console.log("Let's see if we have mail today...");
  myFunction();
};

// Disable Triggers if present
const disableTrigers = () => {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    var trigger = triggers[i];
    if(trigger.getHandlerFunction() === 'retry'){
      ScriptApp.deleteTrigger(trigger);
    }
  }
};


// Save slip to the drive folder named Salary slip 
const saveToDrive = (name, salarySlip, date) => {
  var slipLabel = name + ' ' + date.toLocaleString('default', { month: 'long', year: 'numeric' });
  salarySlip.setName(slipLabel);
  folder = DriveApp.getFoldersByName('Salary slip').next();
  folder.createFile(salarySlip);
  console.log("Save success for " + slipLabel + '!');
}


// Main function - fetches mails after yesterday to check if you have the mails 
const myFunction = () => {
  disableTrigers();
  console.log("Fetching mails");
  var date = new Date();
  let searchString = 'has:attachment from:(' + mails.join(' OR ') + ') after:' + date.getFullYear() + '/' + date.getMonth() + '/' + (date.getDate() - 1) + 'slip';
  result = GmailApp.search(searchString, 0, mails.length + 1);
  date.setMonth(date.getMonth() - 1);
  if (result.length === mails.length) {
    console.log("Mails found, saving salary slip to Drive");
    result.forEach(thread => {
      saveToDrive(getName(thread.getMessages()[0].getFrom()), thread.getMessages()[0].getAttachments()[0], date);
    });
  } else {
    console.log("Mails not found, setting trigger for tomorrow");
    retryTomorrow();
  }
};
