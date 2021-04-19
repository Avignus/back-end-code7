import express from 'express';
import { promises as fs } from 'fs';

const { readFile, writeFile } = fs;

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    let account = req.body;
    if (!account.name || account.balance == null) {
      throw new Error('Name e balance são obrigatórios.');
    }
    const data = JSON.parse(await readFile(global.fileName));
    account = {
      id: data.nextId++,
      name: account.name,
      balance: account.balance,
      description: account.description
    };
    data.accounts.push(account);

    await writeFile(global.fileName, JSON.stringify(data, null, 2));
    console.log(data);
    res.send(account);

    logger.info(`${req.method} ${req.baseUrl} - ${JSON.stringify(account)}`);
  } catch (err) {
    // res.status(400).send({ error: err.message });
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    delete data.nextId;
    res.send(data);
    logger.info(`${req.method} ${req.baseUrl}`);
  } catch (err) {
    // res.status(400).send({ error: err.message });
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const account = data.accounts.find(
      (account) => account.id == req.params.id
    );
    res.send(account);
    logger.info(`${req.method} ${req.baseUrl}/${req.params.id}`);
  } catch (err) {
    // res.status(400).send({ error: err.message });
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    data.accounts = data.accounts.filter(
      (account) => account.id !== parseInt(req.params.id)
    );
    await writeFile(global.fileName, JSON.stringify(data, null, 2));
    res.end();
    logger.info(`${req.method} ${req.baseUrl} ${req.params.id}`);
  } catch (err) {
    next(err);
    // res.status(400).send({ error: err.message });
  }
});

router.put('/', async (req, res, next) => {
  try {
    const account = req.body;
    const data = JSON.parse(await readFile(global.fileName));
    const index = data.accounts.findIndex((a) => a.id === account.id);
    if (index === -1) {
      throw new Error('ID não encontrado');
    }
    data.accounts[index] = account;
    await writeFile(global.fileName, JSON.stringify(data));
    res.send(account);
    logger.info(`${req.method} ${req.baseUrl} - ${JSON.stringify(account)}`);
  } catch (err) {
    next(err);
    // res.status(400).send({ error: err.message });
  }
});

router.patch('/updateDescription', async (req, res, next) => {
  try {
    const account = req.body;
    const data = JSON.parse(await readFile(global.fileName));
    const index = data.accounts.findINdex((a) => a.id === account.id);
    data.accounts[index].description = account.description;
    await writeFile(global.fileName, JSON.stringify(data));
    res.send(data.accounts[index]);
    logger.info(`${req.method} ${req.baseUrl} - ${JSON.stringify(account)}`);
  } catch (err) {
    next(err);
  }
});
router.patch('/updateBalance', async (req, res, next) => {
  try {
    const account = req.body;
    const data = JSON.parse(await readFile(global.fileName));
    const index = data.accounts.findIndex((a) => a.id === account.id);
    data.accounts[index].balance = account.balance;
    await writeFile(global.fileName, JSON.stringify(data));
    res.send(data.accounts[index]);
    logger.info(`${req.method} ${req.baseUrl} - ${JSON.stringify(account)}`);
  } catch (err) {
    // res.status(400).send({ error: err.message });
    next(err);
  }
});

router.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.baseUrl} - ${err.message}`);
  res.status(400).send({ error: err.message });
});
export default router;
