// Lead controller for Salesforce integration
import { getSalesforceConnection } from '../utils/salesforce.js';

// Create a new lead in Salesforce
export const createLead = async (req, res) => {
  try {
    const conn = await getSalesforceConnection();
    const lead = await conn.sobject('Lead').create(req.body);
    if (!lead.success) {
      return res.status(400).json({ message: 'Failed to create lead', errors: lead.errors });
    }
    res.status(201).json({ message: 'Lead created', id: lead.id });
  } catch (error) {
    res.status(500).json({ message: 'Salesforce error', error: error.message });
  }
};

// Get a lead by ID
export const getLead = async (req, res) => {
  try {
    const conn = await getSalesforceConnection();
    const lead = await conn.sobject('Lead').retrieve(req.params.id);
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Salesforce error', error: error.message });
  }
};

// Update a lead by ID
export const updateLead = async (req, res) => {
  try {
    const conn = await getSalesforceConnection();
    const result = await conn.sobject('Lead').update({
      Id: req.params.id,
      ...req.body,
    });
    if (!result.success) {
      return res.status(400).json({ message: 'Failed to update lead', errors: result.errors });
    }
    res.json({ message: 'Lead updated', id: result.id });
  } catch (error) {
    res.status(500).json({ message: 'Salesforce error', error: error.message });
  }
};
