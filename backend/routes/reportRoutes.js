const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { identify, requireIdentity, requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/reportController');

router.get('/categories', ctrl.categories);
router.get('/public', ctrl.listPublic);
router.get('/mine', identify, ctrl.listMine);
router.get('/all', requireAdmin, ctrl.listAll);
router.get('/:id', identify, ctrl.getOne);

router.post('/', identify, requireIdentity, upload.single('image'), ctrl.create);
router.patch('/:id/status', requireAdmin, ctrl.updateStatus);

module.exports = router;
