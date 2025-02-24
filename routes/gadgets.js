const express = require('express');
const router = express.Router();
const { Gadget } = require('../models');

// Generate a confirmation code for self-destruct (simulated)
let expectedConfirmationCode = generateConfirmationCode();

function generateConfirmationCode() {
  // Returns a random five-digit number as a string
  return (Math.floor(Math.random() * 90000) + 10000).toString();
}

/**
 * @swagger
 * /gadgets:
 *   get:
 *     summary: Retrieve a list of gadgets
 *     security:
 *       - BearerAuth: []
 *     description: Retrieve a list of all gadgets. Each gadget includes a randomly generated mission success probability.
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter gadgets by status (e.g., "Available", "Deployed", "Destroyed", "Decommissioned")
 *     responses:
 *       200:
 *         description: A list of gadgets with success probabilities.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   name:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [Available, Deployed, Destroyed, Decommissioned]
 *                   successProbability:
 *                     type: string
 *                     example: "87%"
 *                   display:
 *                     type: string
 *                     example: "The Nightingale - 87% success probability"
 *       500:
 *         description: Internal server error.
 */
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let where = {};
    if (status) {
      where.status = status;
    }
    const gadgets = await Gadget.findAll({ where });
    const gadgetsWithProbability = gadgets.map(gadget => {
      const probability = Math.floor(Math.random() * 100) + 1;
      return {
        ...gadget.toJSON(),
        successProbability: `${probability}%`,
        display: `${gadget.name} - ${probability}% success probability`
      };
    });
    res.json(gadgetsWithProbability);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /gadgets:
 *   post:
 *     summary: Add a new gadget
 *     security:
 *       - BearerAuth: []
 *     description: Add a new gadget to the inventory with a unique, randomly generated codename.
 *     responses:
 *       201:
 *         description: Gadget created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 status:
 *                   type: string
 *                   example: "Available"
 *       400:
 *         description: Bad request.
 */
router.post('/', async (req, res) => {
  try {
    // Generate a unique codename in the format "The [Noun]"
    const name = await generateUniqueCodename();
    const gadget = await Gadget.create({ name, status: 'Available' });
    res.status(201).json(gadget);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /gadgets/{id}:
 *   patch:
 *     summary: Update an existing gadget
 *     security:
 *       - BearerAuth: []
 *     description: Update the information of an existing gadget by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the gadget to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Available, Deployed, Destroyed, Decommissioned]
 *     responses:
 *       200:
 *         description: Gadget updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 status:
 *                   type: string
 *       404:
 *         description: Gadget not found.
 *       400:
 *         description: Bad request.
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const gadget = await Gadget.findByPk(id);
    if (!gadget) {
      return res.status(404).json({ error: 'Gadget not found' });
    }
    await gadget.update(updates);
    res.json(gadget);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /gadgets/{id}:
 *   delete:
 *     summary: Decommission a gadget
 *     security:
 *       - BearerAuth: []
 *     description: Mark a gadget as decommissioned instead of deleting it. Also, add a timestamp for when it was decommissioned.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the gadget to decommission.
 *     responses:
 *       200:
 *         description: Gadget decommissioned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Gadget decommissioned"
 *       404:
 *         description: Gadget not found.
 *       400:
 *         description: Bad request.
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const gadget = await Gadget.findByPk(id);
    if (!gadget) {
      return res.status(404).json({ error: 'Gadget not found' });
    }
    // Mark gadget as decommissioned and add a timestamp
    await gadget.update({ 
      status: 'Decommissioned', 
      decommissionedAt: new Date() 
    });
    res.json({ message: 'Gadget decommissioned' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// In-memory store for pending self-destruct confirmation codes
const pendingSelfDestructCodes = {};

/**
 * @swagger
 * /gadgets/{id}/self-destruct/generate-code:
 *   post:
 *     summary: Generate confirmation code for self-destruct sequence
 *     security:
 *       - BearerAuth: []
 *     description: Generates a confirmation code for the self-destruct sequence. Use this code to confirm self-destruct.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the gadget for which to generate a confirmation code.
 *     responses:
 *       200:
 *         description: Confirmation code generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 confirmationCode:
 *                   type: string
 *                   example: "12345"
 *                 message:
 *                   type: string
 *                   example: "Confirmation code generated. Use this code to confirm self-destruct."
 *       404:
 *         description: Gadget not found.
 *       400:
 *         description: Bad request.
 */
router.post('/:id/self-destruct/generate-code', async (req, res) => {
  try {
    const { id } = req.params;
    const gadget = await Gadget.findByPk(id);
    if (!gadget) {
      return res.status(404).json({ error: 'Gadget not found' });
    }
    // Generate a random 5-digit confirmation code
    const confirmationCode = (Math.floor(Math.random() * 90000) + 10000).toString();
    // Store the confirmation code in memory associated with the gadget id
    pendingSelfDestructCodes[id] = confirmationCode;
    res.json({ 
      confirmationCode, 
      message: 'Confirmation code generated. Use this code to confirm self-destruct.' 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /gadgets/{id}/self-destruct:
 *   post:
 *     summary: Trigger self-destruct sequence
 *     security:
 *       - BearerAuth: []
 *     description: Trigger the self-destruct sequence for a specific gadget. Requires a previously generated confirmation code.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the gadget to self-destruct.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               confirmationCode:
 *                 type: string
 *                 example: "12345"
 *     responses:
 *       200:
 *         description: Gadget self-destructed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Gadget self-destructed"
 *       403:
 *         description: Invalid confirmation code.
 *       404:
 *         description: Gadget not found.
 *       400:
 *         description: Bad request.
 */
router.post('/:id/self-destruct', async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmationCode } = req.body;
    
    // Retrieve the stored confirmation code
    const storedCode = pendingSelfDestructCodes[id];
    if (!storedCode) {
      return res.status(400).json({ error: 'Confirmation code not generated. Please generate the code first.' });
    }
    if (confirmationCode !== storedCode) {
      return res.status(403).json({ error: 'Invalid confirmation code' });
    }
    
    const gadget = await Gadget.findByPk(id);
    if (!gadget) {
      return res.status(404).json({ error: 'Gadget not found' });
    }
    
    // Proceed with self-destruct (update status to "Destroyed")
    await gadget.update({ status: 'Destroyed' });
    
    // Clear the used confirmation code
    delete pendingSelfDestructCodes[id];
    
    res.json({ message: 'Gadget self-destructed' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Modified codename generator that returns a codename in the format "The [Noun]"
function generateCodename() {
  const nouns = [
    'Nightingale', 'Kraken', 'Phantom', 'Vortex', 'Specter',
    'Maverick', 'Intruder', 'Cipher', 'Operative', 'Shadow',
    'Saboteur', 'Viper', 'Agent', 'Enigma'
  ];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `The ${noun}`;
}

// Helper function to ensure the codename is unique before assignment
async function generateUniqueCodename() {
  let codename;
  let exists = true;
  while (exists) {
    codename = generateCodename();
    exists = await Gadget.findOne({ where: { name: codename }});
  }
  return codename;
}

module.exports = router;
