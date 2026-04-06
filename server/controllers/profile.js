import { movieDb } from "../config/movieDB.js";

export const updateProfile = async (req, res) => {
  try {
    const { name, public_id } = req.body;
    const userId = req.user.id;

    if (!name || !public_id) {
      return res.status(400).json({ error: "Name and Public ID required" });
    }

    const profileImage = req.file ? req.file.buffer : null;

    await movieDb.query(
      `UPDATE users 
       SET name = $1, 
           public_id = $2, 
           profile_image = COALESCE($3, profile_image) 
       WHERE id = $4`,
      [name, public_id, profileImage, userId],
    );

    const updatedUser = await movieDb.query(
      `SELECT id, name, email, public_id, profile_image 
       FROM users WHERE id = $1`,
      [userId],
    );

    const user = updatedUser.rows[0];

    if (user.profile_image) {
      user.profile_image = `data:image/jpeg;base64,${user.profile_image.toString("base64")}`;
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Error updating profile" });
  }
};
