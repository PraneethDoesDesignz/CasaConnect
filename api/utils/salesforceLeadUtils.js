import { getSalesforceConnection } from './salesforce.js';

// Always create a new Salesforce Lead (even if email exists)
export const createLead = async (fields) => {
  const conn = await getSalesforceConnection();
  // Pass allowSave: true to bypass duplicate blocking
  const lead = await conn.sobject('Lead').create(fields, { allowSave: true });
  return lead.id;
};

// Create a new Salesforce Lead for property listing actions
export const createListingLead = async ({ email, username, action }) => {
  const conn = await getSalesforceConnection();
  let lastName;
  let status;
  switch (action) {
    case 'created':
      lastName = '- Property Listing Created';
      status = 'Listing Created';
      break;
    case 'updated':
      lastName = '- Property Listing Updated';
      status = 'Listing Updated';
      break;
    case 'deleted':
      lastName = '- Property Listing Deleted';
      status = 'Listing Deleted';
      break;
    default:
      lastName = '- Property Listing Action';
      status = 'Listing Action';
  }
  const lead = await conn.sobject('Lead').create({
    Email: email,
    FirstName: username,
    LastName: lastName,
    Status: status,
    Company: 'CasaConnect'
  }, { allowSave: true });
  return lead.id;
};

// Update a Salesforce Lead by email (kept for possible future use)
export const updateLeadByEmail = async (email, updateFields) => {
  const conn = await getSalesforceConnection();
  const leadId = await findLeadByEmail(email);
  if (!leadId) return null;
  const result = await conn.sobject('Lead').update({ Id: leadId, ...updateFields });
  return result;
};

// Find a Salesforce Lead by email
export const findLeadByEmail = async (email) => {
  const conn = await getSalesforceConnection();
  const leads = await conn.sobject('Lead').find({ Email: email }, 'Id');
  return leads.length ? leads[0].Id : null;
};
