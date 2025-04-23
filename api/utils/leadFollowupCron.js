import cron from 'node-cron';
import { getSalesforceConnection } from './salesforce.js';
import { sendFollowupEmail } from './mailer.js';

// Run daily at 9am
cron.schedule('0 9 * * *', async () => {
  try {
    const conn = await getSalesforceConnection();
    // Find leads with status Registered or Active Listing not contacted in 30 days
    const leads = await conn.sobject('Lead').find({
      Status: { $in: ['Registered', 'Active Listing'] },
      LastActivityDate: { $lte: new Date(Date.now() - 30*24*60*60*1000).toISOString().slice(0,10) }
    }, ['Id', 'Email', 'FirstName']);
    for (const lead of leads) {
      // Update a field or trigger a follow-up action
      await conn.sobject('Lead').update({ Id: lead.Id, Status: 'Follow-Up Needed' });
      // Send follow-up email
      if (lead.Email) {
        try {
          await sendFollowupEmail(lead.Email, lead.FirstName);
        } catch (mailErr) {
          console.error(`Failed to send follow-up email to ${lead.Email}:`, mailErr.message);
        }
      }
    }
    if (leads.length > 0) {
      console.log(`Follow-up triggered for ${leads.length} leads.`);
    }
  } catch (err) {
    console.error('Scheduled follow-up failed:', err.message);
  }
});
