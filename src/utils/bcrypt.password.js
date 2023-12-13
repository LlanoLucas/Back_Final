import bcryptjs from "bcrypt";

export const createHash = (password) => {
  const salt = bcryptjs.genSaltSync(10);
  const passHash = bcryptjs.hashSync(password, salt);

  return passHash;
};

export const isValidPassword = (password, userPassword) => {
  const passValid = bcryptjs.compareSync(password, userPassword);
  return passValid;
};
