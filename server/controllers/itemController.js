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
