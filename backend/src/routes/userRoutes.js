const express = require('express');
const router = express.Router();
const {
  getProfile, updateProfile, updateAvatar, changePassword,
  completeOnboarding, updateFCMToken, deleteAccount,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/avatar', upload.single('avatar'), updateAvatar);
router.put('/change-password', changePassword);
router.post('/onboarding', completeOnboarding);
router.post('/fcm-token', updateFCMToken);
router.delete('/account', deleteAccount);

module.exports = router;
