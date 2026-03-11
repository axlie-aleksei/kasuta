const upload = require("../middleware/uploadMiddleware");

router.post(
  "/add",
  auth.requireAuth,
  upload.single("image"),
  itemsController.addItem
);
