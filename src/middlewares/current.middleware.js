export const current = (roles) => {
  return (req, res, next) => {
    let role = req.user.role;
    if (role === undefined) role = req.user.user.role;
    if (role === undefined) role = req.user.user.user.role;

    if (roles.includes(role)) return next();

    return res.status(400).send("Not authorized via current");
  };
};
