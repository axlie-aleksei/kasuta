const pool = require("../db");

exports.addItem = (req, res) => {

  const { title, price } = req.body;

  const image = req.file.filename;

  const sql =
    "INSERT INTO items (title, price, image) VALUES (?, ?, ?)";

  pool.execute(sql, [title, price, image], (err) => {

    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    res.json({
      success: true
    });

  });

};

exports.getItems = async (req,res)=>{

  try{

    const [rows] =
      await pool.promise().query(
        `SELECT 
           i.*,
           (
             SELECT ii.image
             FROM item_images ii
             WHERE ii.item_id = i.id
             ORDER BY ii.id ASC
             LIMIT 1
           ) AS image
         FROM items i
         ORDER BY i.id DESC`
      )

    res.json(rows)

  }catch(err){

    console.log(err)

    res.status(500).json({
      error:"server error"
    })

  }

}
