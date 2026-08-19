// import { movieDb } from "../config/movieDB.js";

// export const deviceLimitMiddleware = async (req, res, next) => {
//   try {
//     const userId = req.user.id;
//     const totalDevices = await movieDb.query(
//       `SELECT count(user_id) as current_devices_count FROM nxtwatch_refresh_tokens WHERE user_id = $1`,
//       [userId],
//     );
//     const currentDevicesCount = parseInt(
//       totalDevices.rows[0].current_devices_count,
//       10,
//     );
//     if (currentDevicesCount >= 30) {
//       return res
//         .status(403)
//         .json({
//           error:
//             "Device limit reached. Please log out from another device to continue.",
//         });
//     }
//     next();
//   } catch (err) {
//     console.log("DEVICE LIMIT MIDDLEWARE ERROR:", err.message);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };


