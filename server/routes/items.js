const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const pool = require("../db");
const { sanitizeText } = require("../lib/sanitizeInput");

router.post(
  "/add",
  (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ error: "login required" });
    }
    next();
  },
  (req, res, next) => {
    upload.array("images", 10)(req, res, (err) => {
      if (err) {
        console.error("Item upload error:", err);
        return res.status(400).json({ error: err.message || "Upload failed" });
      }
      next();
    });
  },
  (req,res)=>{

    const title = sanitizeText(req.body.title, 200);
    const description = sanitizeText(req.body.description, 2000);
    const city = sanitizeText(req.body.city, 100);
    const priceRaw = req.body.price;
    const price = Number(priceRaw);

    if (!title || title.length > 200) {
      return res.status(400).json({ error: "Invalid title" });
    }
    if (description.length > 2000) {
      return res.status(400).json({ error: "Invalid description" });
    }
    if (!Number.isFinite(price) || price < 0 || price > 1000000) {
      return res.status(400).json({ error: "Invalid price" });
    }
    if (city.length > 100) {
      return res.status(400).json({ error: "Invalid city" });
    }

    const sql =
      "INSERT INTO items(user_id,title,description,price,city) VALUES(?,?,?,?,?)";

    pool.execute(
      sql,
      [
        req.session.user.id,
        title,
        description,
        price,
        city
      ],
      (err,result)=>{

        if(err){
          return res.status(500).json({error:"db error"});
        }

        const itemId = result.insertId;

        if(!req.files || req.files.length === 0){
          return res.json({success:true});
        }

        const images = req.files.map(file=>[
          itemId,
          file.filename
        ]);

        const imgSql =
          "INSERT INTO item_images(item_id,image) VALUES ?";

        pool.query(imgSql, [images], (err) => {
          if (err) {
            return res.status(500).json({ error: "db error" });
          }
          res.json({ success: true });
        });

      }
    );

  });

const itemController = require("../controllers/itemController");

router.get("/", itemController.getItems);

module.exports = router;
