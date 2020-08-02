const Router = require("express").Router;
const Message = require("../models/message");
const {ensureLoggedIn, ensureCorrectUser} = require("../middleware/auth");
const { resumeDrain } = require("../db");

const router = new Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureLoggedIn, async function (req, res, next) {
    try {
      let msg = await Message.get(req.params.id);
      if (req.user.username !== msg.from_user.username || req.user.username !== msg.to_user.username) {
        return next({ status: 401, message: "Unauthorized" });
      }
      else {
        return res.json({msg});
      }
    }
  
    catch (err) {
      return next(err);
    }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async function (req, res, next) {
    try {
      let {to_username, body} = req.body;
      let msg = Message.create(req.user.username, to_username, body);
      return res.json({message: msg})
    }
  
    catch (err) {
      return next(err);
    }
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", ensureLoggedIn, async function (req, res, next) {
    try {
        let msg = await Message.get(req.params.id);
        if (req.user.username !== msg.to_user.username) {
          return next({ status: 401, message: "Unauthorized" });
        }
        else {
            return res.json({message: Message.markRead(req.params.id)});
        }
    }
  
    catch (err) {
      return next(err);
    }
});
