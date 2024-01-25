export const current = (roles) => {
  return (req, res, next) => {
    if (req.user.user.role === roles) return next();

    return res.status(400).send("Not authorized");
  };
};
