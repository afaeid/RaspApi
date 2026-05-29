module.exports = (func) => {
 return (req, res, next) => {
  func(req, res, next).catch((err) => {
      console.log("ASYNC ERROR:", err.name, err.message, err.stack);
      next(err);
   });
 };
};
